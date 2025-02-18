// Orders Management JavaScript

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

// Format date utility function
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Sample data in global scope
let orders = [
    {
        id: "#0001",
        customer: {
            name: "John Doe",
            email: "john@example.com",
            phone: "+1234567890"
        },
        date: "2024-01-15",
        items: [
            { id: 1, name: "Pikachu Plush", quantity: 2, price: 29.99 },
            { id: 2, name: "Charizard Figure", quantity: 1, price: 49.99 }
        ],
        total: 109.97,
        status: "processing",
        shippingAddress: "123 Pokemon St, Kanto Region",
        paymentMethod: "credit_card"
    },
    {
        id: "#0002",
        customer: {
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "+1987654321"
        },
        date: "2024-01-14",
        items: [
            { id: 3, name: "Mewtwo Plush", quantity: 1, price: 34.99 }
        ],
        total: 34.99,
        status: "delivered",
        shippingAddress: "456 Trainer Ave, Johto Region",
        paymentMethod: "paypal"
    },
    {
        id: "#0003",
        customer: {
            name: "Mike Johnson",
            email: "mike@example.com",
            phone: "+1122334455"
        },
        date: "2024-01-13",
        items: [
            { id: 4, name: "Pokemon Card Pack", quantity: 3, price: 19.99 },
            { id: 5, name: "Pokeball Plush", quantity: 1, price: 24.99 }
        ],
        total: 84.96,
        status: "pending",
        shippingAddress: "789 Pokemon Ave, Hoenn Region",
        paymentMethod: "credit_card"
    }
];

// Generate new order ID
function generateOrderId() {
    const lastOrder = orders.length > 0 ? orders.reduce((max, order) => {
        const num = parseInt(order.id.replace('#', ''));
        return num > max ? num : max;
    }, 0) : 0;
    
    return `#${String(lastOrder + 1).padStart(4, '0')}`;
}

