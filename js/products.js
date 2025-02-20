// Declare currentProductData only if it doesn't exist
if (typeof window.currentProductData === 'undefined') {
    window.currentProductData = null;
}

let currentProductData = null;

// Function to add product to cart
async function addToCart(productId, quantity, size = null) {
    try {
        const formData = new FormData();
        formData.append('product_id', productId);
        formData.append('quantity', quantity);
        if (size) {
            formData.append('size', size);
        }

        const response = await fetch('/api/cart.php', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Received non-JSON response from server");
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to add item to cart');
        }

        // Update cart count in header if exists
        const cartCount = document.querySelector('.cart-count');
        if (cartCount && data.cart_count !== undefined) {
            cartCount.textContent = data.cart_count;
            cartCount.style.display = data.cart_count > 0 ? 'block' : 'none';
        }

        return data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
}

// Constants
const ANIMATION_DURATION = 400;
const FILTER_DELAY = 30;

// Elements
const priceRange = document.getElementById('priceRange');
const selectedPrice = document.querySelector('.selected-price');
const filterCheckboxes = {
    plush: document.getElementById('plush'),
    cards: document.getElementById('cards'),
    men: document.getElementById('men'),
    women: document.getElementById('women'),
    unisex: document.getElementById('unisex'),
    accessories: document.getElementById('accessories')
};
const productCards = document.querySelectorAll('.product-card');

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .product-card-container {
        transition: all ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: center;
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
        position: relative;
    }
    
    .product-card-container.hiding {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        pointer-events: none;
        position: absolute;
        width: 100%;
    }
    
    .product-card-container.showing {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
        position: relative;
    }

    .products-grid .row {
        position: relative;
        min-height: 100px;
    }

    .no-results {
        opacity: 0;
        transform: translateY(20px);
        transition: all 300ms ease-in-out;
        text-align: center;
        padding: 40px 20px;
        width: 100%;
    }

    .no-results.visible {
        opacity: 1;
        transform: translateY(0);
    }

    .no-results i {
        font-size: 48px;
        color: #ccc;
        margin-bottom: 20px;
        display: block;
    }

    .no-results p {
        font-size: 18px;
        color: #666;
        margin-bottom: 20px;
    }

    .no-results button {
        padding: 10px 25px;
        font-size: 16px;
        transition: all 200ms ease;
    }

    .no-results button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    /* Quick View Modal Styles */
    .product-stats {
        margin: 1.5rem 0;
        padding: 1.25rem;
        background: #f8f9fa;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid #dee2e6;
    }

    .stat-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    .stat-item:first-child {
        padding-top: 0;
    }

    .stat-label {
        font-weight: 500;
        color: #6c757d;
        font-size: 0.95rem;
    }

    .stat-value {
        font-weight: 600;
        padding: 0.35rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        min-width: 100px;
        text-align: center;
    }

    .stock-status.text-success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    .stock-status.text-danger {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .quantity-value {
        background: #e9ecef;
        color: #495057;
        border: 1px solid #dee2e6;
    }

    .quantity-value.text-success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    .quantity-value.text-warning {
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #ffeeba;
    }

    .quantity-value.text-danger {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    /* Add hover effect */
    .stat-value:hover {
        transform: translateY(-1px);
        transition: transform 0.2s ease;
    }
`;
document.head.appendChild(style);

// Initialize slider
function initializeSlider() {
    if (!priceRange) return;

    const maxValue = priceRange.max;
    updateSliderUI(maxValue);
    
    // Event listeners
    priceRange.addEventListener('input', handleSliderInput);
    priceRange.addEventListener('touchstart', () => priceRange.classList.add('active'));
    priceRange.addEventListener('touchend', () => priceRange.classList.remove('active'));
}

// Handle slider input
function handleSliderInput(e) {
    const value = e.target.value;
    updateSliderUI(value);
    
    requestAnimationFrame(filterProducts);
}

// Update slider UI
function updateSliderUI(value) {
    if (!selectedPrice) return;
    selectedPrice.textContent = `$${value}`;
}

// Format category for display
function formatCategory(category) {
    switch(category) {
        // Clothing categories
        case 'clothing-men':
            return 'Men';
        case 'clothing-women':
            return 'Women';
        case 'clothing-unisex':
            return 'Unisex';
        case 'accessories':
            return 'Accessories';
        // Toys categories
        case 'plush':
            return 'Plush Toys';
        case 'cards':
            return 'Pokemon Cards';
        default:
            return category;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Check if we're on a product page
    const isProductPage = document.querySelector('.products-grid') !== null;
    
    if (isProductPage) {
    initializeSlider();
    initializeQuickView();
    initializeFilters();
    handleImageErrors();
        initializeAddToCartButtons();
        
        // Update product badges
        document.querySelectorAll('.product-badge').forEach(badge => {
            const category = badge.dataset.category;
            if (category) {
                badge.textContent = formatCategory(category);
            }
        });
    }
});

// Initialize filters
function initializeFilters() {
    // Add event listeners for checkboxes
    Object.values(filterCheckboxes).forEach(checkbox => {
        if (checkbox) {
            console.log('Adding listener to checkbox:', checkbox.id);
            checkbox.addEventListener('change', () => {
                console.log('Checkbox changed:', checkbox.id, 'Checked:', checkbox.checked);
                filterProducts();
            });
        }
    });
}

// Initialize quick view
function initializeQuickView() {
    console.log('=== Initializing Quick View ===');
    
    // Handle quick view button clicks
    const buttons = document.querySelectorAll('.quick-view-btn');
    console.log('Found quick view buttons:', buttons.length);

    buttons.forEach((btn, index) => {
        btn.addEventListener('click', handleQuickView);
    });

    // Handle overlay clicks
    const overlays = document.querySelectorAll('.quick-view');
    console.log('Found quick view overlays:', overlays.length);

    overlays.forEach((overlay, index) => {
        overlay.addEventListener('click', handleQuickView);
    });
}

// Handler function for both button and overlay clicks
function handleQuickView(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Quick view triggered by:', e.currentTarget.className);
    const card = this.closest('.product-card');
    
    if (card) {
        try {
            const rawData = card.dataset.product;
            console.log('Raw product data:', rawData);
            
            const productData = JSON.parse(rawData);
            currentProductData = productData;
            console.log('Parsed product data:', {
                id: productData.id,
                name: productData.name,
                price: productData.price,
                category: productData.category,
                stock_quantity: productData.stock_quantity,
                type: typeof productData.stock_quantity
            });
            
            showQuickView(productData);
        } catch (error) {
            console.error('Error processing product data:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
        }
    } else {
        console.error('Could not find product card element');
    }
}

// Filter products
function filterProducts() {
    console.log('=== Starting Filter Products ===');
    if (!priceRange) {
        console.log('Price range element not found');
        return;
    }

    const maxPrice = parseInt(priceRange.value);
    const filters = {
        men: filterCheckboxes.men?.checked || false,
        women: filterCheckboxes.women?.checked || false,
        unisex: filterCheckboxes.unisex?.checked || false,
        accessories: filterCheckboxes.accessories?.checked || false,
        plush: filterCheckboxes.plush?.checked || false,
        cards: filterCheckboxes.cards?.checked || false
    };

    console.log('Active Filters:', filters);

    let visibleProducts = 0;
    let totalProducts = productCards.length;
    let processedProducts = 0;
    
    // First hide all products
    productCards.forEach(card => {
        const cardContainer = card.closest('.col-12');
        if (cardContainer) {
            cardContainer.style.order = ''; // Reset order
            cardContainer.classList.add('product-card-container', 'hiding');
            cardContainer.classList.remove('showing');
        }
    });

    // Then show matching products with proper ordering
    setTimeout(() => {
        let order = 0;
        productCards.forEach(card => {
        try {
            const productData = JSON.parse(card.dataset.product);
            const price = parseFloat(productData.price);
            const category = productData.category;
            const cardContainer = card.closest('.col-12');
            
                if (!cardContainer) return;

            const isVisible = checkVisibility(price, maxPrice, category, filters);
            
                if (isVisible) {
                    cardContainer.style.order = order++; // Set order for visible products
                    cardContainer.classList.remove('hiding');
                    cardContainer.classList.add('showing');
                    visibleProducts++;
                }
                
                processedProducts++;
                
                if (processedProducts === totalProducts) {
                    updateEmptyState(visibleProducts);
                }
        } catch (error) {
            console.error('Error processing product card:', error);
                processedProducts++;
            }
        });
    }, ANIMATION_DURATION / 2);
}

// Check product visibility based on filters
function checkVisibility(price, maxPrice, category, filters) {
    console.log('\nChecking visibility for:', { price, category });
    console.log('Against filters:', { maxPrice, filters });

    // Price check
    if (price > maxPrice) {
        console.log('Failed price check:', price, '>', maxPrice);
        return false;
    }
    console.log('Passed price check');

    // Category check - only apply if at least one category is selected
    const categoryFiltersActive = filters.men || filters.women || filters.unisex || filters.accessories;
    console.log('Category filters active:', categoryFiltersActive);
    
    if (categoryFiltersActive) {
        const categoryMatch = (filters.men && category === 'clothing-men') || 
                            (filters.women && category === 'clothing-women') ||
                            (filters.unisex && category === 'clothing-unisex') ||
                            (filters.accessories && category === 'accessories');
        console.log('Category match result:', {
            category,
            menMatch: filters.men && category === 'clothing-men',
            womenMatch: filters.women && category === 'clothing-women',
            unisexMatch: filters.unisex && category === 'clothing-unisex',
            accessoriesMatch: filters.accessories && category === 'accessories',
            finalMatch: categoryMatch
        });
        return categoryMatch;
    }

    console.log('No category filters active, product is visible');
    return true;
}

// Update empty state message
function updateEmptyState(visibleProducts) {
    const existingMessage = document.querySelector('.no-results');
    const productsGrid = document.querySelector('.products-grid .row');
    
    if (visibleProducts === 0) {
        if (!existingMessage) {
            const message = document.createElement('div');
            message.className = 'no-results';
            message.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>No products match your filters</p>
                <button class="btn btn-outline-primary" onclick="resetFilters()">
                    <i class="fas fa-sync-alt"></i> Reset Filters
                </button>
            `;
            productsGrid.appendChild(message);
            
            // Trigger animation after a small delay
            requestAnimationFrame(() => {
                message.classList.add('visible');
            });
        }
    } else if (existingMessage) {
        existingMessage.classList.remove('visible');
        setTimeout(() => existingMessage.remove(), 300);
    }
}

