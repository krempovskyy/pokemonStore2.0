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

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `address` text COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('customer','admin') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'customer',
  `status` enum('active','inactive','blocked') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `phone`, `password`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'dima', 'abc', 'dima@gmail.com', '0035448122345', 'dima123', '223 hameenlinna', 'customer', 'active', '2025-02-19 12:42:41', '2025-02-19 12:42:41'),
(2, 'lily', 'abcd', 'lily@gmail.com', '0035448122346', 'lily123', '224 hameenlinna', 'customer', 'active', '2025-02-19 12:43:34', '2025-02-19 12:43:34'),
(3, 'madu', 'abc', 'madu@gmail.com', '0035448122346', 'madu123', '225 hameenlinna', 'customer', 'active', '2025-02-19 12:44:06', '2025-02-19 12:44:06'),
(4, 'vinh', 'abc', 'vinh@gmail.com', '0035448122347', 'vinh123', '226 hameenlinna', 'admin', 'active', '2025-02-19 12:44:44', '2025-02-19 12:44:44'),
(5, 'john', 'abc', 'john@gmail.com', '0035448122349', 'john123', '223 helsinki', 'customer', 'active', '2025-02-19 12:45:26', '2025-02-19 12:45:26'),
(6, 'sun', 'shine', 'sun@gmail.com', '0035448122350', 'sun123', '222 pori', 'customer', 'active', '2025-02-19 12:46:39', '2025-02-19 12:46:39');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
