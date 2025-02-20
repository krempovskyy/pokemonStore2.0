<?php
session_start();
require_once __DIR__ . '/includes/config/db.php';
require_once __DIR__ . '/includes/helpers/image_helper.php';

$title = "Pokemon Store - Clothing";
$md = "Explore our collection of Pokemon-themed clothing and accessories";
include 'includes/header.php';

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php_errors.log');

error_log("Starting clothes.php page load");

// Get products from database
$products = [];
try {
    $query = "
        SELECT p.*
        FROM products p 
        WHERE p.category IN ('clothing-men', 'clothing-women', 'clothing-unisex', 'accessories')
        AND p.status = 'in_stock'
        ORDER BY p.created_at DESC
    ";
    error_log("Executing query: " . $query);
    
    $result = executeQuery($query);
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // Get image URLs
            $row['image'] = getProductImageUrl($row['image']);
            $row['gallery'] = getGalleryUrls($row['gallery'], $row['image']);
            
            // Parse sizes JSON
            if (!empty($row['sizes'])) {
                $row['sizes'] = json_decode($row['sizes'], true) ?? [];
            } else {
                $row['sizes'] = [];
            }
            
            $products[] = $row;
        }
        
        error_log("Query executed. Found " . count($products) . " products");
        
        if (empty($products)) {
            // Let's check what categories exist in the database
            $categoryQuery = "SELECT DISTINCT category FROM products";
            $categoryResult = executeQuery($categoryQuery);
            $categories = [];
            if ($categoryResult) {
                while ($row = $categoryResult->fetch_assoc()) {
                    $categories[] = $row['category'];
                }
            }
            error_log("Available categories in database: " . implode(", ", $categories));
            
            // Check total number of products
            $countQuery = "SELECT COUNT(*) as total FROM products";
            $countResult = executeQuery($countQuery);
            $totalProducts = $countResult ? $countResult->fetch_assoc()['total'] : 0;
            error_log("Total products in database: " . $totalProducts);
            
            // Check active products
            $activeQuery = "SELECT COUNT(*) as total FROM products WHERE status = 'in_stock'";
            $activeResult = executeQuery($activeQuery);
            $activeProducts = $activeResult ? $activeResult->fetch_assoc()['total'] : 0;
            error_log("Total in_stock products: " . $activeProducts);
        } else {
            error_log("Sample product data: " . print_r($products[0], true));
        }
    } else {
        error_log("Failed to execute query");
    }
} catch (Exception $e) {
    error_log("Database error: " . $e->getMessage());
    $products = []; // Empty array if error occurs
}
?>

<link href="css/style.css" rel="stylesheet">
<link href="css/products.css" rel="stylesheet">
<link href="css/modal.css" rel="stylesheet">

