// Global state
let currentPage = 1;
let currentLimit = 10;
let currentSearch = '';
let currentCategory = '';
let currentStock = '';
let currentSort = 'newest';

// Constants for image validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSIONS = { width: 2000, height: 2000 };

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeProductForm();
    initializeEventListeners();
    loadProducts();
});

function initializeProductForm() {
    const form = document.getElementById('addProductForm');
    if (!form) {
        console.error('Form not found!');
        return;
    }

    const imageInput = form.querySelector('input[name="image"]');
    if (!imageInput) {
        console.error('Image input not found!');
        return;
    }

    const previewContainer = form.querySelector('.image-preview-container');
    if (!previewContainer) {
        console.error('Preview container not found!');
        return;
    }

    // Add event listener for modal show
    const addProductModal = document.getElementById('addProductModal');
    if (addProductModal) {
        addProductModal.addEventListener('show.bs.modal', function (event) {
            console.log('Modal opening - resetting form');
            
            // Reset form fields
            form.reset();
            form.removeAttribute('data-edit-id');
            
            // Reset image preview container
            const imagePreviewContainer = form.querySelector('.image-preview-container');
            if (imagePreviewContainer) {
                imagePreviewContainer.innerHTML = '';
            }
            
            // Remove any existing image preview
            const existingPreviews = form.querySelectorAll('.image-preview');
            existingPreviews.forEach(preview => preview.remove());
            
            // Reset image input
            const imageInput = form.querySelector('input[name="image"]');
            if (imageInput) {
                imageInput.value = '';
            }
            
            // Reset category-specific sections
            const stockInput = document.getElementById('stockInputContainer');
            const sizeSection = document.getElementById('sizeManagementSection');
            if (stockInput && sizeSection) {
                stockInput.style.display = 'block';
                sizeSection.style.display = 'none';
            }
            
            // Reset size quantities
            const sizeInputs = form.querySelectorAll('.size-quantity');
            sizeInputs.forEach(input => {
                input.value = '0';
            });
            
            // Reset stock input
            const stockQuantityInput = form.querySelector('[name="stock"]');
            if (stockQuantityInput) {
                stockQuantityInput.value = '0';
            }
            
            // Reset modal title and button
            const modalTitle = document.querySelector('#addProductModal .modal-title');
            const submitButton = document.querySelector('#addProductModal .btn-primary');
            if (modalTitle) modalTitle.textContent = 'Add New Product';
            if (submitButton) submitButton.textContent = 'Add Product';
        });
    }

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleProductSubmit(this);
    });

    // Handle image selection
    imageInput.addEventListener('change', function(e) {
        console.log('Image input changed');
        const file = e.target.files[0];
        if (!file) {
            console.log('No file selected');
            return;
        }
        console.log('File selected:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        handleImagePreview(file, imageInput, previewContainer);
    });

    // Handle category change
    const categorySelect = form.querySelector('#productCategory');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            handleCategoryChange(this.value);
        });
    }
}

// Separate function to handle image preview
function handleImagePreview(file, imageInput, previewContainer) {
    console.log('Starting image preview handling');
    
    try {
        // Validate file
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            throw new Error('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
        }

        if (file.size > MAX_IMAGE_SIZE) {
            throw new Error('Image size must not exceed 5MB');
        }

        console.log('File validation passed');

        // Clear existing preview
        previewContainer.innerHTML = '';
        console.log('Cleared existing preview');

        // Create new preview
        const reader = new FileReader();
        
        reader.onload = function(event) {
            console.log('FileReader loaded');
            
            const img = new Image();
            
            img.onload = function() {
                console.log('Image loaded, dimensions:', {
                    width: img.width,
                    height: img.height
                });

                // Validate dimensions
                if (img.width > MAX_IMAGE_DIMENSIONS.width || img.height > MAX_IMAGE_DIMENSIONS.height) {
                    console.log('Image dimensions too large');
                    imageInput.value = '';
                    previewContainer.innerHTML = '';
                    showNotification('Error', [`Image dimensions must not exceed ${MAX_IMAGE_DIMENSIONS.width}x${MAX_IMAGE_DIMENSIONS.height} pixels`]);
                    return;
                }

                console.log('Creating preview HTML');
                const previewHTML = `
                    <div class="image-preview">
                        <img src="${event.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; object-fit: contain;">
                        <button type="button" class="btn btn-sm btn-danger mt-2" onclick="removeImagePreview()">
                            <i class="fas fa-times"></i> Remove
                        </button>
                    </div>
                `;

                console.log('Setting preview HTML');
                previewContainer.innerHTML = previewHTML;
                console.log('Preview added successfully');
            };

            img.onerror = function() {
                console.error('Error loading image');
                imageInput.value = '';
                previewContainer.innerHTML = '';
                showNotification('Error', ['Failed to load image']);
            };

            console.log('Setting image source');
            img.src = event.target.result;
        };

        reader.onerror = function(error) {
            console.error('FileReader error:', error);
            imageInput.value = '';
            previewContainer.innerHTML = '';
            showNotification('Error', ['Failed to read image file']);
        };

        console.log('Starting to read file');
        reader.readAsDataURL(file);

    } catch (error) {
        console.error('Error in handleImagePreview:', error);
        imageInput.value = '';
        previewContainer.innerHTML = '';
        showNotification('Error', [error.message]);
    }
}

