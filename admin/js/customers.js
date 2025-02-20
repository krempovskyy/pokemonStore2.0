// Users Management JavaScript

// Global utility functions
function showNotification(title, messages = [], type = 'success') {
    // Convert string message to array if needed
    const messageArray = Array.isArray(messages) ? messages : [messages];
    
    // Remove existing notifications first
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Base styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 300px;
        max-width: 500px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#cce5ff'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#004085'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#b8daff'};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 15px 20px;
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
        ${messageArray.length > 1 ? `
            <ul style="margin: 0; padding-left: 25px;">
                ${messageArray.map(msg => `<li>${msg}</li>`).join('')}
            </ul>
        ` : `<p style="margin: 0;">${messageArray[0]}</p>`}
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

// Global state
let currentPage = 1;
let currentLimit = 10;
let currentSearch = '';
let currentStatus = '';
let currentSort = 'newest';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    initializeEventListeners();
    await loadCustomers();
});

// Initialize event listeners for dynamic elements
function initializeEventListeners() {
    console.log('Initializing event listeners');

    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(async function(e) {
            currentSearch = e.target.value;
            currentPage = 1;
            await loadCustomers();
        }, 300));
    }

    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', async function() {
            currentStatus = this.value;
            currentPage = 1;
            await loadCustomers();
        });
    }

    // Sort handler
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', async function() {
            currentSort = this.value;
            currentPage = 1;
            await loadCustomers();
        });
    }

    // Export customers handler
    document.getElementById('exportCustomers')?.addEventListener('click', function() {
        const exportModal = new bootstrap.Modal(document.getElementById('exportOptionsModal'));
        exportModal.show();
    });

    // Filter change handlers
    const filters = document.querySelectorAll('.form-select');
    filters.forEach(filter => {
        filter.addEventListener('change', async function() {
            const filterType = this.getAttribute('data-filter-type');
            switch(filterType) {
                case 'status':
                    currentStatus = this.value;
                    break;
                case 'sort':
                    currentSort = this.value;
                    break;
            }
            currentPage = 1; // Reset to first page on filter change
            await loadCustomers();
        });
    });

    // Add Customer Form Handler
    const addCustomerForm = document.getElementById('addCustomerForm');
    if (addCustomerForm) {
        addCustomerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleCustomerSubmit(this);
        });
    }

    // Edit Customer Form Handler
    const editCustomerForm = document.getElementById('editCustomerForm');
    if (editCustomerForm) {
        editCustomerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleCustomerUpdate(this);
        });
    }

    // Delete customer handler
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.btn-delete')) {
            e.preventDefault();
            const customerId = e.target.closest('tr').dataset.customerId;
            if (confirm('Are you sure you want to delete this customer?')) {
                await deleteCustomer(customerId);
            }
        }
    });

    // Edit customer handler
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.btn-edit')) {
            e.preventDefault();
            const customerId = e.target.closest('tr').dataset.customerId;
            await editCustomer(customerId);
        }
    });

    // View orders handler
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.btn-orders')) {
            e.preventDefault();
            const customerId = e.target.closest('tr').dataset.customerId;
            window.location.href = `/admin/orders/index.php?customer_id=${customerId}`;
        }
    });

    // Pagination handler
    document.addEventListener('click', async function(e) {
        const pageLink = e.target.closest('.page-link');
        if (pageLink && !pageLink.parentElement.classList.contains('disabled')) {
            e.preventDefault();
            const page = pageLink.dataset.page;
            if (page) {
                currentPage = parseInt(page);
                await loadCustomers();
            }
        }
    });
}

