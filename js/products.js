let currentProductData = null;

// Constants
const ANIMATION_DURATION = 300;
const FILTER_DELAY = 50;

// Elements
const priceRange = document.getElementById('priceRange');
const selectedPrice = document.querySelector('.selected-price');
const filterCheckboxes = {
    plush: document.getElementById('plush'),
    cards: document.getElementById('cards')
};
const productCards = document.querySelectorAll('.product-card');

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .product-card-container {
        transition: all ${ANIMATION_DURATION}ms ease-in-out;
    }
    .product-card-container.hiding {
        opacity: 0;
        transform: scale(0.8);
    }
    .product-card-container.showing {
        opacity: 1;
        transform: scale(1);
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    initializeSlider();
    initializeQuickView();
    initializeFilters();
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
        plush: filterCheckboxes.plush?.checked || false,
        cards: filterCheckboxes.cards?.checked || false
    };

    console.log('Active Filters:', {
        maxPrice,
        plushChecked: filters.plush,
        cardsChecked: filters.cards
    });

    let visibleProducts = 0;
    
    // First pass: Start animations
    productCards.forEach((card, index) => {
        try {
            const productData = JSON.parse(card.dataset.product);
            const price = parseFloat(productData.price);
            const category = productData.category;
            const cardContainer = card.closest('.col-12');
            
            // Ensure container has our animation class
            cardContainer.classList.add('product-card-container');

            const isVisible = checkVisibility(price, maxPrice, category, filters);
            
            // Stagger the animations
            setTimeout(() => {
                if (isVisible) {
                    cardContainer.classList.remove('hiding');
                    cardContainer.classList.add('showing');
                    visibleProducts++;
                } else {
                    cardContainer.classList.remove('showing');
                    cardContainer.classList.add('hiding');
                }
            }, index * FILTER_DELAY);

            // Update display property after animation
            setTimeout(() => {
                if (isVisible) {
                    cardContainer.style.display = '';
                } else {
                    cardContainer.style.display = 'none';
                }
            }, ANIMATION_DURATION + (index * FILTER_DELAY));
        } catch (error) {
            console.error('Error processing product card:', error);
        }
    });

    // Update empty state after all animations complete
    setTimeout(() => {
        updateEmptyState(visibleProducts);
    }, ANIMATION_DURATION + (productCards.length * FILTER_DELAY));
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
    const categoryFiltersActive = filters.plush || filters.cards;
    console.log('Category filters active:', categoryFiltersActive);
    
    if (categoryFiltersActive) {
        const categoryMatch = (filters.plush && category === 'plush') || 
                            (filters.cards && category === 'cards');
        console.log('Category match result:', {
            category,
            plushMatch: filters.plush && category === 'plush',
            cardsMatch: filters.cards && category === 'cards',
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
    
    if (visibleProducts === 0) {
        if (!existingMessage) {
            const message = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No products match your filters</p>
                    <button class="btn btn-outline-primary" onclick="resetFilters()">Reset Filters</button>
                </div>
            `;
            document.querySelector('.products-grid').insertAdjacentHTML('beforeend', message);
        }
    } else {
        existingMessage?.remove();
    }
}

// Reset filters
function resetFilters() {
    // Reset checkboxes
    Object.values(filterCheckboxes).forEach(checkbox => {
        if (checkbox) checkbox.checked = false;
    });

    // Reset slider with animation
    if (priceRange) {
        const currentValue = parseInt(priceRange.value);
        const maxValue = parseInt(priceRange.max);
        animateSliderReset(currentValue, maxValue);
    }
}

// Animate slider reset
function animateSliderReset(start, end) {
    const steps = 10;
    const increment = (end - start) / steps;
    let step = 0;

    function animate() {
        if (step < steps) {
            const value = start + (increment * step);
            priceRange.value = value;
            updateSliderUI(Math.round(value));
            step++;
            requestAnimationFrame(animate);
        } else {
            priceRange.value = end;
            updateSliderUI(end);
            filterProducts();
        }
    }

    animate();
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

// Quick View functionality
function showQuickView(product) {
    console.log('Showing quick view for product:', {
        id: product.id,
        name: product.name,
        stock_quantity: product.stock_quantity
    });

    const modal = document.getElementById('quickViewModal');
    if (!modal) {
        console.error('Quick view modal not found');
        return;
    }

    // Update modal title and product info
    const modalTitle = modal.querySelector('.modal-title');
    const productTitle = modal.querySelector('.product-title');
    const productPrice = modal.querySelector('.product-price');
    const productDescription = modal.querySelector('.product-description p');
    const productCategory = modal.querySelector('.category-value');
    const stockStatus = modal.querySelector('.stock-status');
    const quantityValue = modal.querySelector('.quantity-value');
    const addToCartBtn = modal.querySelector('.add-to-cart-btn');

    console.log('Modal elements found:', {
        modalTitle: !!modalTitle,
        productTitle: !!productTitle,
        productPrice: !!productPrice,
        productDescription: !!productDescription,
        productCategory: !!productCategory,
        stockStatus: !!stockStatus,
        quantityValue: !!quantityValue,
        addToCartBtn: !!addToCartBtn
    });

    // Update text content with null checks
    if (modalTitle) modalTitle.textContent = product.name;
    if (productTitle) productTitle.textContent = product.name;
    if (productPrice) productPrice.textContent = `$${product.price.toFixed(2)}`;
    if (productDescription) productDescription.textContent = product.description;
    if (productCategory) productCategory.textContent = product.category;

    // Update stock status and quantity
    const inStock = product.stock_quantity > 0;
    const status = inStock ? 'In Stock' : 'Out of Stock';
    const statusClass = inStock ? 'text-success' : 'text-danger';

    console.log('Stock information:', {
        quantity: product.stock_quantity,
        inStock,
        status,
        statusClass
    });

    if (stockStatus) {
        stockStatus.textContent = status;
        stockStatus.className = `stat-value stock-status ${statusClass}`;
    }

    if (quantityValue) {
        quantityValue.textContent = product.stock_quantity;
        quantityValue.className = `stat-value quantity-value ${statusClass}`;
    }

    // Update add to cart button
    if (addToCartBtn) {
        addToCartBtn.disabled = !inStock;
        addToCartBtn.innerHTML = inStock 
            ? '<i class="fas fa-shopping-cart"></i><span class="btn-text">ADD TO CART</span>'
            : '<span class="btn-text">OUT OF STOCK</span>';
    }

    // Update main image with loading state
    const mainImageContainer = modal.querySelector('.quick-view-image');
    const mainImage = mainImageContainer?.querySelector('img');
    const loadingSpinner = mainImageContainer?.querySelector('.loading-spinner');
    
    if (mainImage && loadingSpinner) {
        mainImage.style.opacity = '0';
        loadingSpinner.style.display = 'block';
        
        const newImage = new Image();
        newImage.onload = function() {
            mainImage.src = product.image;
            mainImage.alt = product.name;
            mainImage.style.opacity = '1';
            loadingSpinner.style.display = 'none';
        };
        newImage.src = product.image;
    }

    // Create thumbnails
    const thumbnailList = modal.querySelector('.thumbnail-list');
    if (thumbnailList) {
        thumbnailList.innerHTML = ''; // Clear existing thumbnails
        
        // Add main product image as first thumbnail
        const mainThumbnail = document.createElement('div');
        mainThumbnail.className = 'thumbnail-item active';
        mainThumbnail.innerHTML = `<img src="${product.image}" alt="${product.name}">`;
        mainThumbnail.onclick = function() {
            updateMainImage(product.image);
            updateActiveThumbnail(this);
        };
        thumbnailList.appendChild(mainThumbnail);
    }

    // Store the current product for the add to cart functionality
    modal.dataset.currentProduct = JSON.stringify(product);
    currentProductData = product; // Ensure currentProductData is always updated

    // Show modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
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
