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
                    <button class="btn btn-primary" id="addProductBtn">
                        <i class="fas fa-plus"></i>
                        Add New Product
                    </button>
                </div>

                <!-- Filters & Search -->
                <div class="filters-section">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search products..." id="searchProduct">
                    </div>
                    <div class="filter-options">
                        <select class="form-select" id="categoryFilter">
                            <option value="">All Categories</option>
                            <option value="pokemon">Pokemon</option>
                            <option value="figure">Figure</option>
                        </select>
                        <select class="form-select" id="statusFilter">
                            <option value="">All Status</option>
                            <option value="instock">In Stock</option>
                            <option value="lowstock">Low Stock</option>
                            <option value="outofstock">Out of Stock</option>
                        </select>
                        <button class="btn btn-outline-secondary" id="resetFilters">
                            <i class="fas fa-redo"></i>
                            Reset
                        </button>
                    </div>
                </div>

                <!-- Products Table -->
                <div class="table-responsive products-table">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" class="form-check-input" id="selectAll">
                                </th>
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
                            <tr>
                                <td>
                                    <input type="checkbox" class="form-check-input product-select">
                                </td>
                                <td>1</td>
                                <td>
                                    <img src="/images/products/pikachu.jpg" alt="Product" class="product-img">
                                </td>
                                <td>Pikachu Plush</td>
                                <td>Pokemon</td>
                                <td>$29.99</td>
                                <td>50</td>
                                <td><span class="badge bg-success">In Stock</span></td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn btn-sm btn-info" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <!-- More product rows... -->
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="pagination-section">
                    <div class="items-per-page">
                        <span>Show</span>
                        <select class="form-select">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                        <span>entries</span>
                    </div>
                    <nav>
                        <ul class="pagination">
                            <li class="page-item disabled">
                                <a class="page-link" href="#"><i class="fas fa-chevron-left"></i></a>
                            </li>
                            <li class="page-item active"><a class="page-link" href="#">1</a></li>
                            <li class="page-item"><a class="page-link" href="#">2</a></li>
                            <li class="page-item"><a class="page-link" href="#">3</a></li>
                            <li class="page-item">
                                <a class="page-link" href="#"><i class="fas fa-chevron-right"></i></a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div class="modal fade" id="productModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add New Product</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="productForm">
                        <div class="row mb-3">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="productName" class="form-label">Product Name</label>
                                    <input type="text" class="form-control" id="productName" name="productName" required>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="productCategory" class="form-label">Category</label>
                                        <select class="form-select" id="productCategory" name="productCategory" required>
                                            <option value="">Select Category</option>
                                            <option value="pokemon">Pokemon</option>
                                            <option value="figure">Figure</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="productPrice" class="form-label">Price ($)</label>
                                        <input type="number" 
                                               class="form-control" 
                                               id="productPrice" 
                                               name="productPrice" 
                                               min="0" 
                                               step="0.01" 
                                               required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="productStock" class="form-label">Stock Quantity</label>
                                        <input type="number" class="form-control" id="productStock" name="productStock" min="0" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="productStatus" class="form-label">Status</label>
                                        <select class="form-select" id="productStatus" name="productStatus" required>
                                            <option value="instock">In Stock</option>
                                            <option value="lowstock">Low Stock</option>
                                            <option value="outofstock">Out of Stock</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Product Image</label>
                                    <div class="product-image-upload">
                                        <div class="image-preview" id="imagePreview">
                                            <img src="/images/placeholder.png" alt="Preview" id="previewImg">
                                        </div>
                                        <input type="file" class="form-control" id="productImage" name="productImage" accept="image/*">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="productDescription" class="form-label">Product Description</label>
                            <textarea class="form-control" id="productDescription" name="productDescription" rows="4"></textarea>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Product</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/admin/js/dashboard.js"></script>
    <script src="/admin/js/products.js"></script>
</body>
</html> 