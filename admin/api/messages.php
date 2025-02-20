<?php
require_once '../includes/auth.php';

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

// Set JSON content type
header('Content-Type: application/json');

try {
    // Initialize secure session
    initSecureSession();
    
    // Verify admin authentication
    if (!verifyAdminSession()) {
        throw new Exception('Unauthorized access');
    }

    // Get database connection
    $conn = getDBConnection();
    if (!$conn) {
        throw new Exception('Database connection failed');
    }

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get single message if ID is provided
            if (isset($_GET['id'])) {
                $messageId = (int)$_GET['id'];
                $stmt = mysqli_prepare($conn, "SELECT * FROM contact_messages WHERE message_id = ?");
                mysqli_stmt_bind_param($stmt, "i", $messageId);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                $message = mysqli_fetch_assoc($result);
                
                if ($message) {
                    echo json_encode(['success' => true, 'data' => ['message' => $message]]);
                } else {
                    throw new Exception('Message not found');
                }
                break;
            }

            // Get query parameters
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? max(1, min(50, (int)$_GET['limit'])) : 10;
            $search = isset($_GET['search']) ? mysqli_real_escape_string($conn, trim($_GET['search'])) : '';
            $status = isset($_GET['status']) ? mysqli_real_escape_string($conn, trim($_GET['status'])) : '';
            
            // Calculate offset
            $offset = ($page - 1) * $limit;

            // Build base query
            $baseQuery = "FROM contact_messages WHERE 1=1";
            $params = [];
            $paramTypes = "";

            // Add search condition
            if ($search !== '') {
                $baseQuery .= " AND (name LIKE ? OR email LIKE ? OR subject LIKE ?)";
                $searchPattern = "%{$search}%";
                array_push($params, $searchPattern, $searchPattern, $searchPattern);
                $paramTypes .= "sss";
            }

            // Add status filter
            if ($status !== '') {
                $baseQuery .= " AND message_status = ?";
                $params[] = $status;
                $paramTypes .= "s";
            }

            // Get total count
            $countQuery = "SELECT COUNT(*) " . $baseQuery;
            $stmt = mysqli_prepare($conn, $countQuery);
            if (!empty($params)) {
                mysqli_stmt_bind_param($stmt, $paramTypes, ...$params);
            }
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $totalCount = (int)mysqli_fetch_row($result)[0];

            // Calculate total pages
            $totalPages = ceil($totalCount / $limit);

            // Get messages with pagination
            $query = "SELECT * " . $baseQuery . " ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $stmt = mysqli_prepare($conn, $query);
            if (!empty($params)) {
                $paramTypes .= "ii";
                $params[] = $limit;
                $params[] = $offset;
                mysqli_stmt_bind_param($stmt, $paramTypes, ...$params);
            } else {
                mysqli_stmt_bind_param($stmt, "ii", $limit, $offset);
            }
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);

            $messages = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $messages[] = $row;
            }

            echo json_encode([
                'success' => true,
                'data' => [
                    'messages' => $messages,
                    'pagination' => [
                        'currentPage' => $page,
                        'totalPages' => $totalPages,
                        'totalItems' => $totalCount,
                        'limit' => $limit
                    ]
                ]
            ]);
            break;

        case 'PUT':
            // Get message ID and data
            $data = json_decode(file_get_contents('php://input'), true);
            $messageId = isset($data['id']) ? (int)$data['id'] : 0;
            $status = isset($data['status']) ? $data['status'] : null;

            if (!$messageId) {
                throw new Exception('Message ID is required');
            }

            if ($status && !in_array($status, ['read', 'unread'])) {
                throw new Exception('Invalid status value');
            }

            // Update message status
            $stmt = mysqli_prepare($conn, "UPDATE contact_messages SET message_status = ? WHERE message_id = ?");
            mysqli_stmt_bind_param($stmt, "si", $status, $messageId);
            
            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception('Failed to update message status');
            }

            echo json_encode([
                'success' => true,
                'message' => 'Message status updated successfully'
            ]);
            break;

        case 'DELETE':
            // Get message ID
            $messageId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

            if (!$messageId) {
                throw new Exception('Message ID is required');
            }

            // Delete message
            $stmt = mysqli_prepare($conn, "DELETE FROM contact_messages WHERE message_id = ?");
            mysqli_stmt_bind_param($stmt, "i", $messageId);
            
            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception('Failed to delete message');
            }

            echo json_encode([
                'success' => true,
                'message' => 'Message deleted successfully'
            ]);
            break;

        default:
            throw new Exception('Method not allowed');
    }
} catch (Exception $e) {
    error_log("Error in messages.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        mysqli_close($conn);
    }
} 