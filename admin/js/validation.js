// Validation Utility for Admin Forms

// Regular expressions for validation
const VALIDATION_PATTERNS = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^\+?[1-9]\d{1,14}$/, // International phone number format
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
    fullName: /^[a-zA-Z\s'-]{2,100}$/,
    username: /^[a-zA-Z0-9_-]{3,20}$/,
    price: /^\d+(\.\d{1,2})?$/,
    quantity: /^[1-9]\d*$/,
};

// Validation rules for different form types
const VALIDATION_RULES = {
    login: {
        username: {
            required: true,
            pattern: VALIDATION_PATTERNS.username,
            message: 'Username must be 3-20 characters and can contain letters, numbers, underscores, and hyphens'
        },
        password: {
            required: true,
            pattern: VALIDATION_PATTERNS.password,
            message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
        }
    },
    customer: {
        fullName: {
            required: true,
            pattern: VALIDATION_PATTERNS.fullName,
            message: 'Full name must be 2-100 characters and can only contain letters, spaces, hyphens, and apostrophes'
        },
        email: {
            required: true,
            pattern: VALIDATION_PATTERNS.email,
            message: 'Please enter a valid email address'
        },
        phone: {
            required: true,
            pattern: VALIDATION_PATTERNS.phone,
            message: 'Please enter a valid phone number'
        },
        address: {
            required: true,
            minLength: 10,
            maxLength: 200,
            message: 'Address must be between 10 and 200 characters'
        },
        type: {
            required: true,
            options: ['retail', 'wholesale', 'vip'],
            message: 'Please select a valid customer type'
        }
    },
    product: {
        name: {
            required: true,
            minLength: 3,
            maxLength: 100,
            message: 'Product name must be between 3 and 100 characters'
        },
        price: {
            required: true,
            pattern: VALIDATION_PATTERNS.price,
            min: 0.01,
            message: 'Please enter a valid price greater than 0'
        },
        quantity: {
            required: true,
            pattern: VALIDATION_PATTERNS.quantity,
            min: 0,
            message: 'Please enter a valid quantity (0 or greater)'
        },
        description: {
            required: true,
            minLength: 10,
            maxLength: 1000,
            message: 'Description must be between 10 and 1000 characters'
        },
        category: {
            required: true,
            message: 'Please select a category'
        }
    },
    order: {
        status: {
            required: true,
            options: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            message: 'Please select a valid order status'
        },
        paymentMethod: {
            required: true,
            options: ['credit_card', 'paypal', 'bank_transfer'],
            message: 'Please select a valid payment method'
        },
        shippingAddress: {
            required: true,
            minLength: 10,
            maxLength: 200,
            message: 'Shipping address must be between 10 and 200 characters'
        }
    }
};

// Validation error styling
const ERROR_STYLES = {
    input: 'is-invalid',
    feedback: 'invalid-feedback'
};

// Function to show validation error
function showValidationError(input, message) {
    const field = input.closest('.form-group') || input.parentElement;
    input.classList.add(ERROR_STYLES.input);
    
    // Remove existing error message if any
    const existingError = field.querySelector(`.${ERROR_STYLES.feedback}`);
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = ERROR_STYLES.feedback;
    errorDiv.textContent = message;
    field.appendChild(errorDiv);
}

// Function to clear validation error
function clearValidationError(input) {
    const field = input.closest('.form-group') || input.parentElement;
    input.classList.remove(ERROR_STYLES.input);
    
    const errorDiv = field.querySelector(`.${ERROR_STYLES.feedback}`);
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Function to validate a single field
function validateField(input, rules) {
    const value = input.value.trim();
    const rule = rules[input.name];
    
    if (!rule) return true;
    
    // Required check
    if (rule.required && !value) {
        showValidationError(input, `This field is required`);
        return false;
    }
    
    // Pattern check
    if (rule.pattern && value && !rule.pattern.test(value)) {
        showValidationError(input, rule.message);
        return false;
    }
    
    // Length check
    if (rule.minLength && value.length < rule.minLength) {
        showValidationError(input, `Minimum length is ${rule.minLength} characters`);
        return false;
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
        showValidationError(input, `Maximum length is ${rule.maxLength} characters`);
        return false;
    }
    
    // Options check
    if (rule.options && !rule.options.includes(value)) {
        showValidationError(input, rule.message);
        return false;
    }
    
    // Numeric range check
    if (rule.min !== undefined) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < rule.min) {
            showValidationError(input, rule.message);
            return false;
        }
    }
    
    clearValidationError(input);
    return true;
}

// Function to validate entire form
function validateForm(form, formType) {
    const rules = VALIDATION_RULES[formType];
    if (!rules) {
        console.error(`No validation rules found for form type: ${formType}`);
        return false;
    }
    
    let isValid = true;
    const formData = new FormData(form);
    
    for (const [name, value] of formData.entries()) {
        const input = form.querySelector(`[name="${name}"]`);
        if (input && !validateField(input, rules)) {
            isValid = false;
        }
    }
    
    return isValid;
}

// Function to initialize real-time validation
function initializeRealTimeValidation(form, formType) {
    const rules = VALIDATION_RULES[formType];
    if (!rules) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateField(input, rules);
        });
        
        input.addEventListener('blur', () => {
            validateField(input, rules);
        });
    });
}

// Export functions
window.AdminValidation = {
    validateForm,
    validateField,
    initializeRealTimeValidation,
    VALIDATION_RULES
}; 