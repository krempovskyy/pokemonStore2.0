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
        const exportModal = new bootstrap.Modal(document.getElementById('exportOptionsModal'));
        exportModal.show();
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
async function handleExport() {
    const exportOption = document.querySelector('input[name="exportOption"]:checked').value;
    const modal = bootstrap.Modal.getInstance(document.getElementById('exportOptionsModal'));
    modal.hide();
    
    try {
        showNotification('Info', 'Preparing export, please wait...', 'info');
        
        // Get orders based on export option
        const queryParams = new URLSearchParams({
            search: currentSearch,
            status: currentStatus,
            sort: currentSort
        });

        if (exportOption === 'all') {
            queryParams.set('page', 1);
            queryParams.set('limit', 1000); // Get all orders
        } else {
            queryParams.set('page', currentPage);
            queryParams.set('limit', currentLimit);
        }

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

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        
        // Convert orders to rows with styling
        const rows = orders.map(order => ({
            'ID': { v: order.id, t: 'n', s: { alignment: { horizontal: 'center' } } },
            'Customer Name': { v: order.customer_name, t: 's', s: { alignment: { horizontal: 'left' } } },
            'Customer Email': { v: order.customer_email, t: 's', s: { alignment: { horizontal: 'left' } } },
            'Products': { v: formatOrderProducts(order.products, true), t: 's', s: { alignment: { horizontal: 'left', wrapText: true } } },
            'Total Amount': { 
                v: parseFloat(order.total_amount).toFixed(2), 
                t: 'n',
                s: { 
                    alignment: { horizontal: 'right' },
                    numFmt: '"$"#,##0.00'
                }
            },
            'Status': {
                v: formatStatus(order.status),
                t: 's',
                s: {
                    alignment: { horizontal: 'center' },
                    fill: {
                        patternType: 'solid',
                        fgColor: { 
                            rgb: order.status === 'delivered' ? 'C8E6C9' : 
                                 order.status === 'cancelled' ? 'FFCDD2' : 
                                 order.status === 'pending' ? 'FFF9C4' : 'E1F5FE'
                        }
                    }
                }
            },
            'Created At': { 
                v: new Date(order.created_at), 
                t: 'd',
                s: { 
                    alignment: { horizontal: 'center' },
                    numFmt: 'yyyy-mm-dd hh:mm:ss'
                }
            },
            'Updated At': { 
                v: new Date(order.updated_at), 
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
            { wch: 25 }, // Customer Name
            { wch: 30 }, // Customer Email
            { wch: 50 }, // Products
            { wch: 12 }, // Total Amount
            { wch: 12 }, // Status
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

        // Generate Excel file with appropriate name
        const exportType = exportOption === 'all' ? 'all' : `page${currentPage}`;
        const fileName = `orders_export_${exportType}_${formatDate(new Date())}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        showNotification('Success', `Orders exported successfully (${exportOption === 'all' ? 'All Orders' : 'Current Page'})`, 'success');
    } catch (error) {
        console.error('Error exporting orders:', error);
        showNotification('Error', 'Failed to export orders: ' + error.message, 'error');
    }
}

// Helper functions
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

function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatOrderProducts(products, forExport = false) {
    if (!Array.isArray(products)) {
        try {
            products = JSON.parse(products);
        } catch (e) {
            console.error('Error parsing products:', e);
            return 'Error loading products';
        }
    }

    if (forExport) {
        return products.map(p => 
            `${p.name} (${p.quantity}x $${parseFloat(p.price).toFixed(2)})`
        ).join('\n');
    }

    return products.map(p => 
        `<div class="product-item">
            ${p.name} <span class="text-muted">(${p.quantity}x $${parseFloat(p.price).toFixed(2)})</span>
        </div>`
    ).join('');
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
        transform: translateX(50px);
        transition: all 0.3s ease-in-out;
    `;

    // Get icon based on type
    const getIcon = () => {
        switch(type) {
            case 'success':
                return '<i class="fas fa-check-circle" style="color: #155724"></i>';
            case 'error':
                return '<i class="fas fa-exclamation-circle" style="color: #721c24"></i>';
            default:
                return '<i class="fas fa-info-circle" style="color: #004085"></i>';
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
                    <ul style="margin: 0; padding-left: 18px; font-size: 14px;">
                        ${content.map(msg => `<li style="margin-bottom: 4px;">${msg}</li>`).join('')}
                    </ul>
                ` : `
                    <div style="font-size: 14px;">${content[0]}</div>
                `}
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; font-size: 18px; cursor: pointer; padding: 0 0 0 10px; color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#004085'}; opacity: 0.5;">
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
        notification.style.transform = 'translateX(50px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
} 