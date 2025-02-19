// Global state
let currentPage = 1;
let currentLimit = 10;
let currentSearch = '';
let currentCategory = '';
let currentStock = '';
let currentSort = 'newest';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded');

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize all event listeners
    initializeEventListeners();
    
    // Initial load
    await loadProducts();
});

// Initialize event listeners for dynamic elements
function initializeEventListeners() {
    console.log('Initializing event listeners');

    // Category change handler
    document.getElementById('productCategory').addEventListener('change', function() {
        const category = this.value;
        const stockInput = document.getElementById('stockInputContainer');
        const sizeSection = document.getElementById('sizeManagementSection');
        
        // Reset all sections
        stockInput.style.display = 'none';
        sizeSection.style.display = 'none';
        
        if (category.includes('clothing')) {
            // For clothing items, show size management
            sizeSection.style.display = 'block';
            // Reset all size quantities
            const sizeInputs = document.querySelectorAll('.size-quantity');
            sizeInputs.forEach(input => input.value = 0);
        } else {
            // For non-clothing items (including accessories), show stock input
            stockInput.style.display = 'block';
            document.querySelector('[name="stock"]').value = 0;
        }
    });

    // Size quantity change handler to update total stock
    const sizeQuantityInputs = document.querySelectorAll('.size-quantity');
    if (sizeQuantityInputs.length) {
        sizeQuantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                if (document.getElementById('productCategory').value.includes('clothing')) {
                    const total = Array.from(sizeQuantityInputs)
                        .reduce((sum, input) => sum + (parseInt(input.value) || 0), 0);
                    document.querySelector('input[name="stock"]').value = total;
                }
            });
        });
    }

    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(async function(e) {
            currentSearch = e.target.value;
            currentPage = 1; // Reset to first page on search
            await loadProducts();
        }, 300));
    }

    // Filter change handlers
    const filters = document.querySelectorAll('.form-select');
    filters.forEach(filter => {
        filter.addEventListener('change', async function() {
            console.log('Filter changed:', this.id, 'Value:', this.value);
            const filterType = this.getAttribute('data-filter-type');
            
            switch(filterType) {
                case 'category':
                    currentCategory = this.value;
                    console.log('Category filter updated to:', currentCategory);
                    break;
                case 'stock':
                    currentStock = this.value;
                    console.log('Stock filter updated to:', currentStock);
                    break;
                case 'sort':
                    currentSort = this.value;
                    console.log('Sort filter updated to:', currentSort);
                    break;
            }
            
            currentPage = 1; // Reset to first page on filter change
            await loadProducts();
        });
    });

    // Add Product Form Handler
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleProductSubmit(this);
        });
    }

        // Delete product handler
    document.addEventListener('click', async function(e) {
            if (e.target.closest('.btn-danger')) {
                e.preventDefault();
                const productId = parseInt(e.target.closest('tr').dataset.productId);
                if (confirm('Are you sure you want to delete this product?')) {
                await deleteProduct(productId);
                }
            }
        });

        // Edit product handler
    document.addEventListener('click', async function(e) {
            if (e.target.closest('.btn-info')) {
                e.preventDefault();
                const productId = parseInt(e.target.closest('tr').dataset.productId);
            await editProduct(productId);
            }
        });

        // Add Product button handler
        const addProductBtn = document.querySelector('[data-bs-toggle="modal"][data-bs-target="#addProductModal"]');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', function() {
                const form = document.getElementById('addProductForm');
                form.reset();
                document.querySelector('#addProductModal .modal-title').textContent = 'Add New Product';
                document.querySelector('#addProductModal .btn-primary').textContent = 'Add Product';
            });
        }

    // Pagination handler - Using event delegation
    document.addEventListener('click', async function(e) {
        const pageLink = e.target.closest('.page-link');
        if (pageLink) {
            e.preventDefault();
            console.log('Pagination element clicked:', e.target);
            console.log('Page link element:', pageLink);
            
            if (!pageLink.parentElement.classList.contains('disabled')) {
                const page = pageLink.dataset.page;
                console.log('Page data:', page);
                
                if (page) {
                    currentPage = parseInt(page);
                    console.log('Loading page:', currentPage);
                    await loadProducts();
                }
            } else {
                console.log('Pagination link is disabled');
            }
        }
    });
}

