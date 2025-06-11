-- Create roles table
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name ENUM('ROLE_USER', 'ROLE_ADMIN') NOT NULL
);

-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user_roles junction table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Create milk table
CREATE TABLE milk (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    milk_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    rate DOUBLE NOT NULL,
    amount DOUBLE NOT NULL,
    entry_date TIMESTAMP NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert roles
INSERT INTO roles (name) VALUES
('ROLE_USER'),
('ROLE_ADMIN');

-- Insert sample users (password is "password" encoded with BCrypt)
INSERT INTO users (username, email, password) VALUES
('sudhakar', 'sudhakar@gmail.com', '$2a$10$Vb5T8jrhQQy6BknNKO6vJ.5uEAJQ7Q1QIO0f1u1NX7EFxN1NXSDb.');

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 2); -- admin has ROLE_ADMIN

-- Insert sample milk data
INSERT INTO milk (milk_type, quantity, rate, amount, entry_date, user_id) VALUES
('Buffalo Milk', 10, 80.00, 800.00, CURRENT_TIMESTAMP, 1);