// Separate function to handle category change
function handleCategoryChange(category) {
    const stockInput = document.getElementById('stockInputContainer');
    const sizeSection = document.getElementById('sizeManagementSection');
    
    if (!stockInput || !sizeSection) {
        console.error('Required form sections not found');
        return;
    }
    
    console.log('Updating display for category:', category);
    stockInput.style.display = category.includes('clothing') ? 'none' : 'block';
    sizeSection.style.display = category.includes('clothing') ? 'block' : 'none';
    
    // Reset quantities
    if (category.includes('clothing')) {
        document.querySelectorAll('.size-quantity').forEach(input => {
            input.value = '0';
            console.log('Reset size quantity:', input.name);
        });
    }
    document.querySelector('[name="stock"]').value = '0';
    console.log('Reset stock value');
}

// Remove image preview
window.removeImagePreview = function() {
    console.log('Removing image preview');
    const form = document.getElementById('addProductForm');
    if (!form) {
        console.error('Form not found');
        return;
    }

    const imageInput = form.querySelector('input[name="image"]');
    const previewContainer = form.querySelector('.image-preview-container');
    
    if (imageInput) {
        console.log('Clearing image input');
        imageInput.value = '';
    }
    
    if (previewContainer) {
        console.log('Clearing preview container');
        previewContainer.innerHTML = '';
    }
    
    console.log('Image preview removed');
};

// Handle product form submission
async function handleProductSubmit(form) {
    console.log('Starting form submission');
    try {
        const isEdit = !!form.dataset.editId;
        const formData = new FormData(form);
        console.log('Form data created');

        // Log all form data
        for (let [key, value] of formData.entries()) {
            console.log('Form field:', key, value);
        }

        // Basic validation
        const name = formData.get('name');
        const price = parseFloat(formData.get('price'));
        const category = formData.get('category');
        const description = formData.get('description');
        const image = formData.get('image');

        // Validation for new products
        if (!isEdit) {
            if (!name || !price || !category || !description) {
                throw new Error('Please fill in all required fields');
            }
            if (!image || !(image instanceof File) || image.size === 0) {
                throw new Error('Please select an image for the new product');
            }
        } else {
            // Validation for editing - only validate fields that are provided
            if ((!name && name !== '') || (!price && price !== 0) || !category || (!description && description !== '')) {
                throw new Error('Please fill in all required fields');
            }
        }

        if (price && price <= 0) {
            throw new Error('Price must be greater than 0');
        }

        // Handle stock based on category
        let stock = 0;
        let sizes = null;

        if (category.includes('clothing')) {
            console.log('Processing clothing sizes');
            const sizeData = {};
            const sizeInputs = form.querySelectorAll('.size-quantity');
            
            sizeInputs.forEach(input => {
                const quantity = parseInt(input.value) || 0;
                const size = input.closest('.size-row').querySelector('input[type="text"]').value;
                sizeData[size] = { quantity };
                stock += quantity;
            });
            
            sizes = JSON.stringify(sizeData);
            console.log('Size data:', sizes);
        } else {
            stock = parseInt(formData.get('stock')) || 0;
        }

        if (stock < 0) {
            throw new Error('Stock quantity cannot be negative');
        }

        // Create data object
        const productData = {
            name: name,
            category: category,
            price: price.toFixed(2),
            stock_quantity: stock,
            description: description
        };

        if (sizes) {
            productData.sizes = sizes;
        }

        if (isEdit) {
            productData.id = form.dataset.editId;
        }

        // For PUT requests, send as JSON
        if (isEdit) {
            const response = await fetch('/admin/api/products.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || result.message || 'Failed to update product');
            }
            
            if (result.success) {
                showNotification('Success', 'Product updated successfully');
                const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
                if (modal) modal.hide();
                await loadProducts();
            }
        } else {
            // For POST requests, use FormData
            const submitData = new FormData();
            Object.entries(productData).forEach(([key, value]) => {
                submitData.append(key, value);
            });
            
            // Only append image for new products
            if (image instanceof File && image.size > 0) {
                submitData.append('image', image);
            }

            const response = await fetch('/admin/api/products.php', {
                method: 'POST',
                body: submitData
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || result.message || 'Failed to create product');
            }
            
            if (result.success) {
                showNotification('Success', 'Product added successfully');
                const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
                if (modal) modal.hide();
                await loadProducts();
            }
        }
    } catch (error) {
        console.error('Error in handleProductSubmit:', error);
        showNotification('Error', error.message || 'Failed to save product');
    }
}

