<?php
session_start();

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

// Set JSON content type
header('Content-Type: application/json');

try {
    // Get JSON data from request
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception('Invalid request data');
    }

    // Validate required fields
    $required_fields = ['name', 'email', 'subject', 'message'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            throw new Exception("Please fill in the {$field} field");
        }
    }

    // Validate email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Include database connection
    require_once __DIR__ . '/../config/db.php';

    // Prepare and execute query
    $stmt = mysqli_prepare($conn, "
        INSERT INTO contact_messages (name, email, subject, message, message_status, created_at)
        VALUES (?, ?, ?, ?, 'unread', NOW())
    ");

    mysqli_stmt_bind_param($stmt, "ssss", 
        $data['name'],
        $data['email'],
        $data['subject'],
        $data['message']
    );

    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception('Failed to save message: ' . mysqli_error($conn));
    }

    // Log success
    error_log("Contact message saved successfully from: {$data['email']}");

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully'
    ]);

} catch (Exception $e) {
    error_log("Contact form error: " . $e->getMessage());
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
?>

    