window.addEventListener('load', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Render initial orders
    renderOrders(orders);

    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredOrders = orders.filter(order => 
                order.id.toLowerCase().includes(searchTerm) ||
                order.customer.name.toLowerCase().includes(searchTerm) ||
                order.customer.email.toLowerCase().includes(searchTerm) ||
                order.total.toString().includes(searchTerm)
            );
            renderOrders(filteredOrders);
        }, 300));
    }

    // Filter change handlers
    const filters = document.querySelectorAll('.form-select');
    filters.forEach(filter => {
        filter.addEventListener('change', function() {
            applyFilters();
        });
    });

    // Edit order form handler
    const editOrderForm = document.getElementById('editOrderForm');
    if (editOrderForm) {
        editOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Enable Bootstrap validation
            this.classList.add('was-validated');
            
            if (!this.checkValidity()) {
                e.stopPropagation();
                return;
            }
            
            handleOrderUpdate(this);
        });
    }

    // Print invoice handler
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-success')) {
            e.preventDefault();
            const orderId = e.target.closest('tr').dataset.orderId;
            printInvoice(orderId);
        }
    });

    // Render orders table
    function renderOrders(ordersToRender = orders) {
        const tbody = document.querySelector('.orders-table tbody');
        if (!tbody) {
            console.error('Could not find table body element');
            return;
        }

        tbody.innerHTML = '';
        
        if (ordersToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No orders found</td>
                </tr>
            `;
            return;
        }

        ordersToRender.forEach(order => {
            const statusClass = {
                'pending': 'bg-warning',
                'processing': 'bg-info',
                'shipped': 'bg-primary',
                'delivered': 'bg-success',
                'cancelled': 'bg-danger'
            };

            const tr = document.createElement('tr');
            tr.dataset.orderId = order.id;
            tr.innerHTML = `
                <td>${order.id}</td>
                <td>
                    <div class="customer-info">
                        <div class="customer-name">${order.customer.name}</div>
                        <div class="customer-email text-muted">${order.customer.email}</div>
                    </div>
                </td>
                <td>
                    <div class="order-date" style="min-width: 100px;">
                        ${formatDate(order.date)}
                    </div>
                </td>
                <td>
                    <div class="product-info">
                        <div class="product-count">${order.items.length} items</div>
                        <div class="product-list text-muted">
                            ${order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        </div>
                    </div>
                </td>
                <td>
                    <div class="order-total">
                        $${order.total.toFixed(2)}
                    </div>
                </td>
                <td>
                    <div class="order-status">
                        <span class="badge ${statusClass[order.status]}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="editOrder('${order.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="printOrder('${order.id}')" title="Print Invoice">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Edit Order Function
    window.editOrder = function(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const form = document.getElementById('editOrderForm');
        if (!form) return;

        // Reset form validation
        form.classList.remove('was-validated');

        // Populate form fields
        form.elements['orderId'].value = order.id;
        form.elements['customerName'].value = order.customer.name;
        form.elements['customerEmail'].value = order.customer.email;
        form.elements['customerPhone'].value = order.customer.phone;
        form.elements['orderStatus'].value = order.status;
        form.elements['shippingAddress'].value = order.shippingAddress;
        
        // Populate order items
        const itemsContainer = document.getElementById('orderItems');
        itemsContainer.innerHTML = order.items.map((item, index) => `
            <div class="order-item mb-3">
                <div class="row">
                    <div class="col-md-5">
                        <input type="text" class="form-control" name="items[${index}][name]" value="${item.name}" readonly>
                    </div>
                    <div class="col-md-3">
                        <input type="number" class="form-control quantity-input" name="items[${index}][quantity]" value="${item.quantity}" min="1" required>
                        <div class="invalid-feedback">
                            Quantity must be at least 1
                        </div>
                    </div>
                    <div class="col-md-3">
                        <input type="number" class="form-control price-input" name="items[${index}][price]" value="${item.price}" step="0.01" readonly>
                    </div>
                    <div class="col-md-1">
                        <button type="button" class="btn btn-danger btn-sm remove-item">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners for quantity changes
        itemsContainer.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', updateOrderTotal);
        });

        // Add event listeners for remove buttons
        itemsContainer.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                if (itemsContainer.querySelectorAll('.order-item').length > 1) {
                    this.closest('.order-item').remove();
                    updateOrderTotal();
                } else {
                    showNotification('Error', ['Order must have at least one item'], 'error');
                }
            });
        });

        // Update totals
        updateOrderTotal();

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editOrderModal'));
        modal.show();
    };

    // Handle order update
    function handleOrderUpdate(form) {
        const formData = new FormData(form);
        const orderData = {
            id: formData.get('orderId'),
            customer: {
                name: formData.get('customerName'),
                email: formData.get('customerEmail'),
                phone: formData.get('customerPhone')
            },
            status: formData.get('orderStatus'),
            shippingAddress: formData.get('shippingAddress'),
            items: []
        };

        // Get items
        const itemElements = form.querySelectorAll('.order-item');
        itemElements.forEach(item => {
            orderData.items.push({
                name: item.querySelector('input[name$="[name]"]').value,
                quantity: parseInt(item.querySelector('input[name$="[quantity]"]').value),
                price: parseFloat(item.querySelector('input[name$="[price]"]').value)
            });
        });

        // Calculate total
        orderData.total = orderData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        // Validate order data
        const errors = validateOrderData(orderData);
        if (errors.length > 0) {
            showNotification('Validation Errors', errors, 'error');
            return;
        }

        // Update order in local data
        const index = orders.findIndex(o => o.id === orderData.id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...orderData };
            showNotification('Success', ['Order updated successfully'], 'success');
            
            // Close modal and refresh table
            bootstrap.Modal.getInstance(document.getElementById('editOrderModal')).hide();
            renderOrders();
        }
    }

    // Print Order Function
    window.printOrder = function(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        // Open print page in new window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showNotification('Error', ['Could not open print window. Please check your popup blocker.'], 'error');
            return;
        }

        // Generate print content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order Invoice #${order.id}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link href="/admin/css/print.css" rel="stylesheet">
            </head>
            <body>
                <div class="invoice-container">
                    <div class="invoice-header">
                        <div class="row">
                            <div class="col-6">
                                <div class="company-info">
                                    <div class="company-logo mb-3">
                                        <img src="/images/logo.png" alt="Pokemon Store Logo" style="max-width: 200px;">
                                    </div>
                                    <p>123 Pokemon Street</p>
                                    <p>Pallet Town, KT 12345</p>
                                    <p>United States</p>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="invoice-info">
                                    <h3>Invoice #${order.id}</h3>
                                    <p>Date: ${formatDate(order.date)}</p>
                                    <p>
                                        <span class="status-badge status-${order.status}">
                                            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="customer-info">
                        <h4>Bill To:</h4>
                        <p><strong>Name:</strong> ${order.customer.name}</p>
                        <p><strong>Email:</strong> ${order.customer.email}</p>
                        <p><strong>Phone:</strong> ${order.customer.phone}</p>
                        <p><strong>Shipping Address:</strong><br>${order.shippingAddress}</p>
                    </div>

                    <div class="order-items">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th class="text-center">Quantity</th>
                                    <th class="text-end">Price</th>
                                    <th class="text-end">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td class="text-center">${item.quantity}</td>
                                        <td class="text-end">$${item.price.toFixed(2)}</td>
                                        <td class="text-end">$${(item.quantity * item.price).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                    <td class="text-end"><strong>$${order.total.toFixed(2)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div class="invoice-footer">
                        <p class="thank-you">Thank you for your business!</p>
                        <p>If you have any questions about this invoice, please contact us:</p>
                        <p>Email: support@pokemon-store.com | Phone: (555) 123-4567</p>
                        <div class="invoice-meta">
                            Invoice generated on ${new Date().toLocaleString()}
                        </div>
                    </div>

                    <button class="print-button no-print" onclick="window.print()">
                        <i class="fas fa-print"></i> Print Invoice
                    </button>
                </div>
            </body>
            </html>
        `;

        // Write content to print window
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    // Utility Functions
    function validateOrderData(data) {
        const errors = [];
        
        // Customer validation
        if (!data.customer.name || data.customer.name.length < 2) {
            errors.push('Customer name must be at least 2 characters long');
        }
        
        if (!data.customer.email || !isValidEmail(data.customer.email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!data.customer.phone || !isValidPhone(data.customer.phone)) {
            errors.push('Please enter a valid phone number');
        }
        
        // Items validation
        if (!data.items.length) {
            errors.push('Order must have at least one item');
        }
        
        data.items.forEach((item, index) => {
            if (item.quantity < 1) {
                errors.push(`Item #${index + 1}: Quantity must be at least 1`);
            }
            if (item.price <= 0) {
                errors.push(`Item #${index + 1}: Price must be greater than 0`);
            }
        });
        
        // Shipping address validation
        if (!data.shippingAddress || data.shippingAddress.length < 10) {
            errors.push('Shipping address must be at least 10 characters long');
        }
        
        return errors;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        return /^\+?[\d\s-]{10,}$/.test(phone);
    }

    function updateOrderTotal() {
        const items = Array.from(document.querySelectorAll('.order-item')).map(item => ({
            quantity: parseInt(item.querySelector('.quantity-input').value) || 0,
            price: parseFloat(item.querySelector('.price-input').value) || 0
        }));
        
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('subtotal').textContent = subtotal.toFixed(2);
        document.getElementById('total').textContent = subtotal.toFixed(2);
    }

    // Add event listener for export button
    document.getElementById('exportOrders')?.addEventListener('click', function() {
        exportOrders();
    });
});

// Utility Functions
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

// Filter orders based on search input
function filterOrders(searchTerm) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Apply all filters
function applyFilters() {
    const status = document.getElementById('statusFilter').value;
    const date = document.getElementById('dateFilter').value;
    const sort = document.getElementById('sortBy').value;

    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const statusMatch = !status || row.querySelector('.badge').textContent.toLowerCase() === status;
        const dateMatch = !date || matchesDateFilter(row.querySelector('.order-date .date').textContent, date);
        row.style.display = statusMatch && dateMatch ? '' : 'none';
    });

    // Apply sorting
    sortOrders(sort);
}

// Check if date matches filter
function matchesDateFilter(dateStr, filter) {
    const orderDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch(filter) {
        case 'today':
            return orderDate >= today;
        case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return orderDate >= yesterday && orderDate < today;
        case 'last7days':
            const last7Days = new Date(today);
            last7Days.setDate(last7Days.getDate() - 7);
            return orderDate >= last7Days;
        case 'last30days':
            const last30Days = new Date(today);
            last30Days.setDate(last30Days.getDate() - 30);
            return orderDate >= last30Days;
        default:
            return true;
    }
}

// Sort orders
function sortOrders(sortBy) {
    const tbody = document.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        switch(sortBy) {
            case 'newest':
                return compareDate(b, a);
            case 'oldest':
                return compareDate(a, b);
            case 'highest':
                return getAmount(b) - getAmount(a);
            case 'lowest':
                return getAmount(a) - getAmount(b);
            default:
                return 0;
        }
    });

    // Clear and re-append sorted rows
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}

// Helper function to compare dates
function compareDate(rowA, rowB) {
    const dateA = new Date(rowA.querySelector('.order-date .date').textContent);
    const dateB = new Date(rowB.querySelector('.order-date .date').textContent);
    return dateA - dateB;
}

// Helper function to get amount
function getAmount(row) {
    const amountText = row.querySelector('td:nth-child(5)').textContent;
    return parseFloat(amountText.replace('$', ''));
}

// Export orders
function exportOrders() {
    try {
        if (!orders || orders.length === 0) {
            showNotification('Export Error', ['No orders available to export'], 'error');
            return;
        }

        // Get visible rows only
        const visibleRows = Array.from(document.querySelectorAll('tbody tr')).filter(
            row => row.style.display !== 'none'
        );

        if (visibleRows.length === 0) {
            showNotification('Export Error', ['No orders match your current filters'], 'error');
            return;
        }

        // Create workbook data
        const workbook = {
            SheetNames: ['Orders'],
            Sheets: {
                Orders: {
                    '!ref': `A1:H${visibleRows.length + 1}`,
                    '!cols': [
                        { wch: 12 }, // Order ID
                        { wch: 25 }, // Customer Name
                        { wch: 30 }, // Customer Email
                        { wch: 15 }, // Date
                        { wch: 40 }, // Products
                        { wch: 12 }, // Total
                        { wch: 15 }, // Status
                        { wch: 40 }  // Shipping Address
                    ]
                }
            }
        };

        // Add headers
        const headers = [
            'Order ID', 
            'Customer Name', 
            'Customer Email', 
            'Date', 
            'Products', 
            'Total', 
            'Status',
            'Shipping Address'
        ];

        // Style for headers
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4A90E2" } },
            alignment: { horizontal: "center", vertical: "center" }
        };

        // Add headers to sheet
        headers.forEach((header, idx) => {
            const cell = String.fromCharCode(65 + idx) + '1';
            workbook.Sheets.Orders[cell] = { 
                v: header,
                t: 's',
                s: headerStyle
            };
        });

        // Add data rows
        let exportedCount = 0;
        visibleRows.forEach((row, rowIdx) => {
            const rowNum = rowIdx + 2; // Start from row 2 (after headers)
            const orderId = row.dataset.orderId;
            const order = orders.find(o => o.id === orderId);
            
            if (!order) return;

            // Data cells
            const rowData = [
                { v: order.id, t: 's' },
                { v: order.customer.name, t: 's' },
                { v: order.customer.email, t: 's' },
                { v: formatDate(order.date), t: 's' },
                { 
                    v: order.items.map(item => 
                        `${item.quantity}x ${item.name} ($${item.price})`
                    ).join('\n'),
                    t: 's'
                },
                { 
                    v: order.total,
                    t: 'n',
                    z: '$#,##0.00'
                },
                { v: order.status.charAt(0).toUpperCase() + order.status.slice(1), t: 's' },
                { v: order.shippingAddress, t: 's' }
            ];

            // Add cells to sheet
            rowData.forEach((cell, colIdx) => {
                const cellRef = String.fromCharCode(65 + colIdx) + rowNum;
                workbook.Sheets.Orders[cellRef] = {
                    ...cell,
                    s: {
                        alignment: { 
                            vertical: "center",
                            wrapText: true
                        }
                    }
                };
            });
            exportedCount++;
        });

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { 
            bookType: 'xlsx', 
            type: 'array',
            cellStyles: true
        });

        // Create and trigger download
        const blob = new Blob([excelBuffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_export_${formatDate(new Date())}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Show success notification
        showNotification('Export Success', [
            `Successfully exported ${exportedCount} orders to Excel`
        ], 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Export Error', [
            'Failed to export orders. Please try again.',
            error.message
        ], 'error');
    }
}

