<?php
function checkAuth() {
    $currentPath = $_SERVER['REQUEST_URI'];
    $isLoginPage = strpos($currentPath, 'login.php') !== false;
    
    echo "
    <script>
        function handleAuthRedirect() {
            const sessionData = JSON.parse(localStorage.getItem('adminSession') || '{}');
            const currentTime = Date.now();
            const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
            
            const isLoggedIn = sessionData.adminLoggedIn && 
                              sessionData.sessionId && 
                              (currentTime - sessionData.loginTime) < SESSION_TIMEOUT;
            
            if (" . ($isLoginPage ? "isLoggedIn" : "!isLoggedIn") . ") {
                localStorage.setItem('redirectFrom', window.location.pathname);
                window.location.href = '" . ($isLoginPage ? "/admin/index.php" : "/admin/login.php") . "';
            }
        }

        // Check immediately and also after a short delay to ensure DOM is loaded
        handleAuthRedirect();
        document.addEventListener('DOMContentLoaded', handleAuthRedirect);
    </script>
    ";
}

// Function to safely end admin session
function endAdminSession() {
    echo "
    <script>
        localStorage.removeItem('adminSession');
        sessionStorage.clear();
        document.cookie.split(';').forEach(function(c) { 
            document.cookie = c.trim().split('=')[0] + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; 
        });
    </script>
    ";
}
?>
