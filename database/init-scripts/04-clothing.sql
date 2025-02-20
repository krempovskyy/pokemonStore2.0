-- Insert men's clothing
INSERT INTO products (name, price, description, category, image, gallery, sizes, stock_quantity, status) VALUES
('Pokemon Hoodie - Men', 49.99, 'Comfortable and stylish Pokemon-themed hoodie for men. Features a large Pikachu design on the front.', 'clothing-men', 'Images/HOODIE MAN.png', 
 JSON_ARRAY('Images/HOODIE MAN.png'), 
 JSON_OBJECT('S', 10, 'M', 15, 'L', 10, 'XL', 10, 'XXL', 5), 
 50, 'in_stock'),

('Pokemon Jacket - Men', 59.99, 'Lightweight jacket with Pokemon design. Perfect for casual wear.', 'clothing-men', 'Images/JACKET MAN.png',
 JSON_ARRAY('Images/JACKET MAN.png'),
 JSON_OBJECT('S', 5, 'M', 10, 'L', 8, 'XL', 5, 'XXL', 2),
 30, 'in_stock'),

('Pokemon T-Shirt - Men', 24.99, 'Classic fit t-shirt with Pokemon print. Made from 100% cotton.', 'clothing-men', 'Images/T SHIRT MEN.png',
 JSON_ARRAY('Images/T SHIRT MEN.png'),
 JSON_OBJECT('S', 20, 'M', 25, 'L', 25, 'XL', 20, 'XXL', 10),
 100, 'in_stock'),

('Pokemon Sweater - Men', 54.99, 'Warm and cozy sweater with Pokemon design. Perfect for cold weather.', 'clothing-men', 'Images/SWEATER MAN.png',
 JSON_ARRAY('Images/SWEATER MAN.png'),
 JSON_OBJECT('S', 8, 'M', 12, 'L', 10, 'XL', 7, 'XXL', 3),
 40, 'in_stock'),

-- Insert women's clothing
('Pokemon Crop Top', 26.99, 'Stylish crop top with cute Pokemon design. Perfect for summer.', 'clothing-women', 'Images/CROP TOP.png',
 JSON_ARRAY('Images/CROP TOP.png'),
 JSON_OBJECT('XS', 12, 'S', 15, 'M', 20, 'L', 13),
 60, 'in_stock'),

('Pokemon Tank Top', 29.99, 'Comfortable tank top with Pokemon print. Great for casual wear or workout.', 'clothing-women', 'Images/TANK TOP.png',
 JSON_ARRAY('Images/TANK TOP.png'),
 JSON_OBJECT('XS', 8, 'S', 12, 'M', 15, 'L', 8, 'XL', 2),
 45, 'in_stock'),

('Pokemon Hoodie - Women', 49.99, 'Cozy hoodie with cute Pokemon design. Features a soft inner lining.', 'clothing-women', 'Images/HOODIE WOMAN.png',
 JSON_ARRAY('Images/HOODIE WOMAN.png'),
 JSON_OBJECT('XS', 10, 'S', 12, 'M', 15, 'L', 10, 'XL', 3),
 50, 'in_stock'),

-- Insert unisex clothing & accessories
('Pokemon Cap', 19.99, 'Adjustable cap with embroidered Pokemon logo. One size fits most.', 'clothing-unisex', 'Images/UNI HAT.png',
 JSON_ARRAY('Images/UNI HAT.png'),
 JSON_ARRAY('One Size'),
 80, 'in_stock'),

('Pokemon Gloves', 14.99, 'Warm and comfortable gloves with Pokemon design. Available in multiple sizes.', 'clothing-unisex', 'Images/GLOVES UNI.png',
 JSON_ARRAY('Images/GLOVES UNI.png'),
 JSON_OBJECT('S/M', 35, 'L/XL', 35),
 70, 'in_stock'),

-- Insert accessories
('Pokemon Tote Bag', 29.99, 'Spacious tote bag with Pokemon print. Perfect for shopping or daily use.', 'accessories', 'Images/TOTE.png',
 JSON_ARRAY('Images/TOTE.png'),
 NULL,
 100, 'in_stock'),

('Pokemon Earbuds Case', 19.99, 'Protective case for earbuds with cute Pokemon design. Compatible with most wireless earbuds.', 'accessories', 'Images/CASE EARBUDS.png',
 JSON_ARRAY('Images/CASE EARBUDS.png'),
 NULL,
 120, 'in_stock'),

('Pokemon Phone Case', 24.99, 'Shock-resistant phone case with Pokemon design. Available for various iPhone models.', 'accessories', 'Images/SHOCK CASE.png',
 JSON_ARRAY('Images/SHOCK CASE.png'),
 JSON_OBJECT('iPhone 13', 50, 'iPhone 14', 50, 'iPhone 15', 50),
 150, 'in_stock'); 