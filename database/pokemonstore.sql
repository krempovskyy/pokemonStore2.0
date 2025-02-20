-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Feb 19, 2025 at 10:15 PM
-- Server version: 8.0.41
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pokemonstore`
--
CREATE DATABASE IF NOT EXISTS `pokemonstore` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `pokemonstore`;

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
CREATE TABLE IF NOT EXISTS `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `size` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `cart`
--

TRUNCATE TABLE `cart`;
-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_number` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `shipping_fee` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_address` text COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `payment_method` enum('credit_card','paypal','bank_transfer') COLLATE utf8mb4_general_ci NOT NULL,
  `payment_status` enum('pending','paid','failed') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `orders`
--

TRUNCATE TABLE `orders`;
--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `order_number`, `subtotal`, `shipping_fee`, `total_amount`, `shipping_address`, `status`, `payment_method`, `payment_status`, `created_at`, `updated_at`) VALUES
(1, 2, '001', 149.97, 10.00, 159.97, '123 Main St, New York, NY 10001', 'processing', 'credit_card', 'pending', '2025-02-19 16:58:14', '2025-02-19 17:10:56'),
(2, 3, '002', 89.98, 10.00, 99.98, '456 Oak Ave, Los Angeles, CA 90001', 'processing', 'paypal', 'paid', '2025-02-19 16:58:14', '2025-02-19 17:00:43'),
(3, 4, '003', 199.96, 10.00, 209.96, '789 Pine St, Chicago, IL 60601', 'shipped', 'bank_transfer', 'paid', '2025-02-19 16:58:14', '2025-02-19 17:00:43'),
(4, 2, '004', 59.99, 10.00, 69.99, '123 Main St, New York, NY 10001', 'pending', 'credit_card', 'failed', '2025-02-19 16:58:14', '2025-02-19 19:19:33'),
(5, 3, '005', 299.95, 0.00, 299.95, '456 Oak Ave, Los Angeles, CA 90001', 'cancelled', 'paypal', 'failed', '2025-02-19 16:58:14', '2025-02-19 17:00:43');


-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `size` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `order_items`
--

TRUNCATE TABLE `order_items`;
--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `size`, `created_at`) VALUES
(1, 1, 1, 2, 49.99, NULL, '2025-02-19 16:58:14'),
(2, 1, 3, 1, 49.99, NULL, '2025-02-19 16:58:14'),
(3, 2, 2, 2, 44.99, NULL, '2025-02-19 16:58:14'),
(4, 3, 1, 2, 49.99, NULL, '2025-02-19 16:58:14'),
(5, 3, 26, 2, 49.99, 'L', '2025-02-19 16:58:14'),
(6, 4, 3, 1, 59.99, NULL, '2025-02-19 16:58:14'),
(7, 5, 2, 3, 99.99, NULL, '2025-02-19 16:58:14');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text COLLATE utf8mb4_general_ci NOT NULL,
  `category` enum('plush','cards','accessories','clothing-men','clothing-women','clothing-unisex') COLLATE utf8mb4_general_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `gallery` json DEFAULT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `sizes` json DEFAULT NULL,
  `status` enum('in_stock','out_of_stock') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'out_of_stock',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `products`
--

