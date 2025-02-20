<?php
session_start();

// Include the DB connection
require_once __DIR__ . '/../config/db.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

$response = ['success' => false, 'message' => 'An error occurred'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get JSON input
        $rawData = file_get_contents('php://input');
        error_log("Raw request data: " . $rawData);
        
        $data = json_decode($rawData, true);
        error_log("Decoded data: " . print_r($data, true));
        
        // Validate input
        $email = isset($data['email']) ? trim($data['email']) : '';
        $password = isset($data['password']) ? $data['password'] : '';
        
        error_log("=== Processed input data ===");
        error_log("Email: " . $email);
        error_log("Password length: " . strlen($password));
        
        if (empty($email) || empty($password)) {
            $response['message'] = 'Please fill in all fields';
            echo json_encode($response);
            exit;
        }

        // Get user by email
        $sql = "SELECT id, email, password, first_name, last_name, role, status FROM users WHERE email = ? AND status = 'active'";
        error_log("=== Checking user credentials ===");
        error_log("SQL Query: " . $sql);
        error_log("Email being checked: " . $email);
        
        $stmt = $conn->prepare($sql);
        
        if ($stmt) {
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            
            error_log("Query result rows: " . $result->num_rows);
            
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                
                // Verify password
                if (password_verify($password, $user['password'])) {
                    error_log("Password verified successfully for user: " . $user['id']);
                    
                    // Set session variables
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_email'] = $user['email'];
                    $_SESSION['username'] = $user['first_name'] . ' ' . $user['last_name'];
                    $_SESSION['user_role'] = $user['role'];
                    
                    $response = [
                        'success' => true,
                        'message' => 'Login successful',
                        'data' => [
                            'id' => $user['id'],
                            'email' => $user['email'],
                            'name' => $user['first_name'] . ' ' . $user['last_name'],
                            'role' => $user['role']
                        ]
                    ];
                } else {
                    error_log("Invalid password for user: " . $email);
                    $response['message'] = 'Invalid email or password';
                }
            } else {
                error_log("No user found with email: " . $email);
                $response['message'] = 'Invalid email or password';
            }
            $stmt->close();
        } else {
            error_log("Failed to prepare statement: " . $conn->error);
            $response['message'] = 'Database error';
        }
    } catch (Exception $e) {
        error_log("Login error: " . $e->getMessage());
        $response['message'] = 'An error occurred during login';
    }
}

error_log("Final response: " . json_encode($response));
echo json_encode($response);
exit;
?>
