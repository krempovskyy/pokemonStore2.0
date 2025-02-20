-- Insert plush toys
INSERT INTO products (name, price, description, category, image, gallery, sizes, stock_quantity, status) VALUES
('Pikachu Plush', 24.99, 'Adorable Pikachu plush toy, perfect for Pokemon fans of all ages. Super soft and huggable!', 'plush', 'Images/pikachu-cos-mario.jpg', 
 JSON_ARRAY('Images/pikachu-cos-mario.jpg'), NULL, 100, 'in_stock'),

('Snorlax Plush', 29.99, 'Large and cuddly Snorlax plush toy. Perfect for naps and display!', 'plush', 'Images/snorlax-burger.jpg',
 JSON_ARRAY('Images/snorlax-burger.jpg'), NULL, 50, 'in_stock'),

('Charizard Plush', 34.99, 'Fierce and detailed Charizard plush toy. Features detailed wings and flame-tipped tail.', 'plush', 'Images/charizard-family.jpg',
 JSON_ARRAY('Images/charizard-family.jpg'), NULL, 30, 'in_stock'),

('Squirtle Plush', 24.99, 'Cute and collectible Squirtle plush toy. Perfect size for carrying around!', 'plush', 'Images/squirtle.jpg',
 JSON_ARRAY('Images/squirtle.jpg'), NULL, 75, 'in_stock'),

('Bulbasaur Plush', 24.99, 'Adorable Bulbasaur plush with detailed features. Great for any Pokemon collection!', 'plush', 'Images/bulbasaur-family.jpg',
 JSON_ARRAY('Images/bulbasaur-family.jpg'), NULL, 75, 'in_stock'),

-- Insert Pokemon cards
('Mewtwo GX Card', 49.99, 'Rare Mewtwo GX Pokemon card. Perfect for collectors and players alike.', 'cards', 'Images/mewtwo.jpg',
 JSON_ARRAY('Images/mewtwo.jpg'), NULL, 20, 'in_stock'),

('Rayquaza V Card', 39.99, 'Powerful Rayquaza V card with stunning artwork. A must-have for any collection.', 'cards', 'Images/Rayquaza.jpg',
 JSON_ARRAY('Images/Rayquaza.jpg'), NULL, 25, 'in_stock'),

('Mimikyu Card Set', 29.99, 'Special set of Mimikyu cards including rare holofoil variants.', 'cards', 'Images/Mimikyu.jpg',
 JSON_ARRAY('Images/Mimikyu.jpg'), NULL, 40, 'in_stock'),

('Gyarados EX Card', 44.99, 'Rare Gyarados EX card with dynamic artwork. Perfect for competitive play.', 'cards', 'Images/Gyarados.jpg',
 JSON_ARRAY('Images/Gyarados.jpg'), NULL, 15, 'in_stock'),

('Dragonite V Card', 34.99, 'Powerful Dragonite V card with beautiful illustration. Great addition to any collection.', 'cards', 'Images/Dragonite.jpg',
 JSON_ARRAY('Images/Dragonite.jpg'), NULL, 30, 'in_stock'); 