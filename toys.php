<?php
$title = "Pokemon Store - Toys & Cards";
$md = "Explore our collection of Pokemon toys, figures, and plushies";
include 'layout/header.php';

// Define products array first
$products = [
    [
        'name' => 'Hamburger Snorlax',
        'price' => 109,
        'image' => 'snorlax-burger.jpg',
        'gallery' => [
            'snorlax-burger.jpg',
            'pikachu-cos-mario.jpg',
            'charizard-family.jpg'
        ],
        'description' => 'Adorable Snorlax figure enjoying a delicious hamburger. Perfect for Pokemon fans who love this sleepy Pokemon\'s eating habits!'
    ],
    [
        'name' => 'Pikachu Cos Mario',
        'price' => 89,
        'image' => 'pikachu-cos-mario.jpg',
        'gallery' => [
            'pikachu-cos-mario.jpg'
        ],
        'description' => 'Cute Pikachu dressed as Mario! A unique crossover figure combining Pokemon and Super Mario universes.'
    ],
    [
        'name' => 'Charizard Family',
        'price' => 149,
        'image' => 'charizard-family.jpg',
        'gallery' => [
            'charizard-family.jpg'
        ],
        'description' => 'Beautiful diorama featuring Charizard and its evolution line. Shows the majestic fire Pokemon in all its forms.'
    ],
    [
        'name' => 'Eevee',
        'price' => 79,
        'image' => 'eevee.jpg',
        'gallery' => [
            'eevee.jpg'
        ]
    ],
    [
        'name' => 'Mewtwo',
        'price' => 299,
        'image' => 'mewtwo.jpg',
        'gallery' => [
            'mewtwo.jpg'
        ]
    ],
    [
        'name' => 'Gengar',
        'price' => 95,
        'image' => 'gengar.jpg',
        'gallery' => [
            'gengar.jpg'
        ]
    ],
    [
        'name' => 'Bulbasaur Family',
        'price' => 69,
        'image' => 'bulbasaur-family.jpg',
        'gallery' => [
            'bulbasaur-family.jpg'
        ]
    ],
    [
        'name' => 'Squirtle',
        'price' => 85,
        'image' => 'squirtle.jpg',
        'gallery' => [
            'squirtle.jpg'
        ]
    ],
    [
        'name' => 'Gyarados',
        'price' => 199,
        'image' => 'Gyarados.jpg',
        'gallery' => [
            'Gyarados.jpg'
        ]
    ],
    [
        'name' => 'Dragonite',
        'price' => 99,
        'image' => 'Dragonite.jpg',
        'gallery' => [
            'Dragonite.jpg'
        ]
    ],
    [
        'name' => 'Rayquaza',
        'price' => 249,
        'image' => 'Rayquaza.jpg',
        'gallery' => [
            'Rayquaza.jpg'
        ]
    ],
    [
        'name' => 'Mimikyu',
        'price' => 89,
        'image' => 'Mimikyu.jpg',
        'gallery' => [
            'Mimikyu.jpg'
        ]
    ]
];
?>

<link href="css/style.css" rel="stylesheet">
<link href="css/products.css" rel="stylesheet">

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
                        <h3>BRAND</h3>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="pokemon">
                            <label class="form-check-label" for="pokemon">POKEMON</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="figure">
                            <label class="form-check-label" for="figure">FIGURE</label>
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
                            echo '<div class="col-12 col-md-6 col-lg-4">
                                    <div class="product-card" onclick="showQuickView(' . htmlspecialchars(json_encode($product)) . ')">
                                        <div class="product-badge">FIGURE</div>
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
                                    <div class="stat-value">Figure</div>
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
