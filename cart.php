<?php
$title = "Shopping Cart - Pokemon Store";
$md = "View and manage your shopping cart";
include 'includes/header.php';
?>

<!-- Add SweetAlert2 -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<main class="container py-5">
    <h1 class="text-center mb-4">Shopping Cart</h1>
    
    <div class="row">
        <div class="col-lg-8">
            <!-- Cart Items -->
            <div class="cart-items mb-4">
                <!-- Items will be dynamically loaded here -->
            </div>

            <!-- Empty Cart Message -->
            <div class="empty-cart text-center d-none">
                <img src="images/empty-cart.png" alt="Empty Cart" class="empty-cart-image mb-3">
                <h3>Your cart is empty</h3>
                <p class="text-muted">Looks like you haven't added any items to your cart yet.</p>
                <a href="index.php" class="btn btn-primary">Continue Shopping</a>
            </div>
        </div>

        <div class="col-lg-4">
            <!-- Cart Summary -->
            <div class="cart-summary card">
                <div class="card-body">
                    <h3 class="card-title mb-4">Order Summary</h3>
                    
                    <div class="summary-item d-flex justify-content-between mb-3">
                        <span>Subtotal</span>
                        <span class="cart-subtotal">$0.00</span>
                    </div>
                    
                    <div class="summary-item d-flex justify-content-between mb-3">
                        <span>Shipping</span>
                        <span class="shipping-cost">$5.00</span>
                    </div>
                    
                    <hr>
                    
                    <div class="summary-item d-flex justify-content-between mb-4">
                        <strong>Total</strong>
                        <strong class="cart-total">$0.00</strong>
                    </div>
                    
                    <button class="btn btn-primary w-100 checkout-btn" disabled>
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    </div>
</main>

<template id="cart-item-template">
    <div class="cart-item card mb-3">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-md-2">
                    <img src="" alt="" class="item-image img-fluid rounded">
                </div>
                <div class="col-md-4">
                    <h5 class="item-name mb-2"></h5>
                    <p class="item-price text-primary mb-0"></p>
                    <p class="item-size text-muted mb-0 d-none"></p>
                </div>
                <div class="col-md-4">
                    <div class="quantity-control d-flex align-items-center">
                        <button class="btn btn-outline-secondary quantity-btn minus">-</button>
                        <input type="number" class="form-control quantity-input mx-2" value="1" min="1" max="99">
                        <button class="btn btn-outline-secondary quantity-btn plus">+</button>
                    </div>
                </div>
                <div class="col-md-2 text-end">
                    <button class="btn btn-link text-danger remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<?php include 'includes/footer.php'; ?>

<script src="js/cart-manager.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Get cart items container and template
    const cartItemsContainer = document.querySelector('.cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart');
    const template = document.querySelector('#cart-item-template');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // Update cart display
    function updateCartDisplay() {
        const cartItems = cartManager.getItems();
        cartItemsContainer.innerHTML = '';
        
        if (cartItems.length === 0) {
            emptyCartMessage.classList.remove('d-none');
            cartItemsContainer.classList.add('d-none');
            checkoutBtn.disabled = true;
            updateSummary(); // Make sure to update summary when cart is empty
            return;
        }
        
        emptyCartMessage.classList.add('d-none');
        cartItemsContainer.classList.remove('d-none');
        checkoutBtn.disabled = false;
        
        cartItems.forEach(item => {
            const cartItem = template.content.cloneNode(true);
            
            // Set item details
            cartItem.querySelector('.item-image').src = item.image;
            cartItem.querySelector('.item-image').alt = item.name;
            cartItem.querySelector('.item-name').textContent = item.name;
            cartItem.querySelector('.item-price').textContent = `$${item.price.toFixed(2)}`;
            
            // Show size if available
            const sizeElement = cartItem.querySelector('.item-size');
            if (item.size) {
                sizeElement.textContent = `Size: ${item.size}`;
                sizeElement.classList.remove('d-none');
            }
            
            const quantityInput = cartItem.querySelector('.quantity-input');
            quantityInput.value = item.quantity || 1;
            
            // Add event listeners
            const minusBtn = cartItem.querySelector('.minus');
            const plusBtn = cartItem.querySelector('.plus');
            const removeBtn = cartItem.querySelector('.remove-item');
            
            quantityInput.addEventListener('change', () => {
                const newQuantity = parseInt(quantityInput.value);
                if (newQuantity > 0) {
                    cartManager.updateQuantity(item.id, newQuantity, item.size);
                }
            });
            
            minusBtn.addEventListener('click', () => {
                const currentQty = parseInt(quantityInput.value);
                if (currentQty > 1) {
                    cartManager.updateQuantity(item.id, currentQty - 1, item.size);
                }
            });
            
            plusBtn.addEventListener('click', () => {
                const currentQty = parseInt(quantityInput.value);
                cartManager.updateQuantity(item.id, currentQty + 1, item.size);
            });
            
            removeBtn.addEventListener('click', () => {
                cartManager.removeItem(item.id, item.size);
            });
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        updateSummary();
    }
    
    // Update order summary
    function updateSummary() {
        const subtotal = cartManager.getTotal() || 0;
        const shipping = subtotal > 0 ? 5.00 : 0;
        const total = subtotal + shipping;
        
        document.querySelector('.cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.shipping-cost').textContent = `$${shipping.toFixed(2)}`;
        document.querySelector('.cart-total').textContent = `$${total.toFixed(2)}`;

        // Update checkout button state only
        checkoutBtn.disabled = subtotal <= 0;
    }
    
    // Initialize cart display
    updateCartDisplay();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', () => {
        updateCartDisplay();
    });
    
    // Handle checkout
    checkoutBtn.addEventListener('click', () => {
        // Check if user is logged in
        const isLoggedIn = <?php echo isset($_SESSION['user_id']) ? 'true' : 'false'; ?>;
        
        if (!isLoggedIn) {
            // Show login required message
            Swal.fire({
                title: 'Login Required',
                text: 'Please login to proceed with checkout',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Login',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#8860d0'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'signin.php';
                }
            });
            return;
        }
        
        // If logged in, proceed with checkout
        // TODO: Implement checkout process
        alert('Checkout process will be implemented soon!');
    });
});
</script>