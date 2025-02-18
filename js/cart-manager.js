class CartManager {
    constructor() {
        this.items = [];
        this.loadCart();
        
        // Add event listener for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                this.loadCart();
                this.updateCartCount();
                this.dispatchCartUpdateEvent();
            }
        });
    }

    // Load cart from localStorage
    loadCart() {
        try {
            const cart = localStorage.getItem('cart');
            this.items = cart ? JSON.parse(cart) : [];
            this.updateCartCount();
        } catch (error) {
            console.error('Error loading cart:', error);
            this.items = [];
            this.updateCartCount();
        }
    }

    // Save cart to localStorage
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
            this.updateCartCount();
            this.dispatchCartUpdateEvent();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    // Dispatch custom event for cart updates
    dispatchCartUpdateEvent() {
        const event = new CustomEvent('cartUpdated', {
            detail: {
                items: this.getItems(),
                total: this.getTotal(),
                count: this.getTotalItems()
            }
        });
        window.dispatchEvent(event);
    }

    // Add item to cart
    addItem(product) {
        if (!product || !product.id) {
            console.error('Invalid product:', product);
            return;
        }

        // Check if item already exists with same id and size
        const existingItem = this.items.find(item => 
            item.id === product.id && 
            item.size === product.size
        );
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.showNotification(product.name);
    }

    // Remove item from cart
    removeItem(productId, size = null) {
        this.items = this.items.filter(item => {
            if (size) {
                return !(item.id === productId && item.size === size);
            }
            return item.id !== productId;
        });
        this.saveCart();
    }

    // Update item quantity
    updateQuantity(productId, quantity, size = null) {
        const item = this.items.find(item => {
            if (size) {
                return item.id === productId && item.size === size;
            }
            return item.id === productId;
        });

        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(productId, size);
            } else {
                this.saveCart();
            }
        }
    }

    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => {
            const quantity = Math.max(1, parseInt(item.quantity) || 1); // Ensure minimum quantity is 1
            const price = parseFloat(item.price) || 0; // Default to 0 if price is invalid
            return total + (price * quantity);
        }, 0);
    }

    // Get total items count
    getTotalItems() {
        return this.items.reduce((total, item) => {
            return total + (parseInt(item.quantity) || 1);
        }, 0);
    }

    // Update cart count in header
    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.getTotalItems();
            cartCount.textContent = totalItems;
            
            // Show/hide cart count
            if (totalItems > 0) {
                cartCount.style.display = 'flex';
                cartCount.classList.add('pulse');
                setTimeout(() => cartCount.classList.remove('pulse'), 300);
            } else {
                cartCount.style.display = 'none';
            }
        }
    }

    // Show notification when item is added
    showNotification(productName) {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <div class="notification-text">
                    <p class="title">Added to Cart!</p>
                    <p class="message">${productName} has been added to your cart</p>
                </div>
            </div>
            <a href="cart.php" class="view-cart-btn">View Cart</a>
        `;

        document.body.appendChild(notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Get cart items
    getItems() {
        return [...this.items];
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.saveCart();
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Listen for cart updates
window.addEventListener('cartUpdated', (e) => {
    console.log('Cart updated:', e.detail);
});

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    cartManager.loadCart();
}); 