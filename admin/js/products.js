// Wait for DOM and Bootstrap to be fully loaded
window.addEventListener('load', function() {
    // Sample data - in production this would come from a database
    let products = [
        {
            id: 1,
            name: 'Pikachu Plush',
            category: 'plush',
            price: 29.99,
            stock: 50,
            status: 'instock',
            image: '/images/pikachu-cos-mario.jpg',
            description: 'A cute Pikachu plush toy wearing Mario costume'
        },
        {
            id: 2,
            name: 'Charizard Figure',
            category: 'figure',
            price: 49.99,
            stock: 5,
            status: 'lowstock',
            image: '/images/charizard-family.jpg',
            description: 'Detailed Charizard figure with family'
        },
        {
            id: 3,
            name: 'Mewtwo Plush',
            category: 'plush',
            price: 34.99,
            stock: 0,
            status: 'outofstock',
            image: '/images/mewtwo.jpg',
            description: 'Legendary Mewtwo plush toy'
        }
    ];

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize event listeners
    initializeEventListeners();
    
    // Initial render
    renderProducts(products);

    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                product.price.toString().includes(searchTerm) ||
                product.stock.toString().includes(searchTerm)
            );
            renderProducts(filteredProducts);
        }, 300));
    }

    // Filter change handlers
    const filters = document.querySelectorAll('.form-select');
    filters.forEach(filter => {
        filter.addEventListener('change', function() {
            applyFilters();
        });
    });

    // Add Product Form Handler
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleProductSubmit(this);
        });
    }

    // Initialize event listeners for dynamic elements
    function initializeEventListeners() {
        // Delete product handler
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-danger')) {
                e.preventDefault();
                const productId = parseInt(e.target.closest('tr').dataset.productId);
                if (confirm('Are you sure you want to delete this product?')) {
                    deleteProduct(productId);
                }
            }
        });

        // Edit product handler
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-info')) {
                e.preventDefault();
                const productId = parseInt(e.target.closest('tr').dataset.productId);
                editProduct(productId);
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
    }
    
    // Render products table
    function renderProducts(productsToRender = products) {
        const tbody = document.querySelector('.products-table tbody');
        if (!tbody) {
            console.error('Could not find table body element with class .products-table tbody');
            return;
        }
        
        console.log('Rendering products:', productsToRender);
        tbody.innerHTML = '';
        
        if (productsToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No products found</td>
                </tr>
            `;
            return;
        }
        
        productsToRender.forEach(product => {
            const statusClass = {
                'instock': 'bg-success',
                'lowstock': 'bg-warning',
                'outofstock': 'bg-danger'
            };
            
            const statusText = {
                'instock': 'In Stock',
                'lowstock': 'Low Stock',
                'outofstock': 'Out of Stock'
            };

            const tr = document.createElement('tr');
            tr.dataset.productId = product.id;
            tr.innerHTML = `
                <td>
                    <img src="${product.image}" alt="${product.name}" class="product-thumbnail">
                </td>
                <td>${product.name}</td>
                <td>${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.stock}</td>
                <td><span class="badge ${statusClass[product.status]}">${statusText[product.status]}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Reinitialize tooltips
        const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltips.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

    // Delete Product Function
    function deleteProduct(productId) {
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products.splice(index, 1);
            renderProducts();
            showNotification('Product deleted successfully!', 'success');
        }
    }

    // Edit Product Function
    function editProduct(productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            const form = document.getElementById('addProductForm');
            form.dataset.editId = productId;
            
            // Populate form fields
            form.querySelector('input[name="productName"]').value = product.name;
            form.querySelector('select[name="category"]').value = product.category;
            form.querySelector('input[name="price"]').value = product.price;
            form.querySelector('input[name="stock"]').value = product.stock;
            form.querySelector('textarea[name="description"]').value = product.description || '';
            
            // Update modal title
            document.querySelector('#addProductModal .modal-title').textContent = 'Edit Product';
            document.querySelector('#addProductModal .btn-primary').textContent = 'Update Product';
            
            const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
            modal.show();
        }
    }

    // Handle Product Form Submit
    async function handleProductSubmit(form) {
        const formData = new FormData(form);
        const productData = {
            name: formData.get('productName'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            description: formData.get('description')
        };

        try {
            // Validate product data
            const errors = await validateProductData(productData, form);
            if (errors.length > 0) {
                showNotification('Validation errors', errors, 'error');
                return;
            }

            // Determine stock status
            productData.status = determineStockStatus(productData.stock);

            // Handle image
            const imageFile = form.querySelector('input[type="file"]').files[0];
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    productData.image = e.target.result;
                    saveProduct(productData, form);
                };
                reader.readAsDataURL(imageFile);
            } else {
                // If editing and no new image selected, keep existing image
                if (form.dataset.editId) {
                    const existingProduct = products.find(p => p.id === parseInt(form.dataset.editId));
                    if (existingProduct) {
                        productData.image = existingProduct.image;
                        saveProduct(productData, form);
                    } else {
                        showNotification('Error', ['Product not found'], 'error');
                    }
                } else {
                    showNotification('Error', ['Please select a product image'], 'error');
                }
            }
        } catch (error) {
            console.error('Error handling product submission:', error);
            showNotification('Error', ['Failed to process product submission'], 'error');
        }
    }

    // Save Product
    function saveProduct(productData, form) {
        if (form.dataset.editId) {
            // Update existing product
            const id = parseInt(form.dataset.editId);
            const index = products.findIndex(p => p.id === id);
            if (index !== -1) {
                products[index] = { ...products[index], ...productData };
                showNotification('Product updated successfully!', 'success');
            }
        } else {
            // Add new product
            productData.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push(productData);
            showNotification('Product added successfully!', 'success');
        }

        // Reset form and close modal
        form.reset();
        delete form.dataset.editId;
        document.querySelector('#addProductModal .modal-title').textContent = 'Add New Product';
        document.querySelector('#addProductModal .btn-primary').textContent = 'Add Product';
        bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();

        // Refresh products table
        renderProducts();
    }

    // Apply filters
    function applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const stockFilter = document.getElementById('stockFilter').value;
        const sortBy = document.getElementById('sortBy').value;
        
        let filteredProducts = [...products];
        
        // Apply category filter
        if (categoryFilter) {
            filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
        }
        
        // Apply stock filter
        if (stockFilter) {
            filteredProducts = filteredProducts.filter(p => p.status === stockFilter);
        }

        // Apply sorting
        switch(sortBy) {
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'newest':
                filteredProducts.sort((a, b) => b.id - a.id);
                break;
            case 'oldest':
                filteredProducts.sort((a, b) => a.id - b.id);
                break;
        }
        
        renderProducts(filteredProducts);
    }

    // Reset modal when closed
    document.getElementById('addProductModal').addEventListener('hidden.bs.modal', function() {
        const form = document.getElementById('addProductForm');
        form.reset();
        delete form.dataset.editId;
        document.querySelector('#addProductModal .modal-title').textContent = 'Add New Product';
        document.querySelector('#addProductModal .btn-primary').textContent = 'Add Product';
    });
});

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
    if (stockQuantity <= 0) return 'outofstock';
    if (stockQuantity <= 10) return 'lowstock';
    return 'instock';
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