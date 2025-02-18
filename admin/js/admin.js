// Simulate admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'Admin@123'
};

// Session management
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

// Validation functions
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const errors = [];
    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
    if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
    if (!hasNumbers) errors.push('Password must contain at least one number');
    if (!hasSpecialChar) errors.push('Password must contain at least one special character');
    
    return errors;
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
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const loginBtn = this.querySelector('.login-btn');
    const username = sanitizeInput(this.querySelector('input[name="username"]').value);
    const password = this.querySelector('input[name="password"]').value;
    
    // Check if account is locked
    if (Date.now() < lockoutUntil) {
        const minutesLeft = Math.ceil((lockoutUntil - Date.now()) / 60000);
        showNotification(`Account is locked. Please try again in ${minutesLeft} minutes.`, 'error');
        return;
    }
    
    // Validate inputs
    if (!username || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Password validation
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
        showNotification('Password requirements not met:\n' + passwordErrors.join('\n'), 'error');
        return;
    }
    
    loginBtn.classList.add('loading');
    
    // Simulate API call with CSRF token
    const csrfToken = Math.random().toString(36).substring(7);
    setTimeout(() => {
        if (username === ADMIN_CREDENTIALS.username && 
            password === ADMIN_CREDENTIALS.password) {
            
            // Reset login attempts on successful login
            loginAttempts = 0;
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('lockoutUntil');
            
            // Save login state with additional security
            const loginTime = Date.now();
            const sessionData = {
                adminLoggedIn: true,
                adminUsername: username,
                loginTime: loginTime,
                sessionId: csrfToken,
                expiresAt: loginTime + SESSION_TIMEOUT
            };
            
            localStorage.setItem('adminSession', JSON.stringify(sessionData));
            
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard or previous page
            const redirectTo = localStorage.getItem('redirectFrom') || '/admin/index.php';
            localStorage.removeItem('redirectFrom');
            setTimeout(() => {
                window.location.href = redirectTo;
            }, 1000);
            
        } else {
            loginBtn.classList.remove('loading');
            loginAttempts++;
            localStorage.setItem('loginAttempts', loginAttempts.toString());
            
            if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                lockoutUntil = Date.now() + LOCKOUT_TIME;
                localStorage.setItem('lockoutUntil', lockoutUntil.toString());
                showNotification(`Too many failed attempts. Account locked for 15 minutes.`, 'error');
            } else {
                const attemptsLeft = MAX_LOGIN_ATTEMPTS - loginAttempts;
                showNotification(`Invalid username or password! ${attemptsLeft} attempts remaining.`, 'error');
            }
        }
    }, 1000);
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

// Improved password toggle functionality
function initializePasswordToggle() {
    const toggleBtn = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('input[name="password"]');
    
    if (toggleBtn && passwordInput) {
        // Style the toggle button
        toggleBtn.style.cssText = `
            border: none;
            background: none;
            color: #6c757d;
            transition: all 0.2s ease;
            padding: 0 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Add hover effect
        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.color = '#495057';
        });
        
        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.color = '#6c757d';
        });
        
        // Toggle password visibility with animation
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                this.setAttribute('title', 'Hide password');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                this.setAttribute('title', 'Show password');
            }
            
            // Keep focus on password input
            passwordInput.focus();
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Clear any existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Initialize password toggle
    initializePasswordToggle();
    
    // Check login status
    checkLoginStatus();
});