// Load products from API
async function loadProducts() {
    try {
        console.log('Loading products with filters:', {
            page: currentPage,
            limit: currentLimit,
            search: currentSearch,
            category: currentCategory,
            stock: currentStock,
            sort: currentSort
        });

        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: currentLimit,
            search: currentSearch,
            category: currentCategory,
            stock: currentStock,
            sort: currentSort
        });

        const response = await fetch(`/admin/api/products.php?${queryParams}`);
        
        if (!response.ok) {
            console.error('API response not ok:', response.status, response.statusText);
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success) {
            if (!result.data || !result.data.products) {
                console.error('Invalid API response structure:', result);
                throw new Error('Invalid API response structure');
            }

            // Process products and ensure sizes are properly handled
            const processedProducts = result.data.products.map(product => {
                if (product.category.includes('clothing')) {
                    try {
                        if (typeof product.sizes === 'string') {
                            product.sizes = JSON.parse(product.sizes);
                        } else if (!product.sizes) {
                            product.sizes = {};
                        }
                    } catch (e) {
                        console.error(`Error parsing sizes for product ${product.id}:`, e);
                        product.sizes = {};
                    }
                }
                return product;
            });
            
            renderProducts(processedProducts);
            updatePagination(result.data.pagination);
        } else {
            console.error('API returned error:', result.error);
            showNotification('Error', result.error || 'Failed to load products', 'error');
        }
    } catch (error) {
        console.error('Error in loadProducts:', error);
        showNotification('Error', 'Failed to load products. Please try again.', 'error');
        }
    }
    
    // Render products table
