// Users Management JavaScript

// Global utility functions
function showNotification(title, messages, type = 'success') {
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
        border-radius: 4px;
        padding: 15px 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        opacity: 0;
        transform: translateX(20px);
        transition: all 0.3s ease;
    `;

    notification.innerHTML = `
        <div class="notification-header" style="display: flex; align-items: center; margin-bottom: 10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}" 
               style="margin-right: 10px; font-size: 20px;"></i>
            <h5 style="margin: 0; font-size: 16px; font-weight: 600;">${title}</h5>
        </div>
        ${messages.length > 1 ? `
            <ul style="margin: 0; padding-left: 25px;">
                ${messages.map(msg => `<li>${msg}</li>`).join('')}
            </ul>
        ` : `<p style="margin: 0;">${messages[0]}</p>`}
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

// Sample data
let customers = [
    {
        id: 1,
        fullName: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        address: "123 Pokemon Street, Pallet Town, KT 12345",
        type: "vip",
        status: "active",
        joinedDate: "2024-02-15",
        lastOrder: "2024-02-20T14:30:00"
    },
    {
        id: 2,
        fullName: "Jane Smith",
        email: "jane@example.com",
        phone: "+1987654321",
        address: "456 Trainer Avenue, Cerulean City, KT 67890",
        type: "retail",
        status: "active",
        joinedDate: "2024-01-20",
        lastOrder: "2024-02-19T09:15:00"
    },
    {
        id: 3,
        fullName: "Mike Johnson",
        email: "mike@example.com",
        phone: "+1122334455",
        address: "789 Pokemon Center, Viridian City, KT 13579",
        type: "wholesale",
        status: "inactive",
        joinedDate: "2024-01-10",
        lastOrder: "2024-01-15T16:45:00"
    }
];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // Render initial customers
    renderCustomers(customers);

    // Initialize event listeners
    initializeSearch();
    initializeFilters();
    initializeDeleteButtons();
    initializeEditButtons();
    initializeFormSubmission();
});

// Render customers table
function renderCustomers(customersToRender = customers) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (customersToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No customers found</td>
            </tr>
        `;
        return;
    }

    customersToRender.forEach(customer => {
        const tr = document.createElement('tr');
        tr.dataset.customerId = customer.id;
        
        const lastOrderDate = new Date(customer.lastOrder);
        const timeAgo = getTimeAgo(lastOrderDate);

        tr.innerHTML = `
            <td>
                <div class="customer-info">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(customer.fullName)}" 
                         alt="${customer.fullName}" 
                         class="customer-avatar">
                    <span class="customer-name">${customer.fullName}</span>
                </div>
            </td>
            <td>${customer.email}</td>
            <td>
                <span class="badge bg-${getTypeColor(customer.type)}" data-role="${customer.type}">
                    ${customer.type.toUpperCase()}
                </span>
            </td>
            <td data-joined="${customer.joinedDate}">${formatDate(customer.joinedDate)}</td>
            <td>${timeAgo}</td>
            <td>
                <span class="badge bg-${getStatusColor(customer.status)}" data-status="${customer.status}">
                    ${customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-info" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Utility functions
function getTypeColor(type) {
    const colors = {
        'retail': 'info',
        'wholesale': 'primary',
        'vip': 'warning'
    };
    return colors[type] || 'secondary';
}

function getStatusColor(status) {
    const colors = {
        'active': 'success',
        'inactive': 'warning',
        'blocked': 'danger'
    };
    return colors[status] || 'secondary';
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
}

// Search functionality with debounce
function initializeSearch() {
    const searchInput = document.querySelector('.search-box input');
    let debounceTimer;

    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = this.value.toLowerCase();
            filterCustomers(searchTerm);
        }, 300);
    });
}

// Filter change handlers
function initializeFilters() {
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    const sortBy = document.getElementById('sortBy');

    roleFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    sortBy.addEventListener('change', applyFilters);
}

