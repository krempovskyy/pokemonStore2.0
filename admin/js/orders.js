// Orders Management JavaScript

// Global state
let currentPage = 1;
let currentLimit = 10;
let currentSearch = '';
let currentStatus = '';
let currentDateFilter = '';
let currentSort = 'newest';
let currentCustomerId = '';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded');

    // Get customer_id from URL if exists
    const urlParams = new URLSearchParams(window.location.search);
    currentCustomerId = urlParams.get('customer_id') || '';

    // If viewing specific customer's orders, update the page title and add back button
    if (currentCustomerId) {
        const contentHeader = document.querySelector('.content-header');
        if (contentHeader) {
            // Update title
            const titleElement = contentHeader.querySelector('h1');
            if (titleElement) {
                titleElement.textContent = 'Customer Orders';
            }
            
            // Add back button
            const headerActions = contentHeader.querySelector('.header-actions');
            if (headerActions) {
                const backButton = document.createElement('button');
                backButton.className = 'btn btn-outline-secondary me-2';
                backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Customers';
                backButton.onclick = () => window.location.href = '/admin/customers/';
                
                headerActions.insertBefore(backButton, headerActions.firstChild);
            }
        }
    }

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize all event listeners
    initializeEventListeners();
    
    // Initial load
    await loadOrders();
});

// Initialize event listeners for dynamic elements
function initializeEventListeners() {
    console.log('Initializing event listeners');

    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(async function(e) {
            currentSearch = e.target.value;
            currentPage = 1; // Reset to first page on search
            await loadOrders();
        }, 300));
    }

    // Filter change handlers
    const filters = document.querySelectorAll('.form-select');
    filters.forEach(filter => {
        filter.addEventListener('change', async function() {
            const filterType = this.getAttribute('data-filter-type');
            switch(filterType) {
                case 'status':
                    currentStatus = this.value;
                    break;
                case 'date':
                    currentDateFilter = this.value;
                    break;
                case 'sort':
                    currentSort = this.value;
                    break;
            }
            currentPage = 1; // Reset to first page on filter change
            await loadOrders();
        });
    });

    // Edit order form handler
    const editOrderForm = document.getElementById('editOrderForm');
    if (editOrderForm) {
        editOrderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleOrderUpdate(this);
        });
    }

    // Export orders handler
    document.getElementById('exportOrders')?.addEventListener('click', function() {
        exportOrders();
    });

    // Print invoice handler
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-print')) {
            e.preventDefault();
            const orderId = e.target.closest('tr').dataset.orderId;
            printInvoice(orderId);
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
                await loadOrders();
            }
        }
    });
}

