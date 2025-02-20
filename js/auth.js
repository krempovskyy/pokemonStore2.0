document.addEventListener('DOMContentLoaded', function () {
    // Initialize password toggle buttons
    initializePasswordToggles();

    // Initialize form validation
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');

    if (signinForm) {
        initializeSigninForm(signinForm);
    }

    if (signupForm) {
        initializeSignupForm(signupForm);
    }
});

// Password toggle functionality
function initializePasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;

            // Toggle icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    });
}

// Signin form initialization
function initializeSigninForm(form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const formData = new FormData(form);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            remember: formData.get('remember') === 'on'
        };

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';

        // Simulate API call
        setTimeout(() => {
            // TODO: Replace with actual API call
            if (data.email === 'test@example.com' && data.password === 'Test@123') {
                showNotification('Success!', 'Signed in successfully. Redirecting...', 'success');
                setTimeout(() => window.location.href = 'index.php', 1500);
            } else {
                showNotification('Error!', 'Invalid email or password', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }, 1500);
    });
}

// Signup form initialization
function initializeSignupForm(form) {
    const password = form.querySelector('#password');
    const confirmPassword = form.querySelector('input[name="confirmPassword"]');

    // Password match validation
    confirmPassword.addEventListener('input', function () {
        if (this.value !== password.value) {
            this.setCustomValidity('Passwords do not match');
        } else {
            this.setCustomValidity('');
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const formData = new FormData(form);
        const data = {
            firstname: formData.get('firstName'),
            lastname: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            confirmpassword: formData.get('confirmPassword'),
            terms: formData.get('terms') === 'on'
        };

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating account...';

        // Simulate API call
        $.ajax({
            url: 'database/signupForm.php', // Use the form's action URL
            type: "POST",
            data: data, // Serialize form data
            success: function (response) {
                if (response == '1') {
                    showNotification('Success!', 'Account created successfully. Redirecting...', 'success');
                    setTimeout(() => window.location.href = 'signin.php', 1500);
                } else {
                    showNotification('Error!', response, 'error');
                }

            },
            error: function () {
                showNotification('Error!', 'Email already exists', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    });
}

// Notification function
function showNotification(title, message, type = 'success') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 300px;
        max-width: 500px;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
        border-radius: 8px;
        padding: 15px 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        opacity: 0;
        transform: translateX(20px);
        transition: all 0.3s ease;
    `;

    notification.innerHTML = `
        <div class="notification-header" style="display: flex; align-items: center; margin-bottom: 5px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}" 
               style="margin-right: 10px; font-size: 20px;"></i>
            <h5 style="margin: 0; font-size: 16px; font-weight: 600;">${title}</h5>
        </div>
        <p style="margin: 0;">${message}</p>
    `;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove notification
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(20px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
} 