// Load customers from API
async function loadCustomers() {
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: currentLimit,
            search: currentSearch,
            status: currentStatus,
            sort: currentSort
        });

        console.log('Loading customers with params:', queryParams.toString());

        const response = await fetch(`/admin/api/customers.php?${queryParams}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('API response:', result);

        if (result.success) {
            renderCustomers(result.data.customers);
            
            // Update pagination if pagination data exists
            if (result.data.pagination) {
                const paginationContainer = document.querySelector('.pagination-section nav');
                if (paginationContainer) {
                    const { currentPage, totalPages } = result.data.pagination;
                    
                    if (!totalPages) {
                        paginationContainer.innerHTML = '';
                        return;
                    }

                    const ul = document.createElement('ul');
                    ul.className = 'pagination';

                    // Previous button
                    const prevPage = Math.max(1, currentPage - 1);
                    ul.innerHTML = `
                        <li class="page-item ${currentPage <= 1 ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${prevPage}" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                    `;

                    // Page numbers
                    for (let i = 1; i <= totalPages; i++) {
                        ul.innerHTML += `
                            <li class="page-item ${i === parseInt(currentPage) ? 'active' : ''}">
                                <a class="page-link" href="#" data-page="${i}">${i}</a>
                            </li>
                        `;
                    }

                    // Next button
                    const nextPage = Math.min(totalPages, currentPage + 1);
                    ul.innerHTML += `
                        <li class="page-item ${currentPage >= totalPages ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${nextPage}" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>
                    `;

                    paginationContainer.innerHTML = '';
                    paginationContainer.appendChild(ul);
                }
            }
        } else {
            showNotification('Error', result.error || 'Failed to load customers', 'error');
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        showNotification('Error', 'Failed to load customers. Please try again.', 'error');
    }
}

// Render customers table
function renderCustomers(customers) {
    console.log('Rendering customers:', customers);
    
    const tbody = document.querySelector('.customers-table tbody');
    if (!tbody) {
        console.error('Could not find table body element');
        return;
    }

    tbody.innerHTML = '';

    if (customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No customers found</td>
            </tr>
        `;
        return;
    }

    customers.forEach(customer => {
        const statusClass = {
            'active': 'bg-success',
            'inactive': 'bg-warning',
            'blocked': 'bg-danger'
        };

        const tr = document.createElement('tr');
        tr.dataset.customerId = customer.id;
        tr.innerHTML = `
            <td>
                <div class="customer-info">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(customer.first_name + '+' + customer.last_name)}" 
                         alt="${customer.first_name} ${customer.last_name}" 
                         class="customer-avatar">
                    <div class="customer-details">
                        <div class="customer-name">${customer.first_name} ${customer.last_name}</div>
                        <div class="customer-email text-muted">${customer.email}</div>
                    </div>
                </div>
            </td>
            <td>${customer.phone}</td>
            <td>
                <div class="order-stats">
                    <div>Orders: ${customer.total_orders || 0}</div>
                    <div class="text-muted">Total Spent: $${parseFloat(customer.total_spent || 0).toFixed(2)}</div>
                </div>
            </td>
            <td>${formatDate(customer.created_at)}</td>
            <td>${customer.last_order_date ? formatDate(customer.last_order_date) : 'Never'}</td>
            <td>
                <span class="badge ${statusClass[customer.status]}">${customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-info btn-edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-warning btn-orders" title="View Orders">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Reinitialize tooltips
    const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltips.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

// Edit Customer Function
async function editCustomer(customerId) {
    try {
        console.log('Editing customer:', customerId);
        const response = await fetch(`/admin/api/customers.php?id=${customerId}`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch customer data');
        }

        if (result.success) {
            const customer = result.data;
            console.log('Customer data:', customer);
            
            // Get form and form elements
            const form = document.getElementById('editCustomerForm');
            console.log('Form element:', form);
            
            if (!form) {
                throw new Error('Edit customer form not found');
            }

            // Set form values
            form.querySelector('input[name="customerId"]').value = customer.id;
            form.querySelector('input[name="firstName"]').value = customer.first_name;
            form.querySelector('input[name="lastName"]').value = customer.last_name;
            form.querySelector('input[name="email"]').value = customer.email;
            form.querySelector('input[name="phone"]').value = customer.phone;
            form.querySelector('textarea[name="address"]').value = customer.address;
            form.querySelector('select[name="status"]').value = customer.status;

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('editCustomerModal'));
            console.log('Modal element:', modal);
            modal.show();
        } else {
            throw new Error(result.error || 'Failed to fetch customer data');
        }
    } catch (error) {
        console.error('Error editing customer:', error);
        showNotification('Error', error.message || 'Failed to edit customer', 'error');
    }
}

// Handle customer update
async function handleCustomerUpdate(form) {
    try {
        const formData = new FormData(form);
        const customerData = {
            id: formData.get('customerId'),
            first_name: formData.get('firstName'),
            last_name: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            status: formData.get('status')
        };

        console.log('Updating customer with data:', customerData);

        const response = await fetch('/admin/api/customers.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to update customer');
        }

        const result = await response.json();
        
        if (result.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editCustomerModal'));
            modal.hide();
            
            // Show success message
            showNotification('Success', 'Customer updated successfully', 'success');
            
            // Reload customers list
            await loadCustomers();
        } else {
            throw new Error(result.error || 'Failed to update customer');
        }
    } catch (error) {
        console.error('Error updating customer:', error);
        showNotification('Error', error.message || 'Failed to update customer', 'error');
    }
}

// Handle customer submit (Add new customer)
async function handleCustomerSubmit(form) {
    try {
        const formData = new FormData(form);
        const customerData = {
            first_name: formData.get('firstName'),
            last_name: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            password: formData.get('password')
        };

        console.log('Adding new customer:', customerData);

        const response = await fetch('/admin/api/customers.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to add customer');
        }

        const result = await response.json();
        
        if (result.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
            modal.hide();
            
            // Reset form
            form.reset();
            
            // Show success message
            showNotification('Success', 'Customer added successfully', 'success');
            
            // Reload customers list
            await loadCustomers();
        } else {
            throw new Error(result.error || 'Failed to add customer');
        }
    } catch (error) {
        console.error('Error adding customer:', error);
        showNotification('Error', error.message || 'Failed to add customer', 'error');
    }
}

// Delete Customer Function
async function deleteCustomer(customerId) {
    try {
        const response = await fetch(`/admin/api/customers.php?id=${customerId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to delete customer');
        }

        const result = await response.json();
        
        if (result.success) {
            showNotification('Success', 'Customer deleted successfully', 'success');
            await loadCustomers();
        } else {
            throw new Error(result.error || 'Failed to delete customer');
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
        showNotification('Error', error.message || 'Failed to delete customer', 'error');
    }
}

// Utility Functions
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export customers to Excel
async function handleExport() {
    const exportOption = document.querySelector('input[name="exportOption"]:checked').value;
    const modal = bootstrap.Modal.getInstance(document.getElementById('exportOptionsModal'));
    modal.hide();
    
    try {
        showNotification('Info', 'Preparing export, please wait...', 'info');
        
        // Get customers based on export option
        const queryParams = new URLSearchParams({
            search: currentSearch,
            status: currentStatus,
            sort: currentSort
        });

        if (exportOption === 'all') {
            queryParams.set('page', 1);
            queryParams.set('limit', 1000); // Get all customers
        } else {
            queryParams.set('page', currentPage);
            queryParams.set('limit', currentLimit);
        }

        const response = await fetch(`/admin/api/customers.php?${queryParams}`);
        if (!response.ok) {
            throw new Error('Failed to fetch customers for export');
        }

        const result = await response.json();
        if (!result.success || !result.data.customers.length) {
            showNotification('Error', 'No customers available to export', 'error');
            return;
        }

        const customers = result.data.customers;

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        
        // Convert customers to rows with styling
        const rows = customers.map(customer => ({
            'ID': { v: customer.id, t: 'n', s: { alignment: { horizontal: 'center' } } },
            'Name': { v: `${customer.first_name} ${customer.last_name}`, t: 's', s: { alignment: { horizontal: 'left' } } },
            'Email': { v: customer.email, t: 's', s: { alignment: { horizontal: 'left' } } },
            'Phone': { v: customer.phone, t: 's', s: { alignment: { horizontal: 'center' } } },
            'Address': { v: customer.address, t: 's', s: { alignment: { horizontal: 'left', wrapText: true } } },
            'Total Orders': { v: customer.total_orders || 0, t: 'n', s: { alignment: { horizontal: 'center' } } },
            'Total Spent': { 
                v: parseFloat(customer.total_spent || 0).toFixed(2), 
                t: 'n',
                s: { 
                    alignment: { horizontal: 'right' },
                    numFmt: '"$"#,##0.00'
                }
            },
            'Last Order': { 
                v: customer.last_order_date ? new Date(customer.last_order_date) : 'Never', 
                t: customer.last_order_date ? 'd' : 's',
                s: { 
                    alignment: { horizontal: 'center' },
                    numFmt: 'yyyy-mm-dd hh:mm:ss'
                }
            },
            'Status': {
                v: customer.status,
                t: 's',
                s: {
                    alignment: { horizontal: 'center' },
                    fill: {
                        patternType: 'solid',
                        fgColor: { 
                            rgb: customer.status === 'active' ? 'C8E6C9' : 
                                 customer.status === 'inactive' ? 'FFF9C4' : 'FFCDD2' 
                        }
                    }
                }
            },
            'Created At': { 
                v: new Date(customer.created_at), 
                t: 'd',
                s: { 
                    alignment: { horizontal: 'center' },
                    numFmt: 'yyyy-mm-dd hh:mm:ss'
                }
            },
            'Updated At': { 
                v: new Date(customer.updated_at), 
                t: 'd',
                s: { 
                    alignment: { horizontal: 'center' },
                    numFmt: 'yyyy-mm-dd hh:mm:ss'
                }
            }
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(rows, { header: Object.keys(rows[0]) });

        // Set column widths
        const colWidths = [
            { wch: 5 },  // ID
            { wch: 25 }, // Name
            { wch: 30 }, // Email
            { wch: 15 }, // Phone
            { wch: 40 }, // Address
            { wch: 12 }, // Total Orders
            { wch: 12 }, // Total Spent
            { wch: 20 }, // Last Order
            { wch: 10 }, // Status
            { wch: 20 }, // Created At
            { wch: 20 }  // Updated At
        ];
        worksheet['!cols'] = colWidths;

        // Add header row styling
        const headerStyle = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { patternType: 'solid', fgColor: { rgb: '4A148C' } },
            alignment: { horizontal: 'center', vertical: 'center' }
        };

        // Apply header styles
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!worksheet[headerCell].s) worksheet[headerCell].s = {};
            Object.assign(worksheet[headerCell].s, headerStyle);
        }

        // Add the worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

        // Generate Excel file with appropriate name
        const exportType = exportOption === 'all' ? 'all' : `page${currentPage}`;
        const fileName = `customers_export_${exportType}_${formatDate(new Date())}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        showNotification('Success', `Customers exported successfully (${exportOption === 'all' ? 'All Customers' : 'Current Page'})`, 'success');
    } catch (error) {
        console.error('Error exporting customers:', error);
        showNotification('Error', 'Failed to export customers: ' + error.message, 'error');
    }
}