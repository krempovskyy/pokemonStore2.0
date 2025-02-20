<div class="side-bar">
    <div class="logo-container mb-4">
        <img src="/images/logo.png" alt="Logo" class="logo">
    </div>
    
    <nav class="nav-menu">
        <!-- Menu Items -->
        <div class="menu-items">
            <a href="/admin" class="menu-item <?php echo ($currentPage === 'dashboard') ? 'active' : ''; ?>">
                <i class="fas fa-home"></i>
                <span>Dashboard</span>
            </a>
            <a href="/admin/products" class="menu-item <?php echo ($currentPage === 'products') ? 'active' : ''; ?>">  
                <i class="fas fa-box"></i>
                <span>Products</span>
            </a>
            <a href="/admin/orders" class="menu-item <?php echo ($currentPage === 'orders') ? 'active' : ''; ?>">
                <i class="fas fa-shopping-cart"></i>
                <span>Orders</span>
            </a>
            <a href="/admin/customers" class="menu-item <?php echo ($currentPage === 'customers') ? 'active' : ''; ?>">
                <i class="fas fa-users"></i>
                <span>Customers</span>
            </a>
            <a href="/admin/messages" class="menu-item <?php echo ($currentPage === 'messages') ? 'active' : ''; ?>">
                <i class="fas fa-envelope"></i>
                <span>Messages</span>
                <span class="badge bg-danger unread-count" style="display: none;"></span>
            </a>
        </div>

        <!-- User Badge -->
        <div class="userBadge">
            <div class="user-info">
                <img src="/images/user.png" alt="User" class="user-avatar">
                <div class="user-details">
                    <span class="user-name">Admin</span>
                    <span class="user-role">Administrator</span>
                </div>
            </div>
            <a href="#" class="menu-item" id="logoutBtn">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </a>
        </div>
    </nav>
</div>
