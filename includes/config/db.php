<?php
// Database configuration
$servername = "db";
$username = "root";
$password = "password9";
$dbname = "pokemonstore";

// Set default timezone
date_default_timezone_set('Europe/Helsinki');

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/db_errors.log');

// Create connection with error handling
try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Set charset to utf8mb4
    if (!$conn->set_charset("utf8mb4")) {
        error_log("Error setting charset: " . $conn->error);
    }
    
    // Set timezone
    if (!$conn->query("SET time_zone = 'Europe/Helsinki'")) {
        error_log("Error setting timezone: " . $conn->error);
    }
    
    error_log("Database connected successfully");
} catch (Exception $e) {
    error_log("Database connection error: " . $e->getMessage());
    die("Connection failed. Please try again later.");
}

// Function to safely close the database connection
function closeConnection() {
    global $conn;
    if ($conn && $conn instanceof mysqli) {
        $conn->close();
        error_log("Database connection closed");
    }
}

// Function to escape and sanitize input
function sanitizeInput($input) {
    global $conn;
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return $conn->real_escape_string(trim($input));
}

// Function to execute query with error handling
function executeQuery($sql, $params = []) {
    global $conn;
    try {
        error_log("Executing query: " . $sql);
        error_log("Parameters: " . print_r($params, true));

        if (empty($params)) {
            $result = $conn->query($sql);
            if ($result === false) {
                error_log("Query failed: " . $conn->error);
                throw new Exception("Query failed: " . $conn->error);
            }
            return $result;
        }

        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            error_log("Prepare failed: " . $conn->error);
            throw new Exception("Prepare failed: " . $conn->error);
        }

        if (!empty($params)) {
            $types = str_repeat('s', count($params));
            $stmt->bind_param($types, ...$params);
        }

        if (!$stmt->execute()) {
            error_log("Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }

        $result = $stmt->get_result();
        $stmt->close();
        
        error_log("Query executed successfully");
        return $result;
    } catch (Exception $e) {
        error_log("Query execution error: " . $e->getMessage());
        return false;
    }
}

// Register shutdown function to ensure connection is closed
register_shutdown_function('closeConnection');
?>