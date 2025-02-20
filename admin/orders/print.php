<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

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
    $conn = getDBConnection();
    if (!$conn) {
        error_log("Error: Failed to get database connection");
        die('Database connection failed');
    }
    error_log("Database connection successful");

    // Get order details with customer information
    error_log("Fetching order details for order ID: " . $orderId);
    $query = "
        SELECT o.*, CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email as customer_email, u.phone as customer_phone
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
    ";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "i", $orderId);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $order = mysqli_fetch_assoc($result);
    
    error_log("Order query executed. Result: " . ($order ? "Order found" : "Order not found"));

    if (!$order) {
        error_log("Error: Order not found for ID: " . $orderId);
        die('Order not found');
    }

    // Get order items
    error_log("Fetching order items...");
    $query = "
        SELECT oi.*, p.name as product_name, p.image as product_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    ";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "i", $orderId);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $orderItems = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $orderItems[] = $row;
    }
    
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
            font-family: 'Arial', sans-serif;
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
            max-width: 150px;
            height: auto;
            margin-bottom: 20px;
        }
        .invoice-header {
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
        }
        .invoice-title {
            color: #333;
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            display: inline-block;
            margin-top: 10px;
        }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-processing { background: #cce5ff; color: #004085; }
        .status-shipped { background: #d1ecf1; color: #0c5460; }
        .status-delivered { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        
        .customer-info {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .customer-info h5 {
            color: #333;
            margin-bottom: 15px;
            font-weight: bold;
        }
        .customer-info p {
            margin-bottom: 8px;
            color: #555;
        }
        
        .table {
            margin-bottom: 30px;
        }
        .table th {
            background: #f8f9fa;
            color: #333;
            font-weight: bold;
            border-bottom: 2px solid #dee2e6;
        }
        .table td {
            vertical-align: middle;
            color: #555;
        }
        .table tfoot tr:first-child td {
            border-top: 2px solid #dee2e6;
        }
        .table tfoot td {
            font-weight: bold;
            color: #333;
        }
        
        .payment-info {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .payment-info p {
            margin-bottom: 8px;
            color: #555;
        }
        
        .thank-you {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 16px;
            font-style: italic;
        }
        
        .print-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 1000;
        }
        .print-button:hover {
            background: #0056b3;
        }
        .print-button i {
            font-size: 18px;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .invoice-container {
                box-shadow: none;
                padding: 20px;
                max-width: 100%;
            }
            .print-button {
                display: none;
            }
            .table th {
                background-color: #f8f9fa !important;
            }
            .customer-info, .payment-info {
                background-color: #f8f9fa !important;
            }
        }
    </style>
</head>
<body>
    <button onclick="window.print()" class="print-button">
        <i class="fas fa-print"></i> Print Invoice
    </button>
    
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="row">
                <div class="col-6">
                    <img src="/images/logo.png" alt="Pokemon Store Logo" class="company-logo">
                    <div class="company-info">
                        <h4>Pokemon Store</h4>
                        <p>123 Pokemon Street<br>
                        Pallet Town, KT 12345<br>
                        United States<br>
                        Email: support@pokemonstore.com<br>
                        Phone: (555) 123-4567</p>
                    </div>
                </div>
                <div class="col-6 text-end">
                    <h1 class="invoice-title">INVOICE</h1>
                    <p><strong>Invoice #:</strong> INV-<?php echo htmlspecialchars($order['order_number']); ?></p>
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
                    <h5>BILL TO</h5>
                    <p><strong><?php echo htmlspecialchars($order['customer_name']); ?></strong></p>
                    <p>Email: <?php echo htmlspecialchars($order['customer_email']); ?></p>
                    <p>Phone: <?php echo htmlspecialchars($order['customer_phone']); ?></p>
                </div>
                <div class="col-6">
                    <h5>SHIP TO</h5>
                    <p><strong>Shipping Address:</strong><br>
                    <?php echo nl2br(htmlspecialchars($order['shipping_address'])); ?></p>
                </div>
            </div>
        </div>

        <div class="order-items">
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 50%">Item Description</th>
                        <th class="text-center" style="width: 15%">Quantity</th>
                        <th class="text-end" style="width: 15%">Unit Price</th>
                        <th class="text-end" style="width: 20%">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($orderItems as $item): ?>
                        <tr>
                            <td>
                                <strong><?php echo htmlspecialchars($item['product_name']); ?></strong>
                                <?php if (!empty($item['size'])): ?>
                                    <br><small class="text-muted">Size: <?php echo htmlspecialchars($item['size']); ?></small>
                                <?php endif; ?>
                            </td>
                            <td class="text-center"><?php echo $item['quantity']; ?></td>
                            <td class="text-end"><?php echo formatCurrency($item['price']); ?></td>
                            <td class="text-end"><?php echo formatCurrency($item['price'] * $item['quantity']); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="text-end">Subtotal:</td>
                        <td class="text-end"><?php echo formatCurrency($order['subtotal']); ?></td>
                    </tr>
                    <tr>
                        <td colspan="3" class="text-end">Shipping Fee:</td>
                        <td class="text-end"><?php echo formatCurrency($order['shipping_fee']); ?></td>
                    </tr>
                    <tr>
                        <td colspan="3" class="text-end"><strong>Total Amount:</strong></td>
                        <td class="text-end"><strong><?php echo formatCurrency($order['total_amount']); ?></strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="payment-info">
            <div class="row">
                <div class="col-6">
                    <h5>PAYMENT INFORMATION</h5>
                    <p><strong>Method:</strong> <?php echo ucfirst(str_replace('_', ' ', $order['payment_method'])); ?></p>
                    <p><strong>Status:</strong> <?php echo ucfirst($order['payment_status']); ?></p>
                </div>
                <div class="col-6">
                    <h5>ORDER NOTES</h5>
                    <p><?php echo !empty($order['notes']) ? htmlspecialchars($order['notes']) : 'No additional notes'; ?></p>
                </div>
            </div>
        </div>

        <div class="thank-you">
            <p>Thank you for shopping with Pokemon Store!</p>
        </div>
    </div>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</body>
</html>
<?php
} catch (Exception $e) {
    error_log("Error in print.php: " . $e->getMessage());
    die('An error occurred while generating the invoice.');
}
?> 