<?php
include 'includes/auth.php';
checkAuth();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Pokemon Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="css/dashboard.css" rel="stylesheet">
</head>
<body class="admin-dashboard">
    <div class="container-fluid py-5">
        <div class="row">
            <!-- Sidebar -->
            <div class="col-lg-3 side-bar">
                <div class="logo-container mb-4">
                    <img src="../images/logo.png" alt="Logo" class="logo">
                </div>
                
                <div class="menu-container">
                    <nav class="nav-menu">
                        <a href="index.php" class="menu-item active">
                            <i class="fas fa-home"></i>
                            <span>Dashboard</span>
                        </a>
                        <a href="products.php" class="menu-item">  
                            <i class="fas fa-box"></i>
                            <span>Products</span>
                        <a href="orders.php" class="menu-item">
                            <i class="fas fa-shopping-cart"></i>
                            <span>Orders</span>
                        </a>
                        <a href="customers.php" class="menu-item">
                            <i class="fas fa-users"></i>
                            <span>Customers</span>
                        </a>
                    </nav>
                </div>



                <!-- Main Content -->
                <div class="menu-container">
                </div>
            </div>
            <div class="col-lg-9">

            </div>
        </div>
    </div>

</body>
</html>
