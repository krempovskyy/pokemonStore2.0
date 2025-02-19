<?php
// Database connection function
function getDBConnection() {
    $host = 'db';
    $dbname = 'pokemonstore';
    $username = 'root';
    $password = 'password9';
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch(PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
} 
?>