function renderProducts(products) {
    console.log('Starting to render products:', products);
        const tbody = document.querySelector('.products-table tbody');
        if (!tbody) {
        console.error('Products table tbody not found');
            return;
        }
        tbody.innerHTML = '';
        
    products.forEach(product => {
        console.log(`Rendering product ${product.id}:`, {
            name: product.name,
            category: product.category,
            sizes: product.sizes
        });

        let sizeDisplay = '';
        let stockQuantity = 0;
        
        if (product.category.includes('clothing')) {
            console.log(`Processing sizes for clothing product ${product.id}:`, product.sizes);
            try {
                const sizes = product.sizes;
                if (sizes) {
                    if (sizes.ONE_SIZE) {
                        sizeDisplay = `ONE SIZE: ${sizes.ONE_SIZE.quantity}`;
                        stockQuantity = sizes.ONE_SIZE.quantity;
                    } else {
                        const sizeEntries = Object.entries(sizes);
                        if (sizeEntries.length > 0) {
                            sizeDisplay = sizeEntries
                                .map(([size, data]) => `${size}: ${data.quantity}`)
                                .join('<br>');
                            stockQuantity = sizeEntries.reduce((total, [_, data]) => total + data.quantity, 0);
                        }
                    }
                }
                console.log(`Generated size display for product ${product.id}:`, sizeDisplay);
            } catch (e) {
                console.error(`Error processing sizes for product ${product.id}:`, e);
                sizeDisplay = 'Error loading sizes';
            }
        } else {
            stockQuantity = product.stock_quantity;
            sizeDisplay = product.stock_quantity;
        }

        const row = `
            <tr data-product-id="${product.id}">
                <td><img src="${product.image}" alt="${product.name}" class="product-thumbnail"></td>
                <td>${product.name}</td>
                <td>${formatCategory(product.category)}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>${sizeDisplay}</td>
                <td>
                    <span class="status-badge ${getStockStatus(stockQuantity)}">
                        ${determineStockStatus(stockQuantity)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        tbody.insertAdjacentHTML('beforeend', row);
        });

        // Reinitialize tooltips
        const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltips.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

// Update pagination controls
function updatePagination({ currentPage, totalPages, totalItems, limit }) {
    console.log('Updating pagination with:', { currentPage, totalPages, totalItems, limit });
    const paginationContainer = document.querySelector('.pagination-section nav');
    if (!paginationContainer) {
        console.error('Pagination container not found');
                return;
            }

    const pagination = document.createElement('ul');
    pagination.className = 'pagination';

    // Previous button
    const prevPage = Math.max(1, currentPage - 1);
    pagination.innerHTML = `
        <li class="page-item ${currentPage <= 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${prevPage}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === parseInt(currentPage) ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    // Next button
    const nextPage = Math.min(totalPages, currentPage + 1);
    pagination.innerHTML += `
        <li class="page-item ${currentPage >= totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${nextPage}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;

    console.log('Generated pagination HTML:', pagination.innerHTML);
    paginationContainer.innerHTML = '';
    paginationContainer.appendChild(pagination);
}

// Helper functions
function formatCategory(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function getStockStatus(quantity) {
    if (quantity <= 0) return 'cancelled';
    if (quantity <= 10) return 'pending';
    return 'delivered';
}

// Validation constants
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MIN_IMAGE_DIMENSIONS = { width: 200, height: 200 };
const MAX_IMAGE_DIMENSIONS = { width: 2000, height: 2000 };

function validateProductData(data, form) {
    const errors = [];
    
    // Name validation
    if (!data.name || data.name.length < 3) {
        errors.push('Product name must be at least 3 characters long');
    }
    
    // Category validation
    const validCategories = ['plush', 'cards', 'accessories', 'clothing-men', 'clothing-women', 'clothing-unisex'];
    if (!validCategories.includes(data.category)) {
        errors.push('Please select a valid category');
    }
    
    // Price validation
    if (isNaN(data.price) || data.price <= 0) {
        errors.push('Price must be a positive number');
    }
    
    // Stock validation
    if (isNaN(data.stock) || data.stock < 0) {
        errors.push('Stock must be a non-negative number');
    }
    
    // Description validation
    if (!data.description || data.description.length < 10) {
        errors.push('Description must be at least 10 characters long');
    }
    
    // Image validation
    const imageInput = form.querySelector('input[type="file"]');
    const isNewProduct = !form.dataset.editId;

    if (isNewProduct && (!imageInput || !imageInput.files.length)) {
        errors.push('Please select a product image');
        return errors;
    }

    if (imageInput && imageInput.files.length > 0) {
        const file = imageInput.files[0];
        
        // Check file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            errors.push('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)');
        }
        
        // Check file size
        if (file.size > MAX_IMAGE_SIZE) {
            errors.push('Image size must not exceed 5MB');
        }
        
        // Create a promise to check image dimensions
        const dimensionPromise = new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                if (this.width < MIN_IMAGE_DIMENSIONS.width || this.height < MIN_IMAGE_DIMENSIONS.height) {
                    errors.push(`Image dimensions must be at least ${MIN_IMAGE_DIMENSIONS.width}x${MIN_IMAGE_DIMENSIONS.height} pixels`);
                }
                if (this.width > MAX_IMAGE_DIMENSIONS.width || this.height > MAX_IMAGE_DIMENSIONS.height) {
                    errors.push(`Image dimensions must not exceed ${MAX_IMAGE_DIMENSIONS.width}x${MAX_IMAGE_DIMENSIONS.height} pixels`);
                }
                resolve();
            };
            img.onerror = function() {
                errors.push('Failed to load image for validation');
                resolve();
            };
            img.src = URL.createObjectURL(file);
        });

        // Return promise for async validation
        return dimensionPromise.then(() => {
            URL.revokeObjectURL(img.src);
            return errors;
        });
    }
    
    return Promise.resolve(errors);
}

function determineStockStatus(stockQuantity) {
    if (stockQuantity <= 0) return 'Out of Stock';
    if (stockQuantity <= 10) return 'Low Stock';
    return 'In Stock';
}

function showNotification(title, messages = [], type = 'success') {
    // Remove existing notifications first
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Base styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 300px;
        max-width: 500px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#cce5ff'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#004085'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#b8daff'};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 15px 20px;
        z-index: 9999;
        opacity: 0;
        transform: translateX(50px);
        transition: all 0.3s ease-in-out;
    `;

    // Get icon based on type
    const getIcon = () => {
        switch(type) {
            case 'success':
                return '<i class="fas fa-check-circle" style="color: #155724"></i>';
            case 'error':
                return '<i class="fas fa-exclamation-circle" style="color: #721c24"></i>';
            default:
                return '<i class="fas fa-info-circle" style="color: #004085"></i>';
        }
    };

    // Create notification content
    const content = Array.isArray(messages) ? messages : [messages];
    
    notification.innerHTML = `
        <div style="display: flex; align-items: start;">
            <div style="margin-right: 12px; font-size: 20px;">
                ${getIcon()}
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 16px; margin-bottom: ${content.length > 1 ? '8px' : '0'};">
                    ${title}
                </div>
                ${content.length > 1 ? `
                    <ul style="margin: 0; padding-left: 18px; font-size: 14px;">
                        ${content.map(msg => `<li style="margin-bottom: 4px;">${msg}</li>`).join('')}
                    </ul>
                ` : `
                    <div style="font-size: 14px;">${content[0]}</div>
                `}
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; font-size: 18px; cursor: pointer; padding: 0 0 0 10px; color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#004085'}; opacity: 0.5;">
                ×
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add preview image functionality
document.querySelector('input[name="image"]')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            showNotification('Error', ['Please select a valid image file'], 'error');
            this.value = '';
            return;
        }
        
        // Validate file size
        if (file.size > MAX_IMAGE_SIZE) {
            showNotification('Error', ['Image size must not exceed 5MB'], 'error');
            this.value = '';
            return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.createElement('div');
            preview.className = 'image-preview mt-2';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; object-fit: contain;">
                <button type="button" class="btn btn-sm btn-danger mt-2" onclick="removeImage()">
                    <i class="fas fa-times"></i> Remove
                </button>
            `;
            
            // Remove existing preview if any
            const existingPreview = document.querySelector('.image-preview');
            if (existingPreview) {
                existingPreview.remove();
            }
            
            // Add new preview
            e.target.parentNode.appendChild(preview);
        };
        reader.readAsDataURL(file);
    }
});

