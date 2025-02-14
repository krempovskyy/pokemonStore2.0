// Toggle Password Visibility
document.querySelector('.toggle-password').addEventListener('click', function() {
    const passwordInput = this.parentElement.querySelector('input');
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

// Simulate admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Form Submit Handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const loginBtn = this.querySelector('.login-btn');
    const username = this.querySelector('input[name="username"]').value;
    const password = this.querySelector('input[name="password"]').value;
    
    loginBtn.classList.add('loading');
    
    // simulate API call
    setTimeout(() => {
        if (username === ADMIN_CREDENTIALS.username && 
            password === ADMIN_CREDENTIALS.password) {
            
            // Lưu trạng thái đăng nhập
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
            
            // Chuyển hướng đến dashboard
            window.location.href = 'index.php';
        } else {
            loginBtn.classList.remove('loading');
            alert('Invalid username or password!');
        }
    }, 1000);
});

// Check login status
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('login.php') && isLoggedIn) {
        // If logged in and go to login page -> redirect to dashboard
        window.location.href = 'index.php';
    } else if (!currentPage.includes('login.php') && !isLoggedIn) {
        // if not logged in and go to other pages -> redirect to login
        window.location.href = 'login.php';
    }
}

// Check when reload page
checkLoginStatus();
