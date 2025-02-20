<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

// Database configuration
define('DB_HOST', 'db');
define('DB_NAME', 'pokemonstore');
define('DB_USER', 'root');
define('DB_PASS', 'password9');

// Database connection
function getDBConnection() {
    try {
        $conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        if (!$conn) {
            throw new Exception("Database connection failed: " . mysqli_connect_error());
        }
        
        mysqli_set_charset($conn, "utf8mb4");
        return $conn;
    } catch (Exception $e) {
        error_log("Database connection error: " . $e->getMessage());
        return null;
    }
}

function initSecureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        // Set secure session parameters
        ini_set('session.cookie_httponly', 1);
        ini_set('session.cookie_secure', 1);
        ini_set('session.cookie_samesite', 'Strict');
        ini_set('session.use_strict_mode', 1);
        ini_set('session.gc_maxlifetime', 3600);
        
        session_start();
        
        // Set session cookie parameters
        $params = session_get_cookie_params();
        setcookie(session_name(), session_id(), [
            'expires' => time() + 3600,
            'path' => '/',
            'domain' => '',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
    }
}

function checkAdminAuth($conn, $email, $password) {
    try {
        $email = mysqli_real_escape_string($conn, $email);
        $stmt = mysqli_prepare($conn, "SELECT id, password, role, first_name, last_name FROM users WHERE email = ? AND status = 'active' AND role = 'admin' LIMIT 1");
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if ($row = mysqli_fetch_assoc($result)) {
            if (password_verify($password, $row['password'])) {
                // Clear any existing session data
                session_unset();
                
                // Regenerate session ID
                session_regenerate_id(true);
                
                // Set session variables
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_id'] = $row['id'];
                $_SESSION['admin_email'] = $email;
                $_SESSION['admin_role'] = $row['role'];
                $_SESSION['admin_name'] = $row['first_name'] . ' ' . $row['last_name'];
                $_SESSION['session_id'] = session_id();
                $_SESSION['last_activity'] = time();
                
                return [
                    'success' => true,
                    'user_id' => $row['id'],
                    'role' => $row['role']
                ];
            }
        }
        
        return ['success' => false, 'message' => 'Invalid credentials'];
    } catch (Exception $e) {
        error_log("Admin auth error: " . $e->getMessage());
        return ['success' => false, 'message' => 'Authentication error'];
    }
}

function verifyAdminSession() {
    if (!isset($_SESSION['admin_logged_in']) || !$_SESSION['admin_logged_in'] || 
        !isset($_SESSION['admin_id']) || !isset($_SESSION['admin_role']) || 
        $_SESSION['admin_role'] !== 'admin' || !isset($_SESSION['session_id']) || 
        $_SESSION['session_id'] !== session_id()) {
        
        error_log("Session verification failed:");
        error_log("admin_logged_in set: " . (isset($_SESSION['admin_logged_in']) ? 'yes' : 'no'));
        error_log("admin_logged_in value: " . ($_SESSION['admin_logged_in'] ?? 'not set'));
        error_log("admin_id set: " . (isset($_SESSION['admin_id']) ? 'yes' : 'no'));
        error_log("admin_role set: " . (isset($_SESSION['admin_role']) ? 'yes' : 'no'));
        error_log("admin_role value: " . ($_SESSION['admin_role'] ?? 'not set'));
        error_log("session_id set: " . (isset($_SESSION['session_id']) ? 'yes' : 'no'));
        error_log("session_id match: " . (isset($_SESSION['session_id']) && $_SESSION['session_id'] === session_id() ? 'yes' : 'no'));
        error_log("Current session_id: " . session_id());
        error_log("Stored session_id: " . ($_SESSION['session_id'] ?? 'not set'));
        
        return false;
    }
    
    // Check session timeout (30 minutes)
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
        error_log("Session timeout");
        endSession();
        return false;
    }
    
    // Update last activity time
    $_SESSION['last_activity'] = time();
    error_log("Session verified successfully. Last activity updated to: " . date('Y-m-d H:i:s'));
    
    return true;
}

function endSession() {
    // Clear session data
    $_SESSION = array();
    
    // Delete session cookie
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
    
    // Destroy session
    session_destroy();
}

function checkAuth() {
    initSecureSession();
    
    $currentPath = $_SERVER['REQUEST_URI'];
    $isLoginPage = strpos($currentPath, 'login.php') !== false;
    
    if ($isLoginPage) {
        if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
            header('Location: /admin/index.php');
            exit();
        }
    } else {
        if (!verifyAdminSession()) {
            header('Location: /admin/login.php');
            exit();
        }
        
        // Update last activity time
        $_SESSION['last_activity'] = time();
    }
}
?>
