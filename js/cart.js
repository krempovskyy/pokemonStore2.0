// Cart functionality
let currentProduct = null;
let isMobile = window.innerWidth <= 1024;

class CartHandler {
    constructor() {
        this.setupEventListeners();
        this.handleResize();
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));

        // Handle product card clicks (quick view and add to cart)
        document.addEventListener('click', (event) => {
            // Check for add to cart button first
            const addToCartBtn = event.target.closest('.add-to-cart-btn');
            if (addToCartBtn && !event.target.closest('#quickViewModal')) {
                const productCard = addToCartBtn.closest('.product-card');
                if (productCard) {
                    event.preventDefault();
                    event.stopPropagation();
                    try {
                        const product = JSON.parse(productCard.getAttribute('data-product'));
                        this.addToCartFromCard(addToCartBtn, product);
                    } catch (error) {
                        console.error('Error parsing product data:', error);
                    }
                }
                return;
            }

            // Handle quick view differently for mobile and desktop
            if (isMobile) {
                const imgContainer = event.target.closest('.img-container');
                if (imgContainer) {
                    const productCard = imgContainer.closest('.product-card');
                    if (productCard) {
                        event.preventDefault();
                        const quickView = productCard.querySelector('.quick-view');
                        if (quickView) {
                            quickView.classList.add('active');
                            setTimeout(() => {
                                try {
                                    const product = JSON.parse(productCard.getAttribute('data-product'));
                                    this.showQuickView(product);
                                    quickView.classList.remove('active');
                                } catch (error) {
                                    console.error('Error parsing product data:', error);
                                }
                            }, 200);
                        }
                    }
                }
            } else {
                // Desktop quick view behavior
                const quickViewArea = event.target.closest('.quick-view');
                if (quickViewArea) {
                    const productCard = quickViewArea.closest('.product-card');
                    if (productCard) {
                        event.preventDefault();
                        try {
                            const product = JSON.parse(productCard.getAttribute('data-product'));
                            this.showQuickView(product);
                        } catch (error) {
                            console.error('Error parsing product data:', error);
                        }
                    }
                }
            }
        });

        // Handle modal add to cart button
        document.addEventListener('click', (event) => {
            const addToCartBtn = event.target.closest('#quickViewModal .add-to-cart-btn');
            if (addToCartBtn) {
                event.preventDefault();
                this.addToCartFromModal(addToCartBtn);
            }
        });

        // Handle modal events
        const modal = document.getElementById('quickViewModal');
        if (modal) {
            modal.addEventListener('hidden.bs.modal', () => {
                currentProduct = null;
                // Remove active class from all quick views when modal is closed
                document.querySelectorAll('.quick-view').forEach(qv => qv.classList.remove('active'));
            });

            modal.addEventListener('shown.bs.modal', () => {
                const sizeSelector = modal.querySelector('#modalSizeSelect');
                if (sizeSelector) {
                    sizeSelector.value = '';
                }
            });
        }
    }

    handleResize() {
        isMobile = window.innerWidth <= 1024;
    }

    showQuickView(product) {
        if (!product) {
            console.error('No product data provided');
            return;
        }

        currentProduct = product;
        const modal = document.getElementById('quickViewModal');
        
        // Check if modal is already open
        let modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
            modalInstance.dispose();
        }
        
        // Update modal content
        modal.querySelector('.modal-title').textContent = product.name;
        modal.querySelector('.quick-view-info .product-title').textContent = product.name;
        modal.querySelector('.quick-view-info .product-price').textContent = `$${product.price.toFixed(2)}`;
        modal.querySelector('.category-value').textContent = product.category;
        
        // Update description if available
        const descriptionContainer = modal.querySelector('.product-description');
        const descriptionText = modal.querySelector('.product-description p');
        if (product.description) {
            descriptionText.textContent = product.description;
            descriptionContainer.style.display = 'block';
        } else {
            descriptionContainer.style.display = 'none';
        }
        
        // Update size selector
        const sizeSelector = modal.querySelector('#modalSizeSelect');
        const sizeSelectorContainer = modal.querySelector('.size-selector');
        
        // Reset size error message
        const sizeError = modal.querySelector('.size-error');
        if (sizeError) {
            sizeError.classList.add('d-none');
        }
        
        // Handle size selector visibility and options
        if (product.category === 'Women' || product.category === 'Men' || product.category === 'Unisex') {
            // For clothing products
            if (sizeSelectorContainer) {
                sizeSelector.innerHTML = '<option value="">Select Size</option>';
                const sizes = product.sizes || this.getDefaultSizes(product.category);
                sizes.forEach(size => {
                    const option = document.createElement('option');
                    option.value = size;
                    option.textContent = size;
                    sizeSelector.appendChild(option);
                });
                sizeSelectorContainer.style.display = 'block';
                sizeSelector.value = ''; // Reset size selection
            }
        } else {
            // For non-clothing products
            if (sizeSelectorContainer) {
                sizeSelectorContainer.style.display = 'none';
            }
        }
        
        // Setup gallery
        this.setupGallery(product, modal);
        
        // Show modal
        modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }

    setupGallery(product, modal) {
        const imageContainer = modal.querySelector('.quick-view-image');
        const thumbnailList = modal.querySelector('.thumbnail-list');
        
        // Clear existing thumbnails
        thumbnailList.innerHTML = '';
        
        // Create main image with onload handler
        const mainImage = new Image();
        mainImage.onload = function() {
            imageContainer.innerHTML = `
                <img src="${this.src}" 
                     alt="${product.name}" 
                     style="opacity: 1; width: 100%; height: 100%; object-fit: contain;">
            `;
        };
        mainImage.src = product.image;
        
        // Show loading spinner while image loads
        imageContainer.innerHTML = `
            <div class="loading-spinner"></div>
            <img src="${mainImage.src}" 
                 alt="${product.name}" 
                 style="opacity: 0">
        `;

        // Create thumbnails if gallery exists
        if (product.gallery && product.gallery.length > 0) {
            product.gallery.forEach((img, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = `thumbnail-item ${index === 0 ? 'active' : ''}`;
                thumbnail.innerHTML = `<img src="${img}" alt="Product view ${index + 1}">`;
                
                thumbnail.addEventListener('click', () => {
                    this.updateMainImage(img);
                    this.updateActiveThumbnail(thumbnail);
                });
                
                thumbnailList.appendChild(thumbnail);
            });
            thumbnailList.style.display = 'flex';
        } else {
            thumbnailList.style.display = 'none';
        }
    }

    getDefaultSizes(category) {
        switch(category) {
            case 'Women':
            case 'Men':
                return ['XS', 'S', 'M', 'L', 'XL'];
            case 'Unisex':
                return ['S', 'M', 'L', 'XL', 'XXL'];
            default:
                return [];
        }
    }

    updateMainImage(src) {
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

    updateActiveThumbnail(clickedThumbnail) {
        document.querySelectorAll('.thumbnail-item').forEach(item => {
            item.classList.remove('active');
        });
        clickedThumbnail.classList.add('active');
    }

    addToCartFromModal(button) {
        const modal = document.getElementById('quickViewModal');
        const product = currentProduct;
        
        if (!product) {
            console.error('No product selected');
            return;
        }
        
        // Get the size selector
        const sizeSelector = document.getElementById('modalSizeSelect');
        const sizeError = modal.querySelector('.size-error');
        
        // Check if size is required (for clothing products)
        const needsSize = product.category === 'Women' || 
                         product.category === 'Men' || 
                         product.category === 'Unisex';
        
        if (needsSize && sizeSelector && !sizeSelector.value) {
            if (sizeError) {
                sizeError.textContent = 'Please select a size';
                sizeError.classList.remove('d-none');
            }
            return;
        }
        
        // Hide error message if it was shown
        if (sizeError) {
            sizeError.classList.add('d-none');
        }
        
        // Show loading state
        const btnText = button.querySelector('.btn-text');
        const loadingSpinner = button.querySelector('.loading-spinner');
        if (btnText && loadingSpinner) {
            btnText.style.display = 'none';
            loadingSpinner.classList.remove('d-none');
        }

        // Create cart item object
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            size: needsSize && sizeSelector ? sizeSelector.value : null
        };

        // Add to cart
        cartManager.addItem(cartItem);

        // Reset button state after a short delay
        setTimeout(() => {
            if (btnText && loadingSpinner) {
                btnText.style.display = 'block';
                loadingSpinner.classList.add('d-none');
            }

            // Close modal
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        }, 500);
    }

    addToCartFromCard(button, product) {
        // For clothing products, open modal to select size
        if (product.category === 'Women' || 
            product.category === 'Men' || 
            product.category === 'Unisex') {
            this.showQuickView(product);
            return;
        }
        
        // For non-clothing products, add directly to cart
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            size: null
        };
        
        // Show loading state
        const btnText = button.querySelector('.btn-text');
        const loadingSpinner = button.querySelector('.loading-spinner');
        if (btnText && loadingSpinner) {
            btnText.style.display = 'none';
            loadingSpinner.classList.remove('d-none');
        }
        
        // Add to cart
        cartManager.addItem(cartItem);
        
        // Reset button state after a short delay
        setTimeout(() => {
            if (btnText && loadingSpinner) {
                btnText.style.display = 'block';
                loadingSpinner.classList.add('d-none');
            }
        }, 500);
    }
}

// Initialize cart handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cartHandler = new CartHandler();
    cartManager.loadCart();
}); 