// Delete customer handler
function initializeDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.btn-danger');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to delete this customer?')) {
                const customerId = this.closest('tr').dataset.customerId;
                deleteCustomer(customerId);
            }
        });
    });
}

// Edit customer handler
function initializeEditButtons() {
    const editButtons = document.querySelectorAll('.btn-info');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const customerId = this.closest('tr').dataset.customerId;
            loadCustomerData(customerId);
        });
    });
}

// Form submission handler
function initializeFormSubmission() {
    const addCustomerForm = document.getElementById('addCustomerForm');
    const editCustomerForm = document.getElementById('editCustomerForm');

    addCustomerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleCustomerFormSubmit(this);
    });

    editCustomerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleCustomerFormSubmit(this);
    });
}

// Filter customers based on search term
function filterCustomers(searchTerm) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Apply all filters
function applyFilters() {
    const roleValue = document.getElementById('roleFilter').value;
    const statusValue = document.getElementById('statusFilter').value;
    const sortValue = document.getElementById('sortBy').value;

    // Apply filters to the table
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    rows.forEach(row => {
        const roleMatch = !roleValue || row.querySelector('[data-role]').dataset.role === roleValue;
        const statusMatch = !statusValue || row.querySelector('[data-status]').dataset.status === statusValue;
        row.style.display = roleMatch && statusMatch ? '' : 'none';
    });

    // Apply sorting
    sortCustomers(rows, sortValue);
}

// Sort customers
function sortCustomers(rows, sortValue) {
    const tbody = document.querySelector('tbody');
    rows.sort((a, b) => {
        switch(sortValue) {
            case 'name':
                return a.querySelector('.customer-name').textContent.localeCompare(
                    b.querySelector('.customer-name').textContent
                );
            case 'name-desc':
                return b.querySelector('.customer-name').textContent.localeCompare(
                    a.querySelector('.customer-name').textContent
                );
            case 'newest':
                return new Date(b.querySelector('[data-joined]').dataset.joined) - 
                       new Date(a.querySelector('[data-joined]').dataset.joined);
            case 'oldest':
                return new Date(a.querySelector('[data-joined]').dataset.joined) - 
                       new Date(b.querySelector('[data-joined]').dataset.joined);
            default:
                return 0;
        }
    });

    rows.forEach(row => tbody.appendChild(row));
}

// API calls
async function addCustomer(formData) {
    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            location.reload();
        } else {
            throw new Error('Failed to add customer');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add customer. Please try again.');
    }
}

async function updateCustomer(formData) {
    try {
        const customerId = formData.get('customerId');
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'PUT',
            body: formData
        });
        
        if (response.ok) {
            location.reload();
        } else {
            throw new Error('Failed to update customer');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update customer. Please try again.');
    }
}

async function deleteCustomer(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            location.reload();
        } else {
            throw new Error('Failed to delete customer');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete customer. Please try again.');
    }
}

async function loadCustomerData(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (response.ok) {
            const customer = await response.json();
            populateEditForm(customer);
        } else {
            throw new Error('Failed to load customer data');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load customer data. Please try again.');
    }
}

// Populate edit form with customer data
function populateEditForm(customer) {
    const form = document.getElementById('editCustomerForm');
    form.querySelector('[name="customerId"]').value = customer.id;
    form.querySelector('[name="fullName"]').value = customer.fullName;
    form.querySelector('[name="email"]').value = customer.email;
    form.querySelector('[name="phone"]').value = customer.phone;
    form.querySelector('[name="address"]').value = customer.address;
    form.querySelector('[name="type"]').value = customer.type;
    form.querySelector('[name="status"]').value = customer.status;
}

// Reset modal forms when closed
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('hidden.bs.modal', function() {
        const form = this.querySelector('form');
        if (form) form.reset();
    });
});

// Customer validation functions
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/; // International phone number format
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VALID_CUSTOMER_TYPES = ['retail', 'wholesale', 'vip'];

