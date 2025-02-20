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
        const productId = form.getAttribute('data-edit-id');
        const isEdit = !!productId;
        
        console.log('Form submission details:', {
            isEdit,
            productId,
            formData: new FormData(form)
        });

        // Create FormData for the request
        const formData = new FormData(form);
        
        // Add product ID for edit mode
        if (isEdit) {
            formData.append('id', productId);
        }

        // Handle sizes for clothing categories
        const category = formData.get('category');
        if (category.includes('clothing')) {
            const sizes = {};
            let totalStock = 0;
            
            form.querySelectorAll('.size-quantity').forEach(input => {
                const size = input.dataset.size;
                const quantity = parseInt(input.value || 0);
                if (size) {
                    sizes[size] = quantity;
                    totalStock += quantity;
                }
            });
            
            formData.set('sizes', JSON.stringify(sizes));
            formData.set('stock_quantity', totalStock.toString());
            formData.set('status', totalStock > 0 ? 'in_stock' : 'out_of_stock');
        } else {
            const stock = parseInt(formData.get('stock') || 0);
            formData.set('stock_quantity', stock.toString());
            formData.set('status', stock > 0 ? 'in_stock' : 'out_of_stock');
            formData.delete('sizes');
        }

        // Handle image
        const imageInput = form.querySelector('input[name="image"]');
        const currentImage = form.querySelector('.image-preview img');
        
        if (imageInput.files.length > 0) {
            // New image selected
            formData.set('image', imageInput.files[0]);
        } else if (isEdit && currentImage) {
            // Keep existing image
            const currentImagePath = currentImage.getAttribute('src');
            if (currentImagePath && !currentImagePath.includes('default-product.jpg')) {
                formData.set('image_path', currentImagePath.replace(/^\/+/, ''));
            }
        }

        // Log FormData contents for debugging
        console.log('FormData contents:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        // For PUT requests, we need to add a special parameter to handle FormData
        if (isEdit) {
            formData.append('_method', 'PUT');
        }

        // Send request
        const response = await fetch('/admin/api/products.php', {
            method: 'POST', // Always use POST for FormData
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Failed to save product');
        }

        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        if (modal) {
            modal.hide();
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        // Show success message and reload products
        showNotification('Success', isEdit ? 'Product updated successfully' : 'Product added successfully');
        await loadProducts();

    } catch (error) {
        console.error('Error in handleProductSubmit:', error);
        showNotification('Error', error.message || 'Failed to save product', 'error');
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

    // Pagination click handler using event delegation
    document.querySelector('.pagination-section')?.addEventListener('click', async function(e) {
        const pageLink = e.target.closest('.page-link');
        if (!pageLink || pageLink.parentElement.classList.contains('disabled')) return;
        
        e.preventDefault();
        const page = parseInt(pageLink.dataset.page);
        if (page && page !== currentPage) {
            currentPage = page;
            await loadProducts();
        }
    });

    // Items per page change handler using event delegation
    document.querySelector('.pagination-section')?.addEventListener('change', async function(e) {
        if (e.target.id === 'itemsPerPage') {
            currentLimit = parseInt(e.target.value);
            currentPage = 1; // Reset to first page when changing items per page
            await loadProducts();
        }
    });
}

// Load products from API
async function loadProducts() {
    try {
        console.log('Loading products with params:', {
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

        const response = await fetch(`/admin/api/products.php?${queryParams}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('API response not ok:', response.status, response.statusText);
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to load products');
        }

        // Render products and update pagination
        renderProducts(data.data.products);
        updatePagination(data.data.pagination);
        
        return data;
    } catch (error) {
        console.error('Error in loadProducts:', error);
        showNotification('Error', 'Failed to load products. Please try again.', 'error');
        throw error;
    }
}

// Render products table
function renderProducts(products) {
    console.log('Starting to render products:', products);
    const tbody = document.querySelector('.products-table tbody');
    if (!tbody) {
        console.error('Table body not found');
        return;
    }

    tbody.innerHTML = '';

    products.forEach(product => {
        console.log(`Rendering product ${product.id}:`, {
            name: product.name,
            stock: product.stock_quantity,
            status: product.status,
            sizes: product.sizes,
            image: product.image
        });

        // Handle stock quantity display
        let stockDisplay = '';

        if (product.category.includes('clothing')) {
            if (product.sizes && typeof product.sizes === 'object') {
                // Create size display string with stock for each size
                stockDisplay = Object.entries(product.sizes)
                    .map(([size, qty]) => `${size}: ${qty}`)
                    .join('<br>');
            }
        } else {
            stockDisplay = `${product.stock_quantity}`;
        }

        // Handle image display
        let imageUrl = '/Images/default-product.jpg';
        if (product.image) {
            // Ensure the image path starts with a forward slash
            imageUrl = product.image.startsWith('/') ? product.image : '/' + product.image;
        }
        const imageAlt = product.name ? `${product.name} image` : 'Product image';

        const row = `
            <tr data-product-id="${product.id}">
                <td>${product.id}</td>
                <td>
                    <img src="${imageUrl}" 
                         alt="${imageAlt}" 
                         class="product-thumbnail"
                         onerror="this.src='/Images/default-product.jpg'">
                </td>
                <td>${product.name}</td>
                <td>${formatCategory(product.category)}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>${stockDisplay}</td>
                <td>
                    <span class="status-badge ${getStockStatus(product.status)}">
                        ${determineStockStatus(product.status)}
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

    // Create wrapper div for pagination info and controls
    const paginationWrapper = document.createElement('div');
    paginationWrapper.className = 'd-flex justify-content-between align-items-center flex-wrap gap-3';

    // Add pagination info
    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalItems);
    const paginationInfo = document.createElement('div');
    paginationInfo.className = 'pagination-info';
    paginationInfo.innerHTML = `
        <span class="text-muted">
            Showing ${startItem}-${endItem} of ${totalItems} items
        </span>
        <select class="form-select form-select-sm d-inline-block ms-2" style="width: auto;" id="itemsPerPage">
            <option value="10" ${limit === 10 ? 'selected' : ''}>10 per page</option>
            <option value="20" ${limit === 20 ? 'selected' : ''}>20 per page</option>
            <option value="50" ${limit === 50 ? 'selected' : ''}>50 per page</option>
            <option value="100" ${limit === 100 ? 'selected' : ''}>100 per page</option>
        </select>
    `;

    // Create pagination list
    const pagination = document.createElement('ul');
    pagination.className = 'pagination mb-0';

    // Previous button
    const prevPage = Math.max(1, currentPage - 1);
    pagination.innerHTML = `
        <li class="page-item ${currentPage <= 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${prevPage}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    // Calculate page range to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust if we're near the end
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    // First page and ellipsis if needed
    if (startPage > 1) {
        pagination.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="1">1</a>
            </li>
        `;
        if (startPage > 2) {
            pagination.innerHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === parseInt(currentPage) ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    // Last page and ellipsis if needed
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagination.innerHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
        pagination.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
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

    // Add components to wrapper
    const paginationNav = document.createElement('div');
    paginationNav.appendChild(pagination);
    paginationWrapper.appendChild(paginationInfo);
    paginationWrapper.appendChild(paginationNav);

    // Clear and append to container
    paginationContainer.innerHTML = '';
    paginationContainer.appendChild(paginationWrapper);
}

// Format category display
function formatCategory(category) {
    if (!category) return 'N/A';
    
    const categoryMap = {
        'plush': 'Plush Toys',
        'cards': 'Pokemon Cards',
        'accessories': 'Accessories',
        'clothing-men': "Men",
        'clothing-women': "Women",
        'clothing-unisex': 'Unisex'
    };
    
    return categoryMap[category] || category;
}

// Get stock status class
function getStockStatus(status) {
    switch (status) {
        case 'out_of_stock':
            return 'text-danger';
        case 'low_stock':
            return 'text-warning';
        case 'in_stock':
            return 'text-success';
        default:
            return 'text-muted';
    }
}

// Determine stock status text
function determineStockStatus(status) {
    switch (status) {
        case 'out_of_stock':
            return 'Out of Stock';
        case 'low_stock':
            return 'Low Stock';
        case 'in_stock':
            return 'In Stock';
        default:
            return 'Unknown';
    }
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

// Edit Product Function
async function editProduct(productId) {
    console.log('Editing product:', productId);
    try {
        // Get product details by ID
        const response = await fetch(`/admin/api/products.php?id=${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch product: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch product details');
        }

        const product = data.data;
        console.log('Product data received:', product);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
        modal.show();

        // Get form elements
        const form = document.getElementById('addProductForm');
        if (!form) {
            throw new Error('Edit form not found');
        }

        // Set form to edit mode with product ID
        form.setAttribute('data-edit-id', product.id);

        // Fill form data
        form.querySelector('[name="name"]').value = product.name || '';
        form.querySelector('[name="price"]').value = product.price || '';
        form.querySelector('[name="description"]').value = product.description || '';
        
        // Set category and handle category-specific fields
        const categorySelect = form.querySelector('[name="category"]');
        categorySelect.value = product.category || '';
        handleCategoryChange(product.category);

        // Handle stock quantity based on category
        const stockInput = form.querySelector('[name="stock"]');
        const sizeInputs = form.querySelectorAll('.size-quantity');
        
        if (product.category.includes('clothing')) {
            // For clothing, handle sizes
            if (product.sizes) {
                let sizes;
                try {
                    sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
                } catch (e) {
                    console.error('Error parsing sizes:', e);
                    sizes = {};
                }
                
                sizeInputs.forEach(input => {
                    const size = input.dataset.size;
                    input.value = sizes[size] || 0;
                });
            } else {
                sizeInputs.forEach(input => input.value = '0');
            }
        } else {
            // For non-clothing items, use stock_quantity directly
            stockInput.value = product.stock_quantity || 0;
        }

        // Show current product image
        const imagePreviewContainer = form.querySelector('.image-preview-container');
        if (imagePreviewContainer) {
            let imageUrl = product.image || '/Images/default-product.jpg';
            imageUrl = imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;
            
            const imagePreview = document.createElement('div');
            imagePreview.className = 'image-preview mt-2';
            imagePreview.innerHTML = `
                <img src="${imageUrl}" 
                     alt="Current Image" 
                     style="max-width: 200px; max-height: 200px; object-fit: contain;"
                     onerror="this.src='/Images/default-product.jpg'">
                <p class="text-muted small mt-1">Current image. Upload a new one to change it.</p>
            `;
            
            imagePreviewContainer.innerHTML = '';
            imagePreviewContainer.appendChild(imagePreview);
        }

    } catch (error) {
        console.error('Error in editProduct:', error);
        showNotification('Error', error.message || 'Failed to edit product', 'error');
    }
}

// Delete Product Function
async function deleteProduct(productId) {
    console.log('Deleting product:', productId);
    
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const response = await fetch(`/admin/api/products.php`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: productId })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete product');
        }

        if (data.success) {
            showNotification('Success', 'Product deleted successfully');
            await loadProducts(); // Reload the products list
        } else {
            throw new Error(data.message || 'Failed to delete product');
        }
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        showNotification('Error', error.message || 'Failed to delete product');
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
                    v: determineStockStatus(product.status),
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