// Reset filters with smooth animation
function resetFilters() {
    // Reset checkboxes with animation
    Object.values(filterCheckboxes).forEach(checkbox => {
        if (checkbox && checkbox.checked) {
            checkbox.checked = false;
            checkbox.closest('.form-check').style.transform = 'scale(1.1)';
            setTimeout(() => {
                checkbox.closest('.form-check').style.transform = '';
            }, 200);
        }
    });

    // Reset slider with smooth animation
    if (priceRange) {
        const currentValue = parseInt(priceRange.value);
        const maxValue = parseInt(priceRange.max);
        animateSliderReset(currentValue, maxValue);
    }
}

// Animate slider reset
function animateSliderReset(start, end) {
    const duration = 300; // Animation duration in ms
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easeOutQuad easing function for smooth animation
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        
        const currentValue = start + (end - start) * easeProgress;
        priceRange.value = currentValue;
        updateSliderUI(Math.round(currentValue));
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            filterProducts(); // Apply filters after animation completes
        }
    }

    requestAnimationFrame(update);
}

// Back to top functionality
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Function to show quick view modal
async function showQuickView(product) {
    try {
        console.log('Showing quick view for product:', product);
        window.currentProductData = product;

        // Update modal content
    const modal = document.getElementById('quickViewModal');
    if (!modal) {
            throw new Error('Quick view modal not found');
        }

        // Get all required elements
        const elements = {
            modalTitle: modal.querySelector('.modal-title'),
            productTitle: modal.querySelector('.product-title'),
            productPrice: modal.querySelector('.product-price'),
            productDescription: modal.querySelector('.product-description p'),
            stockStatus: modal.querySelector('.stock-status'),
            categoryValue: modal.querySelector('.category-value'),
            quantityValue: modal.querySelector('.quantity-value'),
            sizeSelector: modal.querySelector('.size-selector'),
            sizeSelect: modal.querySelector('#modalSizeSelect'),
            sizeError: modal.querySelector('.size-error'),
            addToCartBtn: modal.querySelector('.add-to-cart-btn')
        };

        // Check if required elements exist
        if (!elements.modalTitle || !elements.productTitle || !elements.productPrice || 
            !elements.productDescription || !elements.stockStatus || !elements.categoryValue || 
            !elements.quantityValue || !elements.addToCartBtn) {
            throw new Error('Required modal elements not found');
        }

        // Update text content
        elements.modalTitle.textContent = product.name;
        elements.productTitle.textContent = product.name;
        elements.productPrice.textContent = `$${product.price.toFixed(2)}`;
        elements.productDescription.textContent = product.description;
        elements.stockStatus.textContent = product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock';
        elements.stockStatus.className = `stat-value stock-status ${product.stock_quantity > 0 ? 'text-success' : 'text-danger'}`;
        elements.categoryValue.textContent = formatCategory(product.category);
        elements.quantityValue.textContent = product.stock_quantity;
        
        // Add class based on stock quantity
        if (product.stock_quantity > 10) {
            elements.quantityValue.className = 'stat-value quantity-value text-success';
        } else if (product.stock_quantity > 0) {
            elements.quantityValue.className = 'stat-value quantity-value text-warning';
        } else {
            elements.quantityValue.className = 'stat-value quantity-value text-danger';
        }

        // Handle size selector if it exists
        if (elements.sizeSelector && elements.sizeSelect && product.category.includes('clothing') && product.sizes) {
            elements.sizeSelector.classList.remove('d-none');
            elements.sizeSelect.innerHTML = '<option value="">Select Size</option>';
            
            // Add size options
            Object.entries(product.sizes).forEach(([size, quantity]) => {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = size;
                option.disabled = quantity <= 0;
                if (quantity <= 0) {
                    option.textContent += ' (Out of Stock)';
                }
                elements.sizeSelect.appendChild(option);
            });
        } else if (elements.sizeSelector) {
            elements.sizeSelector.classList.add('d-none');
        }

        // Update gallery
        updateGallery(product.gallery || [product.image]);

        // Get button elements
        const btnText = elements.addToCartBtn.querySelector('.btn-text');
        const loadingSpinner = elements.addToCartBtn.querySelector('.loading-spinner');
        
        if (!btnText || !loadingSpinner) {
            throw new Error('Button elements not found');
        }

        // Reset button state
        elements.addToCartBtn.disabled = product.stock_quantity <= 0;
        btnText.textContent = product.stock_quantity > 0 ? 'ADD TO CART' : 'OUT OF STOCK';
        loadingSpinner.classList.add('d-none');
        if (elements.sizeError) {
            elements.sizeError.classList.add('d-none');
        }

        // Add to cart button click handler
        elements.addToCartBtn.onclick = async () => {
            try {
                // Check if size is required but not selected
                if (elements.sizeSelect && product.category.includes('clothing') && !elements.sizeSelect.value) {
                    if (elements.sizeError) {
                        elements.sizeError.textContent = 'Please select a size';
                        elements.sizeError.classList.remove('d-none');
                    }
                    return;
                }

                // Hide any previous error
                if (elements.sizeError) {
                    elements.sizeError.classList.add('d-none');
                }

                // Show loading state
                btnText.textContent = 'Adding...';
                loadingSpinner.classList.remove('d-none');
                elements.addToCartBtn.disabled = true;

                // Add to cart
                await window.cartManager.addToCart(
                    product.id, 
                    1, 
                    elements.sizeSelect ? elements.sizeSelect.value : null
                );

                // Show success state
                btnText.textContent = 'Added!';
                setTimeout(() => {
                    btnText.textContent = 'ADD TO CART';
                    elements.addToCartBtn.disabled = false;
                }, 2000);
            } catch (error) {
                console.error('Error adding to cart:', error);
                
                // Show error state
                btnText.textContent = 'Failed to Add';
                if (elements.sizeError) {
                    elements.sizeError.textContent = error.message || 'Failed to add item to cart';
                    elements.sizeError.classList.remove('d-none');
                }
                
                setTimeout(() => {
                    btnText.textContent = 'ADD TO CART';
                    elements.addToCartBtn.disabled = false;
                }, 2000);
            } finally {
                loadingSpinner.classList.add('d-none');
            }
        };

        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    } catch (error) {
        console.error('Error showing quick view:', error);
    }
}

