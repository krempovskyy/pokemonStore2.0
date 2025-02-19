<?php
// Database configuration
$servername = "db";
$username = "root";
$password = "password9";
$dbname = "pokemonstore";

// Set default timezone
date_default_timezone_set('Europe/Helsinki');

// Create connection with error handling
try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Set charset to utf8mb4
    $conn->set_charset("utf8mb4");
    
    // Set timezone
    $conn->query("SET time_zone = 'Europe/Helsinki'");
    
} catch (Exception $e) {
    die("Connection failed: " . $e->getMessage());
}

// Function to safely close the database connection
function closeConnection() {
    global $conn;
    if ($conn) {
        $conn->close();
    }
}

// Register shutdown function to ensure connection is closed
register_shutdown_function('closeConnection');
?>