// Order validation constants
const VALID_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const VALID_PAYMENT_METHODS = ['credit_card', 'paypal', 'bank_transfer'];
const MAX_ITEMS_PER_ORDER = 100;

function validateOrderData(formData) {
    const errors = [];
    
    // Order Status validation
    const status = formData.get('status');
    if (!VALID_ORDER_STATUSES.includes(status)) {
        errors.push('Invalid order status');
    }
    
    // Payment Method validation
    const paymentMethod = formData.get('paymentMethod');
    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
        errors.push('Invalid payment method');
    }
    
    // Order Items validation
    const items = JSON.parse(formData.get('items') || '[]');
    if (!Array.isArray(items) || items.length === 0) {
        errors.push('Order must contain at least one item');
    }
    if (items.length > MAX_ITEMS_PER_ORDER) {
        errors.push(`Order cannot contain more than ${MAX_ITEMS_PER_ORDER} items`);
    }
    
    // Validate each order item
    items.forEach((item, index) => {
        if (!item.productId) {
            errors.push(`Item #${index + 1}: Missing product ID`);
        }
        if (!item.quantity || item.quantity < 1) {
            errors.push(`Item #${index + 1}: Quantity must be at least 1`);
        }
        if (item.price <= 0) {
            errors.push(`Item #${index + 1}: Invalid price`);
        }
    });
    
    // Shipping Address validation
    const shippingAddress = formData.get('shippingAddress')?.trim();
    if (!shippingAddress || shippingAddress.length < 10) {
        errors.push('Shipping address must be at least 10 characters long');
    }
    if (shippingAddress.length > 200) {
        errors.push('Shipping address must not exceed 200 characters');
    }
    
    // Total Amount validation
    const totalAmount = parseFloat(formData.get('totalAmount'));
    if (isNaN(totalAmount) || totalAmount <= 0) {
        errors.push('Invalid total amount');
    }
    
    // Validate total matches sum of items
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) { // Allow for small floating point differences
        errors.push('Total amount does not match sum of items');
    }
    
    return errors;
}

