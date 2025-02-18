// Toggle Menu
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.side-bar');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
}

// Menu toggle functionality
document.querySelector('.menu-toggle')?.addEventListener('click', function() {
    document.querySelector('.side-bar').classList.toggle('collapsed');
});

// Initialize tooltips
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Logout functionality
document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        // Clear all admin session data
        localStorage.removeItem('adminSession');
        sessionStorage.clear();
        
        // Clear any other stored data
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Redirect to login page
        window.location.href = '/admin/login.php';
    }
});

// Session check
function checkAdminSession() {
    const sessionData = JSON.parse(localStorage.getItem('adminSession') || '{}');
    const currentTime = Date.now();
    const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

    if (!sessionData.adminLoggedIn || 
        !sessionData.sessionId || 
        (currentTime - sessionData.loginTime) >= SESSION_TIMEOUT) {
        // Session expired or invalid
        localStorage.removeItem('adminSession');
        window.location.href = '/admin/login.php';
    }
}

// Check session every minute
setInterval(checkAdminSession, 60000);

// Update user info in sidebar
function updateUserInfo() {
    const sessionData = JSON.parse(localStorage.getItem('adminSession') || '{}');
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement && sessionData.adminUsername) {
        userNameElement.textContent = sessionData.adminUsername;
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    updateUserInfo();
    checkAdminSession();
}); 