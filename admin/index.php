<?php
include 'includes/auth.php';
checkAuth();

// Set current page for active menu item
$currentPage = 'dashboard';

// Get database connection
$conn = getDBConnection();

// Get statistics
$stats = [
    'orders' => 0,
    'revenue' => 0,
    'customers' => 0,
    'products' => 0
];

try {
    // Total Orders
    $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM orders");
    $row = mysqli_fetch_assoc($result);
    $stats['orders'] = $row['count'];

    // Total Revenue
    $result = mysqli_query($conn, "SELECT SUM(total_amount) as total FROM orders WHERE status != 'cancelled'");
    $row = mysqli_fetch_assoc($result);
    $stats['revenue'] = $row['total'] ?: 0;

    // Total Customers
    $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM users WHERE role = 'customer' AND status = 'active'");
    $row = mysqli_fetch_assoc($result);
    $stats['customers'] = $row['count'];

    // Total Products
    $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM products");
    $row = mysqli_fetch_assoc($result);
    $stats['products'] = $row['count'];

    // Get recent orders
    $result = mysqli_query($conn, "
        SELECT o.*, 
               CONCAT(u.first_name, ' ', u.last_name) as customer_name,
               GROUP_CONCAT(CONCAT(oi.quantity, 'x ', p.name) SEPARATOR ', ') as product_list
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 5
    ");
    $recentOrders = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $recentOrders[] = $row;
    }
} catch (Exception $e) {
    error_log("Dashboard error: " . $e->getMessage());
}

// Calculate trends (comparing with last month)
$trends = [
    'orders' => 0,
    'revenue' => 0,
    'customers' => 0,
    'products' => 0
];

