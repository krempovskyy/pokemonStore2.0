<?php
header('Content-Type: application/json');
require_once '../includes/auth.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$password = $input['password'];

// Attempt login
if (adminLogin($email, $password)) {
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'email' => $email,
            'sessionId' => session_id()
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'error' => 'Invalid email or password'
    ]);
}
?> 