// Function to update gallery
function updateGallery(images) {
    const mainImage = document.querySelector('.quick-view-image img');
    const thumbnailList = document.querySelector('.thumbnail-list');
    const loadingSpinner = document.querySelector('.quick-view-image .loading-spinner');

    // Show loading state
    if (mainImage && loadingSpinner) {
        mainImage.style.opacity = '0';
        loadingSpinner.style.display = 'block';
    }

    // Clear existing thumbnails
    if (thumbnailList) {
        thumbnailList.innerHTML = '';
    }

    // Load main image
    if (mainImage && images.length > 0) {
        const img = new Image();
        img.onload = () => {
            mainImage.src = images[0];
            mainImage.alt = currentProductData.name;
            mainImage.style.opacity = '1';
            loadingSpinner.style.display = 'none';
        };
        img.onerror = () => {
            mainImage.src = '/Images/default-product.jpg';
            mainImage.alt = 'Product image not available';
            mainImage.style.opacity = '1';
            loadingSpinner.style.display = 'none';
        };
        img.src = images[0];
    }

    // Add thumbnails
    if (thumbnailList && images.length > 1) {
        images.forEach((image, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail' + (index === 0 ? ' active' : '');
            thumbnail.innerHTML = `<img src="${image}" alt="Product thumbnail ${index + 1}">`;
            thumbnail.onclick = () => {
                // Update main image
                if (mainImage) {
                    mainImage.style.opacity = '0';
                    loadingSpinner.style.display = 'block';
                    const img = new Image();
                    img.onload = () => {
                        mainImage.src = image;
                        mainImage.style.opacity = '1';
                        loadingSpinner.style.display = 'none';
                    };
                    img.onerror = () => {
                        mainImage.src = '/Images/default-product.jpg';
                        mainImage.style.opacity = '1';
                        loadingSpinner.style.display = 'none';
                    };
                    img.src = image;
                }
                // Update active thumbnail
                document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
                thumbnail.classList.add('active');
            };
            thumbnailList.appendChild(thumbnail);
        });
    }
}

