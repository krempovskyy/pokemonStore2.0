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
            // If ID is provided, get single order with its items
            if (isset($_GET['id'])) {
                $orderId = (int)$_GET['id'];
                
                // Get order details
                $stmt = mysqli_prepare($conn, "
                    SELECT o.*, CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email as customer_email, u.phone as customer_phone
                    FROM orders o
                    JOIN users u ON o.user_id = u.id
                    WHERE o.id = ?
                ");
                mysqli_stmt_bind_param($stmt, "i", $orderId);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                $order = mysqli_fetch_assoc($result);
                
                if (!$order) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Order not found']);
                    break;
                }
                
                // Get order items
                $stmt = mysqli_prepare($conn, "
                    SELECT oi.*, p.name as product_name, p.image as product_image
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = ?
                ");
                mysqli_stmt_bind_param($stmt, "i", $orderId);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                $order['items'] = [];
                while ($item = mysqli_fetch_assoc($result)) {
                    $order['items'][] = $item;
                }
                
                echo json_encode(['success' => true, 'data' => $order]);
                break;
            }

            // Get query parameters for listing orders
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? max(1, min(50, (int)$_GET['limit'])) : 10;
            $search = isset($_GET['search']) ? mysqli_real_escape_string($conn, trim($_GET['search'])) : '';
            $status = isset($_GET['status']) ? mysqli_real_escape_string($conn, trim($_GET['status'])) : '';
            $dateFilter = isset($_GET['date']) ? mysqli_real_escape_string($conn, trim($_GET['date'])) : '';
            $sort = isset($_GET['sort']) ? mysqli_real_escape_string($conn, trim($_GET['sort'])) : 'newest';
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
            $paramTypes = "";

            // Add customer filter if provided
            if ($customerId) {
                $whereConditions[] = "o.user_id = ?";
                $queryParams[] = $customerId;
                $paramTypes .= "i";
            }

            // Add search condition
            if ($search !== '') {
                $whereConditions[] = "(o.order_number LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR u.email LIKE ?)";
                $searchPattern = "%{$search}%";
                $queryParams[] = $searchPattern;
                $queryParams[] = $searchPattern;
                $queryParams[] = $searchPattern;
                $paramTypes .= "sss";
            }

            // Add status filter
            if ($status !== '') {
                $whereConditions[] = "o.status = ?";
                $queryParams[] = $status;
                $paramTypes .= "s";
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

                // Get orders with pagination
                $query = "
                    SELECT 
                        o.*, 
                        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                        u.email as customer_email,
                        u.phone as customer_phone
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
                
                $orders = [];
                while ($order = mysqli_fetch_assoc($result)) {
                    // Get order items for each order
                    $stmt2 = mysqli_prepare($conn, "
                        SELECT oi.*, p.name as product_name, p.image as product_image
                        FROM order_items oi
                        JOIN products p ON oi.product_id = p.id
                        WHERE oi.order_id = ?
                    ");
                    mysqli_stmt_bind_param($stmt2, "i", $order['id']);
                    mysqli_stmt_execute($stmt2);
                    $itemsResult = mysqli_stmt_get_result($stmt2);
                    
                    $order['items'] = [];
                    while ($item = mysqli_fetch_assoc($itemsResult)) {
                        $order['items'][] = $item;
                    }
                    
                    $orders[] = $order;
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
            } catch (Exception $e) {
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
            $stmt = mysqli_prepare($conn, "SELECT id FROM orders WHERE id = ?");
            mysqli_stmt_bind_param($stmt, "i", $orderId);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            if (!mysqli_fetch_assoc($result)) {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
                break;
            }

            // Start transaction
            mysqli_begin_transaction($conn);

            try {
                // Update order status
                if (isset($data['status'])) {
                    $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
                    if (!in_array($data['status'], $validStatuses)) {
                        throw new Exception('Invalid order status');
                    }

                    $stmt = mysqli_prepare($conn, "UPDATE orders SET status = ? WHERE id = ?");
                    mysqli_stmt_bind_param($stmt, "si", $data['status'], $orderId);
                    mysqli_stmt_execute($stmt);
                }

                // Update payment status
                if (isset($data['payment_status'])) {
                    $validPaymentStatuses = ['pending', 'paid', 'failed'];
                    if (!in_array($data['payment_status'], $validPaymentStatuses)) {
                        throw new Exception('Invalid payment status');
                    }

                    $stmt = mysqli_prepare($conn, "UPDATE orders SET payment_status = ? WHERE id = ?");
                    mysqli_stmt_bind_param($stmt, "si", $data['payment_status'], $orderId);
                    mysqli_stmt_execute($stmt);
                }

                mysqli_commit($conn);
                echo json_encode(['success' => true, 'message' => 'Order updated successfully']);
            } catch (Exception $e) {
                mysqli_rollback($conn);
                throw $e;
            }
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                throw new Exception('Order ID is required');
            }

            $orderId = (int)$_GET['id'];
            
            // Check if order exists
            $stmt = mysqli_prepare($conn, "SELECT id FROM orders WHERE id = ?");
            mysqli_stmt_bind_param($stmt, "i", $orderId);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            if (!mysqli_fetch_assoc($result)) {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
                break;
            }

            // Start transaction
            mysqli_begin_transaction($conn);

            try {
                // Delete order items first (cascade will handle this automatically due to foreign key)
                $stmt = mysqli_prepare($conn, "DELETE FROM orders WHERE id = ?");
                mysqli_stmt_bind_param($stmt, "i", $orderId);
                mysqli_stmt_execute($stmt);

                mysqli_commit($conn);
                echo json_encode(['success' => true, 'message' => 'Order deleted successfully']);
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
    error_log("Error in orders.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
} finally {
    if (isset($conn)) {
        mysqli_close($conn);
    }
}
?> 