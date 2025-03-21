-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS order_payments CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS company CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS worker_role CASCADE;

-- Create company table
CREATE TABLE company (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create worker role enum
CREATE TYPE worker_role AS ENUM ('STAFF', 'ADMIN');

-- Create workers table
CREATE TABLE workers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role worker_role NOT NULL DEFAULT 'STAFF',
    phone VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create tables
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create order status enum
CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    assigned_worker_id INTEGER,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status order_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_worker FOREIGN KEY (assigned_worker_id) REFERENCES workers(id)
);

-- Create order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create payment status enum
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED');

-- Create order payments table
CREATE TABLE order_payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    status payment_status NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_payment FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for order_payments
CREATE TRIGGER update_order_payments_updated_at
    BEFORE UPDATE ON order_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO workers (name, email, password_hash, role, phone, active) VALUES
    ('Admin User', 'admin@example.com', 
     '$2b$10$bNl0AhJvIbgCTxHrK0L0/uR6E3Kw4dFZaZBTB3vreOk/0RK8NqlHW',  -- password: admin123
     'ADMIN', '555-0000', true);

INSERT INTO customers (name, email, address, phone) VALUES
    ('John Doe', 'john@example.com', '123 Main St', '555-0123'),
    ('Jane Smith', 'jane@example.com', '456 Oak Ave', '555-0456');

INSERT INTO orders (customer_id, status) VALUES
    (1, 'PENDING'),
    (1, 'COMPLETED'),
    (2, 'PROCESSING');

INSERT INTO order_items (order_id, product_name, quantity, price) VALUES
    (1, 'Widget A', 2, 19.99),
    (1, 'Widget B', 1, 29.99),
    (2, 'Widget C', 3, 15.99),
    (3, 'Widget D', 1, 49.99);

INSERT INTO order_payments (order_id, status, amount, payment_method, transaction_id) VALUES
    (1, 'PENDING', 69.97, NULL, NULL),
    (2, 'PAID', 47.97, 'CREDIT_CARD', 'TXN-001'),
    (3, 'PENDING', 49.99, NULL, NULL); 

    