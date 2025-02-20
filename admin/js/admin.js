// Simulate admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'Admin@123'
};

// Session management
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

// Validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function sanitizeInput(input) {
    if (!input) return '';
    return input.trim().replace(/[<>]/g, ''); // Basic XSS prevention
}

// Login attempt counter
let loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
let lockoutUntil = parseInt(localStorage.getItem('lockoutUntil') || '0');

// Form Submit Handler
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const loginBtn = this.querySelector('.login-btn');
    const email = sanitizeInput(this.querySelector('input[name="username"]').value);
    const password = this.querySelector('input[name="password"]').value;
    
    // Check if account is locked
    if (Date.now() < lockoutUntil) {
        const minutesLeft = Math.ceil((lockoutUntil - Date.now()) / 60000);
        showNotification(`Account is locked. Please try again in ${minutesLeft} minutes.`, 'error');
        return;
    }
    
    // Validate inputs
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Email validation
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Password validation
    if (!validatePassword(password)) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    loginBtn.classList.add('loading');
    
    try {
        const response = await fetch('/admin/api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Response was not JSON");
        }

        const data = await response.json();
        
        if (data.success) {
            // Reset login attempts on successful login
            loginAttempts = 0;
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('lockoutUntil');
            
            // Store session data
            const sessionData = {
                adminLoggedIn: true,
                sessionId: data.data.sessionId,
                email: data.data.email,
                expiresAt: Date.now() + SESSION_TIMEOUT
            };
            localStorage.setItem('adminSession', JSON.stringify(sessionData));
            
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard or previous page
            const redirectTo = localStorage.getItem('redirectFrom') || '/admin/index.php';
            localStorage.removeItem('redirectFrom');
            
            // Reload the page to ensure session is properly set
            window.location.reload();
            
            setTimeout(() => {
                window.location.href = redirectTo;
            }, 1000);
            
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        loginBtn.classList.remove('loading');
        
        loginAttempts++;
        localStorage.setItem('loginAttempts', loginAttempts.toString());
        
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            lockoutUntil = Date.now() + LOCKOUT_TIME;
            localStorage.setItem('lockoutUntil', lockoutUntil.toString());
            showNotification(`Too many failed attempts. Account locked for 15 minutes.`, 'error');
        } else {
            const attemptsLeft = MAX_LOGIN_ATTEMPTS - loginAttempts;
            showNotification(`${error.message}. ${attemptsLeft} attempts remaining.`, 'error');
        }
    } finally {
        loginBtn.classList.remove('loading');
    }
});

// Enhanced login status check
function checkLoginStatus() {
    try {
        const currentPath = window.location.pathname;
        const sessionData = JSON.parse(localStorage.getItem('adminSession') || '{}');
        const currentTime = Date.now();
        
        const isLoggedIn = sessionData.adminLoggedIn && 
                          sessionData.sessionId && 
                          currentTime < sessionData.expiresAt;

        // Only check and redirect if we're on an admin page
        if (currentPath.startsWith('/admin/')) {
            if (currentPath.includes('login.php')) {
                // On login page
                if (isLoggedIn) {
                    window.location.href = '/admin/index.php';
                }
            } else {
                // On other admin pages
                if (!isLoggedIn) {
                    // Save current page for redirect after login
                    localStorage.setItem('redirectFrom', currentPath);
                    localStorage.removeItem('adminSession');
                    window.location.href = '/admin/login.php';
                }
            }
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        localStorage.removeItem('adminSession');
        window.location.href = '/admin/login.php';
    }
}

// Show notification function with improved styling
function showNotification(message, type = 'success') {
    // Remove existing notifications first
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        opacity: 0;
        transform: translateX(50px);
        transition: all 0.3s ease-in-out;
        background-color: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#cce5ff'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#b8daff'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#004085'};
    `;

    // If message contains newlines, format as list
    if (message.includes('\n')) {
        const messages = message.split('\n');
        const title = messages[0];
        const items = messages.slice(1);
        
        notification.innerHTML = `
            <div style="display: flex; align-items: start;">
                <span style="margin-right: 10px; font-size: 16px;">
                    ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
                </span>
                <div style="flex: 1;">
                    <strong style="display: block; margin-bottom: 5px;">${title}</strong>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    } else {
        notification.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 10px; font-size: 16px;">
                    ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
                </span>
                <span>${message}</span>
            </div>
        `;
    }
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Initialize password toggle
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('input[name="password"]');
    
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Clear any existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Check login status
    checkLoginStatus();
});