// Initialize Add to Cart buttons
function initializeAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.product-card .add-to-cart-btn');
    if (!addToCartButtons || addToCartButtons.length === 0) {
        console.log('No add to cart buttons found on this page');
        return;
    }
    
    console.log('Found add to cart buttons:', addToCartButtons.length);

    addToCartButtons.forEach(button => {
        if (!button) return;
        
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Get product data
            const productCard = button.closest('.product-card');
            if (!productCard) return;

            try {
                const productData = JSON.parse(productCard.dataset.product);
                const btnText = button.querySelector('.btn-text');
                const loadingSpinner = button.querySelector('.loading-spinner');
                
                if (!btnText || !loadingSpinner) {
                    console.error('Button elements not found');
                    return;
                }
                
                // Disable button and show loading state
                button.disabled = true;
                btnText.textContent = 'Adding...';
                loadingSpinner.classList.remove('d-none');

                // For clothing items, show quick view instead
                if (productData.category.includes('clothing')) {
                    showQuickView(productData);
                    return;
                }

                // Add to cart
                await window.cartManager.addToCart(productData.id, 1);

                // Show success state
                btnText.textContent = 'Added!';
                setTimeout(() => {
                    btnText.textContent = 'ADD TO CART';
                    button.disabled = false;
                }, 2000);
            } catch (error) {
                console.error('Error adding to cart:', error);
                const btnText = button.querySelector('.btn-text');
                if (btnText) {
                    btnText.textContent = 'Failed!';
                    setTimeout(() => {
                        btnText.textContent = 'ADD TO CART';
                        button.disabled = false;
                    }, 2000);
                }
            } finally {
                const loadingSpinner = button.querySelector('.loading-spinner');
                if (loadingSpinner) {
                    loadingSpinner.classList.add('d-none');
                }
            }
        });
    });
}

