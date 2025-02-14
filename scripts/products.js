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
    
    // Sử dụng requestAnimationFrame thay vì setTimeout
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
    
    // Sử dụng requestAnimationFrame để tối ưu hiệu năng
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
    
    // Thêm event listeners cho checkboxes với debounce ngắn hơn
    Object.values(filterCheckboxes).forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                filterProducts(); // Bỏ debounce để phản hồi ngay lập tức
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
    
    // Update category - check if category exists first
    const categoryValue = modal.querySelector('.category-value');
    if (categoryValue) {
        if (product.category) {
            categoryValue.textContent = product.category;
        } else {
            // Fallback nếu không có category
            categoryValue.textContent = 'Unknown';
        }
    }
    
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
