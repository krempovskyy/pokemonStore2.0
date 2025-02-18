<?php
$title = "Pokemon Store - Toys & Cards";
$md = "Explore our collection of Pokemon toys, figures, and plushies";
include 'includes/header.php';

// Define products array first
$products = [
    [
        'id' => 1001,
        'name' => 'Hamburger Snorlax',
        'price' => 109,
        'category' => 'Plushie',
        'image' => 'images/snorlax-burger.jpg',
        'gallery' => [
            'images/snorlax-burger.jpg',
            'images/pikachu-cos-mario.jpg',
            'images/charizard-family.jpg'
        ],
        'description' => 'Adorable Snorlax figure enjoying a delicious hamburger. Perfect for Pokemon fans who love this sleepy Pokemon\'s eating habits!'
    ],
    [
        'id' => 1002,
        'name' => 'Pikachu Cos Mario',
        'price' => 89,
        'category' => 'Figure',
        'image' => 'images/pikachu-cos-mario.jpg',
        'gallery' => [
            'images/pikachu-cos-mario.jpg'
        ],
        'description' => 'Cute Pikachu dressed as Mario! A unique crossover figure combining Pokemon and Super Mario universes.'
    ],
    [
        'id' => 1003,
        'name' => 'Charizard Family',
        'price' => 149,
        'category' => 'Figure',
        'image' => 'images/charizard-family.jpg',
        'gallery' => [
            'images/charizard-family.jpg'
        ],
        'description' => 'Beautiful diorama featuring Charizard and its evolution line. Shows the majestic fire Pokemon in all its forms.'
    ],
    [
        'id' => 1004,
        'name' => 'Eevee',
        'price' => 79,
        'category' => 'Plushie',
        'image' => 'images/eevee.jpg',
        'gallery' => [
            'images/eevee.jpg'
        ]
    ],
    [
        'id' => 1005,
        'name' => 'Mewtwo',
        'price' => 299,
        'category' => 'Figure',
        'image' => 'images/mewtwo.jpg',
        'gallery' => [
            'images/mewtwo.jpg'
        ]
    ],
    [
        'id' => 1006,
        'name' => 'Gengar',
        'price' => 95,
        'category' => 'Plushie',
        'image' => 'images/gengar.jpg',
        'gallery' => [
            'images/gengar.jpg'
        ]
    ],
    [
        'id' => 1007,
        'name' => 'Bulbasaur Family',
        'price' => 69,
        'category' => 'Figure',
        'image' => 'images/bulbasaur-family.jpg',
        'gallery' => [
            'images/bulbasaur-family.jpg'
        ]
    ],
    [
        'id' => 1008,
        'name' => 'Squirtle',
        'price' => 85,
        'category' => 'Plushie',
        'image' => 'images/squirtle.jpg',
        'gallery' => [
            'images/squirtle.jpg'
        ]
    ],
    [
        'id' => 1009,
        'name' => 'Gyarados',
        'price' => 199,
        'category' => 'Figure',
        'image' => 'images/Gyarados.jpg',
        'gallery' => [
            'images/Gyarados.jpg'
        ]
    ],
    [
        'id' => 1010,
        'name' => 'Dragonite',
        'price' => 99,
        'category' => 'Plushie',
        'image' => 'images/Dragonite.jpg',
        'gallery' => [
            'images/Dragonite.jpg'
        ]
    ],
    [
        'id' => 1011,
        'name' => 'Rayquaza',
        'price' => 249,
        'category' => 'Figure',
        'image' => 'images/Rayquaza.jpg',
        'gallery' => [
            'images/Rayquaza.jpg'
        ]
    ],
    [
        'id' => 1012,
        'name' => 'Mimikyu',
        'price' => 89,
        'category' => 'Plushie',
        'image' => 'images/Mimikyu.jpg',
        'gallery' => [
            'images/Mimikyu.jpg'
        ]
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
        <h1 class="page-title">TOYS & FIGURES</h1>
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
                        <h3>CATEGORY</h3>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="figure">
                            <label class="form-check-label" for="figure">Figure</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="plushie">
                            <label class="form-check-label" for="plushie">Plushie</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="card">
                            <label class="form-check-label" for="card">Card</label>
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
                        // Loop through products
                        foreach ($products as $product) {
                            // Properly encode the product data
                            $productJson = htmlspecialchars(json_encode($product), ENT_QUOTES, 'UTF-8');
                            
                            echo '<div class="col-12 col-md-6 col-lg-4">
                                    <div class="product-card" data-product="' . $productJson . '">
                                        <div class="product-badge">' . htmlspecialchars($product['category']) . '</div>
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
