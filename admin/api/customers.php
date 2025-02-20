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
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
        exit();
    }

    // Database connection
    $conn = getDBConnection();
    if (!$conn) {
        throw new Exception('Database connection failed');
    }

    // Handle different HTTP methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // If ID is provided, get single customer
            if (isset($_GET['id'])) {
                $customerId = (int)$_GET['id'];
                
                $stmt = mysqli_prepare($conn, "
                    SELECT u.*, 
                           COUNT(DISTINCT o.id) as total_orders,
                           COALESCE(SUM(o.total_amount), 0) as total_spent,
                           MAX(o.created_at) as last_order_date
                    FROM users u
                    LEFT JOIN orders o ON u.id = o.user_id
                    WHERE u.id = ? AND u.role = 'customer'
                    GROUP BY u.id
                ");
                mysqli_stmt_bind_param($stmt, "i", $customerId);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                $customer = mysqli_fetch_assoc($result);
                
                if (!$customer) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Customer not found']);
                    break;
                }
                
                // Get recent orders
                $stmt = mysqli_prepare($conn, "
                    SELECT o.*, COUNT(oi.id) as total_items
                    FROM orders o
                    LEFT JOIN order_items oi ON o.id = oi.order_id
                    WHERE o.user_id = ?
                    GROUP BY o.id
                    ORDER BY o.created_at DESC
                    LIMIT 5
                ");
                mysqli_stmt_bind_param($stmt, "i", $customerId);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                
                $customer['recent_orders'] = [];
                while ($order = mysqli_fetch_assoc($result)) {
                    $customer['recent_orders'][] = $order;
                }
                
                echo json_encode(['success' => true, 'data' => $customer]);
                break;
            }

            // Get query parameters for listing customers
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? max(1, min(50, (int)$_GET['limit'])) : 10;
            $search = isset($_GET['search']) ? mysqli_real_escape_string($conn, trim($_GET['search'])) : '';
            $status = isset($_GET['status']) ? mysqli_real_escape_string($conn, trim($_GET['status'])) : '';
            $sort = isset($_GET['sort']) ? mysqli_real_escape_string($conn, trim($_GET['sort'])) : 'newest';

            // Calculate offset
            $offset = ($page - 1) * $limit;

            // Build base query
            $baseQuery = "
                FROM users u
                LEFT JOIN (
                    SELECT user_id, 
                           COUNT(DISTINCT id) as total_orders,
                           COALESCE(SUM(total_amount), 0) as total_spent,
                           MAX(created_at) as last_order_date
                    FROM orders
                    GROUP BY user_id
                ) o ON u.id = o.user_id
                WHERE u.role = 'customer'
            ";
            
            $whereConditions = [];
            $queryParams = [];
            $paramTypes = "";

            // Add search condition
            if ($search !== '') {
                $whereConditions[] = "(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
                $searchPattern = "%{$search}%";
                $queryParams[] = $searchPattern;
                $queryParams[] = $searchPattern;
                $queryParams[] = $searchPattern;
                $queryParams[] = $searchPattern;
                $paramTypes .= "ssss";
            }

            // Add status filter
            if ($status !== '') {
                $whereConditions[] = "u.status = ?";
                $queryParams[] = $status;
                $paramTypes .= "s";
            }

            // Combine where conditions
            if (!empty($whereConditions)) {
                $baseQuery .= " AND " . implode(" AND ", $whereConditions);
            }

            // Add sorting
            $orderBy = match($sort) {
                'oldest' => "u.created_at ASC",
                'most_orders' => "total_orders DESC",
                'highest_spent' => "total_spent DESC",
                'name' => "u.first_name ASC, u.last_name ASC",
                default => "u.created_at DESC"
            };
            $baseQuery .= " ORDER BY " . $orderBy;

            try {
                // Get total count
                $countQuery = "SELECT COUNT(*) " . $baseQuery;
                $stmt = mysqli_prepare($conn, $countQuery);
                if (!empty($paramTypes)) {
                    mysqli_stmt_bind_param($stmt, $paramTypes, ...$queryParams);
                }
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                $totalCount = (int)mysqli_fetch_row($result)[0];

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
                        COALESCE(o.total_orders, 0) as total_orders,
                        COALESCE(o.total_spent, 0) as total_spent,
                        o.last_order_date
                    " . $baseQuery . " LIMIT ? OFFSET ?";
                
                $stmt = mysqli_prepare($conn, $query);
                if (!empty($paramTypes)) {
                    $paramTypes .= "ii";
                    $queryParams[] = $limit;
                    $queryParams[] = $offset;
                    mysqli_stmt_bind_param($stmt, $paramTypes, ...$queryParams);
                } else {
                    mysqli_stmt_bind_param($stmt, "ii", $limit, $offset);
                }
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                
                $customers = [];
                while ($customer = mysqli_fetch_assoc($result)) {
                    $customers[] = $customer;
                }

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
            } catch (Exception $e) {
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
            $stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE id = ? AND role = 'customer'");
            mysqli_stmt_bind_param($stmt, "i", $customerId);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            if (!mysqli_fetch_assoc($result)) {
                http_response_code(404);
                echo json_encode(['error' => 'Customer not found']);
                break;
            }

            // Start transaction
            mysqli_begin_transaction($conn);

            try {
                $updates = [];
                $params = [];
                $paramTypes = "";

                // Update status
                if (isset($data['status'])) {
                    $validStatuses = ['active', 'inactive', 'blocked'];
                    if (!in_array($data['status'], $validStatuses)) {
                        throw new Exception('Invalid status');
                    }
                    $updates[] = "status = ?";
                    $params[] = $data['status'];
                    $paramTypes .= "s";
                }

                // Update first name
                if (isset($data['first_name']) && trim($data['first_name']) !== '') {
                    $updates[] = "first_name = ?";
                    $params[] = trim($data['first_name']);
                    $paramTypes .= "s";
                }

                // Update last name
                if (isset($data['last_name']) && trim($data['last_name']) !== '') {
                    $updates[] = "last_name = ?";
                    $params[] = trim($data['last_name']);
                    $paramTypes .= "s";
                }

                // Update email
                if (isset($data['email']) && trim($data['email']) !== '') {
                    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                        throw new Exception('Invalid email format');
                    }
                    
                    // Check if email already exists
                    $stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE email = ? AND id != ?");
                    mysqli_stmt_bind_param($stmt, "si", $data['email'], $customerId);
                    mysqli_stmt_execute($stmt);
                    $result = mysqli_stmt_get_result($stmt);
                    if (mysqli_fetch_assoc($result)) {
                        throw new Exception('Email already exists');
                    }
                    
                    $updates[] = "email = ?";
                    $params[] = trim($data['email']);
                    $paramTypes .= "s";
                }

                // Update phone
                if (isset($data['phone']) && trim($data['phone']) !== '') {
                    $updates[] = "phone = ?";
                    $params[] = trim($data['phone']);
                    $paramTypes .= "s";
                }

                if (!empty($updates)) {
                    $query = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
                    $params[] = $customerId;
                    $paramTypes .= "i";
                    
                    $stmt = mysqli_prepare($conn, $query);
                    mysqli_stmt_bind_param($stmt, $paramTypes, ...$params);
                    mysqli_stmt_execute($stmt);
                }

                mysqli_commit($conn);
                echo json_encode(['success' => true, 'message' => 'Customer updated successfully']);
            } catch (Exception $e) {
                mysqli_rollback($conn);
                throw $e;
            }
            break;

        case 'POST':
            // Get JSON data from request body
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            
            if (!$data) {
                throw new Exception('Invalid request data');
            }

            // Validate required fields
            $requiredFields = ['first_name', 'last_name', 'email', 'phone', 'address', 'password'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    throw new Exception("Missing required field: {$field}");
                }
            }

            // Validate email format
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Invalid email format');
            }

            // Check if email already exists
            $stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE email = ?");
            mysqli_stmt_bind_param($stmt, "s", $data['email']);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            if (mysqli_fetch_assoc($result)) {
                throw new Exception('Email already exists');
            }

            // Hash password
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

            // Start transaction
            mysqli_begin_transaction($conn);

            try {
                // Insert new customer
                $stmt = mysqli_prepare($conn, 
                    "INSERT INTO users (first_name, last_name, email, phone, address, password, role, status) 
                     VALUES (?, ?, ?, ?, ?, ?, 'customer', 'active')"
                );
                mysqli_stmt_bind_param($stmt, "ssssss", 
                    $data['first_name'],
                    $data['last_name'],
                    $data['email'],
                    $data['phone'],
                    $data['address'],
                    $hashedPassword
                );
                mysqli_stmt_execute($stmt);
                $customerId = mysqli_insert_id($conn);

                mysqli_commit($conn);
                echo json_encode([
                    'success' => true, 
                    'message' => 'Customer added successfully',
                    'data' => ['id' => $customerId]
                ]);
            } catch (Exception $e) {
                mysqli_rollback($conn);
                throw $e;
            }
            break;

        case 'DELETE':
            // Get customer ID from query parameters
            if (!isset($_GET['id'])) {
                throw new Exception('Customer ID is required for deletion');
            }

            $customerId = (int)$_GET['id'];
            
            // Validate customer exists and is not an admin
            $stmt = mysqli_prepare($conn, "SELECT id, role FROM users WHERE id = ?");
            mysqli_stmt_bind_param($stmt, "i", $customerId);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $customer = mysqli_fetch_assoc($result);
            
            if (!$customer) {
                http_response_code(404);
                echo json_encode(['error' => 'Customer not found']);
                break;
            }

            if ($customer['role'] !== 'customer') {
                throw new Exception('Cannot delete admin users');
            }

            // Start transaction
            mysqli_begin_transaction($conn);

            try {
                // Delete customer's orders and order items first
                $stmt = mysqli_prepare($conn, "DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)");
                mysqli_stmt_bind_param($stmt, "i", $customerId);
                mysqli_stmt_execute($stmt);

                $stmt = mysqli_prepare($conn, "DELETE FROM orders WHERE user_id = ?");
                mysqli_stmt_bind_param($stmt, "i", $customerId);
                mysqli_stmt_execute($stmt);

                // Delete customer's cart items
                $stmt = mysqli_prepare($conn, "DELETE FROM cart WHERE user_id = ?");
                mysqli_stmt_bind_param($stmt, "i", $customerId);
                mysqli_stmt_execute($stmt);

                // Finally delete the customer
                $stmt = mysqli_prepare($conn, "DELETE FROM users WHERE id = ?");
                mysqli_stmt_bind_param($stmt, "i", $customerId);
                mysqli_stmt_execute($stmt);

                mysqli_commit($conn);
                echo json_encode(['success' => true, 'message' => 'Customer deleted successfully']);
            } catch (Exception $e) {
                mysqli_rollback($conn);
                throw $e;
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log("Error in customers.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
} finally {
    if (isset($conn)) {
        mysqli_close($conn);
    }
}
?>