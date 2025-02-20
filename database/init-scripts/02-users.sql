-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert admin user
INSERT INTO users (first_name, last_name, email, phone, address, password, role, status) VALUES
('Admin', 'User', 'admin@pokemonstore.com', '1234567890', '123 Admin Street, Admin City, AC 12345', '$2y$10$EaMo0i4xP1aGdfLMgc9G8OuRKOLLVwEyqyFE2JCQuLTDEFSwve6Ta', 'admin', 'active');

-- Insert test customers
INSERT INTO users (first_name, last_name, email, phone, address, password, role, status) VALUES
('John', 'Doe', 'john@example.com', '1234567891', '456 Oak Street, Springfield, SP 67890', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', 'active'),
('Jane', 'Smith', 'jane@example.com', '1234567892', '789 Maple Avenue, Riverside, RS 34567', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', 'active'),
('Alice', 'Johnson', 'alice@example.com', '1234567893', '321 Pine Road, Lakeside, LS 89012', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', 'active');

-- Note: Admin password is 'Admin@123', customer passwords are 'password' using bcrypt hash 