try {
    // Orders trend
    $result = mysqli_query($conn, "
        SELECT 
            (SELECT COUNT(*) FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) as current_month,
            (SELECT COUNT(*) FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) 
             AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) as last_month
    ");
    $orderCounts = mysqli_fetch_assoc($result);
    if ($orderCounts['last_month'] > 0) {
        $trends['orders'] = (($orderCounts['current_month'] - $orderCounts['last_month']) / $orderCounts['last_month']) * 100;
    }

    // Revenue trend
    $result = mysqli_query($conn, "
        SELECT 
            (SELECT SUM(total_amount) FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) 
             AND status != 'cancelled') as current_month,
            (SELECT SUM(total_amount) FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) 
             AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND status != 'cancelled') as last_month
    ");
    $revenueCounts = mysqli_fetch_assoc($result);
    if ($revenueCounts['last_month'] > 0) {
        $trends['revenue'] = (($revenueCounts['current_month'] - $revenueCounts['last_month']) / $revenueCounts['last_month']) * 100;
    }

    // Customers trend
    $result = mysqli_query($conn, "
        SELECT 
            (SELECT COUNT(*) FROM users WHERE role = 'customer' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) as current_month,
            (SELECT COUNT(*) FROM users WHERE role = 'customer' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) 
             AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) as last_month
    ");
    $customerCounts = mysqli_fetch_assoc($result);
    if ($customerCounts['last_month'] > 0) {
        $trends['customers'] = (($customerCounts['current_month'] - $customerCounts['last_month']) / $customerCounts['last_month']) * 100;
    }

    // Products trend
    $result = mysqli_query($conn, "
        SELECT 
            (SELECT COUNT(*) FROM products WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) as current_month,
            (SELECT COUNT(*) FROM products WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) 
             AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) as last_month
    ");
    $productCounts = mysqli_fetch_assoc($result);
    if ($productCounts['last_month'] > 0) {
        $trends['products'] = (($productCounts['current_month'] - $productCounts['last_month']) / $productCounts['last_month']) * 100;
    }
} catch (Exception $e) {
    error_log("Dashboard trends error: " . $e->getMessage());
} finally {
    if (isset($conn)) {
        mysqli_close($conn);
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Pokemon Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="/admin/css/dashboard.css" rel="stylesheet">
</head>
<body class="admin-dashboard">
    <!-- Toggle Menu Button -->
    <button class="menu-toggle">
        <i class="fas fa-bars"></i>
    </button>

    <div class="container-fluid">
        <div class="row">
            <!-- Include Sidebar -->
            <?php include 'includes/sidebar.php'; ?>

            <!-- Main Content -->
            <div class="main-content">
                <!-- Content Header -->
                <div class="content-header">
                    <h1>Dashboard Overview</h1>
                    <div class="date-time">
                        <?php echo date('l, F j, Y'); ?>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="stats-row">
                    <div class="stats-card">
                        <div class="stats-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="stats-info">
                            <h3>Total Orders</h3>
                            <p class="stats-number"><?php echo number_format($stats['orders']); ?></p>
                            <span class="stats-trend <?php echo $trends['orders'] >= 0 ? 'positive' : 'negative'; ?>">
                                <i class="fas fa-arrow-<?php echo $trends['orders'] >= 0 ? 'up' : 'down'; ?>"></i>
                                <?php echo abs(round($trends['orders'], 1)); ?>%
                            </span>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="stats-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stats-info">
                            <h3>Revenue</h3>
                            <p class="stats-number">$<?php echo number_format($stats['revenue'], 2); ?></p>
                            <span class="stats-trend <?php echo $trends['revenue'] >= 0 ? 'positive' : 'negative'; ?>">
                                <i class="fas fa-arrow-<?php echo $trends['revenue'] >= 0 ? 'up' : 'down'; ?>"></i>
                                <?php echo abs(round($trends['revenue'], 1)); ?>%
                            </span>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="stats-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stats-info">
                            <h3>Customers</h3>
                            <p class="stats-number"><?php echo number_format($stats['customers']); ?></p>
                            <span class="stats-trend <?php echo $trends['customers'] >= 0 ? 'positive' : 'negative'; ?>">
                                <i class="fas fa-arrow-<?php echo $trends['customers'] >= 0 ? 'up' : 'down'; ?>"></i>
                                <?php echo abs(round($trends['customers'], 1)); ?>%
                            </span>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="stats-icon">
                            <i class="fas fa-box"></i>
                        </div>
                        <div class="stats-info">
                            <h3>Products</h3>
                            <p class="stats-number"><?php echo number_format($stats['products']); ?></p>
                            <span class="stats-trend <?php echo $trends['products'] >= 0 ? 'positive' : 'negative'; ?>">
                                <i class="fas fa-arrow-<?php echo $trends['products'] >= 0 ? 'up' : 'down'; ?>"></i>
                                <?php echo abs(round($trends['products'], 1)); ?>%
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Recent Orders -->
                <div class="recent-orders">
                    <div class="section-header">
                        <h2>Recent Orders</h2>
                        <a href="/admin/orders" class="btn btn-primary">
                            View All
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Products</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($recentOrders)): ?>
                                <tr>
                                    <td colspan="6" class="text-center">No recent orders found</td>
                                </tr>
                                <?php else: ?>
                                <?php foreach ($recentOrders as $order): ?>
                                <tr>
                                    <td>#<?php echo htmlspecialchars($order['order_number']); ?></td>
                                    <td><?php echo htmlspecialchars($order['customer_name']); ?></td>
                                    <td><?php echo htmlspecialchars($order['product_list']); ?></td>
                                    <td>$<?php echo number_format($order['total_amount'], 2); ?></td>
                                    <td>
                                        <span class="badge bg-<?php 
                                            echo match($order['status']) {
                                                'pending' => 'warning',
                                                'processing' => 'info',
                                                'shipped' => 'primary',
                                                'delivered' => 'success',
                                                'cancelled' => 'danger',
                                                default => 'secondary'
                                            };
                                        ?>">
                                            <?php echo ucfirst($order['status']); ?>
                                        </span>
                                    </td>
                                    <td><?php echo date('Y-m-d H:i', strtotime($order['created_at'])); ?></td>
                                </tr>
                                <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/admin/js/dashboard.js"></script>
</body>
</html>
