<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

// Allow CORS for development
header('Access-Control-Allow-Origin: http://localhost:81');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set JSON content type
header('Content-Type: application/json; charset=utf-8');

try {
    require_once '../includes/auth.php';

    // Initialize secure session
    initSecureSession();

    // Verify admin authentication
    if (!verifyAdminSession()) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
        exit();
    }

    // Database connection
    $pdo = getDBConnection();
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    // Handle different HTTP methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // If ID is provided, get single customer
            if (isset($_GET['id'])) {
                $customerId = (int)$_GET['id'];
                
                // Get customer details
                $stmt = $pdo->prepare("
                    SELECT u.*, 
                           (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders,
                           (SELECT MAX(created_at) FROM orders WHERE user_id = u.id) as last_order_date,
                           (SELECT SUM(total_amount) FROM orders WHERE user_id = u.id) as total_spent
                    FROM users u 
                    WHERE u.id = ? AND u.role = 'customer'
                ");
                $stmt->execute([$customerId]);
                $customer = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($customer) {
                    echo json_encode(['success' => true, 'data' => $customer]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Customer not found']);
                }
                break;
            }

            // Get query parameters
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? max(1, min(50, (int)$_GET['limit'])) : 10;
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            $status = isset($_GET['status']) ? trim($_GET['status']) : '';
            $sort = isset($_GET['sort']) ? trim($_GET['sort']) : 'newest';

            // Calculate offset
            $offset = ($page - 1) * $limit;

            // Build base query
            $baseQuery = "
                FROM users u 
                WHERE u.role = 'customer'
            ";
            $whereConditions = [];
            $queryParams = [];

            // Add search condition
            if ($search !== '') {
                $whereConditions[] = "(CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
                $searchTerm = "%{$search}%";
                $queryParams[] = $searchTerm;
                $queryParams[] = $searchTerm;
                $queryParams[] = $searchTerm;
            }

            // Add status filter
            if ($status !== '') {
                $whereConditions[] = "u.status = ?";
                $queryParams[] = $status;
            }

            // Combine where conditions
            if (!empty($whereConditions)) {
                $baseQuery .= " AND " . implode(" AND ", $whereConditions);
            }

            // Add sorting
            $orderBy = match($sort) {
                'oldest' => "u.created_at ASC",
                'name' => "u.first_name ASC",
                'name-desc' => "u.first_name DESC",
                default => "u.created_at DESC"
            };
            $baseQuery .= " ORDER BY " . $orderBy;

            try {
                // Get total count
                $countQuery = "SELECT COUNT(*) " . $baseQuery;
                $stmt = $pdo->prepare($countQuery);
                $stmt->execute($queryParams);
                $totalCount = (int)$stmt->fetchColumn();

                // Calculate total pages
                $totalPages = max(1, ceil($totalCount / $limit));
                
                // Adjust current page if it exceeds total pages
                if ($page > $totalPages) {
                    $page = $totalPages;
                    $offset = ($page - 1) * $limit;
                }

                // Get customers with pagination
                $query = "
                    SELECT 
                        u.*,
                        (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders,
                        (SELECT MAX(created_at) FROM orders WHERE user_id = u.id) as last_order_date,
                        (SELECT SUM(total_amount) FROM orders WHERE user_id = u.id) as total_spent
                    " . $baseQuery . " LIMIT " . (int)$limit . " OFFSET " . (int)$offset;
                
                $stmt = $pdo->prepare($query);
                $stmt->execute($queryParams);
                $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'success' => true,
                    'data' => [
                        'customers' => $customers,
                        'pagination' => [
                            'currentPage' => (int)$page,
                            'totalPages' => (int)$totalPages,
                            'totalItems' => (int)$totalCount,
                            'limit' => (int)$limit
                        ]
                    ]
                ]);
            } catch (PDOException $e) {
                error_log("Database error in customers query: " . $e->getMessage());
                throw $e;
            }
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || !isset($data['id'])) {
                throw new Exception('Invalid request data');
            }

            $customerId = (int)$data['id'];
            
            // Validate customer exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'customer'");
            $stmt->execute([$customerId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Customer not found']);
                break;
            }

            // Start transaction
            $pdo->beginTransaction();

            try {
                // Validate required fields
                $requiredFields = ['first_name', 'last_name', 'email', 'phone', 'address', 'status'];
                foreach ($requiredFields as $field) {
                    if (!isset($data[$field]) || trim($data[$field]) === '') {
                        throw new Exception("Missing required field: {$field}");
                    }
                }

                // Check if email is unique (excluding current customer)
                $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
                $stmt->execute([$data['email'], $customerId]);
                if ($stmt->fetch()) {
                    throw new Exception('Email already exists');
                }

                // Update customer
                $stmt = $pdo->prepare("
                    UPDATE users 
                    SET first_name = ?, 
                        last_name = ?, 
                        email = ?, 
                        phone = ?, 
                        address = ?, 
                        status = ?,
                        updated_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([
                    $data['first_name'],
                    $data['last_name'],
                    $data['email'],
                    $data['phone'],
                    $data['address'],
                    $data['status'],
                    $customerId
                ]);

                // Commit transaction
                $pdo->commit();

                // Get updated customer data
                $stmt = $pdo->prepare("
                    SELECT u.*, 
                           (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders,
                           (SELECT MAX(created_at) FROM orders WHERE user_id = u.id) as last_order_date,
                           (SELECT SUM(total_amount) FROM orders WHERE user_id = u.id) as total_spent
                    FROM users u 
                    WHERE u.id = ?
                ");
                $stmt->execute([$customerId]);
                $customer = $stmt->fetch(PDO::FETCH_ASSOC);

                echo json_encode(['success' => true, 'data' => $customer]);
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                throw new Exception('Invalid request data');
            }

            // Start transaction
            $pdo->beginTransaction();

            try {
                // Validate required fields
                $requiredFields = ['first_name', 'last_name', 'email', 'phone', 'address', 'password'];
                foreach ($requiredFields as $field) {
                    if (!isset($data[$field]) || trim($data[$field]) === '') {
                        throw new Exception("Missing required field: {$field}");
                    }
                }

                // Check if email is unique
                $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
                $stmt->execute([$data['email']]);
                if ($stmt->fetch()) {
                    throw new Exception('Email already exists');
                }

                // Hash password
                $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

                // Insert new customer
                $stmt = $pdo->prepare("
                    INSERT INTO users (
                        first_name, last_name, email, phone, address, password, role, status, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, 'customer', 'active', NOW(), NOW())
                ");
                $stmt->execute([
                    $data['first_name'],
                    $data['last_name'],
                    $data['email'],
                    $data['phone'],
                    $data['address'],
                    $hashedPassword
                ]);

                $customerId = $pdo->lastInsertId();

                // Commit transaction
                $pdo->commit();

                // Get new customer data
                $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
                $stmt->execute([$customerId]);
                $customer = $stmt->fetch(PDO::FETCH_ASSOC);

                echo json_encode(['success' => true, 'data' => $customer]);
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                throw new Exception('Customer ID is required');
            }

            $customerId = (int)$_GET['id'];
            
            // Check if customer exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'customer'");
            $stmt->execute([$customerId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Customer not found']);
                break;
            }

            // Start transaction
            $pdo->beginTransaction();

            try {
                // Instead of deleting, set status to 'deleted'
                $stmt = $pdo->prepare("UPDATE users SET status = 'deleted', updated_at = NOW() WHERE id = ?");
                $stmt->execute([$customerId]);

                // Commit transaction
                $pdo->commit();

                echo json_encode(['success' => true, 'message' => 'Customer deleted successfully']);
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            break;

        default:
            throw new Exception('Method not allowed');
    }
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'message' => $e->getMessage()]);
} catch (Exception $e) {
    error_log("Application error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Application error', 'message' => $e->getMessage()]);
}
?>