function validateCustomerData(formData) {
    const errors = [];
    
    // Full Name validation
    const fullName = formData.get('fullName')?.trim();
    if (!fullName) {
        errors.push('Full name is required');
    } else if (fullName.length < 2) {
        errors.push('Full name must be at least 2 characters long');
    } else if (fullName.length > 100) {
        errors.push('Full name must not exceed 100 characters');
    } else if (!/^[a-zA-ZÀ-ỹ\s'-]+$/u.test(fullName)) {
        errors.push('Full name can only contain letters, spaces, hyphens and apostrophes');
    }
    
    // Email validation
    const email = formData.get('email')?.trim().toLowerCase();
    if (!email) {
        errors.push('Email is required');
    } else if (!EMAIL_REGEX.test(email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Phone validation
    const phone = formData.get('phone')?.trim();
    if (!phone) {
        errors.push('Phone number is required');
    } else if (!PHONE_REGEX.test(phone)) {
        errors.push('Please enter a valid phone number');
    }
    
    // Address validation
    const address = formData.get('address')?.trim();
    if (!address) {
        errors.push('Address is required');
    } else if (address.length < 10) {
        errors.push('Address must be at least 10 characters long');
    } else if (address.length > 200) {
        errors.push('Address must not exceed 200 characters');
    }
    
    // Customer Type validation
    const type = formData.get('type');
    if (!type) {
        errors.push('Customer type is required');
    } else if (!VALID_CUSTOMER_TYPES.includes(type)) {
        errors.push('Invalid customer type selected');
    }

    // Status validation
    const status = formData.get('status');
    if (!status) {
        errors.push('Status is required');
    } else if (!['active', 'inactive'].includes(status)) {
        errors.push('Invalid status selected');
    }
    
    return errors;
}

function sanitizeCustomerData(formData) {
    const sanitized = new FormData();
    
    for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
            // Remove HTML tags, extra spaces, and potentially dangerous characters
            let sanitizedValue = value
                .replace(/<[^>]*>/g, '')
                .trim()
                .replace(/[<>]/g, '');
                
            // Special handling for different fields
            switch (key) {
                case 'email':
                    sanitizedValue = sanitizedValue.toLowerCase();
                    break;
                case 'phone':
                    sanitizedValue = sanitizedValue.replace(/[^\d+]/g, '');
                    break;
                case 'fullName':
                    sanitizedValue = sanitizedValue
                        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                        .replace(/[^a-zA-Z\s'-]/g, ''); // Allow only letters, spaces, hyphens and apostrophes
                    break;
            }
            
            sanitized.append(key, sanitizedValue);
        } else {
            sanitized.append(key, value);
        }
    }
    
    return sanitized;
}

// Handle customer form submission
async function handleCustomerFormSubmit(form) {
    const formData = new FormData(form);
    const errors = validateCustomerData(formData);
    
    if (errors.length > 0) {
        showNotification('Validation Error', errors, 'error');
        return;
    }

    const sanitizedData = sanitizeCustomerData(formData);
    const isEditForm = form.id === 'editCustomerForm';
    
    try {
        if (isEditForm) {
            await updateCustomer(sanitizedData);
            showNotification('Success', ['Customer updated successfully'], 'success');
            bootstrap.Modal.getInstance(document.getElementById('editCustomerModal')).hide();
        } else {
            await addCustomer(sanitizedData);
            showNotification('Success', ['New customer added successfully'], 'success');
            bootstrap.Modal.getInstance(document.getElementById('addCustomerModal')).hide();
        }
        form.reset();
        setTimeout(() => location.reload(), 1500);
    } catch (error) {
        showNotification('Error', [error.message || 'Failed to process customer data'], 'error');
    }
}

// Initialize customer form handlers
document.addEventListener('DOMContentLoaded', function() {
    const addCustomerForm = document.getElementById('addCustomerForm');
    if (addCustomerForm) {
        addCustomerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCustomerFormSubmit(this);
        });
    }
    
    // Real-time validation feedback
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const email = this.value.trim().toLowerCase();
            if (email && !EMAIL_REGEX.test(email)) {
                this.setCustomValidity('Please enter a valid email address');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    const phoneInput = document.querySelector('input[type="tel"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            const phone = this.value.trim();
            if (phone && !PHONE_REGEX.test(phone)) {
                this.setCustomValidity('Please enter a valid phone number');
            } else {
                this.setCustomValidity('');
            }
        });
    }
});

