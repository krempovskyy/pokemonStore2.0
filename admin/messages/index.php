<?php
include '../includes/auth.php';
checkAuth();

// Get database connection
$conn = getDBConnection();
if (!$conn) {
    die('Database connection failed');
}

$currentPage = 'messages';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Messages - Pokemon Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="/admin/css/dashboard.css" rel="stylesheet">
    <link href="/admin/css/messages.css" rel="stylesheet">
</head>
<body class="admin-dashboard">
    <button class="menu-toggle">
        <i class="fas fa-bars"></i>
    </button>

    <div class="container-fluid">
        <div class="row">
            <?php include '../includes/sidebar.php'; ?>
            
            <!-- Main Content -->
            <div class="main-content">
                <!-- Content Header -->
                <div class="content-header">
                    <h1>Messages</h1>
                    <div class="header-actions">
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-outline-primary active" data-status="all">
                                All Messages
                            </button>
                            <button type="button" class="btn btn-outline-primary" data-status="unread">
                                Unread <span class="badge bg-danger unread-count" style="display: none;"></span>
                            </button>
                            <button type="button" class="btn btn-outline-primary" data-status="read">
                                Read
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Search -->
                <div class="filters-section">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" class="form-control" id="searchMessages" placeholder="Search messages...">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Messages List -->
                <div class="messages-list mt-4">
                    <div class="table-responsive">
                        <table class="table table-hover messages-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="messagesTableBody">
                                <!-- Messages will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="pagination-container mt-4">
                    <nav aria-label="Messages pagination">
                        <ul class="pagination justify-content-center" id="messagesPagination">
                            <!-- Pagination will be loaded here -->
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>

    <!-- Message View Modal -->
    <div class="modal fade" id="viewMessageModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Message Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="message-info">
                        <p><strong>From:</strong> <span id="modalName"></span></p>
                        <p><strong>Email:</strong> <span id="modalEmail"></span></p>
                        <p><strong>Subject:</strong> <span id="modalSubject"></span></p>
                        <p><strong>Date:</strong> <span id="modalDate"></span></p>
                        <hr>
                        <div class="message-content" id="modalMessage"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-danger" id="deleteMessage">Delete</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/admin/js/admin.js"></script>
    <script>
    // Add logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = '/admin/logout.php';
        }
    });
    </script>
    <script src="/admin/js/messages.js"></script>
</body>
</html> 