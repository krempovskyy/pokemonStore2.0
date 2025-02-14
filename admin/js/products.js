document.addEventListener('DOMContentLoaded', function() {
    // Sample data
    let products = [
        {
            id: 1,
            name: 'Pikachu Plush',
            category: 'pokemon',
            price: 29.99,
            stock: 50,
            status: 'instock',
            image: '/images/pikachu-cos-mario.jpg'
        },
        {
            id: 2,
            name: 'Charizard Figure',
            category: 'figure',
            price: 49.99,
            stock: 5,
            status: 'lowstock',
            image: '/images/charizard-family.jpg'
        },
        {
            id: 3,
            name: 'Mewtwo Plush',
            category: 'pokemon',
            price: 34.99,
            stock: 0,
            status: 'outofstock',
            image: '/images/mewtwo.jpg'
        }
    ];

        // Initialize Bootstrap modal
        const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    
        // Render products table
        function renderProducts(productsToRender = products) {
            const tbody = document.querySelector('.products-table tbody');
            tbody.innerHTML = '';
            
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
                tr.innerHTML = `
                    <td><input type="checkbox" class="form-check-input product-select" data-id="${product.id}"></td>
                    <td>#${String(product.id).padStart(4, '0')}</td>
                    <td><img src="${product.image}" alt="${product.name}" class="product-img"></td>
                    <td>${product.name}</td>
                    <td>${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</td>
                    <td>$${parseFloat(product.price).toFixed(2)}</td>
                    <td>${product.stock}</td>
                    <td><span class="badge ${statusClass[product.status]}">${statusText[product.status]}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-info" title="Edit" onclick="editProduct(${product.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" title="Delete" onclick="deleteProduct(${product.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    
        // Search functionality
        document.getElementById('searchProduct').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                String(product.id).padStart(4, '0').includes(searchTerm.replace('#', '')) ||
                product.price.toString().includes(searchTerm) ||
                product.stock.toString().includes(searchTerm)
            );
            renderProducts(filteredProducts);
        });
    
        // Filter functionality
        function applyFilters() {
            const categoryFilter = document.getElementById('categoryFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;
            
            let filteredProducts = products;
            
            if (categoryFilter) {
                filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
            }
            
            if (statusFilter) {
                filteredProducts = filteredProducts.filter(p => p.status === statusFilter);
            }
            
            renderProducts(filteredProducts);
        }
    
        document.getElementById('categoryFilter').addEventListener('change', applyFilters);
        document.getElementById('statusFilter').addEventListener('change', applyFilters);
        
        // Reset filters
        document.getElementById('resetFilters').addEventListener('click', function() {
            document.getElementById('searchProduct').value = '';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('statusFilter').value = '';
            renderProducts();
        });
    
        // Select all functionality
        document.getElementById('selectAll').addEventListener('change', function(e) {
            const checkboxes = document.querySelectorAll('.product-select');
            checkboxes.forEach(checkbox => checkbox.checked = e.target.checked);
        });
    
        // Add Product Form Handler
        document.getElementById('productForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                id: parseInt(this.dataset.editId) || products.length + 1,
                name: document.getElementById('productName').value,
                category: document.getElementById('productCategory').value,
                price: parseFloat(document.getElementById('productPrice').value).toFixed(2),
                stock: parseInt(document.getElementById('productStock').value),
                status: document.getElementById('productStatus').value,
                image: document.getElementById('productImage').files.length > 0 
                    ? URL.createObjectURL(document.getElementById('productImage').files[0])
                    : document.getElementById('previewImg').src
            };
            
            if (this.dataset.editId) {
                // Update existing product
                const index = products.findIndex(p => p.id === parseInt(this.dataset.editId));
                if (index !== -1) {
                    products[index] = { ...products[index], ...formData };
                }
                delete this.dataset.editId; // Clear edit mode
            } else {
                // Add new product
                products.push(formData);
            }
            
            renderProducts();
            productModal.hide();
            this.reset();
        });
    
        // Add Product button click handler
        document.getElementById('addProductBtn').addEventListener('click', function() {
            // Reset form before showing modal
            const form = document.getElementById('productForm');
            form.reset();
            document.getElementById('previewImg').src = '/images/placeholder.png';
            document.getElementById('productImage').required = true; // Set required for new product
            productModal.show();
        });
    
        // Initial render
        renderProducts();
    
        // Edit Product Function
        window.editProduct = function(id) {
            const product = products.find(p => p.id === id);
            if (product) {
                const form = document.getElementById('productForm');
                form.dataset.editId = id.toString();
                
                document.getElementById('productName').value = product.name;
                document.getElementById('productCategory').value = product.category;
                document.getElementById('productPrice').value = parseFloat(product.price).toFixed(2);
                document.getElementById('productStock').value = product.stock;
                document.getElementById('productStatus').value = product.status;
                document.getElementById('previewImg').src = product.image;
                document.getElementById('productImage').required = false; // Remove required for edit
                
                // Update modal title
                document.querySelector('#productModal .modal-title').textContent = 'Edit Product';
                
                productModal.show();
            }
        };
    
        window.deleteProduct = function(id) {
            if (confirm('Are you sure you want to delete this product?')) {
                products = products.filter(p => p.id !== id);
                renderProducts();
            }
        };
    
        // Image preview handler
        document.getElementById('productImage').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('previewImg').src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    
        // Reset form and title when modal is closed
        document.getElementById('productModal').addEventListener('hidden.bs.modal', function () {
            const form = document.getElementById('productForm');
            form.reset();
            delete form.dataset.editId; // Clear edit mode
            document.getElementById('previewImg').src = '/images/placeholder.png';
            document.getElementById('productImage').required = true; // Reset to required
            document.querySelector('#productModal .modal-title').textContent = 'Add New Product';
        });
    



}); 