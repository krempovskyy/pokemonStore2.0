<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set JSON content type
header('Content-Type: application/json; charset=utf-8');

try {
    require_once __DIR__ . '/../includes/config/db.php';

    // Use the global connection
    if (!isset($conn) || !$conn) {
        throw new Exception('Database connection failed');
    }

    // Handle different HTTP methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'POST':
            // Get form data
            $productId = isset($_POST['product_id']) ? (int)$_POST['product_id'] : null;
            $quantity = isset($_POST['quantity']) ? (int)$_POST['quantity'] : 1;
            $size = isset($_POST['size']) ? $_POST['size'] : null;
            $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;

            // Validate data
            if (!$productId) {
                throw new Exception('Product ID is required');
            }

            // Check if product exists and has enough stock
            $stmt = mysqli_prepare($conn, "SELECT * FROM products WHERE id = ?");
            mysqli_stmt_bind_param($stmt, "i", $productId);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $product = mysqli_fetch_assoc($result);

            if (!$product) {
                throw new Exception('Product not found');
            }

            // Check stock based on product type
            if (strpos($product['category'], 'clothing') !== false) {
                if (!$size) {
                    throw new Exception('Size is required for clothing items');
                }

                // Get sizes from product
                $sizes = json_decode($product['sizes'], true);
                if (!isset($sizes[$size]) || $sizes[$size] < $quantity) {
                    throw new Exception('Selected size is out of stock');
                }
            } else {
                if ($product['stock_quantity'] < $quantity) {
                    throw new Exception('Product is out of stock');
                }
            }

            // If user is logged in, add to database cart
            if ($userId) {
                // Check if item already exists in cart
                $stmt = mysqli_prepare($conn, 
                    "SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND (size = ? OR (size IS NULL AND ? IS NULL))"
                );
                mysqli_stmt_bind_param($stmt, "iiss", $userId, $productId, $size, $size);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                $cartItem = mysqli_fetch_assoc($result);

                if ($cartItem) {
                    // Update quantity
                    $newQuantity = $cartItem['quantity'] + $quantity;
                    $stmt = mysqli_prepare($conn, "UPDATE cart SET quantity = ? WHERE id = ?");
                    mysqli_stmt_bind_param($stmt, "ii", $newQuantity, $cartItem['id']);
                    mysqli_stmt_execute($stmt);
                } else {
                    // Insert new item
                    $stmt = mysqli_prepare($conn, 
                        "INSERT INTO cart (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)"
                    );
                    mysqli_stmt_bind_param($stmt, "iiis", $userId, $productId, $quantity, $size);
                    mysqli_stmt_execute($stmt);
                }

                // Get total cart count
                $stmt = mysqli_prepare($conn, "SELECT SUM(quantity) as count FROM cart WHERE user_id = ?");
                mysqli_stmt_bind_param($stmt, "i", $userId);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                $cartCount = mysqli_fetch_assoc($result)['count'] ?? 0;
            } else {
                // For non-logged in users, store in session
                if (!isset($_SESSION['cart'])) {
                    $_SESSION['cart'] = [];
                }

                $found = false;
                foreach ($_SESSION['cart'] as &$item) {
                    if ($item['product_id'] === $productId && $item['size'] === $size) {
                        $item['quantity'] += $quantity;
                        $found = true;
                        break;
                    }
                }

                if (!$found) {
                    $_SESSION['cart'][] = [
                        'product_id' => $productId,
                        'quantity' => $quantity,
                        'size' => $size
                    ];
                }

                // Calculate cart count from session
                $cartCount = array_reduce($_SESSION['cart'], function($sum, $item) {
                    return $sum + $item['quantity'];
                }, 0);
            }

            echo json_encode([
                'success' => true,
                'message' => 'Product added to cart successfully',
                'cart_count' => $cartCount
            ]);
            break;

        case 'GET':
            // Get user's cart items
            $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
            $items = [];

            if ($userId) {
                // Get items from database
                $stmt = mysqli_prepare($conn, "
                    SELECT c.*, p.name, p.price, p.image, p.category, p.sizes
                    FROM cart c
                    JOIN products p ON c.product_id = p.id
                    WHERE c.user_id = ?
                ");
                mysqli_stmt_bind_param($stmt, "i", $userId);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);

                while ($row = mysqli_fetch_assoc($result)) {
                    $items[] = $row;
                }
            } else {
                // Get items from session
                if (isset($_SESSION['cart'])) {
                    foreach ($_SESSION['cart'] as $item) {
                        $stmt = mysqli_prepare($conn, "SELECT * FROM products WHERE id = ?");
                        mysqli_stmt_bind_param($stmt, "i", $item['product_id']);
                        mysqli_stmt_execute($stmt);
                        $result = mysqli_stmt_get_result($stmt);
                        $product = mysqli_fetch_assoc($result);

                        if ($product) {
                            $items[] = array_merge($product, [
                                'quantity' => $item['quantity'],
                                'size' => $item['size']
                            ]);
                        }
                    }
                }
            }

            echo json_encode([
                'success' => true,
                'data' => $items
            ]);
            break;

        case 'DELETE':
            // Remove item from cart
            $data = json_decode(file_get_contents('php://input'), true);
            $productId = isset($data['product_id']) ? (int)$data['product_id'] : null;
            $size = isset($data['size']) ? $data['size'] : null;
            $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;

            if (!$productId) {
                throw new Exception('Product ID is required');
            }

            if ($userId) {
                // Remove from database
                $stmt = mysqli_prepare($conn, 
                    "DELETE FROM cart WHERE user_id = ? AND product_id = ? AND (size = ? OR (size IS NULL AND ? IS NULL))"
                );
                mysqli_stmt_bind_param($stmt, "iiss", $userId, $productId, $size, $size);
                mysqli_stmt_execute($stmt);
            } else {
                // Remove from session
                if (isset($_SESSION['cart'])) {
                    foreach ($_SESSION['cart'] as $key => $item) {
                        if ($item['product_id'] === $productId && $item['size'] === $size) {
                            unset($_SESSION['cart'][$key]);
                            break;
                        }
                    }
                    $_SESSION['cart'] = array_values($_SESSION['cart']); // Reindex array
                }
            }

            echo json_encode([
                'success' => true,
                'message' => 'Item removed from cart successfully'
            ]);
            break;

        case 'PUT':
            // Update cart item quantity
            $data = json_decode(file_get_contents('php://input'), true);
            $productId = isset($data['product_id']) ? (int)$data['product_id'] : null;
            $quantity = isset($data['quantity']) ? (int)$data['quantity'] : null;
            $size = isset($data['size']) ? $data['size'] : null;
            $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;

            if (!$productId || !$quantity) {
                throw new Exception('Product ID and quantity are required');
            }

            if ($userId) {
                // Update in database
                $stmt = mysqli_prepare($conn, 
                    "UPDATE cart SET quantity = ? 
                     WHERE user_id = ? AND product_id = ? AND (size = ? OR (size IS NULL AND ? IS NULL))"
                );
                mysqli_stmt_bind_param($stmt, "iiiss", $quantity, $userId, $productId, $size, $size);
                mysqli_stmt_execute($stmt);
            } else {
                // Update in session
                if (isset($_SESSION['cart'])) {
                    foreach ($_SESSION['cart'] as &$item) {
                        if ($item['product_id'] === $productId && $item['size'] === $size) {
                            $item['quantity'] = $quantity;
                            break;
                        }
                    }
                }
            }

            echo json_encode([
                'success' => true,
                'message' => 'Cart item quantity updated successfully'
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log("Error in cart.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    if (isset($conn)) {
        mysqli_close($conn);
    }
} 