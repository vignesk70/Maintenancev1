ALTER TABLE orders
ADD COLUMN assigned_worker_id INTEGER REFERENCES workers(id); 