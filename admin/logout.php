<?php
require_once 'includes/auth.php';

// Initialize secure session
initSecureSession();

// End the session
endSession();

// Redirect to login page
header('Location: /admin/login.php');
exit();
?>