// Add Customer Form Handler
document.getElementById('addCustomerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Enable Bootstrap validation
    this.classList.add('was-validated');
    
    if (!this.checkValidity()) {
        e.stopPropagation();
        return;
    }
    
    const formData = new FormData(this);
    const customerData = {
        id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        type: formData.get('customerType'),
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        lastOrder: null
    };
    
    // Validate customer data
    const errors = validateCustomerData(formData);
    if (errors.length > 0) {
        showNotification('Validation Error', errors, 'error');
        return;
    }
    
    // Add customer to array
    customers.push(customerData);
    
    // Show success notification
    showNotification('Success', ['Customer added successfully'], 'success');
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
    modal.hide();
    this.reset();
    
    // Refresh customer list
    renderCustomers();
});

// Edit Customer Form Handler
document.getElementById('editCustomerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Enable Bootstrap validation
    this.classList.add('was-validated');
    
    if (!this.checkValidity()) {
        e.stopPropagation();
        return;
    }
    
    const formData = new FormData(this);
    const customerId = parseInt(formData.get('customerId'));
    
    // Find customer index
    const index = customers.findIndex(c => c.id === customerId);
    if (index === -1) {
        showNotification('Error', ['Customer not found'], 'error');
        return;
    }
    
    // Update customer data
    const customerData = {
        ...customers[index],
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        type: formData.get('customerType'),
        status: formData.get('status')
    };
    
    // Validate customer data
    const errors = validateCustomerData(formData);
    if (errors.length > 0) {
        showNotification('Validation Error', errors, 'error');
        return;
    }
    
    // Update customer in array
    customers[index] = customerData;
    
    // Show success notification
    showNotification('Success', ['Customer updated successfully'], 'success');
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('editCustomerModal'));
    modal.hide();
    this.reset();
    
    // Refresh customer list
    renderCustomers();
});

// Delete Customer Handler
function deleteCustomer(customerId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
        return;
    }
    
    // Find customer index
    const index = customers.findIndex(c => c.id === customerId);
    if (index === -1) {
        showNotification('Error', ['Customer not found'], 'error');
        return;
    }
    
    // Remove customer from array
    customers.splice(index, 1);
    
    // Show success notification
    showNotification('Success', ['Customer deleted successfully'], 'success');
    
    // Refresh customer list
    renderCustomers();
}

// Load Customer Data for Editing
function loadCustomerData(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
        showNotification('Error', ['Customer not found'], 'error');
        return;
    }
    
    const form = document.getElementById('editCustomerForm');
    
    // Reset form validation
    form.classList.remove('was-validated');
    
    // Populate form fields
    form.elements['customerId'].value = customer.id;
    form.elements['fullName'].value = customer.fullName;
    form.elements['email'].value = customer.email;
    form.elements['phone'].value = customer.phone;
    form.elements['address'].value = customer.address;
    form.elements['customerType'].value = customer.type;
    form.elements['status'].value = customer.status;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editCustomerModal'));
    modal.show();
}

// Initialize event listeners for dynamic elements
document.addEventListener('click', function(e) {
    // Edit button handler
    if (e.target.closest('.btn-info')) {
        const customerId = parseInt(e.target.closest('tr').dataset.customerId);
        loadCustomerData(customerId);
    }
    
    // Delete button handler
    if (e.target.closest('.btn-danger')) {
        const customerId = parseInt(e.target.closest('tr').dataset.customerId);
        deleteCustomer(customerId);
    }
});