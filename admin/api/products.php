<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

// Include required files
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../../includes/helpers/image_helper.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in as admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true || 
    !isset($_SESSION['admin_role']) || $_SESSION['admin_role'] !== 'admin') {
    error_log("Unauthorized access attempt to products API");
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

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
    // Initialize secure session
    initSecureSession();

    // Verify admin authentication
    if (!verifyAdminSession()) {
        error_log("Admin session verification failed");
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
        exit();
    }

    // Database connection
    $conn = getDBConnection();
    if (!$conn) {
        throw new Exception('Database connection failed');
    }

    // Check for method override
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method === 'POST' && isset($_POST['_method'])) {
        $method = strtoupper($_POST['_method']);
        error_log("Method overridden to: " . $method);
    }

    // Handle different HTTP methods
    switch ($method) {
        case 'GET':
            // If ID is provided, get single product
            if (isset($_GET['id'])) {
                $productId = (int)$_GET['id'];
                $stmt = mysqli_prepare($conn, "SELECT * FROM products WHERE id = ?");
                mysqli_stmt_bind_param($stmt, "i", $productId);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                $product = mysqli_fetch_assoc($result);
                
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
            $search = isset($_GET['search']) ? mysqli_real_escape_string($conn, trim($_GET['search'])) : '';
            $category = isset($_GET['category']) ? mysqli_real_escape_string($conn, trim($_GET['category'])) : '';
            $stock = isset($_GET['stock']) ? mysqli_real_escape_string($conn, trim($_GET['stock'])) : '';
            $sort = isset($_GET['sort']) ? mysqli_real_escape_string($conn, trim($_GET['sort'])) : 'newest';

            // Calculate offset
            $offset = ($page - 1) * $limit;

            // Build base query
            $baseQuery = "FROM products WHERE 1=1";
            $whereConditions = [];
            $queryParams = [];
            $paramTypes = "";

            // Add search condition
            if ($search !== '') {
                $whereConditions[] = "(name LIKE ? OR description LIKE ?)";
                $searchPattern = "%{$search}%";
                $queryParams[] = $searchPattern;
                $queryParams[] = $searchPattern;
                $paramTypes .= "ss";
            }

            // Add category filter
            if ($category !== '') {
                $whereConditions[] = "category = ?";
                $queryParams[] = $category;
                $paramTypes .= "s";
            }

            // Add stock filter
            if ($stock !== '') {
                switch ($stock) {
                    case 'instock':
                        $whereConditions[] = "status = 'in_stock'";
                        break;
                    case 'lowstock':
                        $whereConditions[] = "status = 'low_stock'";
                        break;
                    case 'outofstock':
                        $whereConditions[] = "status = 'out_of_stock'";
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
                $countQuery = "SELECT COUNT(*) as total " . $baseQuery;
                error_log("Count Query: " . $countQuery);
                error_log("Count Params: " . print_r($queryParams, true));

                $stmt = mysqli_prepare($conn, $countQuery);
                if (!empty($paramTypes)) {
                    mysqli_stmt_bind_param($stmt, $paramTypes, ...$queryParams);
                }
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                $row = mysqli_fetch_assoc($result);
                $totalCount = (int)$row['total'];
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
                $query = "SELECT * " . $baseQuery . " LIMIT ? OFFSET ?";
                error_log("Products Query: " . $query);
                
                // Add pagination parameters
                $stmt = mysqli_prepare($conn, $query);
                if (!empty($paramTypes)) {
                    $paramTypes .= "ii";
                    $queryParams[] = $limit;
                    $queryParams[] = $offset;
                    mysqli_stmt_bind_param($stmt, $paramTypes, ...$queryParams);
                } else {
                    mysqli_stmt_bind_param($stmt, "ii", $limit, $offset);
                }
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                
                $products = [];
                while ($product = mysqli_fetch_assoc($result)) {
                    // Process image path
                    if (!empty($product['image'])) {
                        $product['image'] = getProductImageUrl($product['image']);
                    } else {
                        $product['image'] = '/Images/default-product.jpg';
                    }
                    
                    // Process stock quantity
                    $product['stock_quantity'] = (int)$product['stock_quantity'];
                    
                    // Process sizes if exists
                    if (!empty($product['sizes'])) {
                        $product['sizes'] = json_decode($product['sizes'], true);
                    }
                    
                    $products[] = $product;
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
            } catch (Exception $e) {
                error_log("Database error in products query: " . $e->getMessage());
                throw $e;
            }
            break;

        case 'POST':
            // Handle file upload
            $uploadDir = __DIR__ . '/../../uploads/products/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            // Process image upload
            $imagePath = '';
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $fileInfo = pathinfo($_FILES['image']['name']);
                $extension = strtolower($fileInfo['extension']);
                
                // Validate file type
                $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                if (!in_array($extension, $allowedTypes)) {
                    throw new Exception('Invalid image type. Allowed types: ' . implode(', ', $allowedTypes));
                }
                
                // Generate unique filename
                $filename = uniqid('product_') . '.' . $extension;
                $targetPath = $uploadDir . $filename;
                
                if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                    $imagePath = 'uploads/products/' . $filename;
                } else {
                    throw new Exception('Failed to upload image');
                }
            }

            // Process other form data
            $name = $_POST['name'] ?? '';
            $category = $_POST['category'] ?? '';
            $price = floatval($_POST['price'] ?? 0);
            $description = $_POST['description'] ?? '';
            
            // Handle stock and sizes based on category
            if (strpos($category, 'clothing') !== false) {
                // For clothing items, calculate total stock from sizes
                $sizes = isset($_POST['sizes']) ? $_POST['sizes'] : [];
                if (is_string($sizes)) {
                    $sizes = json_decode($sizes, true);
                }
                $stock = 0;
                if (is_array($sizes)) {
                    foreach ($sizes as $size) {
                        $stock += isset($size['quantity']) ? intval($size['quantity']) : 0;
                    }
                }
                $sizesJson = json_encode($sizes);
            } else {
                // For non-clothing items, use direct stock value
                $stock = isset($_POST['stock_quantity']) ? intval($_POST['stock_quantity']) : 
                        (isset($_POST['stock']) ? intval($_POST['stock']) : 0);
                $sizesJson = null;
            }

            // Validate data
            if (empty($name) || empty($category) || $price <= 0) {
                throw new Exception('Missing required fields');
            }

            // Determine status based on stock quantity
            $status = $stock > 0 ? 'in_stock' : 'out_of_stock';
            if ($stock > 0 && $stock <= 10) {
                $status = 'low_stock';
            }

            error_log("Adding new product with data: " . print_r([
                'name' => $name,
                'category' => $category,
                'price' => $price,
                'stock' => $stock,
                'status' => $status,
                'sizes' => $sizesJson
            ], true));

            // Insert product
            $stmt = mysqli_prepare($conn, 
                "INSERT INTO products (name, category, price, description, image, stock_quantity, sizes, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            );
            mysqli_stmt_bind_param($stmt, "ssdssiss", 
                $name, $category, $price, $description, 
                $imagePath, $stock, $sizesJson, $status
            );
            
            if (mysqli_stmt_execute($stmt)) {
                $productId = mysqli_insert_id($conn);
                echo json_encode([
                    'success' => true, 
                    'message' => 'Product added successfully',
                    'data' => [
                        'id' => $productId,
                        'name' => $name,
                        'category' => $category,
                        'price' => $price,
                        'description' => $description,
                        'image' => $imagePath,
                        'stock_quantity' => $stock,
                        'sizes' => $sizesJson ? json_decode($sizesJson, true) : null,
                        'status' => $status
                    ]
                ]);
            } else {
                $error = mysqli_error($conn);
                error_log("MySQL error in product insert: " . $error);
                throw new Exception('Failed to add product: ' . $error);
            }
            break;

        case 'PUT':
            // Get data from request
            $data = [];
            if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
                // Handle form data
                $data = $_POST;
                error_log("Received PUT form data: " . print_r($_POST, true));
                error_log("Received PUT files: " . print_r($_FILES, true));
            } else {
                // Handle JSON data
                $jsonData = file_get_contents('php://input');
                error_log("Received PUT data: " . $jsonData);
                $data = json_decode($jsonData, true);
            }

            if (empty($data)) {
                error_log("No data received in PUT request");
                throw new Exception('No data received');
            }
            
            error_log("Processing data: " . print_r($data, true));
            
            // Validate required fields for PUT
            if (!isset($data['id'])) {
                throw new Exception('Product ID is required for update');
            }
            
            // Get existing product to preserve unchanged values
            $stmt = mysqli_prepare($conn, "SELECT * FROM products WHERE id = ?");
            mysqli_stmt_bind_param($stmt, "i", $data['id']);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $existingProduct = mysqli_fetch_assoc($result);
            
            if (!$existingProduct) {
                throw new Exception('Product not found');
            }
            
            // Merge existing data with updates
            $name = $data['name'] ?? $existingProduct['name'];
            $category = $data['category'] ?? $existingProduct['category'];
            $price = isset($data['price']) ? floatval($data['price']) : $existingProduct['price'];
            $stock = isset($data['stock_quantity']) ? intval($data['stock_quantity']) : $existingProduct['stock_quantity'];
            $description = $data['description'] ?? $existingProduct['description'];
            
            // Handle sizes
            if (isset($data['sizes']) && !empty($data['sizes'])) {
                if (is_string($data['sizes'])) {
                    $sizes = json_decode($data['sizes'], true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        error_log("JSON decode error for sizes: " . json_last_error_msg());
                        $sizes = null;
                    }
                } else {
                    $sizes = $data['sizes'];
                }
            } else {
                $sizes = null;
            }
            
            // Encode sizes for database
            $sizesJson = $sizes !== null ? json_encode($sizes) : null;
            
            // Handle image update
            $imagePath = $existingProduct['image'];
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../../uploads/products/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                $fileInfo = pathinfo($_FILES['image']['name']);
                $extension = strtolower($fileInfo['extension']);
                
                // Validate file type
                $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                if (!in_array($extension, $allowedTypes)) {
                    throw new Exception('Invalid image type. Allowed types: ' . implode(', ', $allowedTypes));
                }
                
                // Generate unique filename
                $filename = uniqid('product_') . '.' . $extension;
                $targetPath = $uploadDir . $filename;
                
                if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                    // Delete old image if it exists and is not the default image
                    if ($existingProduct['image'] && 
                        file_exists(__DIR__ . '/../../' . $existingProduct['image']) && 
                        !strpos($existingProduct['image'], 'default-product.jpg')) {
                        unlink(__DIR__ . '/../../' . $existingProduct['image']);
                    }
                    $imagePath = 'uploads/products/' . $filename;
                } else {
                    throw new Exception('Failed to upload image');
                }
            } else if (isset($data['image_path'])) {
                $imagePath = $data['image_path'];
            }

            // Determine status based on stock quantity
            $status = $stock > 0 ? 'in_stock' : 'out_of_stock';
            if ($stock > 0 && $stock <= 10) {
                $status = 'low_stock';
            }

            // Update product
            $stmt = mysqli_prepare($conn, 
                "UPDATE products 
                 SET name = ?, 
                     category = ?, 
                     price = ?, 
                     description = ?, 
                     image = ?, 
                     stock_quantity = ?, 
                     sizes = ?, 
                     status = ?,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?"
            );

            mysqli_stmt_bind_param($stmt, "ssdssissi", 
                $name, $category, $price, $description, 
                $imagePath, $stock, $sizesJson, $status, $data['id']
            );
            
            if (mysqli_stmt_execute($stmt)) {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Product updated successfully',
                    'data' => [
                        'id' => $data['id'],
                        'name' => $name,
                        'category' => $category,
                        'price' => $price,
                        'description' => $description,
                        'image' => $imagePath,
                        'stock_quantity' => $stock,
                        'sizes' => $sizes,
                        'status' => $status
                    ]
                ]);
            } else {
                $error = mysqli_error($conn);
                error_log("MySQL error in product update: " . $error);
                throw new Exception('Failed to update product: ' . $error);
            }
            break;

        case 'DELETE':
            // Get JSON data from request body
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            
            if (!isset($data['id'])) {
                throw new Exception('Product ID is required for deletion');
            }
            
            // Get product info to delete image
            $stmt = mysqli_prepare($conn, "SELECT image FROM products WHERE id = ?");
            mysqli_stmt_bind_param($stmt, "i", $data['id']);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $product = mysqli_fetch_assoc($result);
            
            if ($product && !empty($product['image'])) {
                $imagePath = __DIR__ . '/../../' . $product['image'];
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }
            
            // Delete product
            $stmt = mysqli_prepare($conn, "DELETE FROM products WHERE id = ?");
            mysqli_stmt_bind_param($stmt, "i", $data['id']);
            
            if (mysqli_stmt_execute($stmt)) {
                echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
            } else {
                throw new Exception('Failed to delete product');
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log("Error in products.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
} finally {
    if (isset($conn)) {
        mysqli_close($conn);
    }
}
?> 