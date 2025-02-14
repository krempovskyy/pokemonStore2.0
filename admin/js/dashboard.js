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

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    
    // Clear admin login state
    localStorage.removeItem('adminLoggedIn');
    
    // Redirect to login page
    window.location.href = '/admin/login.php';
}); 