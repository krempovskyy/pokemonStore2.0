<?php
require_once 'includes/auth.php';

// Initialize secure session
initSecureSession();

// End admin session using the auth function
endAdminSession();

// Clear any output buffers
while (ob_get_level()) {
    ob_end_clean();
}

// Prevent caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Redirect to login page with absolute path
header("Location: /admin/login.php");
exit();
?>
