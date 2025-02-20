<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

// Allow CORS for development
header('Access-Control-Allow-Origin: http://localhost:81');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set JSON content type
header('Content-Type: application/json; charset=utf-8');

try {
    require_once '../includes/auth.php';

    // Initialize session first
    initSecureSession();
    
    // Log session data for debugging
    error_log("Session status: " . session_status());
    error_log("Session ID: " . session_id());
    error_log("Session data: " . print_r($_SESSION, true));

    // Verify admin session
    if (!verifyAdminSession()) {
        http_response_code(401);
        echo json_encode([
            'error' => 'Unauthorized', 
            'debug' => [
                'session_status' => session_status(),
                'session_id' => session_id(),
                'has_session_data' => !empty($_SESSION)
            ]
        ]);
        exit;
    }

    // Database connection
    $pdo = getDBConnection();
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    // Handle different HTTP methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // If ID is provided, get single product
            if (isset($_GET['id'])) {
                $productId = (int)$_GET['id'];
                $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
                $stmt->execute([$productId]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($product) {
                    echo json_encode(['success' => true, 'data' => $product]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Product not found']);
                }
                break;
            }
            // Get query parameters
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? max(1, min(50, (int)$_GET['limit'])) : 10;
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            $category = isset($_GET['category']) ? trim($_GET['category']) : '';
            $stock = isset($_GET['stock']) ? trim($_GET['stock']) : '';
            $sort = isset($_GET['sort']) ? trim($_GET['sort']) : 'newest';

            // Calculate offset
            $offset = ($page - 1) * $limit;

            // Build base query
            $baseQuery = "FROM products WHERE 1=1";
            $whereConditions = [];
            $queryParams = [];

            // Add search condition
            if ($search !== '') {
                $whereConditions[] = "(name LIKE ? OR description LIKE ?)";
                $queryParams[] = "%{$search}%";
                $queryParams[] = "%{$search}%";
            }

            // Add category filter
            if ($category !== '') {
                if (strpos($category, 'clothing-') === 0) {
                    // For clothing categories, match the exact category
                    $whereConditions[] = "category = ?";
                    $queryParams[] = $category;
                } else {
                    // For non-clothing categories, use the base category
                    $whereConditions[] = "category = ?";
                    $queryParams[] = $category;
                }
            }

            // Add stock filter
            if ($stock !== '') {
                switch ($stock) {
                    case 'instock':
                        $whereConditions[] = "(stock_quantity > 10 OR (category LIKE 'clothing-%' AND EXISTS (
                            SELECT 1 FROM json_table(sizes, '$[*]' COLUMNS (quantity INT PATH '$.quantity'))
                            WHERE quantity > 10
                        )))";
                        break;
                    case 'lowstock':
                        $whereConditions[] = "(stock_quantity > 0 AND stock_quantity <= 10) OR (category LIKE 'clothing-%' AND EXISTS (
                            SELECT 1 FROM json_table(sizes, '$[*]' COLUMNS (quantity INT PATH '$.quantity'))
                            WHERE quantity > 0 AND quantity <= 10
                        ))";
                        break;
                    case 'outofstock':
                        $whereConditions[] = "stock_quantity = 0 OR (category LIKE 'clothing-%' AND NOT EXISTS (
                            SELECT 1 FROM json_table(sizes, '$[*]' COLUMNS (quantity INT PATH '$.quantity'))
                            WHERE quantity > 0
                        ))";
                        break;
                }
            }

            // Combine where conditions
            if (!empty($whereConditions)) {
                $baseQuery .= " AND " . implode(" AND ", $whereConditions);
            }

            // Add sorting
            $orderBy = match($sort) {
                'oldest' => "created_at ASC",
                'price-high' => "price DESC",
                'price-low' => "price ASC",
                'stock-high' => "stock_quantity DESC",
                'stock-low' => "stock_quantity ASC",
                default => "created_at DESC"
            };
            $baseQuery .= " ORDER BY " . $orderBy;

            try {
                // Get total count
                $countQuery = "SELECT COUNT(*) " . $baseQuery;
                error_log("Count Query: " . $countQuery);
                error_log("Count Params: " . print_r($queryParams, true));

                $stmt = $pdo->prepare($countQuery);
                if (!empty($queryParams)) {
                    $stmt->execute($queryParams);
                } else {
                    $stmt->execute();
                }
                $totalCount = (int)$stmt->fetchColumn();
                error_log("Total products found: " . $totalCount);

                // Calculate total pages
                $totalPages = max(1, ceil($totalCount / $limit));
                error_log("Pagination details:");
                error_log("- Total pages: " . $totalPages);
                error_log("- Current page: " . $page);
                error_log("- Items per page: " . $limit);
                error_log("- Current offset: " . $offset);
                
                // Adjust current page if it exceeds total pages
                if ($page > $totalPages) {
                    error_log("Page number {$page} exceeds total pages {$totalPages}, adjusting...");
                    $page = $totalPages;
                    $offset = ($page - 1) * $limit;
                    error_log("Adjusted to page {$page} with offset {$offset}");
                }

                // Get products with pagination
                $query = "SELECT * " . $baseQuery . " LIMIT " . (int)$limit . " OFFSET " . (int)$offset;
                error_log("Products Query: " . $query);
                
                // Add pagination parameters
                $stmt = $pdo->prepare($query);
                $stmt->execute($queryParams);
                $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
                error_log("Products retrieved from database: " . count($products));
                foreach ($products as $product) {
                    error_log("Product ID {$product['id']} - Category: {$product['category']} - Sizes: " . ($product['sizes'] ?? 'null'));
                    if ($product['sizes']) {
                        error_log("Parsed sizes for product {$product['id']}: " . print_r(json_decode($product['sizes'], true), true));
                    }
                }

                $response = [
                    'success' => true,
                    'data' => [
                        'products' => $products,
                        'pagination' => [
                            'currentPage' => (int)$page,
                            'totalPages' => (int)$totalPages,
                            'totalItems' => (int)$totalCount,
                            'limit' => (int)$limit,
                            'offset' => (int)$offset
                        ]
                    ]
                ];

                // Log response
                error_log("Pagination response data: " . print_r($response['data']['pagination'], true));

                echo json_encode($response);
            } catch (PDOException $e) {
                error_log("Database error in products query: " . $e->getMessage());
                throw $e;
            }
            break;

        case 'PUT':
            // Get JSON data from request body
            $jsonData = file_get_contents('php://input');
            error_log("Received PUT data: " . $jsonData);
            
            $data = json_decode($jsonData, true);
            if (!$data) {
                throw new Exception('Invalid JSON data received');
            }
            
            error_log("Decoded JSON data: " . print_r($data, true));
            
            // Validate required fields for PUT
            if (!isset($data['id'])) {
                throw new Exception('Product ID is required for update');
            }
            
            // Get existing product to preserve unchanged values
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$data['id']]);
            $existingProduct = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$existingProduct) {
                throw new Exception('Product not found');
            }
            
            // Merge existing data with updates
            $name = $data['name'] ?? $existingProduct['name'];
            $category = $data['category'] ?? $existingProduct['category'];
            $price = $data['price'] ?? $existingProduct['price'];
            $stock = $data['stock_quantity'] ?? $existingProduct['stock_quantity'];
            $description = $data['description'] ?? $existingProduct['description'];
            $sizes = isset($data['sizes']) ? $data['sizes'] : $existingProduct['sizes'];
            
            // Basic validation
            if (empty($name)) {
                throw new Exception('Product name cannot be empty');
            }
            
            if ($price <= 0) {
                throw new Exception('Price must be greater than 0');
            }
            
            if ($stock < 0) {
                throw new Exception('Stock cannot be negative');
            }
            
            // Update status
            $status = 0;  // 0 = out of stock
            if ($stock > 0) {
                $status = $stock <= 10 ? 1 : 2;  // 1 = low stock, 2 = in stock
            }
            
            // Update product
            $stmt = $pdo->prepare("UPDATE products SET 
                name = ?, 
                category = ?, 
                price = ?, 
                stock_quantity = ?, 
                description = ?, 
                status = ?,
                sizes = ?, 
                updated_at = NOW()
                WHERE id = ?");
                
            $stmt->execute([
                $name,
                $category,
                $price,
                $stock,
                $description,
                $status,
                $sizes,
                $data['id']
            ]);
            
            // Get updated product
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$data['id']]);
            $updatedProduct = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $updatedProduct]);
            break;

        case 'POST':
            // Get data from FormData
            $data = [];
            $data['name'] = $_POST['name'] ?? null;
            $data['category'] = $_POST['category'] ?? null;
            $data['price'] = $_POST['price'] ?? null;
            $data['stock_quantity'] = $_POST['stock_quantity'] ?? null;
            $data['description'] = $_POST['description'] ?? null;
            
            // Handle file upload
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../../uploads/products/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
                $uploadFile = $uploadDir . $fileName;
                
                if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
                    $data['image'] = '/uploads/products/' . $fileName;
                } else {
                    throw new Exception('Failed to upload image');
                }
            }
            
            // Handle sizes for clothing items
            if (isset($_POST['sizes'])) {
                $data['sizes'] = $_POST['sizes'];
            }
            
            // Validate required fields
            $requiredFields = ['name', 'category', 'price', 'stock_quantity', 'description'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || trim($data[$field]) === '') {
                    throw new Exception("Missing required field: {$field}");
                }
            }

            // Validate sizes for clothing items
            if (strpos($data['category'], 'clothing') !== false) {
                if (!isset($data['sizes'])) {
                    throw new Exception("Sizes are required for clothing items");
                }
                // Keep sizes as is if it's already a JSON string
                if (!is_string($data['sizes'])) {
                    $data['sizes'] = json_encode($data['sizes']);
                }
            } else {
                $data['sizes'] = null;
            }

            // Sanitize and validate data
            $name = trim($data['name']);
            $category = trim($data['category']);
            $price = (float)$data['price'];
            $stock = (int)$data['stock_quantity'];
            $description = trim($data['description']);
            
            // Validate data
            if (strlen($name) < 3) {
                throw new Exception('Product name must be at least 3 characters long');
            }

            if ($price <= 0) {
                throw new Exception('Price must be greater than 0');
            }

            if ($stock < 0) {
                throw new Exception('Stock cannot be negative');
            }

            // Update status calculation
            $status = 0;  // 0 = out of stock
            if ($stock > 0) {
                $status = $stock <= 10 ? 1 : 2;  // 1 = low stock, 2 = in stock
            }

            // Check if updating existing product
            $productId = isset($_POST['id']) ? (int)$_POST['id'] : null;
            
            if ($productId) {
                // Update existing product
                $query = "UPDATE products SET 
                    name = ?, 
                    category = ?, 
                    price = ?, 
                    stock_quantity = ?, 
                    description = ?, 
                    status = ?,
                    sizes = ?, 
                    updated_at = NOW()";
                
                $params = [$name, $category, $price, $stock, $description, $status, $data['sizes']];
                
                if (isset($data['image'])) {
                    $query .= ", image = ?";
                    $params[] = $data['image'];
                }
                
                $query .= " WHERE id = ?";
                $params[] = $productId;

                $stmt = $pdo->prepare($query);
                $stmt->execute($params);

                if ($stmt->rowCount() === 0) {
                    throw new Exception('Product not found or no changes made');
                }
            } else {
                // Insert new product
                if (!isset($data['image'])) {
                    throw new Exception('Image is required for new products');
                }

                $stmt = $pdo->prepare("INSERT INTO products (name, category, price, stock_quantity, description, image, status, sizes, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
                $stmt->execute([$name, $category, $price, $stock, $description, $data['image'], $status, $data['sizes']]);
                $productId = $pdo->lastInsertId();
            }

            // Get updated product data
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$productId]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $product]);
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                throw new Exception('Product ID is required');
            }

            $productId = (int)$_GET['id'];
            
            // Check if product exists
            $stmt = $pdo->prepare("SELECT id FROM products WHERE id = ?");
            $stmt->execute([$productId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
                break;
            }

            // Delete the product
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$productId]);

            echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
            break;

        default:
            throw new Exception('Method not allowed');
    }
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'message' => $e->getMessage()]);
} catch (Exception $e) {
    error_log("Application error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Application error', 'message' => $e->getMessage()]);
}
?> 