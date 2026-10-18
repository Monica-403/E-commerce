-- ==========================================================
-- FASHION CUBE - Database Schema & Sample Data
-- Fashion E-Commerce Website
-- Database: MySQL
-- ==========================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS fashion_cube;
USE fashion_cube;

-- 2. Drop existing tables if needed (in reverse order of foreign keys)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

-- 3. Categories Table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL
);

-- 4. Products Table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(500) NOT NULL,
    color VARCHAR(100) NOT NULL,
    size VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Orders Table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Processing'
);

-- 6. Order Items Table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ==========================================================
-- SEED DATA: Categories
-- ==========================================================
INSERT INTO categories (name, department) VALUES
('Basics', 'Women'),
('Blazer', 'Women'),
('Knitwear', 'Men'),
('Jeans', 'Men'),
('Jackets', 'Men'),
('Girl', 'Kids'),
('Boy', 'Kids');

-- ==========================================================
-- SEED DATA: Products (Prices in INR ₹)
-- ==========================================================
INSERT INTO products (name, description, price, image, color, size, category, department, quantity) VALUES
-- WOMEN
('Basic Ribbed Top', 'Minimalist ribbed crewneck top made from ultra-soft stretch cotton for effortless everyday styling.', 799.00, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', 'White', 'S, M, L', 'Basics', 'Women', 35),
('Essential Tank Top', 'Classic racerback ribbed tank crafted with breathable organic cotton. Perfect as a base layer.', 599.00, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80', 'Black', 'XS, S, M, L', 'Basics', 'Women', 50),
('Oversized Textured Top', 'Relaxed-fit waffle knit tunic top with dropped shoulders, raw-cut edges, and ribbed cuffs.', 1199.00, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80', 'Beige', 'S, M, L', 'Basics', 'Women', 28),
('Belted Plaid Blazer', 'Tailored houndstooth plaid blazer featuring a notched lapel, front flap pockets, and an adjustable waist belt.', 2999.00, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80', 'Grey Plaid', 'S, M, L', 'Blazer', 'Women', 15),
('Double-Breasted Blazer', 'Sharp double-breasted structured blazer cut from premium twill blend with padded shoulders.', 3499.00, 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80', 'Navy Blue', 'S, M, L, XL', 'Blazer', 'Women', 18),

-- MEN
('Chunky Knit Sweater', 'Warm chunky crewneck sweater knitted from soft wool blend with ribbed cuffs and hem.', 1899.00, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80', 'Forest Green', 'M, L, XL', 'Knitwear', 'Men', 30),
('Classic Cable Knit Cardigan', 'Heritage cable knit cardigan with faux-horn buttons and a cozy shawl collar.', 2199.00, 'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800&auto=format&fit=crop&q=80', 'Cream', 'S, M, L, XL', 'Knitwear', 'Men', 22),
('Vintage Ripped Jeans', 'Vintage light wash slim straight denim jeans with subtle knee distressing and whiskering.', 1999.00, 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80', 'Light Wash', '30, 32, 34, 36', 'Jeans', 'Men', 40),
('Basic Slim Fit Jeans', 'Classic five-pocket dark indigo denim jeans with flexible comfort stretch and clean stitching.', 1699.00, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80', 'Dark Indigo', '30, 32, 34, 36', 'Jeans', 'Men', 45),
('Classic Leather Biker Jacket', 'Iconic asymmetrical biker jacket featuring silver hardware, zippered pockets, and smooth vegan leather.', 4499.00, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80', 'Jet Black', 'S, M, L, XL', 'Jackets', 'Men', 14),
('Utility Canvas Jacket', 'Rugged workwear-inspired field jacket with double chest flap pockets and snap buttons.', 2499.00, 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80', 'Olive Green', 'M, L, XL', 'Jackets', 'Men', 25),

-- KIDS
('Kids Cozy Fleece Sweatshirt', 'Super-soft brushed cotton fleece pullover with cheerful graphic lettering and elastic ribbing.', 999.00, 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80', 'Pastel Pink', '4Y, 6Y, 8Y, 10Y', 'Girl', 'Kids', 32),
('Kids Floral Skater Dress', 'Breezy everyday dress with vibrant floral botanical prints and flared tiered silhouette.', 1199.00, 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80', 'Floral Yellow', '3Y, 5Y, 7Y, 9Y', 'Girl', 'Kids', 20),
('Kids Quilted Bomber Jacket', 'Insulated zip-up flight bomber jacket with contrast orange lining and snug ribbed collar.', 1499.00, 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80', 'Navy Blue', '5Y, 7Y, 9Y, 11Y', 'Boy', 'Kids', 25),('Kids Sporty Colorblock Hoodie', 'Casual sporty hoodie featuring bold contrast colorblocking and roomy front pouch pocket.', 899.00, 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=800&auto=format&fit=crop&q=80', 'Teal & Grey', '4Y, 6Y, 8Y, 10Y', 'Boy', 'Kids', 35);

-- Sample Initial Order
INSERT INTO orders (customer_name, email, phone, address, total, status) VALUES
('Jane Doe', 'jane.doe@example.com', '+91 98765 43210', '42 MG Road, Indiranagar, Bengaluru, Karnataka 560038', 3798.00, 'Delivered');

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 799.00),
(1, 4, 1, 2999.00);
