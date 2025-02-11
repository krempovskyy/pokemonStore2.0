// Price range slider
const priceRange = document.getElementById('priceRange');
const selectedPrice = document.querySelector('.selected-price');

// Get filter elements
const pokemonCheckbox = document.getElementById('pokemon');
const figureCheckbox = document.getElementById('figure');
const productCards = document.querySelectorAll('.product-card');

// Filter products based on checkboxes and price
function filterProducts() {
    const maxPrice = parseInt(priceRange.value);
    const showPokemon = pokemonCheckbox.checked;
    const showFigure = figureCheckbox.checked;
    let visibleProducts = 0;

    productCards.forEach(card => {
        const price = parseInt(card.querySelector('.product-price').textContent.replace('$', ''));
        const isFigure = card.querySelector('.product-badge').textContent === 'FIGURE';
        const isPokemon = !isFigure;

        const matchesPrice = price <= maxPrice;
        const matchesCategory = (!showPokemon && !showFigure) || (showPokemon && isPokemon) || (showFigure && isFigure);

        const shouldShow = matchesPrice && matchesCategory;
        card.closest('.col-12').style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) visibleProducts++;
    });

    // Show/hide empty state message
    const emptyState = document.querySelector('.no-results');
    if (visibleProducts === 0) {
        if (!emptyState) {
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
        emptyState?.remove();
    }
}

// Update price and slider background when slider moves
priceRange.addEventListener('input', function() {
    // Update price text
    selectedPrice.textContent = '$' + this.value;
    
    // Calculate percentage for background
    const value = (this.value - this.min) / (this.max - this.min) * 100;
    
    // Update background gradient
    this.style.setProperty('--value', `${value}%`);

    // Apply filters
    filterProducts();
});


// Add event listeners to checkboxes
pokemonCheckbox.addEventListener('change', filterProducts);
figureCheckbox.addEventListener('change', filterProducts);

// Initialize slider on page load
window.addEventListener('load', function() {
    // Set initial slider background to 100%
    priceRange.style.setProperty('--value', '100%');
});

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

function resetFilters() {
    pokemonCheckbox.checked = false;
    figureCheckbox.checked = false;
    priceRange.value = priceRange.max;
    selectedPrice.textContent = '$' + priceRange.value;
    priceRange.style.setProperty('--value', '100%');
    filterProducts();
}

// Quick View functionality
function showQuickView(product) {
    const modal = document.getElementById('quickViewModal');
    
    // Check if modal is already open
    let modalInstance = bootstrap.Modal.getInstance(modal);
    
    // If modal is already open, dispose of it
    if (modalInstance) {
        modalInstance.dispose();
    }
    
    // Create new modal instance
    modalInstance = new bootstrap.Modal(modal);
    
    // Update modal content
    modal.querySelector('.modal-title').textContent = product.name;
    
    // Setup gallery
    const imageContainer = modal.querySelector('.quick-view-image');
    const thumbnailList = modal.querySelector('.thumbnail-list');
    
    // Clear existing thumbnails
    thumbnailList.innerHTML = '';
    
    // Create main image
    imageContainer.innerHTML = `
        <div class="loading-spinner"></div>
        <img src="images/${product.gallery ? product.gallery[0] : product.image}" 
             alt="${product.name}" 
             style="opacity: 0">
    `;

    // Create thumbnails
    if (product.gallery) {
        product.gallery.forEach((img, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = `thumbnail-item ${index === 0 ? 'active' : ''}`;
            thumbnail.innerHTML = `<img src="images/${img}" alt="Product view ${index + 1}">`;
            
            // Add click handler
            thumbnail.addEventListener('click', () => {
                // Update main image
                imageContainer.innerHTML = `
                    <div class="loading-spinner"></div>
                    <img src="images/${img}" 
                         alt="${product.name}" 
                         style="opacity: 0">
                `;
                
                // Handle main image loading
                const mainImg = imageContainer.querySelector('img');
                const spinner = imageContainer.querySelector('.loading-spinner');
                
                mainImg.onload = () => {
                    spinner.style.display = 'none';
                    mainImg.style.opacity = '1';
                };
                
                // Update active state
                thumbnailList.querySelectorAll('.thumbnail-item').forEach(thumb => {
                    thumb.classList.remove('active');
                });
                thumbnail.classList.add('active');
            });
            
            thumbnailList.appendChild(thumbnail);
        });
    }

    // Handle main image loading
    const mainImg = imageContainer.querySelector('img');
    const spinner = imageContainer.querySelector('.loading-spinner');
    
    mainImg.onload = () => {
        spinner.style.display = 'none';
        mainImg.style.opacity = '1';
    };
    
    mainImg.onerror = () => {
        spinner.style.display = 'none';
        imageContainer.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-image fa-3x mb-2"></i>
                <p>Image not available</p>
            </div>
        `;
    };
    
    // Update product info
    modal.querySelector('.quick-view-info .product-title').textContent = product.name;
    modal.querySelector('.quick-view-info .product-price').textContent = `$${product.price}`;
    
    // Update description
    const description = product.description || 'No description available.';
    modal.querySelector('.product-description p').textContent = description;
    
    // Update add to cart button
    const addToCartBtn = modal.querySelector('.add-to-cart-btn');
    addToCartBtn.onclick = () => addToCart(addToCartBtn, product.price);
    
    // Show modal
    modalInstance.show();
    
    // Clean up when modal is hidden
    modal.addEventListener('hidden.bs.modal', function () {
        modalInstance.dispose();
    }, { once: true });

    // Add keyboard navigation for gallery
    if (product.gallery && product.gallery.length > 1) {
        modal.addEventListener('keydown', function(e) {
            const currentIndex = Array.from(thumbnailList.children)
                .findIndex(item => item.classList.contains('active'));
            
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                thumbnailList.children[currentIndex - 1].click();
            } else if (e.key === 'ArrowRight' && currentIndex < product.gallery.length - 1) {
                thumbnailList.children[currentIndex + 1].click();
            }
        });
    }
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
            const productData = JSON.parse(this.getAttribute('onclick').split('(')[1].split(')')[0]);
            showQuickView(productData);
        }
    });
});
