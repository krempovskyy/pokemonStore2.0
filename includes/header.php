<?php
// Session is started in the parent file
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php echo $md; ?>">
    <title><?php echo $title; ?></title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="css/style.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <!-- Bootstrap Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</head>
<body>
    <header>
        <nav class="navbar navbar-expand-lg">
            <div class="container">
                <a class="navbar-brand" href="index.php">
                    <img src="images/logo.png" alt="Pokemon Store Logo" class="logo">
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="index.php">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="clothes.php">Clothes</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="toys.php">Toys</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="contact.php">Contact Us</a>
                        </li>
                    </ul>
                    <div class="d-flex align-items-center">
                        <a href="cart.php" class="cart-icon me-3">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="cart-count">0</span>
                        </a>
                        <?php if (isset($_SESSION['user_id'])): ?>
                            <div class="dropdown">
                                <button class="btn btn-link dropdown-toggle user-menu" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-user-circle"></i>
                                    <span><?php echo htmlspecialchars($_SESSION['username']); ?></span>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                                    <li><a class="dropdown-item" href="profile.php"><i class="fas fa-user me-2"></i>My Profile</a></li>
                                    <li><a class="dropdown-item" href="orders.php"><i class="fas fa-shopping-bag me-2"></i>My Orders</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="includes/api/logout.php"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                                </ul>
                            </div>
                        <?php else: ?>
                            <a href="signin.php" class="btn btn-outline-primary me-2">Sign In</a>
                            <a href="signup.php" class="btn btn-primary">Sign Up</a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </nav>
    </header>

    <script>
    console.log('Script section loaded');
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded');
        
        // Check if Bootstrap is loaded
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap is not loaded!');
        } else {
            console.log('Bootstrap version:', bootstrap.Dropdown.VERSION);
        }
        
        // Check if user menu exists and initialize dropdown
        const userMenu = document.getElementById('userMenu');
        console.log('User menu element:', userMenu);
        
        if (userMenu) {
            // Initialize dropdown using Bootstrap's data API
            const dropdownInstance = new bootstrap.Dropdown(userMenu);
            console.log('Dropdown instance created:', dropdownInstance);
            
            // Add click event listener
            userMenu.addEventListener('click', function(e) {
                console.log('User menu clicked');
                dropdownInstance.toggle();
            });
            
            // Add dropdown event listeners
            userMenu.addEventListener('show.bs.dropdown', function() {
                console.log('Dropdown is showing');
            });
            
            userMenu.addEventListener('shown.bs.dropdown', function() {
                console.log('Dropdown is shown');
            });
            
            userMenu.addEventListener('hide.bs.dropdown', function() {
                console.log('Dropdown is hiding');
            });
            
            userMenu.addEventListener('hidden.bs.dropdown', function() {
                console.log('Dropdown is hidden');
            });
        }
    });
    </script>
</body>
</html>
