<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

error_log("Print.php started - Request received for order print");
error_log("GET parameters: " . print_r($_GET, true));

include '../includes/auth.php';

try {
    error_log("Checking authentication...");
    checkAuth();
    error_log("Authentication check passed");

    // Get order ID from query string
    $orderId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    error_log("Order ID from request: " . $orderId);

    if (!$orderId) {
        error_log("Error: No order ID provided");
        die('Order ID is required');
    }

    // Get database connection
    error_log("Getting database connection...");
    $pdo = getDBConnection();
    if (!$pdo) {
        error_log("Error: Failed to get database connection");
        die('Database connection failed');
    }
    error_log("Database connection successful");

    // Get order details with customer information
    error_log("Fetching order details for order ID: " . $orderId);
    $stmt = $pdo->prepare("
        SELECT o.*, CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email as customer_email, u.phone as customer_phone
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
    ");
    $stmt->execute([$orderId]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    error_log("Order query executed. Result: " . ($order ? "Order found" : "Order not found"));
    error_log("Order data: " . print_r($order, true));

    if (!$order) {
        error_log("Error: Order not found for ID: " . $orderId);
        die('Order not found');
    }

    // Get order items
    error_log("Fetching order items...");
    $stmt = $pdo->prepare("
        SELECT oi.*, p.name as product_name, p.image as product_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    ");
    $stmt->execute([$orderId]);
    $orderItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Order items found: " . count($orderItems));
    error_log("Order items data: " . print_r($orderItems, true));

    // Format date
    function formatDate($date) {
        return date('M d, Y h:i A', strtotime($date));
    }

    // Format currency
    function formatCurrency($amount) {
        return '$' . number_format($amount, 2);
    }

    error_log("Starting to render HTML template...");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Invoice #<?php echo htmlspecialchars($order['order_number']); ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: #f8f9fa;
            padding: 20px;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .company-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 20px;
        }
        .invoice-header {
            margin-bottom: 40px;
        }
        .invoice-title {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-processing { background: #cce5ff; color: #004085; }
        .status-shipped { background: #d1ecf1; color: #0c5460; }
        .status-delivered { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        .customer-info {
            margin-bottom: 40px;
        }
        .table th {
            background: #f8f9fa;
        }
        .total-section {
            margin-top: 20px;
        }
        .thank-you {
            margin-top: 40px;
            text-align: center;
            color: #666;
        }
        .print-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .print-button:hover {
            background: #0056b3;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .invoice-container {
                box-shadow: none;
                padding: 20px;
            }
            .print-button {
                display: none;
            }
        }
    </style>
</head>
<body>
    <?php error_log("Starting to render invoice content..."); ?>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="row">
                <div class="col-6">
                    <img src="/images/logo.png" alt="Pokemon Store Logo" class="company-logo">
                    <div class="company-info">
                        <p>Pokemon Store</p>
                        <p>123 Pokemon Street</p>
                        <p>Pallet Town, KT 12345</p>
                        <p>United States</p>
                    </div>
                </div>
                <div class="col-6 text-end">
                    <h1 class="invoice-title">Invoice</h1>
                    <p><strong>Order #:</strong> <?php echo htmlspecialchars($order['order_number']); ?></p>
                    <p><strong>Date:</strong> <?php echo formatDate($order['created_at']); ?></p>
                    <p>
                        <span class="status-badge status-<?php echo $order['status']; ?>">
                            <?php echo ucfirst($order['status']); ?>
                        </span>
                    </p>
                </div>
            </div>
        </div>

        <div class="customer-info">
            <div class="row">
                <div class="col-6">
                    <h5>Bill To:</h5>
                    <p><strong>Name:</strong> <?php echo htmlspecialchars($order['customer_name']); ?></p>
                    <p><strong>Email:</strong> <?php echo htmlspecialchars($order['customer_email']); ?></p>
                    <p><strong>Phone:</strong> <?php echo htmlspecialchars($order['customer_phone']); ?></p>
                </div>
                <div class="col-6">
                    <h5>Ship To:</h5>
                    <p><?php echo nl2br(htmlspecialchars($order['shipping_address'])); ?></p>
                </div>
            </div>
        </div>

        <div class="order-items">
            <table class="table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th class="text-center">Quantity</th>
                        <th class="text-end">Price</th>
                        <th class="text-end">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($orderItems as $item): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($item['product_name']); ?></td>
                            <td class="text-center"><?php echo $item['quantity']; ?></td>
                            <td class="text-end"><?php echo formatCurrency($item['price']); ?></td>
                            <td class="text-end"><?php echo formatCurrency($item['price'] * $item['quantity']); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="text-end"><strong>Subtotal:</strong></td>
                        <td class="text-end"><?php echo formatCurrency($order['subtotal']); ?></td>
                    </tr>
                    <tr>
                        <td colspan="3" class="text-end"><strong>Shipping Fee:</strong></td>
                        <td class="text-end"><?php echo formatCurrency($order['shipping_fee']); ?></td>
                    </tr>
                    <tr>
                        <td colspan="3" class="text-end"><strong>Total:</strong></td>
                        <td class="text-end"><strong><?php echo formatCurrency($order['total_amount']); ?></strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="payment-info">
            <p><strong>Payment Method:</strong> <?php echo ucfirst(str_replace('_', ' ', $order['payment_method'])); ?></p>
            <p><strong>Payment Status:</strong> <?php echo ucfirst($order['payment_status']); ?></p>
        </div>

        <div class="thank-you">
            <h5>Thank you for your business!</h5>
            <p>If you have any questions about this invoice, please contact us:</p>
            <p>Email: support@pokemon-store.com | Phone: (555) 123-4567</p>
        </div>
    </div>

    <button class="print-button" onclick="window.print()">
        <i class="fas fa-print"></i> Print Invoice
    </button>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/js/all.min.js"></script>
    <?php error_log("Finished rendering invoice template"); ?>
</body>
</html>
<?php
} catch (Exception $e) {
    error_log("Critical error in print.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    die('An error occurred while generating the invoice. Please check the error logs.');
}
?> 