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

    // Initialize session first
    initSecureSession();
    
    // Log session data for debugging
    error_log("Session status: " . session_status());
    error_log("Session ID: " . session_id());
    error_log("Session data: " . print_r($_SESSION, true));

    // Verify admin session
    if (!verifyAdminSession()) {
        http_response_code(401);
        echo json_encode([
            'error' => 'Unauthorized', 
            'debug' => [
                'session_status' => session_status(),
                'session_id' => session_id(),
                'has_session_data' => !empty($_SESSION)
            ]
        ]);
        exit;
    }

    // Database connection
    $pdo = getDBConnection();
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    // Handle different HTTP methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // If ID is provided, get single order with its items
            if (isset($_GET['id'])) {
                $orderId = (int)$_GET['id'];
                
                // Get order details
                $stmt = $pdo->prepare("
                    SELECT o.*, CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email as customer_email, u.phone as customer_phone
                    FROM orders o
                    JOIN users u ON o.user_id = u.id
                    WHERE o.id = ?
                ");
                $stmt->execute([$orderId]);
                $order = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$order) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Order not found']);
                    break;
                }
                
                // Get order items
                $stmt = $pdo->prepare("
                    SELECT oi.*, p.name as product_name, p.image as product_image
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = ?
                ");
                $stmt->execute([$orderId]);
                $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $order]);
                break;
            }

            // Get query parameters for listing orders
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? max(1, min(50, (int)$_GET['limit'])) : 10;
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            $status = isset($_GET['status']) ? trim($_GET['status']) : '';
            $dateFilter = isset($_GET['date']) ? trim($_GET['date']) : '';
            $sort = isset($_GET['sort']) ? trim($_GET['sort']) : 'newest';
            $customerId = isset($_GET['customer_id']) ? (int)$_GET['customer_id'] : null;

            // Calculate offset
            $offset = ($page - 1) * $limit;

            // Build base query
            $baseQuery = "
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE 1=1
            ";
            $whereConditions = [];
            $queryParams = [];

            // Add customer filter if provided
            if ($customerId) {
                $whereConditions[] = "o.user_id = ?";
                $queryParams[] = $customerId;
            }

            // Add search condition
            if ($search !== '') {
                $whereConditions[] = "(o.order_number LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR u.email LIKE ?)";
                $queryParams[] = "%{$search}%";
                $queryParams[] = "%{$search}%";
                $queryParams[] = "%{$search}%";
            }

            // Add status filter
            if ($status !== '') {
                $whereConditions[] = "o.status = ?";
                $queryParams[] = $status;
            }

            // Add date filter
            if ($dateFilter !== '') {
                switch($dateFilter) {
                    case 'today':
                        $whereConditions[] = "DATE(o.created_at) = CURDATE()";
                        break;
                    case 'yesterday':
                        $whereConditions[] = "DATE(o.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
                        break;
                    case 'last7days':
                        $whereConditions[] = "o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
                        break;
                    case 'last30days':
                        $whereConditions[] = "o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                        break;
                }
            }

            // Combine where conditions
            if (!empty($whereConditions)) {
                $baseQuery .= " AND " . implode(" AND ", $whereConditions);
            }

            // Add sorting
            $orderBy = match($sort) {
                'oldest' => "o.created_at ASC",
                'highest' => "o.total_amount DESC",
                'lowest' => "o.total_amount ASC",
                default => "o.created_at DESC"
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

                // Get orders with pagination
                $query = "
                    SELECT 
                        o.*, 
                        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                        u.email as customer_email,
                        u.phone as customer_phone
                    " . $baseQuery . " LIMIT " . (int)$limit . " OFFSET " . (int)$offset;
                
                $stmt = $pdo->prepare($query);
                $stmt->execute($queryParams);
                $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Get order items for each order
                foreach ($orders as &$order) {
                    $stmt = $pdo->prepare("
                        SELECT oi.*, p.name as product_name, p.image as product_image
                        FROM order_items oi
                        JOIN products p ON oi.product_id = p.id
                        WHERE oi.order_id = ?
                    ");
                    $stmt->execute([$order['id']]);
                    $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                }

                echo json_encode([
                    'success' => true,
                    'data' => [
                        'orders' => $orders,
                        'pagination' => [
                            'currentPage' => (int)$page,
                            'totalPages' => (int)$totalPages,
                            'totalItems' => (int)$totalCount,
                            'limit' => (int)$limit
                        ]
                    ]
                ]);
            } catch (PDOException $e) {
                error_log("Database error in orders query: " . $e->getMessage());
                throw $e;
            }
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || !isset($data['id'])) {
                throw new Exception('Invalid request data');
            }

            $orderId = (int)$data['id'];
            
            // Validate order exists
            $stmt = $pdo->prepare("SELECT id FROM orders WHERE id = ?");
            $stmt->execute([$orderId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
                break;
            }

            // Start transaction
            $pdo->beginTransaction();

            try {
                // Update order status
                if (isset($data['status'])) {
                    $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
                    if (!in_array($data['status'], $validStatuses)) {
                        throw new Exception('Invalid order status');
                    }

                    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
                    $stmt->execute([$data['status'], $orderId]);
                }

                // Update payment status
                if (isset($data['payment_status'])) {
                    $validPaymentStatuses = ['pending', 'paid', 'failed'];
                    if (!in_array($data['payment_status'], $validPaymentStatuses)) {
                        throw new Exception('Invalid payment status');
                    }

                    $stmt = $pdo->prepare("UPDATE orders SET payment_status = ? WHERE id = ?");
                    $stmt->execute([$data['payment_status'], $orderId]);
                }

                // Update shipping address if provided
                if (isset($data['shipping_address']) && trim($data['shipping_address']) !== '') {
                    $stmt = $pdo->prepare("UPDATE orders SET shipping_address = ? WHERE id = ?");
                    $stmt->execute([trim($data['shipping_address']), $orderId]);
                }

                // Commit transaction
                $pdo->commit();

                // Get updated order data
                $stmt = $pdo->prepare("
                    SELECT o.*, CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email as customer_email, u.phone as customer_phone
                    FROM orders o
                    JOIN users u ON o.user_id = u.id
                    WHERE o.id = ?
                ");
                $stmt->execute([$orderId]);
                $order = $stmt->fetch(PDO::FETCH_ASSOC);

                // Get order items
                $stmt = $pdo->prepare("
                    SELECT oi.*, p.name as product_name, p.image as product_image
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = ?
                ");
                $stmt->execute([$orderId]);
                $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode(['success' => true, 'data' => $order]);
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                throw new Exception('Order ID is required');
            }

            $orderId = (int)$_GET['id'];
            
            // Check if order exists
            $stmt = $pdo->prepare("SELECT id FROM orders WHERE id = ?");
            $stmt->execute([$orderId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
                break;
            }

            // Start transaction
            $pdo->beginTransaction();

            try {
                // Delete order items first (cascade will handle this automatically due to foreign key)
                $stmt = $pdo->prepare("DELETE FROM orders WHERE id = ?");
                $stmt->execute([$orderId]);

                // Commit transaction
                $pdo->commit();

                echo json_encode(['success' => true, 'message' => 'Order deleted successfully']);
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