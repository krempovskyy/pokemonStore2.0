<?php
$title = "Pokemon Store - Clothes";
$md = "Explore our collection of Pokemon clothes and accessories";
include 'layout/header.php';

// Define products array first
$products = [
    [
        'name' => 'Crop top',
        'price' => 26.99,
        'category' => 'Women',
        'image' => 'CROP TOP.png',
        'gallery' => [
            'CROP TOP.png'
            ],
    ],
    [
        'name' => 'Tank Top',
        'price' => 29.99,
        'category' => 'Women',
        'image' => 'TANK TOP.png',
        'gallery' => [
            'TANK TOP.png'
        ],
    ],
    [
        'name' => 'Hoodie',
        'price' => 49.99,
        'category'=> 'Women',
        'image' => 'HOODIE WOMAN.png',
        'gallery' => [
            'HOODIE WOMAN.png'
        ],
    ],
    [
        'name' => 'Jacket',
        'price' => 39.99,
        'category'=> 'Men',
        'image' => 'JACKET MAN.png',
        'gallery' => [
            'JACKET MAN.png'
        ]
    ],
    [
        'name' => 'Hoodie',
        'price' => 49.99,
        'category'=> 'Men',
        'image' => 'HOODIE MAN.png',
        'gallery' => [
            'HOODIE MAN.png'
        ]
    ],
    [
        'name' => 'Sweater',
        'price' => 59.99,
        'category'=> 'Men',
        'image' => 'SWEATER MAN.png',
        'gallery' => [
            'SWEATER MAN.png'
        ]
    ],
    [
        'name' => 'Hat',
        'price' => 19.99,
        'category'=> 'Unisex',
        'image' => 'UNI HAT.png',
        'gallery' => [
            'UNI HAT.png'
        ]
    ],
    [
        'name' => 'T-Shirt',
        'price' => 19.99,
        'category'=> 'Unisex',
        'image' => 'T SHIRT MEN.png',
        'gallery' => [
            'T SHIRT MEN.png'
        ]
    ],
    [
        'name' => 'Gloves',
        'price' => 9.99,
        'category'=> 'Unisex',
        'image' => 'GLOVES UNI.png',
        'gallery' => [
            'GLOVES UNI.png'
        ]
    ],
    [
        'name' => 'Multi Purposes Tote',
        'price' => 29.99,
        'category'=> 'Unisex',
        'image' => 'TOTE.png',
        'gallery' => [
            'TOTE.png'
        ]
    ],
    [
        'name' => 'Earbuds Case',
        'price' => 19.99,
        'category'=> 'Unisex',
        'image' => 'CASE EARBUDS.png',
        'gallery' => [
            'CASE EARBUDS.png'
        ]
    ],
    [
        'name' => 'IP Shock Case',
        'price' => 19.99,
        'category'=> 'Unisex',
        'image' => 'SHOCK CASE.png',
        'gallery' => [
            'SHOCK CASE.png'
        ]
    ]
];
?>

<link href="css/style.css" rel="stylesheet">
<link href="css/products.css" rel="stylesheet">

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
                            <input class="form-check-input" type="checkbox" value="" id="type">
                            <label class="form-check-label" for="type">Men & Unisex</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="type">
                            <label class="form-check-label" for="type">Women & Unisex</label>
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
                                    <div class="product-card" onclick="showQuickView(' . htmlspecialchars(json_encode($product)) . ')">
                                        <div class="product-badge">Women</div>
                                        <div class="img-container">
                                            <img src="images/' . $product['image'] . '" alt="' . $product['name'] . '">
                                            <div class="quick-view">
                                                <button class="quick-view-btn" aria-label="Quick view ' . $product['name'] . '">
                                                    <i class="fas fa-eye" aria-hidden="true"></i> Quick View
                                                </button>
                                            </div>
                                        </div>
                                        <div class="product-info">
                                            <h3 class="product-title">' . $product['name'] . '</h3>
                                            <p class="product-price">$'. $product['price'] . '</p>
                                            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(this, ' . $product['price'] . ')">
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
                                    <div class="product-card" onclick="showQuickView(' . htmlspecialchars(json_encode($product)) . ')">
                                        <div class="product-badge">Men</div>
                                        <div class="img-container">
                                            <img src="images/' . $product['image'] . '" alt="' . $product['name'] . '">
                                            <div class="quick-view">
                                                <button class="quick-view-btn" aria-label="Quick view ' . $product['name'] . '">
                                                    <i class="fas fa-eye" aria-hidden="true"></i> Quick View
                                                </button>
                                            </div>
                                        </div>
                                        <div class="product-info">
                                            <h3 class="product-title">' . $product['name'] . '</h3>
                                            <p class="product-price">$'. $product['price'] . '</p>
                                            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(this, ' . $product['price'] . ')">
                                                <span class="btn-text">ADD TO CART</span>
                                                <span class="loading-spinner d-none"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>';# code...

                            }
                            else  {
                                # code...
                            
                            
                                echo '<div class="col-12 col-md-6 col-lg-4">
                                    <div class="product-card" onclick="showQuickView(' . htmlspecialchars(json_encode($product)) . ')">
                                        <div class="product-badge">Unisex</div>
                                        <div class="img-container">
                                            <img src="images/' . $product['image'] . '" alt="' . $product['name'] . '">
                                            <div class="quick-view">
                                                <button class="quick-view-btn" aria-label="Quick view ' . $product['name'] . '">
                                                    <i class="fas fa-eye" aria-hidden="true"></i> Quick View
                                                </button>
                                            </div>
                                        </div>
                                        <div class="product-info">
                                            <h3 class="product-title">' . $product['name'] . '</h3>
                                            <p class="product-price">$'. $product['price'] . '</p>
                                            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(this, ' . $product['price'] . ')">
                                                <span class="btn-text">ADD TO CART</span>
                                                <span class="loading-spinner d-none"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>';# code...
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
                                <div class="quick-view-image"></div>
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
                            <div class="product-stats">
                                <div class="stat-item">
                                    <div class="stat-label">Stock Status</div>
                                    <div class="stat-value">In Stock</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Category</div>
                                    <div class="stat-value"><?php echo $product['category']; ?></div>
                                </div>
                            </div>
                            <button class="add-to-cart-btn w-100">
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

<script src="scripts/products.js"></script>
<?php include 'layout/footer.php'; ?>