<main>
    <div class="container">
        <h1 class="page-title">CLOTHES & ACCESSORIES</h1>
        <div class="title-underline"></div>
    </div>

    <div class="container-fluid py-5">
        <div class="row">
            <!-- Filters Sidebar -->
            <div class="col-lg-3 mb-4">
                <div class="filter-section">
                    <h2 class="filter-title">FILTER</h2>
                    <div class="filter-underline"></div>
                    
                    <!-- Category Filter -->
                    <div class="filter-group">
                        <h3>GENDER</h3>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="men" id="men">
                            <label class="form-check-label" for="men">Men</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="women" id="women">
                            <label class="form-check-label" for="women">Women</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="unisex" id="unisex">
                            <label class="form-check-label" for="unisex">Unisex</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="accessories" id="accessories">
                            <label class="form-check-label" for="accessories">Accessories</label>
                        </div>
                    </div>
                    
                    <!-- Price Range Filter -->
                    <div class="filter-group">
                        <h3>PRICE RANGE</h3>
                        <?php
                        // Find max price from products
                        $maxPrice = 0;
                        foreach ($products as $product) {
                            if ($product['price'] > $maxPrice) {
                                $maxPrice = $product['price'];
                            }
                        }
                        // Round up to nearest hundred for better UX
                        $maxPrice = ceil($maxPrice/100) * 100;
                        ?>
                        <input type="range" class="price-slider" 
                               min="0" 
                               max="<?php echo $maxPrice; ?>" 
                               step="1" 
                               id="priceRange" 
                               value="<?php echo $maxPrice; ?>">
                        <div class="price-range-text">
                            <span>$0</span>
                            <span class="selected-price">$<?php echo $maxPrice; ?></span>
                            <span>$<?php echo $maxPrice; ?></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Products Grid -->
            <div class="col-lg-9">
                <div class="products-grid">
                    <div class="row g-4">
                        <?php if (empty($products)): ?>
                            <div class="col-12">
                                <div class="alert alert-info">
                                    No products found.
                                </div>
                            </div>
                        <?php else: ?>
                            <?php foreach ($products as $product): 
                                // Create product data for JavaScript
                                $productData = [
                                    'id' => $product['id'],
                                    'name' => $product['name'],
                                    'price' => (float)$product['price'],
                                    'category' => $product['category'],
                                    'image' => $product['image'],
                                    'gallery' => $product['gallery'],
                                    'description' => $product['description'],
                                    'stock_quantity' => (int)$product['stock_quantity'],
                                    'sizes' => $product['sizes']
                                ];
                                
                                // Encode product data for HTML attribute
                                $productJson = htmlspecialchars(json_encode($productData), ENT_QUOTES, 'UTF-8');
                            ?>
                                <div class="col-12 col-md-6 col-lg-4">
                                    <div class="product-card" data-product="<?php echo $productJson; ?>">
                                        <div class="product-badge" data-category="<?php echo htmlspecialchars($product['category']); ?>"></div>
                                        <div class="img-container">
                                            <img src="<?php echo htmlspecialchars($product['image']); ?>" 
                                                 alt="<?php echo htmlspecialchars($product['name']); ?>">
                                            <div class="quick-view">
                                                <button class="quick-view-btn" 
                                                        aria-label="Quick view <?php echo htmlspecialchars($product['name']); ?>">
                                                    <i class="fas fa-eye" aria-hidden="true"></i> Quick View
                                                </button>
                                            </div>
                                        </div>
                                        <div class="product-info">
                                            <h3 class="product-title"><?php echo htmlspecialchars($product['name']); ?></h3>
                                            <p class="product-price">$<?php echo number_format($product['price'], 2); ?></p>
                                            <?php if ($product['stock_quantity'] > 0): ?>
                                                <button class="add-to-cart-btn">
                                                    <span class="btn-text">ADD TO CART</span>
                                                    <span class="loading-spinner d-none"></span>
                                                </button>
                                            <?php else: ?>
                                                <button class="add-to-cart-btn out-of-stock" disabled>
                                                    <span class="btn-text">OUT OF STOCK</span>
                                                </button>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<!-- Quick View Modal -->
<div class="modal fade" id="quickViewModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close modal"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="quick-view-gallery">
                            <div class="main-image">
                                <div class="quick-view-image">
                                    <div class="loading-spinner"></div>
                                    <img src="" alt="" style="opacity: 0">
                                </div>
                            </div>
                            <div class="thumbnail-list">
                                <!-- Thumbnails will be inserted here by JS -->
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="quick-view-info">
                            <h2 class="product-title"></h2>
                            <p class="product-price"></p>
                            <div class="product-description">
                                <h3>Description</h3>
                                <p></p>
                            </div>

                            <div class="size-selector mb-3">
                                <label for="modalSizeSelect" class="form-label">Select Size</label>
                                <select class="form-select" id="modalSizeSelect">
                                    <option value="">Select Size</option>
                                </select>
                                <div class="size-error mt-2 d-none"></div>
                            </div>
                            <div class="product-stats">
                                <div class="stat-item">
                                    <div class="stat-label">Stock Status</div>
                                    <div class="stat-value stock-status"></div>
                                </div>
                                
                                <div class="stat-item">
                                    <div class="stat-label">Category</div>
                                    <div class="stat-value category-value"></div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Quantity in Stock</div>
                                    <div class="stat-value quantity-value"></div>
                                </div>
                            </div>
                            <button class="add-to-cart-btn">
                                <i class="fas fa-shopping-cart"></i>
                                <span class="btn-text">ADD TO CART</span>
                                <span class="loading-spinner d-none"></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<button id="backToTop" class="back-to-top-btn">↑</button>

<?php include 'includes/footer.php'; ?>