function updateMainImage(src) {
    const mainImageContainer = document.querySelector('.quick-view-image');
    if (!mainImageContainer) return;

    const mainImage = mainImageContainer.querySelector('img');
    const loadingSpinner = mainImageContainer.querySelector('.loading-spinner');
    
    if (mainImage && loadingSpinner) {
        mainImage.style.opacity = '0';
        loadingSpinner.style.display = 'block';
        
        const newImage = new Image();
        newImage.onload = function() {
            mainImage.src = src;
            mainImage.style.opacity = '1';
            loadingSpinner.style.display = 'none';
        };
        newImage.src = src;
    }
}

function updateActiveThumbnail(clickedThumbnail) {
    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.classList.remove('active');
    });
    clickedThumbnail.classList.add('active');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('quickViewModal'));
        modal?.hide();
    }
});

// Add touch event handling for mobile
document.querySelectorAll('.product-card').forEach(card => {
    let touchStartTime;
    
    card.addEventListener('touchstart', function(e) {
        touchStartTime = Date.now();
        this.classList.add('touched');
    });
    
    card.addEventListener('touchend', function(e) {
        const touchDuration = Date.now() - touchStartTime;
        this.classList.remove('touched');
        
        // Just open quick view if tap is short (under 200ms)
        if (touchDuration < 200) {
            try {
                const productData = JSON.parse(this.dataset.product);
                showQuickView(productData);
            } catch (error) {
                console.error('Error processing product data on touch:', error);
            }
        }
    });
});

// Add touch feedback
function addTouchFeedback() {
    const filterSection = document.querySelector('.filter-section');
    
    filterSection?.addEventListener('touchstart', () => {
        filterSection.style.transform = 'scale(0.99)';
    });

    filterSection?.addEventListener('touchend', () => {
        filterSection.style.transform = 'scale(1)';
    });
}

// Handle image errors
function handleImageErrors() {
    // Add error handling for all product images
    document.querySelectorAll('.product-card img').forEach(img => {
        img.onerror = handleImageError;
    });

    // Add error handling for quick view images
    const quickViewImage = document.querySelector('#quickViewModal .quick-view-image img');
    if (quickViewImage) {
        quickViewImage.onerror = handleImageError;
    }
}

function handleImageError() {
    // Replace with default image
    this.src = '/Images/default-product.jpg';
    // Log error
    console.error('Failed to load image:', this.src);
    // Remove loading spinner if present
    const spinner = this.parentElement.querySelector('.loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
    // Show image
    this.style.opacity = '1';
}
