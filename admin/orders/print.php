<?php
include '../includes/auth.php';
checkAuth();

// TODO: Get order ID from URL parameter
$orderId = isset($_GET['id']) ? $_GET['id'] : null;

// TODO: Fetch order details from database
$order = [
    'id' => 'ORD-2024-001',
    'date' => '2024-02-20 15:30:00',
    'customer' => [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '(555) 123-4567',
        'address' => [
            'street' => '123 Pokemon Street',
            'city' => 'Pallet Town',
            'state' => 'KT',
            'zip' => '12345',
            'country' => 'United States'
        ]
    ],
    'items' => [
        [
            'name' => 'Pikachu Plush Toy',
            'quantity' => 2,
            'price' => 24.99,
            'total' => 49.98
        ],
        [
            'name' => 'Pokemon Trading Cards Pack',
            'quantity' => 1,
            'price' => 39.99,
            'total' => 39.99
        ]
    ],
    'subtotal' => 89.97,
    'shipping' => 5.99,
    'total' => 95.96,
    'status' => 'Processing'
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Invoice #<?php echo $order['id']; ?> - Pokemon Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        @media print {
            @page {
                size: A4;
                margin: 10mm;
            }
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print {
                display: none !important;
            }
        }
        
        body {
            background: #fff;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .invoice-header {
            border-bottom: 2px solid #dee2e6;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
        }
        
        .company-logo {
            max-height: 60px;
            width: auto;
        }
        
        .invoice-title {
            font-size: 2rem;
            color: #333;
            margin: 0;
        }
        
        .invoice-details {
            margin-bottom: 2rem;
        }
        
        .customer-details, .shipping-details {
            margin-bottom: 2rem;
        }
        
        .section-title {
            color: #666;
            border-bottom: 1px solid #eee;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .table th {
            background-color: #f8f9fa;
        }
        
        .table-totals {
            width: 100%;
            max-width: 400px;
            margin-left: auto;
            margin-top: 2rem;
        }
        
        .table-totals td {
            padding: 0.5rem;
        }
        
        .table-totals td:last-child {
            text-align: right;
            font-weight: 500;
        }
        
        .grand-total {
            font-size: 1.2rem;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
        }

        .print-button {
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 1000;
        }

        .status-badge {
            font-size: 0.9rem;
            padding: 0.5em 1em;
            border-radius: 20px;
        }
        
        .status-processing {
            background-color: #fff3cd;
            color: #856404;
        }
    </style>
</head>
<body>
    <button onclick="window.print()" class="btn btn-primary print-button no-print">
        <i class="fas fa-print"></i> Print Invoice
    </button>

    <div class="invoice-container">
        <div class="invoice-header">
            <div class="row align-items-center">
                <div class="col-6">
                    <img src="/images/logo.png" alt="Pokemon Store" class="company-logo">
                </div>
                <div class="col-6 text-end">
                    <h1 class="invoice-title">INVOICE</h1>
                    <p class="mb-0">#<?php echo $order['id']; ?></p>
                    <span class="status-badge status-<?php echo strtolower($order['status']); ?>">
                        <?php echo $order['status']; ?>
                    </span>
                </div>
            </div>
        </div>

        <div class="invoice-details row">
            <div class="col-sm-6">
                <div class="customer-details">
                    <h5 class="section-title">Bill To</h5>
                    <p class="mb-1"><strong><?php echo $order['customer']['name']; ?></strong></p>
                    <p class="mb-1"><?php echo $order['customer']['email']; ?></p>
                    <p class="mb-1"><?php echo $order['customer']['phone']; ?></p>
                </div>
            </div>
            <div class="col-sm-6">
                <div class="shipping-details">
                    <h5 class="section-title">Ship To</h5>
                    <p class="mb-1"><?php echo $order['customer']['address']['street']; ?></p>
                    <p class="mb-1">
                        <?php echo $order['customer']['address']['city']; ?>,
                        <?php echo $order['customer']['address']['state']; ?>
                        <?php echo $order['customer']['address']['zip']; ?>
                    </p>
                    <p class="mb-1"><?php echo $order['customer']['address']['country']; ?></p>
                </div>
            </div>
        </div>

        <div class="order-items">
            <h5 class="section-title">Order Items</h5>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th class="text-center">Quantity</th>
                        <th class="text-end">Price</th>
                        <th class="text-end">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($order['items'] as $item): ?>
                    <tr>
                        <td><?php echo $item['name']; ?></td>
                        <td class="text-center"><?php echo $item['quantity']; ?></td>
                        <td class="text-end">$<?php echo number_format($item['price'], 2); ?></td>
                        <td class="text-end">$<?php echo number_format($item['total'], 2); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <table class="table-totals">
                <tr>
                    <td>Subtotal:</td>
                    <td>$<?php echo number_format($order['subtotal'], 2); ?></td>
                </tr>
                <tr>
                    <td>Shipping:</td>
                    <td>$<?php echo number_format($order['shipping'], 2); ?></td>
                </tr>
                <tr class="grand-total">
                    <td>Total:</td>
                    <td>$<?php echo number_format($order['total'], 2); ?></td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p class="mb-0">Thank you for shopping with Pokemon Store!</p>
            <p class="mb-0">For any questions, please contact us at support@pokemonstore.com</p>
        </div>
    </div>

    <script>
        // Auto print when the page loads (optional)
        // window.onload = function() {
        //     window.print();
        // };
    </script>
</body>
</html> 