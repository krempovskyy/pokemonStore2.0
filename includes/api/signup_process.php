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

// Log request details
error_log("=== Starting registration process ===");
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Content Type: " . $_SERVER['CONTENT_TYPE']);

// Function to check password strength
function checkPasswordStrength($password) {
    $errors = [];
    
    if (strlen($password) < 8) {
        $errors[] = 'Password must be at least 8 characters long';
    }
    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = 'Password must contain at least one uppercase letter';
    }
    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = 'Password must contain at least one lowercase letter';
    }
    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = 'Password must contain at least one number';
    }
    if (!preg_match('/[!@#$%^&*()\-_=+{};:,<.>]/', $password)) {
        $errors[] = 'Password must contain at least one special character';
    }
    
    return $errors;
}

$response = ['success' => false, 'message' => 'An error occurred'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get JSON input
        $rawData = file_get_contents('php://input');
        error_log("Raw request data: " . $rawData);
        
        $data = json_decode($rawData, true);
        error_log("Decoded data: " . print_r($data, true));
        
        // Validate input
        $first_name = isset($data['first_name']) ? trim($data['first_name']) : '';
        $last_name = isset($data['last_name']) ? trim($data['last_name']) : '';
        $email = isset($data['email']) ? trim($data['email']) : '';
        $phone = isset($data['phone']) ? trim($data['phone']) : '';
        $address = isset($data['address']) ? trim($data['address']) : '';
        $password = isset($data['password']) ? $data['password'] : '';
        $confirm_password = isset($data['confirm_password']) ? $data['confirm_password'] : '';
        
        error_log("=== Processed input data ===");
        error_log("First Name: " . $first_name);
        error_log("Last Name: " . $last_name);
        error_log("Email: " . $email);
        error_log("Phone: " . $phone);
        error_log("Address: " . $address);
        error_log("Password length: " . strlen($password));
        
        $errors = [];
        if (empty($first_name)) {
            $errors[] = 'First name is required';
        }
        if (empty($last_name)) {
            $errors[] = 'Last name is required';
        }
        if (empty($email)) {
            $errors[] = 'Email is required';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Invalid email format';
        }
        if (empty($phone)) {
            $errors[] = 'Phone number is required';
        }
        if (empty($password)) {
            $errors[] = 'Password is required';
        } else {
            // Check password strength
            $passwordErrors = checkPasswordStrength($password);
            if (!empty($passwordErrors)) {
                $errors = array_merge($errors, $passwordErrors);
            }
        }
        if ($password !== $confirm_password) {
            $errors[] = 'Passwords do not match';
        }
        
        if (!empty($errors)) {
            error_log("Validation errors: " . implode(', ', $errors));
            $response['message'] = implode(', ', $errors);
            echo json_encode($response);
            exit;
        }
        
        // Check if email already exists
        $check_sql = "SELECT id FROM users WHERE email = ?";
        error_log("=== Checking email existence ===");
        error_log("SQL Query: " . $check_sql);
        error_log("Email being checked: " . $email);
        
        $check_stmt = $conn->prepare($check_sql);
        
        if ($check_stmt) {
            $check_stmt->bind_param("s", $email);
            $check_stmt->execute();
            $check_result = $check_stmt->get_result();
            
            error_log("Email check result rows: " . $check_result->num_rows);
            
            if ($check_result->num_rows > 0) {
                error_log("Email already exists in database: " . $email);
                $response['message'] = 'Email already exists';
                echo json_encode($response);
                exit;
            }
            $check_stmt->close();
        } else {
            error_log("Failed to prepare email check statement: " . $conn->error);
        }
        
        // Hash password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert new user
        $sql = "INSERT INTO users (first_name, last_name, email, phone, address, password, status) VALUES (?, ?, ?, ?, ?, ?, 'active')";
        error_log("=== Inserting new user ===");
        error_log("SQL Query: " . $sql);
        
        $stmt = $conn->prepare($sql);
        
        if ($stmt) {
            $stmt->bind_param("ssssss", $first_name, $last_name, $email, $phone, $address, $hashed_password);
            if ($stmt->execute()) {
                error_log("User registered successfully with ID: " . $stmt->insert_id);
                $response['success'] = true;
                $response['message'] = 'Registration successful';
                $response['data'] = [
                    'id' => $stmt->insert_id,
                    'email' => $email,
                    'name' => $first_name . ' ' . $last_name
                ];
            } else {
                error_log("Registration failed: " . $stmt->error);
                $response['message'] = 'Registration failed: ' . $stmt->error;
            }
            $stmt->close();
        } else {
            error_log("Failed to prepare insert statement: " . $conn->error);
            $response['message'] = 'Database error: ' . $conn->error;
        }
    } catch (Exception $e) {
        error_log('Registration error: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        $response['message'] = 'An error occurred during registration. Please try again.';
    }
}

error_log("Final response: " . json_encode($response));
echo json_encode($response);
exit;