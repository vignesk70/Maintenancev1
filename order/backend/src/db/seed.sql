-- Add test customer
INSERT INTO customers (name, email, address, phone)
VALUES ('Test Customer', 'test@example.com', '123 Test St', '555-0123');

-- Add test order
INSERT INTO orders (customer_id, status)
VALUES (1, 'PENDING');

-- Add test order items
INSERT INTO order_items (order_id, product_name, quantity, price)
VALUES (1, 'Test Product', 1, 99.99);

-- Add test payment
INSERT INTO order_payments (order_id, status, amount)
VALUES (1, 'PENDING', 99.99); 