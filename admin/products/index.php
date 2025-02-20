<?php
include '../includes/auth.php';
checkAuth();

$currentPage = 'products';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products Management - Pokemon Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="/admin/css/dashboard.css" rel="stylesheet">
    <link href="/admin/css/products.css" rel="stylesheet">
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
                    <h1>Products Management</h1>
                    <div class="header-actions">
                        <button class="btn btn-outline-primary" id="exportProducts">
                            <i class="fas fa-file-export"></i> Export Products
                        </button>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addProductModal">
                            <i class="fas fa-plus"></i> Add New Product
                        </button>
                    </div>
                </div>

                <!-- Filters and Search -->
                <div class="filters-section">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" class="form-control" placeholder="Search products...">
                            </div>
                        </div>
                        <div class="col-md-2">
                            <select class="form-select" id="categoryFilter" data-filter-type="category">
                                <option value="">All Categories</option>
                                <option value="plush">Plush Toys</option>
                                <option value="cards">Pokemon Cards</option>
                                <option value="accessories">Accessories</option>
                                <option value="clothing-men">Men's Clothing</option>
                                <option value="clothing-women">Women's Clothing</option>
                                <option value="clothing-unisex">Unisex Clothing</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <select class="form-select" id="stockFilter" data-filter-type="stock">
                                <option value="">Stock Status</option>
                                <option value="instock">In Stock</option>
                                <option value="lowstock">Low Stock</option>
                                <option value="outofstock">Out of Stock</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <select class="form-select" id="sortBy" data-filter-type="sort">
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="price-low">Price: Low to High</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Products Grid -->
                <div class="products-grid">
                    <div class="table-responsive">
                        <table class="table table-hover products-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Image</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Products will be rendered dynamically by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="pagination-section">
                    <nav>
                        <ul class="pagination">
                            <li class="page-item disabled">
                                <a class="page-link" href="#" tabindex="-1">Previous</a>
                            </li>
                            <li class="page-item active"><a class="page-link" href="#">1</a></li>
                            <li class="page-item"><a class="page-link" href="#">2</a></li>
                            <li class="page-item"><a class="page-link" href="#">3</a></li>
                            <li class="page-item">
                                <a class="page-link" href="#">Next</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Product Modal -->
    <div class="modal fade" id="addProductModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add New Product</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="addProductForm">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Product Name</label>
                                <input type="text" name="name" class="form-control" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Category</label>
                                <select class="form-select" name="category" id="productCategory" required>
                                    <option value="">Select Category</option>
                                    <optgroup label="Pokemon Items">
                                        <option value="plush">Plush Toys</option>
                                        <option value="cards">Pokemon Cards</option>
                                        <option value="accessories">Accessories</option>
                                    </optgroup>
                                    <optgroup label="Clothing">
                                        <option value="clothing-men">Men's Clothing</option>
                                        <option value="clothing-women">Women's Clothing</option>
                                        <option value="clothing-unisex">Unisex Clothing</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Price</label>
                                <input type="number" name="price" class="form-control" step="0.01" required>
                            </div>
                            <div class="col-md-6" id="stockInputContainer">
                                <label class="form-label">Stock Quantity</label>
                                <input type="number" name="stock" class="form-control" required>
                            </div>
                        </div>

                        <!-- Size Management Section -->
                        <div class="mb-3" id="sizeManagementSection" style="display: none;">
                            <label class="form-label">Size Management</label>
                            <div class="size-inputs">
                                <div class="row mb-2">
                                    <div class="col-md-6">
                                        <label class="form-label">Size</label>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Quantity</label>
                                    </div>
                                </div>
                                <div class="size-row row mb-2">
                                    <div class="col-md-6">
                                        <input type="text" class="form-control" name="sizes[0][size]" value="S" readonly>
                                    </div>
                                    <div class="col-md-6">
                                        <input type="number" class="form-control size-quantity" name="sizes[0][quantity]" min="0" value="0">
                                    </div>
                                </div>
                                <div class="size-row row mb-2">
                                    <div class="col-md-6">
                                        <input type="text" class="form-control" name="sizes[1][size]" value="M" readonly>
                                    </div>
                                    <div class="col-md-6">
                                        <input type="number" class="form-control size-quantity" name="sizes[1][quantity]" min="0" value="0">
                                    </div>
                                </div>
                                <div class="size-row row mb-2">
                                    <div class="col-md-6">
                                        <input type="text" class="form-control" name="sizes[2][size]" value="L" readonly>
                                    </div>
                                    <div class="col-md-6">
                                        <input type="number" class="form-control size-quantity" name="sizes[2][quantity]" min="0" value="0">
                                    </div>
                                </div>
                                <div class="size-row row mb-2">
                                    <div class="col-md-6">
                                        <input type="text" class="form-control" name="sizes[3][size]" value="XL" readonly>
                                    </div>
                                    <div class="col-md-6">
                                        <input type="number" class="form-control size-quantity" name="sizes[3][quantity]" min="0" value="0">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Description</label>
                            <textarea name="description" class="form-control" rows="3" required></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Product Image</label>
                            <div class="image-input-container">
                                <input type="file" name="image" class="form-control" accept="image/*">
                                <div class="image-preview-container mt-2">
                                    <!-- Image preview will be inserted here -->
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" form="addProductForm" class="btn btn-primary">Add Product</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap and dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom scripts -->
    <script src="/admin/js/dashboard.js"></script>
    <script src="/admin/js/products.js"></script>

    <!-- Replace SheetJS with xlsx-js-style -->
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
                            Export all products
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