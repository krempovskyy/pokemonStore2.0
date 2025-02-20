<?php
session_start();

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

// Set JSON content type
header('Content-Type: application/json');

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('User not logged in');
    }

    require_once __DIR__ . '/../config/db.php';

    // Get user ID from session
    $userId = (int)$_SESSION['user_id'];

    // Start transaction
    mysqli_begin_transaction($conn);

    try {
        // Get cart items
        $stmt = mysqli_prepare($conn, "
            SELECT c.*, p.price, p.name
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        ");
        mysqli_stmt_bind_param($stmt, "i", $userId);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        $cartItems = [];
        $subtotal = 0;
        
        while ($item = mysqli_fetch_assoc($result)) {
            $cartItems[] = $item;
            $subtotal += $item['price'] * $item['quantity'];
        }

        if (empty($cartItems)) {
            throw new Exception('Cart is empty');
        }

        // Get user's address
        $stmt = mysqli_prepare($conn, "SELECT address FROM users WHERE id = ?");
        mysqli_stmt_bind_param($stmt, "i", $userId);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $user = mysqli_fetch_assoc($result);

        // Calculate totals
        $shippingFee = 5.00;
        $totalAmount = $subtotal + $shippingFee;

        // Generate order number
        $orderNumber = 'ORD' . date('Ymd') . rand(1000, 9999);

        // Create order
        $stmt = mysqli_prepare($conn, "
            INSERT INTO orders (
                user_id, order_number, subtotal, shipping_fee, 
                total_amount, shipping_address, status, 
                payment_method, payment_status
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 'credit_card', 'paid')
        ");
        mysqli_stmt_bind_param($stmt, "isddds", 
            $userId, $orderNumber, $subtotal, $shippingFee, 
            $totalAmount, $user['address']
        );
        mysqli_stmt_execute($stmt);
        $orderId = mysqli_insert_id($conn);

        // Create order items
        foreach ($cartItems as $item) {
            $stmt = mysqli_prepare($conn, "
                INSERT INTO order_items (
                    order_id, product_id, quantity, 
                    price, size
                ) VALUES (?, ?, ?, ?, ?)
            ");
            mysqli_stmt_bind_param($stmt, "iiids", 
                $orderId, $item['product_id'], $item['quantity'], 
                $item['price'], $item['size']
            );
            mysqli_stmt_execute($stmt);

            // Update product stock
            if ($item['size']) {
                // For clothing items, update size stock
                $stmt = mysqli_prepare($conn, "SELECT sizes FROM products WHERE id = ?");
                mysqli_stmt_bind_param($stmt, "i", $item['product_id']);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                $product = mysqli_fetch_assoc($result);
                
                $sizes = json_decode($product['sizes'], true);
                if (isset($sizes[$item['size']])) {
                    $sizes[$item['size']] -= $item['quantity'];
                }
                
                $sizesJson = json_encode($sizes);
                $stmt = mysqli_prepare($conn, "UPDATE products SET sizes = ? WHERE id = ?");
                mysqli_stmt_bind_param($stmt, "si", $sizesJson, $item['product_id']);
                mysqli_stmt_execute($stmt);
            } else {
                // For non-clothing items, update general stock
                $stmt = mysqli_prepare($conn, "
                    UPDATE products 
                    SET stock_quantity = stock_quantity - ? 
                    WHERE id = ?
                ");
                mysqli_stmt_bind_param($stmt, "ii", $item['quantity'], $item['product_id']);
                mysqli_stmt_execute($stmt);
            }
        }

        // Clear user's cart
        $stmt = mysqli_prepare($conn, "DELETE FROM cart WHERE user_id = ?");
        mysqli_stmt_bind_param($stmt, "i", $userId);
        mysqli_stmt_execute($stmt);

        // Commit transaction
        mysqli_commit($conn);

        echo json_encode([
            'success' => true,
            'message' => 'Order placed successfully',
            'data' => [
                'order_id' => $orderId,
                'order_number' => $orderNumber
            ]
        ]);

    } catch (Exception $e) {
        mysqli_rollback($conn);
        throw $e;
    }

} catch (Exception $e) {
    error_log("Checkout error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        mysqli_close($conn);
    }
} 