-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Feb 19, 2025 at 05:33 PM
-- Server version: 8.0.40
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

-- --------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

USE `pokemonstore`;

TRUNCATE TABLE `users`;

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `phone`, `password`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'User', 'admin@pokemonstore.com', '1234567890', '$2y$10$0UBqyYkgTxP9a6EGXo3UL.A/XclIZXLqoLS.TNouHKpQSlOmBNwye', '123 Admin Street', 'admin', 'active', '2025-02-19 14:26:22', '2025-02-19 14:47:30'),
(2, 'dima', 'abc', 'dima@gmail.com', '0035448122345', '$2y$10$6DiGYTqj3nJJBmgyCNH0y.dOwlKs4WrvJUS37fgL5TzIRXhb1HgrG', '223 hameenlinna', 'customer', 'active', '2025-02-19 12:42:41', '2025-02-19 12:42:41'),
(3, 'lily', 'abcd', 'lily@gmail.com', '0035448122346', '$2y$10$EDMAkg7lTcgm6pYq.RfayO2vx0gUND6g4ZbNbZRr2lJcyxWunPIhG', '224 hameenlinna', 'customer', 'active', '2025-02-19 12:43:34', '2025-02-19 12:43:34'),
(4, 'madu', 'abc', 'madu@gmail.com', '0035448122346', '$2y$10$jI.6U8TKUe/i2TXphJskau/1HzXt4EooXUknaACjZ89DlDndoOtDe', '225 hameenlinna', 'customer', 'active', '2025-02-19 12:44:06', '2025-02-19 12:44:06'),
(5, 'vinh', 'abc', 'vinh@gmail.com', '0035448122347', '$2y$10$r5On6gTOmpf5X4HV8XrRhO/64EU7wRm5F3lMT1hfYY6wHr9opwxXO', '226 hameenlinna', 'admin', 'active', '2025-02-19 12:44:44', '2025-02-19 12:44:44'),

SET FOREIGN_KEY_CHECKS = 1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
