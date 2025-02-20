// Check if CartManager already exists
if (typeof window.CartManager === 'undefined') {
    class CartManager {
        constructor() {
            this.items = [];
            this.loadCart(); // Initial load
            this.updateTimeout = null;
        }

        // Debounced function to trigger cart update event
        triggerCartUpdate() {
            if (this.updateTimeout) {
                clearTimeout(this.updateTimeout);
            }
            this.updateTimeout = setTimeout(() => {
                const event = new CustomEvent('cartUpdated');
                window.dispatchEvent(event);
                this.updateTimeout = null;
            }, 300); // Increased debounce timeout
        }

        // Load cart from API
        async loadCart() {
            try {
                const response = await fetch('/api/cart.php');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {
                    // Ensure all items have proper data types
                    this.items = data.data.map(item => ({
                        ...item,
                        price: parseFloat(item.price) || 0,
                        quantity: parseInt(item.quantity) || 1,
                        id: parseInt(item.id)
                    }));
                    this.updateCartCount();
                    // Trigger cart updated event
                    this.triggerCartUpdate();
                } else {
                    throw new Error(data.error || 'Failed to load cart');
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                this.items = [];
                this.updateCartCount();
                // Trigger cart updated event even on error
                this.triggerCartUpdate();
            }
        }

        // Add item to cart
        async addToCart(productId, quantity = 1, size = null) {
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

                await this.loadCart(); // Reload cart after successful addition
                this.showNotification(data.message || 'Item added to cart successfully');
                return true;
            } catch (error) {
                console.error('Error adding to cart:', error);
                throw error;
            }
        }

        // Remove item from cart
        async removeItem(productId, size = null) {
            try {
                const response = await fetch('/api/cart.php', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ product_id: productId, size })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.error || 'Failed to remove item from cart');
                }

                // Update local items array
                this.items = this.items.filter(item => 
                    !(item.product_id === productId && item.size === size)
                );
                
                // Update UI without reloading cart
                this.updateCartCount();
                this.triggerCartUpdate();
                
                return true;
            } catch (error) {
                console.error('Error removing from cart:', error);
                throw error;
            }
        }

        // Update item quantity
        async updateQuantity(productId, quantity, size = null) {
            try {
                const response = await fetch('/api/cart.php', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ product_id: productId, quantity, size })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.error || 'Failed to update cart item quantity');
                }

                // Update local items array
                this.items = this.items.map(item => {
                    if (item.id === productId && item.size === size) {
                        return { ...item, quantity };
                    }
                    return item;
                });
                
                // Update UI without reloading cart
                this.updateCartCount();
                this.triggerCartUpdate();
                
                return true;
            } catch (error) {
                console.error('Error updating cart:', error);
                throw error;
            }
        }

        // Get total items in cart
        getTotalItems() {
            return this.items.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
        }

        // Get total price of cart
        getTotal() {
            return this.items.reduce((total, item) => {
                const price = parseFloat(item.price) || 0;
                const quantity = parseInt(item.quantity) || 1;
                return total + (price * quantity);
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
        showNotification(message) {
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
                        <p class="title">Success!</p>
                        <p class="message">${message}</p>
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
        async getItems() {
            await this.loadCart(); // Ensure cart is up to date
            return [...this.items];
        }

        // Clear cart
        async clearCart() {
            this.items = [];
            await this.loadCart();
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
    }

    // Initialize cart manager only if it doesn't exist
    if (typeof window.cartManager === 'undefined') {
        window.cartManager = new CartManager();
    }

    // Initialize cart count on page load
    document.addEventListener('DOMContentLoaded', async () => {
        await window.cartManager.loadCart();
    });
} 