// Initialize other event listeners
function initializeEventListeners() {
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', async function() {
            currentCategory = this.value;
            currentPage = 1;
            await loadProducts();
        });
    }

    // Search box
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(async function(e) {
            currentSearch = e.target.value;
            currentPage = 1;
            await loadProducts();
        }, 300));
    }

    // Stock filter
    const stockFilter = document.getElementById('stockFilter');
    if (stockFilter) {
        stockFilter.addEventListener('change', async function() {
            currentStock = this.value;
            currentPage = 1;
            await loadProducts();
        });
    }

    // Sort handler
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', async function() {
            currentSort = this.value;
            currentPage = 1;
            await loadProducts();
        });
    }

    // Export products handler
    document.getElementById('exportProducts')?.addEventListener('click', function() {
        const exportModal = new bootstrap.Modal(document.getElementById('exportOptionsModal'));
        exportModal.show();
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
                    // Define size order
                    const sizeOrder = ['S', 'M', 'L', 'XL'];
                    const sizeEntries = Object.entries(sizes)
                        .sort(([a], [b]) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));
                    
                    if (sizeEntries.length > 0) {
                        sizeDisplay = sizeEntries
                            .map(([size, data]) => `${size}: ${data.quantity}`)
                            .join('<br>');
                        stockQuantity = sizeEntries.reduce((total, [_, data]) => total + data.quantity, 0);
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
                <td>${product.id}</td>
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

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(',', '');
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
            form.querySelector('[name="name"]').value = product.name;
            form.querySelector('[name="price"]').value = product.price;
            form.querySelector('[name="description"]').value = product.description;

            // Show current product image
            const imagePreview = document.createElement('div');
            imagePreview.className = 'image-preview mt-2';
            imagePreview.innerHTML = `
                <img src="${product.image}" alt="Current Image" style="max-width: 200px; max-height: 200px; object-fit: contain;">
                <p class="text-muted small mt-1">Current image. Upload a new one to change it.</p>
            `;
            
            // Remove existing preview if any
            const existingPreview = form.querySelector('.image-preview');
            if (existingPreview) {
                existingPreview.remove();
            }
            
            // Find the image input and its container
            const imageInput = form.querySelector('input[name="image"]');
            if (imageInput) {
                imageInput.value = ''; // Reset the file input
                
                // Find the appropriate container
                const container = imageInput.closest('.mb-3') || imageInput.closest('.form-group') || imageInput.parentElement;
                
                if (container) {
                    console.log('Found container for image preview:', container);
                    container.appendChild(imagePreview);
                } else {
                    console.error('Could not find appropriate container for image preview');
                    showNotification('Error', 'Could not display image preview', 'error');
                }
            } else {
                console.error('Image input not found');
                showNotification('Error', 'Could not find image input', 'error');
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
                        stockInput.style.display = 'none';
                        sizeSection.style.display = 'block';
                        
                        // Map size keys to indices
                        const sizeToIndex = { 'S': 0, 'M': 1, 'L': 2, 'XL': 3 };
                        
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

// Save Product
async function saveProduct(formData, form) {
    try {
        console.log('Starting to save product');
        
        // Log all form data being sent
        console.log('Form data being sent to server:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}:`, `File: ${value.name} (${value.type}, ${value.size} bytes)`);
            } else {
                console.log(`${key}:`, value);
            }
        }

        // Send request
        const response = await fetch('/admin/api/products.php', {
            method: form.dataset.editId ? 'PUT' : 'POST',
            body: formData
        });

        console.log('API Response status:', response.status);
        console.log('Response headers:', {
            type: response.headers.get('content-type'),
            length: response.headers.get('content-length')
        });
        
        // Check if response has content
        const text = await response.text();
        console.log('Raw response:', text);
        
        let result;
        try {
            result = text ? JSON.parse(text) : {};
            console.log('Parsed API Response:', result);
        } catch (e) {
            console.error('Failed to parse response:', e);
            throw new Error('Invalid server response format');
        }
        
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to save product');
        }

        if (result.success) {
            console.log('Product saved successfully');
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
            if (modal) {
                modal.hide();
            }
            
            // Reset form
            form.reset();
            form.removeAttribute('data-edit-id');
            const imagePreview = form.querySelector('.image-preview');
            if (imagePreview) {
                imagePreview.remove();
            }
            
            // Show success message and reload products
            showNotification('Success', form.dataset.editId ? 'Product updated successfully' : 'Product added successfully', 'success');
            await loadProducts();
        } else {
            throw new Error(result.error || result.message || 'Failed to save product');
        }
    } catch (error) {
        console.error('Error in saveProduct:', error);
        showNotification('Error', error.message || 'Failed to save product', 'error');
    }
}

// Export products to Excel
async function handleExport() {
    const exportOption = document.querySelector('input[name="exportOption"]:checked').value;
    const modal = bootstrap.Modal.getInstance(document.getElementById('exportOptionsModal'));
    modal.hide();
    
    try {
        showNotification('Info', 'Preparing export, please wait...', 'info');
        
        // Get products based on export option
        const queryParams = new URLSearchParams({
            search: currentSearch,
            category: currentCategory,
            stock: currentStock,
            sort: currentSort
        });

        if (exportOption === 'all') {
            queryParams.set('page', 1);
            queryParams.set('limit', 1000); // Get all products
        } else {
            queryParams.set('page', currentPage);
            queryParams.set('limit', currentLimit);
        }

        const response = await fetch(`/admin/api/products.php?${queryParams}`);
        if (!response.ok) {
            throw new Error('Failed to fetch products for export');
        }

        const result = await response.json();
        if (!result.success || !result.data.products.length) {
            showNotification('Error', 'No products available to export', 'error');
            return;
        }

        const products = result.data.products;

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        
        // Convert products to rows with styling
        const rows = products.map(product => {
            // Calculate total stock
            let totalStock = 0;
            if (product.category.includes('clothing')) {
                try {
                    const sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
                    totalStock = Object.values(sizes).reduce((sum, size) => sum + (size.quantity || 0), 0);
                } catch (e) {
                    console.error('Error parsing sizes:', e);
                    totalStock = 0;
                }
            } else {
                totalStock = product.stock_quantity;
            }

            return {
                'ID': { v: product.id, t: 'n', s: { alignment: { horizontal: 'center' } } },
                'Name': { v: product.name, t: 's', s: { alignment: { horizontal: 'left' } } },
                'Category': { v: formatCategory(product.category), t: 's', s: { alignment: { horizontal: 'center' } } },
                'Price': { 
                    v: parseFloat(product.price).toFixed(2), 
                    t: 'n',
                    s: { 
                        alignment: { horizontal: 'right' },
                        numFmt: '"$"#,##0.00'
                    }
                },
                'Stock': { v: totalStock, t: 'n', s: { alignment: { horizontal: 'center' } } },
                'Status': {
                    v: determineStockStatus(totalStock),
                    t: 's',
                    s: {
                        alignment: { horizontal: 'center' },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: totalStock <= 0 ? 'FFCDD2' : totalStock <= 10 ? 'FFF9C4' : 'C8E6C9' }
                        }
                    }
                },
                'Description': { v: product.description, t: 's', s: { alignment: { horizontal: 'left', wrapText: true } } },
                'Created At': { 
                    v: new Date(product.created_at), 
                    t: 'd',
                    s: { 
                        alignment: { horizontal: 'center' },
                        numFmt: 'yyyy-mm-dd hh:mm:ss'
                    }
                },
                'Updated At': { 
                    v: new Date(product.updated_at), 
                    t: 'd',
                    s: { 
                        alignment: { horizontal: 'center' },
                        numFmt: 'yyyy-mm-dd hh:mm:ss'
                    }
                }
            };
        });

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(rows, { header: Object.keys(rows[0]) });

        // Set column widths
        const colWidths = [
            { wch: 5 },  // ID
            { wch: 30 }, // Name
            { wch: 15 }, // Category
            { wch: 10 }, // Price
            { wch: 8 },  // Stock
            { wch: 12 }, // Status
            { wch: 50 }, // Description
            { wch: 20 }, // Created At
            { wch: 20 }  // Updated At
        ];
        worksheet['!cols'] = colWidths;

        // Add header row styling
        const headerStyle = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { patternType: 'solid', fgColor: { rgb: '4A148C' } },
            alignment: { horizontal: 'center', vertical: 'center' }
        };

        // Apply header styles
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!worksheet[headerCell].s) worksheet[headerCell].s = {};
            Object.assign(worksheet[headerCell].s, headerStyle);
        }

        // Add the worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

        // Generate Excel file with appropriate name
        const exportType = exportOption === 'all' ? 'all' : `page${currentPage}`;
        const fileName = `products_export_${exportType}_${formatDate(new Date())}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        showNotification('Success', `Products exported successfully (${exportOption === 'all' ? 'All Products' : 'Current Page'})`, 'success');
    } catch (error) {
        console.error('Error exporting products:', error);
        showNotification('Error', 'Failed to export products: ' + error.message, 'error');
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