TRUNCATE TABLE `products`;
--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `description`, `category`, `image`, `gallery`, `stock_quantity`, `sizes`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Pikachu Plush', 29.99, 'Adorable Pikachu plush toy', 'plush', '/Images/pikachu-cos-mario.jpg', NULL, 50, NULL, 'in_stock', '2025-02-19 15:12:03', '2025-02-19 15:12:03'),
(2, 'Charizard Plush', 34.99, 'High-quality Charizard plush', 'plush', '/Images/charizard-family.jpg', NULL, 25, NULL, 'in_stock', '2025-02-19 15:12:38', '2025-02-19 15:12:38'),
(3, 'Snorlax Bean Bag', 49.99, 'Giant Snorlax bean bag chair', 'plush', '/Images/snorlax-burger.jpg', NULL, 15, NULL, 'in_stock', '2025-02-19 15:12:38', '2025-02-19 15:18:47'),
(4, 'Eevee Evolution Set', 89.99, 'Complete set of Eevee evolution plushies', 'plush', '/Images/eevee.jpg', NULL, 10, NULL, 'in_stock', '2025-02-19 15:12:38', '2025-02-19 15:12:38'),
(5, 'Bulbasaur Plush', 24.99, 'Cute Bulbasaur plush', 'plush', '/Images/bulbasaur-family.jpg', NULL, 0, NULL, 'out_of_stock', '2025-02-19 15:12:38', '2025-02-19 15:18:47'),
(6, 'Charizard VMAX', 199.99, 'Rare Charizard VMAX card in mint condition', 'cards', '/Images/mewtwo.jpg', NULL, 5, NULL, 'in_stock', '2025-02-19 15:13:06', '2025-02-19 15:18:54'),
(7, 'Pokemon Booster Pack', 4.99, 'Official Pokemon Trading Card Game booster pack', 'cards', '/Images/Rayquaza.jpg', NULL, 100, NULL, 'in_stock', '2025-02-19 15:13:06', '2025-02-19 15:18:54'),
(8, 'Elite Trainer Box', 39.99, 'Pokemon Trading Card Game Elite Trainer Box', 'cards', '/Images/Gyarados.jpg', NULL, 30, NULL, 'in_stock', '2025-02-19 15:13:06', '2025-02-19 15:18:54'),
(9, 'Rare Card Collection', 299.99, 'Collection of rare Pokemon cards', 'cards', '/Images/Dragonite.jpg', NULL, 3, NULL, 'in_stock', '2025-02-19 15:13:06', '2025-02-19 15:18:54'),
(10, 'Starter Deck Set', 19.99, 'Perfect for beginners', 'cards', '/Images/gengar.jpg', NULL, 0, NULL, 'out_of_stock', '2025-02-19 15:13:06', '2025-02-19 15:18:54'),
(11, 'Pikachu Backpack', 39.99, 'Cute Pikachu-themed backpack', 'accessories', '/Images/TOTE.png', NULL, 25, NULL, 'in_stock', '2025-02-19 15:13:20', '2025-02-19 15:19:00'),
(12, 'Pokemon Wallet', 19.99, 'Stylish Pokemon wallet', 'accessories', '/Images/SHOCK CASE.png', NULL, 40, NULL, 'in_stock', '2025-02-19 15:13:20', '2025-02-19 15:19:00'),
(13, 'Pokeball Phone Case', 14.99, 'Protective phone case', 'accessories', '/Images/CASE EARBUDS.png', NULL, 60, NULL, 'in_stock', '2025-02-19 15:13:20', '2025-02-19 15:19:00'),
(14, 'Pokemon Watch', 29.99, 'Digital Pokemon watch', 'accessories', '/Images/UNI HAT.png', NULL, 8, NULL, 'in_stock', '2025-02-19 15:13:20', '2025-02-19 15:19:00'),
(15, 'Gym Badge Set', 24.99, 'Complete set of Kanto badges', 'accessories', '/Images/GLOVES UNI.png', NULL, 0, NULL, 'out_of_stock', '2025-02-19 15:13:20', '2025-02-19 15:19:00'),
(16, 'Pokemon Trainer Jacket', 59.99, 'Official Pokemon Trainer jacket for men', 'clothing-men', '/Images/JACKET MAN.png', NULL, 20, '{\"L\": {\"status\": \"in_stock\", \"quantity\": 5}, \"M\": {\"status\": \"in_stock\", \"quantity\": 6}, \"S\": {\"status\": \"in_stock\", \"quantity\": 5}, \"XL\": {\"status\": \"in_stock\", \"quantity\": 4}}', 'in_stock', '2025-02-19 15:13:34', '2025-02-19 18:55:54'),
(17, 'Pikachu T-Shirt Men', 24.99, 'Comfortable Pikachu t-shirt for men', 'clothing-men', '/Images/T SHIRT MEN.png', NULL, 45, '{\"L\": {\"status\": \"in_stock\", \"quantity\": 10}, \"M\": {\"status\": \"in_stock\", \"quantity\": 12}, \"S\": {\"status\": \"in_stock\", \"quantity\": 15}, \"XL\": {\"status\": \"in_stock\", \"quantity\": 8}}', 'in_stock', '2025-02-19 15:13:34', '2025-02-19 18:56:00'),
(18, 'Pokemon Hoodie Men', 49.99, 'Stylish Pokemon hoodie for men', 'clothing-men', '/Images/HOODIE MAN.png', NULL, 30, '{\"L\": {\"status\": \"in_stock\", \"quantity\": 7}, \"M\": {\"status\": \"in_stock\", \"quantity\": 10}, \"S\": {\"status\": \"in_stock\", \"quantity\": 8}, \"XL\": {\"status\": \"in_stock\", \"quantity\": 5}}', 'in_stock', '2025-02-19 15:13:34', '2025-02-19 18:56:44'),
(19, 'Gym Leader Cap', 19.99, 'Adjustable Gym Leader cap', 'clothing-men', '/Images/UNI HAT.png', NULL, 5, '{\"ONE_SIZE\": {\"status\": \"in_stock\", \"quantity\": 5}}', 'in_stock', '2025-02-19 15:13:34', '2025-02-19 18:56:13'),
(20, 'Pokemon Socks Set Men', 14.99, 'Set of 5 Pokemon socks for men', 'clothing-men', '/Images/SWEATER MAN.png', NULL, 0, '{\"L\": {\"status\": \"out_of_stock\", \"quantity\": 0}, \"M\": {\"status\": \"out_of_stock\", \"quantity\": 0}, \"S\": {\"status\": \"out_of_stock\", \"quantity\": 0}}', 'out_of_stock', '2025-02-19 15:13:34', '2025-02-19 18:56:20'),
(22, 'Pikachu T-Shirt Women', 24.99, 'Fitted Pikachu t-shirt for women', 'clothing-women', '/Images/TANK TOP.png', NULL, 35, '{\"L\": {\"status\": \"in_stock\", \"quantity\": 7}, \"M\": {\"status\": \"in_stock\", \"quantity\": 10}, \"S\": {\"status\": \"in_stock\", \"quantity\": 8}, \"XL\": {\"status\": \"in_stock\", \"quantity\": 5}}', 'in_stock', '2025-02-19 15:13:47', '2025-02-19 18:56:44'),
(23, 'Pokemon Hoodie Women', 49.99, 'Comfortable Pokemon hoodie for women', 'clothing-women', '/Images/HOODIE WOMAN.png', NULL, 25, '{\"L\": {\"status\": \"in_stock\", \"quantity\": 7}, \"M\": {\"status\": \"in_stock\", \"quantity\": 10}, \"S\": {\"status\": \"in_stock\", \"quantity\": 8}, \"XL\": {\"status\": \"in_stock\", \"quantity\": 5}}', 'in_stock', '2025-02-19 15:13:47', '2025-02-19 18:56:44'),
(24, 'Eevee Scarf', 29.99, 'Stylish Eevee scarf', 'clothing-women', '/Images/TOTE.png', NULL, 7, '{\"ONE_SIZE\": {\"status\": \"in_stock\", \"quantity\": 5}}', 'in_stock', '2025-02-19 15:13:47', '2025-02-19 18:56:13'),
(25, 'Pokemon Socks Set Women', 14.99, 'Set of 5 Pokemon socks for women', 'clothing-women', '/Images/GLOVES UNI.png', NULL, 0, '{\"L\": {\"status\": \"out_of_stock\", \"quantity\": 0}, \"M\": {\"status\": \"out_of_stock\", \"quantity\": 0}, \"S\": {\"status\": \"out_of_stock\", \"quantity\": 0}}', 'out_of_stock', '2025-02-19 15:13:47', '2025-02-19 18:56:20'),
(26, 'Pokemon Baseball Jersey', 44.99, 'Unisex Pokemon baseball jersey', 'clothing-unisex', '/Images/SWEATER MAN.png', NULL, 40, '{\"L\": {\"status\": \"in_stock\", \"quantity\": 10}, \"M\": {\"status\": \"in_stock\", \"quantity\": 10}, \"S\": {\"status\": \"in_stock\", \"quantity\": 12}, \"XL\": {\"status\": \"in_stock\", \"quantity\": 8}}', 'in_stock', '2025-02-19 15:14:03', '2025-02-19 18:56:27'),
(27, 'Team Rocket Shirt', 29.99, 'Classic Team Rocket shirt', 'clothing-unisex', '/Images/T SHIRT MEN.png', NULL, 50, '{\"L\": {\"status\": \"in_stock\", \"quantity\": 10}, \"M\": {\"status\": \"in_stock\", \"quantity\": 10}, \"S\": {\"status\": \"in_stock\", \"quantity\": 12}, \"XL\": {\"status\": \"in_stock\", \"quantity\": 8}}', 'in_stock', '2025-02-19 15:14:03', '2025-02-19 18:56:27'),
(28, 'Pokemon Varsity Jacket', 69.99, 'Stylish Pokemon varsity jacket', 'clothing-unisex', '/Images/JACKET MAN.png', NULL, 20, '{\"L\": {\"status\": \"in_stock\", \"quantity\": 10}, \"M\": {\"status\": \"in_stock\", \"quantity\": 10}, \"S\": {\"status\": \"in_stock\", \"quantity\": 12}, \"XL\": {\"status\": \"in_stock\", \"quantity\": 8}}', 'in_stock', '2025-02-19 15:14:03', '2025-02-19 18:56:27'),
(29, 'Pokemon Beanie', 19.99, 'Warm Pokemon beanie', 'clothing-unisex', '/Images/UNI HAT.png', NULL, 6, '{\"ONE_SIZE\": {\"status\": \"in_stock\", \"quantity\": 5}}', 'in_stock', '2025-02-19 15:14:03', '2025-02-19 18:56:13');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `address` text COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('customer','admin') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'customer',
  `status` enum('active','inactive','blocked') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `users`
