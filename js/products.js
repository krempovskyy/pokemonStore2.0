// Constants
const ANIMATION_DURATION = 200;
const FILTER_DELAY = 50;

// Elements
const priceRange = document.getElementById('priceRange');
const selectedPrice = document.querySelector('.selected-price');
const filterCheckboxes = {
    pokemon: document.getElementById('pokemon'),
    figure: document.getElementById('figure'),
    menType: document.getElementById('Mtype'),
    womenType: document.getElementById('Wtype')
};
const productCards = document.querySelectorAll('.product-card');

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
    if (!priceRange || !selectedPrice) return;

    // Update price text with animation
    selectedPrice.textContent = `$${value}`;
    selectedPrice.classList.add('price-updated');
    setTimeout(() => selectedPrice.classList.remove('price-updated'), ANIMATION_DURATION);

    // Update slider background
    const percentage = (value - priceRange.min) / (priceRange.max - priceRange.min) * 100;
    priceRange.style.setProperty('--value', `${percentage}%`);
}

// Filter products
function filterProducts() {
    if (!priceRange) return;

    const maxPrice = parseInt(priceRange.value);
    const filters = {
        pokemon: filterCheckboxes.pokemon?.checked,
        figure: filterCheckboxes.figure?.checked,
        men: filterCheckboxes.menType?.checked,
        women: filterCheckboxes.womenType?.checked
    };

    let visibleProducts = 0;
    
    // Use requestAnimationFrame to optimize performance
    requestAnimationFrame(() => {
        productCards.forEach(card => {
            const price = parseInt(card.querySelector('.product-price').textContent.replace('$', ''));
            const badge = card.querySelector('.product-badge').textContent;
            const cardContainer = card.closest('.col-12');

            const isVisible = checkVisibility(price, maxPrice, badge, filters);
            
            if (isVisible) {
                cardContainer.style.display = 'block';
                card.classList.remove('filtered-out');
                visibleProducts++;
            } else {
                card.classList.add('filtered-out');
                cardContainer.style.display = 'none';
            }
        });

        updateEmptyState(visibleProducts);
    });
}

// Check product visibility based on filters
function checkVisibility(price, maxPrice, badge, filters) {
    // Price check
    if (price > maxPrice) return false;

    // Category check (for toys)
    if (filters.pokemon || filters.figure) {
        if (!((filters.pokemon && badge === 'POKEMON') || 
              (filters.figure && badge === 'FIGURE'))) {
            return false;
        }
    }

    // Gender check (for clothes)
    if (filters.men || filters.women) {
        const isUnisex = badge === 'Unisex';
        const isMen = badge === 'Men';
        const isWomen = badge === 'Women';

        if (!((filters.men && (isMen || isUnisex)) || 
              (filters.women && (isWomen || isUnisex)))) {
            return false;
        }
    }

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

// Initialize on page load
window.addEventListener('load', () => {
    initializeSlider();
    addTouchFeedback();
    
    // Add event listeners for checkboxes with shorter debounce
    Object.values(filterCheckboxes).forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                filterProducts(); // Remove debounce for immediate response
            });
        }
    });
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

// Quick View functionality
function showQuickView(product) {
    // Update modal content
    const modal = document.getElementById('quickViewModal');
    const modalTitle = modal.querySelector('.modal-title');
    const productTitle = modal.querySelector('.product-title');
    const productPrice = modal.querySelector('.product-price');
    const productCategory = modal.querySelector('.category-value');
    const productDescription = modal.querySelector('.product-description p');
    const descriptionContainer = modal.querySelector('.product-description');
    const sizeSelect = modal.querySelector('#modalSizeSelect');
    
    // Clear previous size options
    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    
    // Add size options based on product category
    let sizes = [];
    if (product.category === 'Women' || product.category === 'Men') {
        sizes = ['XS', 'S', 'M', 'L', 'XL'];
    } else if (product.category === 'Unisex') {
        sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    }
    
    sizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        sizeSelect.appendChild(option);
    });
    
    // Show/hide size selector based on product type
    const sizeSelector = modal.querySelector('.size-selector');
    if (product.category === 'Women' || product.category === 'Men' || product.category === 'Unisex') {
        sizeSelector.style.display = 'block';
    } else {
        sizeSelector.style.display = 'none';
    }

    modalTitle.textContent = product.name;
    productTitle.textContent = product.name;
    productPrice.textContent = `$${parseFloat(product.price).toFixed(2)}`;
    productCategory.textContent = product.category || 'N/A';

    // Update description if available
    if (product.description) {
        productDescription.textContent = product.description;
        descriptionContainer.style.display = 'block';
    } else {
        descriptionContainer.style.display = 'none';
    }

    // Update main image with loading state
    const mainImageContainer = modal.querySelector('.quick-view-image');
    const mainImage = mainImageContainer.querySelector('img');
    const loadingSpinner = mainImageContainer.querySelector('.loading-spinner');
    
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

    // Create thumbnails
    const thumbnailList = modal.querySelector('.thumbnail-list');
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

    // Store the current product for the add to cart functionality
    modal.dataset.currentProduct = JSON.stringify(product);

    // Show modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

function updateMainImage(src) {
    const mainImageContainer = document.querySelector('.quick-view-image');
    const mainImage = mainImageContainer.querySelector('img');
    const loadingSpinner = mainImageContainer.querySelector('.loading-spinner');
    
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
            const productData = JSON.parse(this.getAttribute('onclick').split('(')[1].split(')')[0]);
            showQuickView(productData);
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