function sanitizeOrderData(formData) {
    const sanitized = new FormData();
    
    for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
            let sanitizedValue = value
                .replace(/<[^>]*>/g, '')
                .trim()
                .replace(/[<>]/g, '');
                
            // Special handling for different fields
            switch (key) {
                case 'shippingAddress':
                    sanitizedValue = sanitizedValue
                        .replace(/\s+/g, ' ')
                        .substring(0, 200);
                    break;
                case 'items':
                    try {
                        const items = JSON.parse(value);
                        sanitizedValue = JSON.stringify(items.map(item => ({
                            ...item,
                            quantity: Math.max(1, Math.min(parseInt(item.quantity) || 1, 999)),
                            price: parseFloat(item.price) || 0
                        })));
                    } catch (e) {
                        sanitizedValue = '[]';
                    }
                    break;
            }
            
            sanitized.append(key, sanitizedValue);
        } else {
            sanitized.append(key, value);
        }
    }
    
    return sanitized;
}

async function validateOrderStock(items) {
    const errors = [];
    
    // TODO: Implement stock checking against database
    // This is a placeholder for demonstration
    for (const item of items) {
        try {
            const response = await fetch(`/api/products/${item.productId}/stock`);
            const { availableStock } = await response.json();
            
            if (item.quantity > availableStock) {
                errors.push(`Item ${item.productId}: Requested quantity exceeds available stock (${availableStock} available)`);
            }
        } catch (error) {
            console.error('Error checking stock:', error);
            errors.push(`Unable to verify stock for item ${item.productId}`);
        }
    }
    
    return errors;
}

// Handle order form submission
async function handleOrderFormSubmit(form) {
    try {
        const formData = new FormData(form);
        const sanitizedData = sanitizeOrderData(formData);
        
        // Validate order data
        const validationErrors = validateOrderData(sanitizedData);
        if (validationErrors.length > 0) {
            showNotification(validationErrors.join('\n'), 'error');
            return;
        }
        
        // Validate stock availability
        const items = JSON.parse(sanitizedData.get('items'));
        const stockErrors = await validateOrderStock(items);
        if (stockErrors.length > 0) {
            showNotification(stockErrors.join('\n'), 'error');
            return;
        }
        
        // TODO: Implement order API call
        console.log('Validated order data:', Object.fromEntries(sanitizedData));
        
        showNotification('Order saved successfully!', 'success');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
        modal.hide();
        
        // Refresh order list
        // TODO: Implement refresh logic
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('Error saving order. Please try again.', 'error');
    }
} 