--

TRUNCATE TABLE `users`;
--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `phone`, `password`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'User', 'admin@pokemonstore.com', '1234567890', '$2y$10$0UBqyYkgTxP9a6EGXo3UL.A/XclIZXLqoLS.TNouHKpQSlOmBNwye', '123 Admin Street', 'admin', 'active', '2025-02-19 14:26:22', '2025-02-19 14:47:30'),
(2, 'dima', 'abc', 'dima@gmail.com', '0035448122345', '$2y$10$6DiGYTqj3nJJBmgyCNH0y.dOwlKs4WrvJUS37fgL5TzIRXhb1HgrG', '223 hameenlinna', 'customer', 'active', '2025-02-19 12:42:41', '2025-02-19 12:42:41'),
(3, 'lily', 'abcd', 'lily@gmail.com', '0035448122346', '$2y$10$EDMAkg7lTcgm6pYq.RfayO2vx0gUND6g4ZbNbZRr2lJcyxWunPIhG', '224 hameenlinna', 'customer', 'active', '2025-02-19 12:43:34', '2025-02-19 12:43:34'),
(4, 'madu', 'abc', 'madu@gmail.com', '0035448122346', '$2y$10$jI.6U8TKUe/i2TXphJskau/1HzXt4EooXUknaACjZ89DlDndoOtDe', '225 hameenlinna', 'customer', 'active', '2025-02-19 12:44:06', '2025-02-19 12:44:06'),
(5, 'vinh', 'abc', 'vinh@gmail.com', '0035448122347', '$2y$10$r5On6gTOmpf5X4HV8XrRhO/64EU7wRm5F3lMT1hfYY6wHr9opwxXO', '226 hameenlinna', 'admin', 'active', '2025-02-19 12:44:44', '2025-02-19 12:44:44');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;