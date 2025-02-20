<?php
session_start();

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

error_log("=== Starting logout process ===");
error_log("User ID: " . ($_SESSION['user_id'] ?? 'not set'));
error_log("Username: " . ($_SESSION['username'] ?? 'not set'));

// Clear all session variables
$_SESSION = array();

// Destroy the session cookie
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', [
        'expires' => time() - 3600,
        'path' => '/',
        'domain' => '',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
}

// Destroy the session
session_destroy();

error_log("=== Logout completed successfully ===");

// Redirect to home page
header('Location: /index.php');
exit(); 