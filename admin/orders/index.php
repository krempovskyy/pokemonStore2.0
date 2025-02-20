<?php
include '../includes/auth.php';
checkAuth();

// Set current page for active menu item
$currentPage = 'orders';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orders Management - Pokemon Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="/admin/css/dashboard.css" rel="stylesheet">
    <link href="/admin/css/orders.css" rel="stylesheet">
</head>
<body class="admin-dashboard">
    <!-- Toggle Menu Button -->
    <button class="menu-toggle">
        <i class="fas fa-bars"></i>
    </button>

    <div class="container-fluid">
        <div class="row">
            <!-- Include Sidebar -->
            <?php include '../includes/sidebar.php'; ?>

            <!-- Main Content -->
            <div class="main-content">
                <!-- Content Header -->
                <div class="content-header">
                    <h1>Orders Management</h1>
                    <div class="header-actions">
                        <button class="btn btn-outline-primary" id="exportOrders">
                            <i class="fas fa-file-export"></i> Export Orders
                        </button>
                    </div>
                </div>

                <!-- Filters and Search -->
                <div class="filters-section">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" class="form-control" placeholder="Search orders...">
                            </div>
                        </div>
                        <div class="col-md-2">
                            <select class="form-select" id="statusFilter" data-filter-type="status">
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <select class="form-select" id="dateFilter" data-filter-type="date">
                                <option value="">All Time</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="last7days">Last 7 Days</option>
                                <option value="last30days">Last 30 Days</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <select class="form-select" id="sortBy" data-filter-type="sort">
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="total-high">Total: High to Low</option>
                                <option value="total-low">Total: Low to High</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Orders Table -->
                <div class="orders-section">
                    <div class="table-responsive">
                        <table class="table table-hover orders-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Products</th>
                                    <th>Total</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Orders will be rendered dynamically by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- Pagination -->
                <div class="pagination-section">
                    <nav>
                        <ul class="pagination">
                            <!-- Pagination will be rendered dynamically -->
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>

    <!-- Order Details Modal -->
    <div class="modal fade" id="orderDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Order Details #ORD-2024-001</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="order-info mb-4">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Customer Information</h6>
                                <p>Name: John Doe</p>
                                <p>Email: john@example.com</p>
                                <p>Phone: (555) 123-4567</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Shipping Address</h6>
                                <p>123 Pokemon Street</p>
                                <p>Pallet Town, KT 12345</p>
                                <p>United States</p>
                            </div>
                        </div>
                    </div>
                    <div class="order-items mb-4">
                        <h6>Order Items</h6>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Pikachu Plush Toy</td>
                                        <td>2</td>
                                        <td>$24.99</td>
                                        <td>$49.98</td>
                                    </tr>
                                    <tr>
                                        <td>Pokemon Trading Cards Pack</td>
                                        <td>1</td>
                                        <td>$39.99</td>
                                        <td>$39.99</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" class="text-end"><strong>Subtotal:</strong></td>
                                        <td>$89.97</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" class="text-end"><strong>Shipping:</strong></td>
                                        <td>$5.99</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                        <td><strong>$95.96</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    <div class="order-timeline">
                        <h6>Order Timeline</h6>
                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="timeline-point bg-success"></div>
                                <div class="timeline-content">
                                    <h6>Order Placed</h6>
                                    <p>Feb 20, 2024 15:30</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-point bg-warning"></div>
                                <div class="timeline-content">
                                    <h6>Processing</h6>
                                    <p>Feb 20, 2024 16:45</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Print Invoice</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Order Modal -->
    <div class="modal fade" id="editOrderModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit Order</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="editOrderForm">
                        <input type="hidden" id="orderId" name="orderId">
                        
                        <!-- Customer Information -->
                        <div class="mb-3">
                            <h6>Customer Information</h6>
                            <div class="row">
                                <div class="col-md-4">
                                    <label class="form-label">Name</label>
                                    <input type="text" id="customerName" name="customerName" class="form-control" readonly>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Email</label>
                                    <input type="email" id="customerEmail" name="customerEmail" class="form-control" readonly>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Phone</label>
                                    <input type="text" id="customerPhone" name="customerPhone" class="form-control" readonly>
                                </div>
                            </div>
                        </div>

                        <!-- Order Status -->
                        <div class="mb-3">
                            <h6>Order Status</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <label class="form-label">Order Status</label>
                                    <select id="orderStatus" name="orderStatus" class="form-select">
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Payment Status</label>
                                    <select id="paymentStatus" name="paymentStatus" class="form-select">
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Shipping Address -->
                        <div class="mb-3">
                            <h6>Shipping Address</h6>
                            <textarea id="shippingAddress" name="shippingAddress" class="form-control" rows="3"></textarea>
                        </div>

                        <!-- Order Items -->
                        <div class="mb-3">
                            <h6>Order Items</h6>
                            <div id="orderItems">
                                <!-- Order items will be loaded here dynamically -->
                            </div>
                        </div>

                        <!-- Order Totals -->
                        <div class="row">
                            <div class="col-md-6 offset-md-6">
                                <table class="table table-sm">
                                    <tr>
                                        <td class="text-end"><strong>Subtotal:</strong></td>
                                        <td width="120" class="text-end">$<span id="subtotal">0.00</span></td>
                                    </tr>
                                    <tr>
                                        <td class="text-end"><strong>Total:</strong></td>
                                        <td class="text-end"><strong>$<span id="total">0.00</span></strong></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" form="editOrderForm" class="btn btn-primary">Update Order</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Print Order Modal -->
    <div class="modal fade" id="printOrderModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Print Order</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="printOrderContent">
                    <!-- Print content will be populated dynamically -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="window.print()">Print</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap and dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- SheetJS -->
    <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
    
    <!-- Custom scripts -->
    <script src="/admin/js/dashboard.js"></script>
    <script src="/admin/js/orders.js"></script>

    <!-- xlsx-js-style for Excel export -->
    <script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.min.js"></script>

    <!-- Export Options Modal -->
    <div class="modal fade" id="exportOptionsModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Export Options</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Choose what data you want to export:</p>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="radio" name="exportOption" id="exportAll" value="all" checked>
                        <label class="form-check-label" for="exportAll">
                            Export all orders
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="exportOption" id="exportCurrent" value="current">
                        <label class="form-check-label" for="exportCurrent">
                            Export current page only
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="handleExport()">Export</button>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
