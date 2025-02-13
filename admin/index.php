<?php
include 'includes/auth.php';
checkAuth();

// Set current page for active menu item
$currentPage = 'dashboard';
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
                            <p class="stats-number">150</p>
                            <span class="stats-trend positive">
                                <i class="fas fa-arrow-up"></i> 12.5%
                            </span>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="stats-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stats-info">
                            <h3>Revenue</h3>
                            <p class="stats-number">$15,890</p>
                            <span class="stats-trend positive">
                                <i class="fas fa-arrow-up"></i> 8.2%
                            </span>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="stats-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stats-info">
                            <h3>Customers</h3>
                            <p class="stats-number">1,250</p>
                            <span class="stats-trend positive">
                                <i class="fas fa-arrow-up"></i> 5.3%
                            </span>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="stats-icon">
                            <i class="fas fa-box"></i>
                        </div>
                        <div class="stats-info">
                            <h3>Products</h3>
                            <p class="stats-number">486</p>
                            <span class="stats-trend negative">
                                <i class="fas fa-arrow-down"></i> 2.1%
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Recent Orders -->
                <div class="recent-orders">
                    <div class="section-header">
                        <h2>Recent Orders</h2>
                        <a href="orders.php" class="btn btn-primary">
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
                                <!-- Sample data -->
                                <tr>
                                    <td>#ORD-2024</td>
                                    <td>John Doe</td>
                                    <td>Pikachu Plush, Pokemon Cards</td>
                                    <td>$89.99</td>
                                    <td><span class="badge bg-success">Completed</span></td>
                                    <td>2024-01-20</td>
                                </tr>
                                <!-- Add more rows as needed -->
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
