-- Insert sample orders
INSERT INTO orders (user_id, order_number, subtotal, shipping_fee, total_amount, shipping_address, status, payment_method, payment_status) VALUES
(2, 'ORD-2024-001', 74.98, 5.00, 79.98, '123 Main St, City, Country', 'delivered', 'credit_card', 'paid'),
(2, 'ORD-2024-002', 109.97, 5.00, 114.97, '123 Main St, City, Country', 'processing', 'paypal', 'paid'),
(3, 'ORD-2024-003', 49.99, 5.00, 54.99, '456 Oak St, City, Country', 'shipped', 'credit_card', 'paid'),
(4, 'ORD-2024-004', 89.98, 5.00, 94.98, '789 Pine St, City, Country', 'pending', 'bank_transfer', 'pending');

-- Insert order items
-- Note: Product IDs are based on the sequence of inserts:
-- 1-5: Plush toys
-- 6-10: Pokemon cards
-- 11-14: Men's clothing
-- 15-17: Women's clothing
-- 18-19: Unisex clothing
-- 20-22: Accessories

INSERT INTO order_items (order_id, product_id, quantity, price, size) VALUES
-- Order 1 items (Pikachu Plush and Squirtle Plush)
(1, 1, 2, 24.99, NULL),  -- Pikachu Plush
(1, 4, 1, 24.99, NULL),  -- Squirtle Plush

-- Order 2 items (Pokemon Hoodie - Men and Pokemon Cap)
(2, 11, 1, 49.99, 'L'),  -- Pokemon Hoodie - Men
(2, 18, 1, 19.99, 'One Size'),  -- Pokemon Cap

-- Order 3 items (Pokemon Crop Top)
(3, 15, 1, 26.99, 'M'),  -- Pokemon Crop Top

-- Order 4 items (Pokemon T-Shirt - Men and Pokemon Gloves)
(4, 13, 2, 24.99, 'XL'),  -- Pokemon T-Shirt - Men
(4, 19, 1, 14.99, 'L/XL');  -- Pokemon Gloves

-- Insert sample cart items
INSERT INTO cart (user_id, product_id, quantity, size) VALUES
(2, 1, 1, NULL),      -- Pikachu Plush
(2, 11, 1, 'M'),      -- Pokemon Hoodie - Men
(3, 15, 2, 'S'),      -- Pokemon Crop Top
(4, 18, 1, 'One Size'); -- Pokemon Cap 