// Remove image preview
window.removeImage = function() {
    const input = document.querySelector('input[name="image"]');
    input.value = '';
    const preview = document.querySelector('.image-preview');
    if (preview) {
        preview.remove();
    }
};

// Delete Product Function
async function deleteProduct(productId) {
    try {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        const response = await fetch(`/admin/api/products.php?id=${productId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete product');
        }

        if (result.success) {
            showNotification('Success', 'Product deleted successfully', 'success');
            await loadProducts(); // Reload the products list
        } else {
            throw new Error(result.error || 'Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error', error.message || 'Failed to delete product', 'error');
    }
}

// Edit Product Function
async function editProduct(productId) {
    console.log('Editing product:', productId);
    try {
        const response = await fetch(`/admin/api/products.php?id=${productId}`);
        const data = await response.json();
        
        if (data.success) {
            const product = data.data;
            console.log('Product data received:', product);

            // Show modal first
            const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
            modal.show();

            // Get form elements after modal is shown
            const form = document.getElementById('addProductForm');
            if (!form) {
                throw new Error('Edit form not found');
            }

            // Update modal title and button
            document.querySelector('#addProductModal .modal-title').textContent = 'Edit Product';
            document.querySelector('#addProductModal .btn-primary').textContent = 'Update Product';

            // Set form to edit mode
            form.dataset.editId = product.id;

            // Fill form data
            form.querySelector('[name="productName"]').value = product.name;
            form.querySelector('[name="price"]').value = product.price;
            form.querySelector('[name="description"]').value = product.description;

            // Show current product image
            const imagePreview = document.createElement('div');
            imagePreview.className = 'image-preview mt-2';
            imagePreview.innerHTML = `
                <img src="${product.image}" alt="Current Image" style="max-width: 200px; max-height: 200px; object-fit: contain;">
                <p class="text-muted small mt-1">Current image. Upload a new one to change it.</p>
            `;
            
            const existingPreview = form.querySelector('.image-preview');
            if (existingPreview) {
                existingPreview.remove();
            }
            
            const imageInput = form.querySelector('input[name="image"]');
            if (imageInput) {
                imageInput.value = '';
                imageInput.parentNode.appendChild(imagePreview);
            }

            // Handle category and size management
            const categorySelect = form.querySelector('#productCategory');
            const stockInput = form.querySelector('#stockInputContainer');
            const sizeSection = form.querySelector('#sizeManagementSection');

            if (categorySelect) {
                categorySelect.value = product.category;
                console.log('Setting category:', product.category);
                
                // Reset all sections first
                stockInput.style.display = 'none';
                sizeSection.style.display = 'none';
                console.log('Reset sections - stockInput and sizeSection hidden');

                try {
                    let sizes = product.sizes;
                    console.log('Original sizes data:', sizes);
                    
                    if (typeof sizes === 'string') {
                        console.log('Parsing sizes string:', sizes);
                        sizes = JSON.parse(sizes);
                        console.log('Parsed sizes:', sizes);
                    }

                    // Reset all size quantities first
                    const sizeInputs = form.querySelectorAll('.size-quantity');
                    console.log('Found size inputs:', sizeInputs.length);
                    sizeInputs.forEach(input => {
                        input.value = 0;
                        console.log('Reset size input:', input.name, 'to 0');
                    });

                    if (product.category.includes('clothing')) {
                        console.log('Product is clothing category');
                        
                        // Check if it's ONE_SIZE product
                        const isOneSize = sizes.ONE_SIZE !== undefined;
                        console.log('Is ONE_SIZE product?', isOneSize);
                        console.log('Sizes object:', sizes);
                        
                        if (isOneSize) {
                            console.log('Handling ONE_SIZE case');
                            stockInput.style.display = 'block';
                            sizeSection.style.display = 'none';
                            const stockQuantityInput = form.querySelector('[name="stock"]');
                            if (stockQuantityInput) {
                                const quantity = sizes.ONE_SIZE.quantity || 0;
                                console.log('Setting ONE_SIZE quantity:', quantity);
                                stockQuantityInput.value = quantity;
                            }
                        } else {
                            console.log('Handling regular sizes');
                            stockInput.style.display = 'none';
                            sizeSection.style.display = 'block';
                            
                            // Map size keys to indices
                            const sizeToIndex = { 'S': 0, 'M': 1, 'L': 2, 'XL': 3 };
                            
                            // Process each size
                            Object.entries(sizes).forEach(([size, data]) => {
                                console.log('Processing size:', size, 'with data:', data);
                                const index = sizeToIndex[size];
                                if (index !== undefined) {
                                    const input = form.querySelector(`input[name="sizes[${index}][quantity]"]`);
                                    console.log('Found input for size', size, ':', input ? 'yes' : 'no');
                                    if (input) {
                                        input.value = data.quantity || 0;
                                        console.log('Set quantity for size', size, 'to', data.quantity || 0);
                                    }
                                }
                            });
                        }
                    } else {
                        console.log('Product is not clothing category');
                        stockInput.style.display = 'block';
                        sizeSection.style.display = 'none';
                        const stockQuantityInput = form.querySelector('[name="stock"]');
                        if (stockQuantityInput) {
                            console.log('Setting non-clothing stock quantity:', product.stock_quantity || 0);
                            stockQuantityInput.value = product.stock_quantity || 0;
                        }
                    }
                } catch (e) {
                    console.error('Error setting sizes:', e);
                    console.error('Error details:', {
                        sizes: product.sizes,
                        category: product.category,
                        stock: product.stock_quantity
                    });
                    showNotification('Error', 'Failed to load product sizes', 'error');
                }
            }
        } else {
            throw new Error(data.error || 'Failed to load product data');
        }
    } catch (error) {
        console.error('Error fetching product data:', error);
        showNotification('Error', error.message || 'Failed to load product data', 'error');
    }
}

// Handle Product Form Submit
async function handleProductSubmit(form) {
    try {
        const formData = new FormData(form);
        const productData = {
            name: formData.get('productName'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            description: formData.get('description')
        };

        // Handle sizes for clothing items
        if (productData.category.includes('clothing')) {
            const sizes = [];
            const sizeInputs = form.querySelectorAll('.size-row');
            let totalStock = 0;
            
            // Check if size management section is visible
            if (document.getElementById('sizeManagementSection').style.display !== 'none') {
                sizeInputs.forEach((row, index) => {
                    const quantity = parseInt(row.querySelector('.size-quantity').value) || 0;
                    const size = row.querySelector('input[name^="sizes"][name$="[size]"]').value;
                    sizes.push({ size, quantity });
                    totalStock += quantity;
                });
            } else {
                // Handle ONE_SIZE case
                const stockQuantity = parseInt(form.querySelector('[name="stock"]').value) || 0;
                sizes.push({ size: 'ONE_SIZE', quantity: stockQuantity });
                totalStock = stockQuantity;
            }
            
            productData.sizes = sizes;
            productData.stock = totalStock;
        } else {
            productData.stock = parseInt(form.querySelector('[name="stock"]').value) || 0;
        }

        // If editing, add product ID
        if (form.dataset.editId) {
            productData.id = parseInt(form.dataset.editId);
        }

        // Validate data
        const errors = await validateProductData(productData, form);
        if (errors.length > 0) {
            showNotification('Validation Error', errors, 'error');
            return;
        }

        // Handle image
        const imageFile = form.querySelector('input[type="file"]').files[0];
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                productData.image = e.target.result;
                await saveProduct(productData, form);
            };
            reader.readAsDataURL(imageFile);
        } else if (form.dataset.editId) {
            // If editing and no new image selected, proceed without image
            await saveProduct(productData, form);
        } else {
            showNotification('Error', 'Please select a product image', 'error');
        }
    } catch (error) {
        console.error('Error handling product submission:', error);
        showNotification('Error', error.message || 'Failed to save product', 'error');
    }
}

// Save Product
async function saveProduct(productData, form) {
    try {
        const response = await fetch('/admin/api/products.php', {
            method: productData.id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to save product');
        }

        if (result.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
            modal.hide();
            
            // Reset form
            form.reset();
            form.removeAttribute('data-edit-id');
            const imagePreview = form.querySelector('.image-preview');
            if (imagePreview) {
                imagePreview.remove();
            }
            
            // Show success message and reload products
            showNotification('Success', productData.id ? 'Product updated successfully' : 'Product added successfully', 'success');
            await loadProducts();
        } else {
            throw new Error(result.error || 'Failed to save product');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Error', error.message || 'Failed to save product', 'error');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    loadProducts();

    // Search input
    const searchInput = document.querySelector('.search-box input');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            loadProducts();
        }, 500);
    });

    // Filters
    ['categoryFilter', 'stockFilter', 'sortBy'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            currentPage = 1;
            loadProducts();
        });
    });

    // Add product form
    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        // TODO: Implement add product functionality
    });
}); 