// Load orders from API
async function loadOrders() {
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: currentLimit,
            search: currentSearch,
            status: currentStatus,
            date: currentDateFilter,
            sort: currentSort
        });

        // Add customer_id to query params if exists
        if (currentCustomerId) {
            queryParams.append('customer_id', currentCustomerId);
        }

        console.log('Loading orders with params:', queryParams.toString());

        const response = await fetch(`/admin/api/orders.php?${queryParams}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('API response:', result);

        if (result.success) {
            renderOrders(result.data.orders);
            
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
            showNotification('Error', result.error || 'Failed to load orders', 'error');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Error', 'Failed to load orders. Please try again.', 'error');
    }
}

    // Render orders table
function renderOrders(orders) {
    console.log('Rendering orders:', orders);
    
        const tbody = document.querySelector('.orders-table tbody');
        if (!tbody) {
            console.error('Could not find table body element');
            return;
        }

        tbody.innerHTML = '';
        
    if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                <td colspan="8" class="text-center">No orders found</td>
                </tr>
            `;
            return;
        }

    orders.forEach(order => {
            const statusClass = {
                'pending': 'bg-warning',
                'processing': 'bg-info',
                'shipped': 'bg-primary',
                'delivered': 'bg-success',
                'cancelled': 'bg-danger'
            };

        const paymentStatusClass = {
            'pending': 'bg-warning',
            'paid': 'bg-success',
            'failed': 'bg-danger'
            };

            const tr = document.createElement('tr');
            tr.dataset.orderId = order.id;
            tr.innerHTML = `
            <td>${order.order_number}</td>
                <td>
                    <div class="customer-info">
                    <div class="customer-name">${order.customer_name}</div>
                    <div class="customer-email text-muted">${order.customer_email}</div>
                    </div>
                </td>
                <td>
                <div class="order-date">
                    ${formatDate(order.created_at)}
                    </div>
                </td>
                <td>
                    <div class="product-info">
                        <div class="product-count">${order.items.length} items</div>
                        <div class="product-list text-muted">
                        ${order.items.map(item => `${item.quantity}x ${item.product_name}`).join(', ')}
                        </div>
                    </div>
                </td>
                <td>
                    <div class="order-total">
                    $${parseFloat(order.total_amount).toFixed(2)}
                    </div>
                </td>
                <td>
                    <div class="order-status">
                        <span class="badge ${statusClass[order.status]}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </div>
                </td>
            <td>
                <div class="payment-status">
                    <span class="badge ${paymentStatusClass[order.payment_status]}">${order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}</span>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="editOrder('${order.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                    <button class="btn btn-sm btn-success btn-print" title="Print Invoice">
                            <i class="fas fa-print"></i>
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

// Update order in table without full reload
function updateOrderInTable(orderData) {
    const tr = document.querySelector(`tr[data-order-id="${orderData.id}"]`);
    if (!tr) return;

    const statusCell = tr.querySelector('.order-status');
    const paymentStatusCell = tr.querySelector('.payment-status');

    if (statusCell) {
        const statusClass = {
            'pending': 'bg-warning',
            'processing': 'bg-info',
            'shipped': 'bg-primary',
            'delivered': 'bg-success',
            'cancelled': 'bg-danger'
        };

        statusCell.innerHTML = `
            <span class="badge ${statusClass[orderData.status] || 'bg-secondary'}">
                ${orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
            </span>
        `;
    }

    if (paymentStatusCell) {
        const paymentStatusClass = {
            'pending': 'bg-warning',
            'paid': 'bg-success',
            'failed': 'bg-danger'
        };

        paymentStatusCell.innerHTML = `
            <span class="badge ${paymentStatusClass[orderData.payment_status] || 'bg-secondary'}">
                ${orderData.payment_status.charAt(0).toUpperCase() + orderData.payment_status.slice(1)}
            </span>
        `;
    }
    }

    // Edit Order Function
async function editOrder(orderId) {
    try {
        console.log('Editing order:', orderId);
        const response = await fetch(`/admin/api/orders.php?id=${orderId}`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch order data');
        }

        if (result.success) {
            const order = result.data;
            console.log('Order data:', order);
            
            // Get form and form elements
            const form = document.getElementById('editOrderForm');
            console.log('Form element:', form);
            
            if (!form) {
                throw new Error('Edit order form not found');
            }

            // Set form values
            form.querySelector('input[name="orderId"]').value = order.id;
            form.querySelector('input[name="customerName"]').value = order.customer_name;
            form.querySelector('input[name="customerEmail"]').value = order.customer_email;
            form.querySelector('input[name="customerPhone"]').value = order.customer_phone;
            form.querySelector('select[name="orderStatus"]').value = order.status;
            form.querySelector('select[name="paymentStatus"]').value = order.payment_status;
            form.querySelector('textarea[name="shippingAddress"]').value = order.shipping_address;
        
            // Populate order items
            const itemsContainer = document.getElementById('orderItems');
            console.log('Items container:', itemsContainer);
            
            if (!itemsContainer) {
                throw new Error('Order items container not found');
            }

            itemsContainer.innerHTML = order.items.map((item, index) => `
                <div class="order-item mb-3">
                    <div class="row">
                        <div class="col-md-6">
                            <input type="text" class="form-control" value="${item.product_name}" readonly>
                        </div>
                        <div class="col-md-2">
                            <input type="number" class="form-control" value="${item.quantity}" readonly>
                        </div>
                        <div class="col-md-2">
                            <input type="text" class="form-control" value="$${parseFloat(item.price).toFixed(2)}" readonly>
                        </div>
                        <div class="col-md-2">
                            <input type="text" class="form-control" value="$${(item.quantity * item.price).toFixed(2)}" readonly>
                        </div>
                    </div>
                </div>
            `).join('');

            // Update totals using values from server
            const subtotalElement = document.getElementById('subtotal');
            const totalElement = document.getElementById('total');
            
            if (subtotalElement) {
                const subtotal = parseFloat(order.subtotal);
                subtotalElement.textContent = subtotal.toFixed(2);
            }
            
            if (totalElement) {
                const total = parseFloat(order.total_amount);
                totalElement.textContent = total.toFixed(2);
            }

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('editOrderModal'));
            console.log('Modal element:', modal);
            modal.show();
        } else {
            throw new Error(result.error || 'Failed to fetch order data');
        }
    } catch (error) {
        console.error('Error editing order:', error);
        showNotification('Error', error.message || 'Failed to edit order', 'error');
    }
}

    // Handle order update
async function handleOrderUpdate(form) {
    try {
        const formData = new FormData(form);
        const orderData = {
            id: formData.get('orderId'),
            status: formData.get('orderStatus'),
            payment_status: formData.get('paymentStatus'),
            shipping_address: formData.get('shippingAddress')
        };

        console.log('Updating order with data:', orderData);

        const response = await fetch('/admin/api/orders.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to update order');
        }

        const result = await response.json();
        
        if (result.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editOrderModal'));
            modal.hide();
            
            // Show success message
            showNotification('Success', 'Order updated successfully', 'success');
            
            // Update the order in the table immediately
            updateOrderInTable(orderData);
            
            // Then reload all orders to ensure everything is in sync
            await loadOrders();
        } else {
            throw new Error(result.error || 'Failed to update order');
        }
    } catch (error) {
        console.error('Error updating order:', error);
        showNotification('Error', error.message || 'Failed to update order', 'error');
    }
}

// Print Invoice Function
function printInvoice(orderId) {
    window.open(`/admin/orders/print.php?id=${orderId}`, '_blank');
}

// Export orders to Excel
async function exportOrders() {
    try {
        // Get current visible orders
        const queryParams = new URLSearchParams({
            page: 1,
            limit: 1000, // Get all matching orders
            search: currentSearch,
            status: currentStatus,
            date: currentDateFilter,
            sort: currentSort
        });

        const response = await fetch(`/admin/api/orders.php?${queryParams}`);
        if (!response.ok) {
            throw new Error('Failed to fetch orders for export');
        }

        const result = await response.json();
        if (!result.success || !result.data.orders.length) {
            showNotification('Error', 'No orders available to export', 'error');
            return;
        }

        const orders = result.data.orders;

        // Create workbook
        const worksheet = XLSX.utils.json_to_sheet(orders.map(order => ({
            'Order Number': order.order_number,
            'Customer': order.customer_name,
            'Email': order.customer_email,
            'Date': formatDate(order.created_at),
            'Items': order.items.map(item => `${item.quantity}x ${item.product_name}`).join(', '),
            'Total': `$${parseFloat(order.total_amount).toFixed(2)}`,
            'Status': order.status.charAt(0).toUpperCase() + order.status.slice(1),
            'Payment Status': order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1),
            'Shipping Address': order.shipping_address
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

        // Generate Excel file
        XLSX.writeFile(workbook, `orders_export_${formatDate(new Date())}.xlsx`);

        showNotification('Success', 'Orders exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting orders:', error);
        showNotification('Error', 'Failed to export orders', 'error');
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

function showNotification(title, messages = [], type = 'success') {
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

    // Get icon based on type
    const getIcon = () => {
        switch(type) {
            case 'success':
                return '<i class="fas fa-check-circle"></i>';
            case 'error':
                return '<i class="fas fa-exclamation-circle"></i>';
            default:
                return '<i class="fas fa-info-circle"></i>';
        }
    };

    // Create notification content
    const content = Array.isArray(messages) ? messages : [messages];
    
    notification.innerHTML = `
        <div style="display: flex; align-items: start;">
            <div style="margin-right: 12px; font-size: 20px;">
                ${getIcon()}
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 16px; margin-bottom: ${content.length > 1 ? '8px' : '0'};">
                    ${title}
                </div>
                ${content.length > 1 ? `
                    <ul style="margin: 0; padding-left: 18px;">
                        ${content.map(msg => `<li>${msg}</li>`).join('')}
                    </ul>
                ` : `
                    <div>${content[0]}</div>
                `}
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; font-size: 18px; cursor: pointer; padding: 0 0 0 10px;">
                ×
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(20px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
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