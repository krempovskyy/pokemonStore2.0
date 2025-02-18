<?php
$title = "Pokemon Store - Clothes";
$md = "Explore our collection of Pokemon clothes and accessories";
include 'includes/header.php';

// Define products array first
$products = [
    [
        'id' => 2001,
        'name' => 'Crop top',
        'price' => 26.99,
        'category' => 'Women',
        'image' => 'images/CROP TOP.png',
        'gallery' => [
            'images/CROP TOP.png'
        ],
        'sizes' => ['XS', 'S', 'M', 'L', 'XL']
    ],
    [
        'id' => 2002,
        'name' => 'Tank Top',
        'price' => 29.99,
        'category' => 'Women',
        'image' => 'images/TANK TOP.png',
        'gallery' => [
            'images/TANK TOP.png'
        ],
        'sizes' => ['XS', 'S', 'M', 'L', 'XL']
    ],
    [
        'id' => 2003,
        'name' => 'Hoodie',
        'price' => 49.99,
        'category'=> 'Women',
        'image' => 'images/HOODIE WOMAN.png',
        'gallery' => [
            'images/HOODIE WOMAN.png'
        ],
        'sizes' => ['XS', 'S', 'M', 'L', 'XL']
    ],
    [
        'id' => 2004,
        'name' => 'Jacket',
        'price' => 39.99,
        'category'=> 'Men',
        'image' => 'images/JACKET MAN.png',
        'gallery' => [
            'images/JACKET MAN.png'
        ],
        'sizes' => ['S', 'M', 'L', 'XL', 'XXL']
    ],
    [
        'id' => 2005,
        'name' => 'Hoodie',
        'price' => 49.99,
        'category'=> 'Men',
        'image' => 'images/HOODIE MAN.png',
        'gallery' => [
            'images/HOODIE MAN.png'
        ],
        'sizes' => ['S', 'M', 'L', 'XL', 'XXL']
    ],
    [
        'id' => 2006,
        'name' => 'Sweater',
        'price' => 59.99,
        'category'=> 'Men',
        'image' => 'images/SWEATER MAN.png',
        'gallery' => [
            'images/SWEATER MAN.png'
        ],
        'sizes' => ['S', 'M', 'L', 'XL', 'XXL']
    ],
    [
        'id' => 2007,
        'name' => 'Hat',
        'price' => 19.99,
        'category'=> 'Unisex',
        'image' => 'images/UNI HAT.png',
        'gallery' => [
            'images/UNI HAT.png'
        ],
        'sizes' => ['One Size']
    ],
    [
        'id' => 2008,
        'name' => 'T-Shirt',
        'price' => 19.99,
        'category'=> 'Unisex',
        'image' => 'images/T SHIRT MEN.png',
        'gallery' => [
            'images/T SHIRT MEN.png'
        ],
        'sizes' => ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    ],
    [
        'id' => 2009,
        'name' => 'Gloves',
        'price' => 9.99,
        'category'=> 'Unisex',
        'image' => 'images/GLOVES UNI.png',
        'gallery' => [
            'images/GLOVES UNI.png'
        ],
        'sizes' => ['S/M', 'L/XL']
    ],
    [
        'id' => 2010,
        'name' => 'Multi Purposes Tote',
        'price' => 29.99,
        'category'=> 'Unisex',
        'image' => 'images/TOTE.png',
        'gallery' => [
            'images/TOTE.png'
        ],
        'sizes' => ['One Size']
    ],
    [
        'id' => 2011,
        'name' => 'Earbuds Case',
        'price' => 19.99,
        'category'=> 'Unisex',
        'image' => 'images/CASE EARBUDS.png',
        'gallery' => [
            'images/CASE EARBUDS.png'
        ],
        'sizes' => ['One Size']
    ],
    [
        'id' => 2012,
        'name' => 'IP Shock Case',
        'price' => 19.99,
        'category'=> 'Unisex',
        'image' => 'images/SHOCK CASE.png',
        'gallery' => [
            'images/SHOCK CASE.png'
        ],
        'sizes' => ['One Size']
    ]
];
?>

