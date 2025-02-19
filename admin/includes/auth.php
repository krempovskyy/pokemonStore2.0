<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

// Initialize secure session
function initSecureSession() {
    error_log("Initializing secure session...");
    error_log("Current session status: " . session_status());
    
    if (session_status() === PHP_SESSION_NONE) {
        // Set session cookie parameters before starting the session
        $params = [
            'lifetime' => 3600,
            'path' => '/',
            'domain' => '',
            'secure' => isset($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Lax'
        ];
        
        error_log("Setting session parameters: " . print_r($params, true));
        session_set_cookie_params($params);

        // Set additional session security options
        ini_set('session.use_only_cookies', 1);
        ini_set('session.use_strict_mode', 1);
        ini_set('session.gc_maxlifetime', 3600);
        
        error_log("Starting new session...");
        session_start();
        error_log("Session started. Session ID: " . session_id());
    } else {
        error_log("Session already active. Session ID: " . session_id());
    }
    
    error_log("Current session data: " . print_r($_SESSION, true));
}

// Database connection
function getDBConnection() {
    $host = 'db';
    $dbname = 'pokemonstore';
    $username = 'root';
    $password = 'password9';
    
    try {
        error_log("Attempting database connection to {$host}/{$dbname}...");
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        error_log("Database connection successful");
        return $pdo;
    } catch(PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}

// Check authentication status
function checkAuth() {
    error_log("Checking authentication status...");
    initSecureSession();
    
    $currentPath = $_SERVER['REQUEST_URI'];
    $isLoginPage = strpos($currentPath, 'login.php') !== false;
    error_log("Current path: {$currentPath}, Is login page: " . ($isLoginPage ? 'yes' : 'no'));
    
    if ($isLoginPage) {
        if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
            error_log("Admin already logged in, redirecting to index");
            header('Location: /admin/index.php');
            exit();
        }
    } else {
        if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
            error_log("No valid admin session found, redirecting to login");
            header('Location: /admin/login.php');
            exit();
        }
        
        // Check session timeout
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 3600)) {
            error_log("Session timeout detected");
            endAdminSession();
            header('Location: /admin/login.php?timeout=1');
            exit();
        }
        $_SESSION['last_activity'] = time();
        error_log("Session activity timestamp updated");
    }
}

// Admin login function
function adminLogin($email, $password) {
    error_log("Attempting admin login for email: {$email}");
    initSecureSession();
    
    $pdo = getDBConnection();
    if (!$pdo) {
        error_log("Login failed: Database connection error");
        return false;
    }
    
    try {
        // Get admin user from database
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email AND role = 'admin' AND status = 'active'");
        $stmt->execute(['email' => $email]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$admin) {
            error_log("Login failed: No active admin user found with email: {$email}");
            return false;
        }
        
        if (password_verify($password, $admin['password'])) {
            error_log("Password verified successfully for admin: {$email}");
            
            // Clear any existing session data
            session_unset();
            error_log("Cleared existing session data");
            
            // Regenerate session ID to prevent session fixation
            $oldSessionId = session_id();
            session_regenerate_id(true);
            error_log("Regenerated session ID. Old: {$oldSessionId}, New: " . session_id());
            
            // Set session variables
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_email'] = $email;
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['last_activity'] = time();
            $_SESSION['session_id'] = session_id();
            
            error_log("Set new session data: " . print_r($_SESSION, true));
            return true;
        } else {
            error_log("Login failed: Invalid password for admin: {$email}");
        }
    } catch(PDOException $e) {
        error_log("Login failed - Database error: " . $e->getMessage());
    }
    
    return false;
}

// End admin session securely
function endAdminSession() {
    error_log("Ending admin session...");
    error_log("Current session data before cleanup: " . print_r($_SESSION, true));
    
    initSecureSession();
    
    // Unset all session variables
    session_unset();
    error_log("Session variables unset");
    
    // Destroy the session cookie
    if (isset($_COOKIE[session_name()])) {
        error_log("Removing session cookie");
        setcookie(session_name(), '', time() - 3600, '/');
    }
    
    // Destroy the session
    session_destroy();
    error_log("Session destroyed");
}

// Verify admin session
function verifyAdminSession() {
    error_log("Verifying admin session...");
    initSecureSession();
    
    error_log("Current session data: " . print_r($_SESSION, true));
    
    // Check if session exists and is valid
    if (!isset($_SESSION['admin_logged_in']) || 
        !$_SESSION['admin_logged_in'] || 
        !isset($_SESSION['session_id']) || 
        $_SESSION['session_id'] !== session_id()) {
        
        error_log("Session verification failed:");
        error_log("admin_logged_in set: " . (isset($_SESSION['admin_logged_in']) ? 'yes' : 'no'));
        error_log("admin_logged_in value: " . ($_SESSION['admin_logged_in'] ?? 'not set'));
        error_log("session_id set: " . (isset($_SESSION['session_id']) ? 'yes' : 'no'));
        error_log("session_id match: " . ($_SESSION['session_id'] === session_id() ? 'yes' : 'no'));
        error_log("Current session_id: " . session_id());
        error_log("Stored session_id: " . ($_SESSION['session_id'] ?? 'not set'));
        
        return false;
    }
    
    // Check session timeout
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 3600)) {
        error_log("Session timeout detected. Last activity: " . date('Y-m-d H:i:s', $_SESSION['last_activity']));
        endAdminSession();
        return false;
    }
    
    // Update last activity time
    $_SESSION['last_activity'] = time();
    error_log("Session verified successfully. Last activity updated to: " . date('Y-m-d H:i:s', $_SESSION['last_activity']));
    
    return true;
}
?>