<link href="css/style.css" rel="stylesheet">
<link href="css/products.css" rel="stylesheet">
<link href="css/modal.css" rel="stylesheet">
<script src="js/cart-manager.js" defer></script>
<script src="js/cart.js" defer></script>

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
                    
                    <!-- Brand Filter -->
                    <div class="filter-group">
                        <h3>Gender</h3>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="Mtype">
                            <label class="form-check-label" for="Mtype">Men & Unisex</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="Wtype">
                            <label class="form-check-label" for="Wtype">Women & Unisex</label>
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
                        <?php
                        foreach ($products as $product) {
                            if ($product['category'] == "Women") {
                            echo '<div class="col-12 col-md-6 col-lg-4">
                                    <div class="product-card" data-product=\'' . json_encode($product) . '\'>
                                        <div class="product-badge">Women</div>
                                        <div class="img-container">
                                            <img src="' . htmlspecialchars($product['image']) . '" alt="' . htmlspecialchars($product['name']) . '">
                                            <div class="quick-view">
                                                <button class="quick-view-btn" aria-label="Quick view ' . htmlspecialchars($product['name']) . '">
                                                    <i class="fas fa-eye" aria-hidden="true"></i> Quick View
                                                </button>
                                            </div>
                                        </div>
                                        <div class="product-info">
                                            <h3 class="product-title">' . htmlspecialchars($product['name']) . '</h3>
                                            <p class="product-price">$'. number_format($product['price'], 2) . '</p>
                                            <button class="add-to-cart-btn">
                                                <span class="btn-text">ADD TO CART</span>
                                                <span class="loading-spinner d-none"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>';
                            } 
                            elseif ($product['category'] == "Men") 
                            {
                                echo '<div class="col-12 col-md-6 col-lg-4">
                                    <div class="product-card" data-product=\'' . json_encode($product) . '\'>
                                        <div class="product-badge">Men</div>
                                        <div class="img-container">
                                            <img src="' . htmlspecialchars($product['image']) . '" alt="' . htmlspecialchars($product['name']) . '">
                                            <div class="quick-view">
                                                <button class="quick-view-btn" aria-label="Quick view ' . htmlspecialchars($product['name']) . '">
                                                    <i class="fas fa-eye" aria-hidden="true"></i> Quick View
                                                </button>
                                            </div>
                                        </div>
                                        <div class="product-info">
                                            <h3 class="product-title">' . htmlspecialchars($product['name']) . '</h3>
                                            <p class="product-price">$'. number_format($product['price'], 2) . '</p>
                                            <button class="add-to-cart-btn">
                                                <span class="btn-text">ADD TO CART</span>
                                                <span class="loading-spinner d-none"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>';
                            }
                            else {
                                echo '<div class="col-12 col-md-6 col-lg-4">
                                    <div class="product-card" data-product=\'' . json_encode($product) . '\'>
                                        <div class="product-badge">Unisex</div>
                                        <div class="img-container">
                                            <img src="' . htmlspecialchars($product['image']) . '" alt="' . htmlspecialchars($product['name']) . '">
                                            <div class="quick-view">
                                                <button class="quick-view-btn" aria-label="Quick view ' . htmlspecialchars($product['name']) . '">
                                                    <i class="fas fa-eye" aria-hidden="true"></i> Quick View
                                                </button>
                                            </div>
                                        </div>
                                        <div class="product-info">
                                            <h3 class="product-title">' . htmlspecialchars($product['name']) . '</h3>
                                            <p class="product-price">$'. number_format($product['price'], 2) . '</p>
                                            <button class="add-to-cart-btn">
                                                <span class="btn-text">ADD TO CART</span>
                                                <span class="loading-spinner d-none"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>';
                            }
                        }
                        ?>
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
                                    <div class="stat-value in-stock">In Stock</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Category</div>
                                    <div class="stat-value category-value"></div>
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

<!-- Remove duplicate script loading -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>

<?php include 'includes/footer.php'; ?>

<!-- Move all scripts to the end -->
<script src="js/cart-manager.js"></script>
<script src="js/cart.js"></script>
<script src="js/products.js"></script>
