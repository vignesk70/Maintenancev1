const { requireAuth, requireAdmin, generateToken } = require('./auth');
const bcrypt = require('bcrypt');

const resolvers = {
  Query: {
    customers: async (_, __, { pool }) => {
      const result = await pool.query('SELECT * FROM customers');
      return result.rows.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        address: customer.address,
        phone: customer.phone
      }));
    },

    customer: async (_, { id }, { pool }) => {
      const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
      const customer = result.rows[0];
      if (!customer) return null;
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        address: customer.address,
        phone: customer.phone
      };
    },

    orders: async (_, __, { pool }) => {
      const result = await pool.query(`
        SELECT 
          o.id,
          o.customer_id as "customerId",
          o.order_date as "orderDate",
          o.status
        FROM orders o
        ORDER BY o.order_date DESC
      `);
      // console.log('Fetched orders:', result.rows);
      return result.rows;
    },

    order: async (_, { id }, { pool }) => {
      const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
      const order = result.rows[0];
      if (!order) return null;
      return {
        id: order.id,
        customerId: order.customer_id,
        orderDate: order.order_date,
        status: order.status
      };
    },

    company: requireAuth(async (_, __, { pool }) => {
      const result = await pool.query('SELECT * FROM company LIMIT 1');
      return result.rows[0];
    }),

    workers: requireAdmin(async (_, __, { pool }) => {
      const result = await pool.query('SELECT * FROM workers ORDER BY name');
      return result.rows;
    }),

    worker: requireAuth(async (_, { id }, { pool, worker }) => {
      // Staff can only view their own profile
      if (worker.role !== 'ADMIN' && worker.id !== parseInt(id)) {
        throw new Error('Not authorized');
      }
      const result = await pool.query('SELECT * FROM workers WHERE id = $1', [id]);
      return result.rows[0];
    }),

    myAssignedOrders: requireAuth(async (_, __, { pool, worker }) => {
      const result = await pool.query(
        `SELECT * FROM orders 
         WHERE assigned_worker_id = $1 
         ORDER BY order_date DESC`,
        [worker.id]
      );
      return result.rows;
    }),

    currentWorker: requireAuth((_, __, { worker }) => {
      return worker;
    }),
  },

  Customer: {
    orders: async (parent, _, { pool }) => {
      const result = await pool.query(
        'SELECT * FROM orders WHERE customer_id = $1 ORDER BY order_date DESC',
        [parent.id]
      );
      return result.rows.map(order => ({
        id: order.id,
        customerId: order.customer_id,
        orderDate: order.order_date,
        status: order.status
      }));
    },
  },
  
  Order: {
    customer: async (parent, _, { pool }) => {
      const result = await pool.query(
        'SELECT * FROM customers WHERE id = $1',
        [parent.customerId]
      );
      const customer = result.rows[0];
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        address: customer.address,
        phone: customer.phone
      };
    },

    items: async (parent, _, { pool }) => {
      const result = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [parent.id]
      );
      return result.rows.map(item => ({
        id: item.id,
        orderId: item.order_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: item.price
      }));
    },

    payment: async (order, _, { pool }) => {
      const result = await pool.query(
        'SELECT * FROM order_payments WHERE order_id = $1',
        [order.id]
      );
      return result.rows[0];
    },

    assignedWorker: async (order, _, { pool }) => {
      if (!order.assigned_worker_id) return null;
      const result = await pool.query(
        'SELECT id, name, email FROM workers WHERE id = $1',
        [order.assigned_worker_id]
      );
      return result.rows[0];
    },
  },

  Mutation: {
    createCustomer: async (_, { name, email, address, phone }, { pool }) => {
      const result = await pool.query(
        'INSERT INTO customers (name, email, address, phone) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, address, phone]
      );
      const customer = result.rows[0];
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        address: customer.address,
        phone: customer.phone
      };
    },

    createOrder: async (_, { customerId, items }, { pool }) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const orderResult = await client.query(
          'INSERT INTO orders (customer_id, order_date, status) VALUES ($1, NOW(), $2) RETURNING *',
          [customerId, 'PENDING']
        );
        
        const order = orderResult.rows[0];
        
        let totalAmount = 0;
        for (const item of items) {
          await client.query(
            'INSERT INTO order_items (order_id, product_name, quantity, price) VALUES ($1, $2, $3, $4)',
            [order.id, item.productName, item.quantity, item.price]
          );
          totalAmount += item.quantity * item.price;
        }
        
        // Create initial payment record
        await client.query(
          `INSERT INTO order_payments 
           (order_id, status, amount, created_at, updated_at)
           VALUES ($1, 'PENDING', $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [order.id, totalAmount]
        );
        
        await client.query('COMMIT');
        return {
          id: order.id,
          customerId: order.customer_id,
          orderDate: order.order_date,
          status: order.status
        };
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    },
    
    updateOrderStatus: requireAuth(async (_, { id, status }, { pool, worker }) => {
      // Check if worker is assigned to this order or is admin
      const orderResult = await pool.query(
        'SELECT * FROM orders WHERE id = $1',
        [id]
      );
      
      const order = orderResult.rows[0];
      if (!order) throw new Error('Order not found');

      if (worker.role !== 'ADMIN' && order.assigned_worker_id !== worker.id) {
        throw new Error('Not authorized to update this order');
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Update order status
        const result = await client.query(
          `UPDATE orders 
           SET status = $1 
           WHERE id = $2 
           RETURNING id, customer_id, order_date, status`,
          [status, id]
        );
        
        // If order is cancelled, update payment status
        if (status === 'CANCELLED') {
          await client.query(
            `UPDATE order_payments 
             SET status = 'CANCELLED', 
                 updated_at = CURRENT_TIMESTAMP
             WHERE order_id = $1`,
            [id]
          );
        }
        
        await client.query('COMMIT');
        return {
          id: result.rows[0].id,
          customerId: result.rows[0].customer_id,
          orderDate: result.rows[0].order_date,
          status: result.rows[0].status
        };
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }),

    updatePaymentStatus: async (_, { orderId, status, paymentMethod, transactionId }, { pool }) => {
      const paymentDate = status === 'PAID' ? new Date() : null;
      
      // Get order total
      const orderResult = await pool.query(
        `SELECT SUM(quantity * price) as total 
         FROM order_items 
         WHERE order_id = $1`,
        [orderId]
      );
      const amount = orderResult.rows[0].total;

      // Check if payment record exists
      const existingPayment = await pool.query(
        'SELECT id FROM order_payments WHERE order_id = $1',
        [orderId]
      );

      let result;
      if (existingPayment.rows.length > 0) {
        // Update existing payment
        result = await pool.query(
          `UPDATE order_payments 
           SET status = $1, payment_method = $2, transaction_id = $3, 
               payment_date = $4, updated_at = CURRENT_TIMESTAMP
           WHERE order_id = $5 
           RETURNING *`,
          [status, paymentMethod, transactionId, paymentDate, orderId]
        );
      } else {
        // Create new payment record
        result = await pool.query(
          `INSERT INTO order_payments 
           (order_id, status, amount, payment_method, transaction_id, payment_date)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [orderId, status, amount, paymentMethod, transactionId, paymentDate]
        );
      }

      return result.rows[0];
    },

    updateOrderItem: async (_, { id, quantity, price }, { pool }) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const updates = [];
        const values = [];
        let updateIndex = 1;
        
        if (quantity !== undefined) {
          updates.push(`quantity = $${updateIndex}`);
          values.push(quantity);
          updateIndex++;
        }
        
        if (price !== undefined) {
          updates.push(`price = $${updateIndex}`);
          values.push(price);
          updateIndex++;
        }
        
        if (updates.length === 0) {
          throw new Error('No updates provided');
        }
        
        values.push(id);
        const result = await client.query(
          `UPDATE order_items 
           SET ${updates.join(', ')} 
           WHERE id = $${updateIndex}
           RETURNING *`,
          values
        );
        
        if (result.rows.length === 0) {
          throw new Error('Order item not found');
        }

        // Get the order ID and recalculate total
        const orderId = result.rows[0].order_id;
        const totalResult = await client.query(
          `SELECT SUM(quantity * price) as total 
           FROM order_items 
           WHERE order_id = $1`,
          [orderId]
        );
        
        // Update payment amount if it exists
        await client.query(
          `UPDATE order_payments 
           SET amount = $1, 
               updated_at = CURRENT_TIMESTAMP
           WHERE order_id = $2`,
          [totalResult.rows[0].total, orderId]
        );

        await client.query('COMMIT');
        
        return {
          id: result.rows[0].id,
          orderId: result.rows[0].order_id,
          productName: result.rows[0].product_name,
          quantity: result.rows[0].quantity,
          price: result.rows[0].price
        };
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    },

    updateCompany: requireAdmin(async (_, { name, address, phone, email }, { pool }) => {
      const result = await pool.query(
        `INSERT INTO company (name, address, phone, email)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE
         SET name = EXCLUDED.name,
             address = EXCLUDED.address,
             phone = EXCLUDED.phone
         RETURNING *`,
        [name, address, phone, email]
      );
      return result.rows[0];
    }),

    createWorker: requireAdmin(async (_, { name, email, password, role, phone }, { pool }) => {
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO workers (name, email, password_hash, role, phone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, email, passwordHash, role, phone]
      );
      return result.rows[0];
    }),

    loginWorker: async (_, { email, password }, { pool }) => {
      const result = await pool.query(
        `SELECT 
          id, name, email, password_hash, role, phone, active 
          FROM workers 
          WHERE email = $1`,
        [email]
      );
      
      const worker = result.rows[0];
      if (!worker) {
        throw new Error('Invalid credentials');
      }

      if (!worker.active) {
        throw new Error('Account is not active');
      }

      const valid = await bcrypt.compare(password, worker.password_hash);
      if (!valid) {
        throw new Error('Invalid credentials');
      }

      return {
        token: generateToken(worker),
        worker: {
          id: worker.id,
          name: worker.name,
          email: worker.email,
          role: worker.role,
          active: worker.active
        }
      };
    },

    assignOrder: requireAdmin(async (_, { orderId, workerId }, { pool }) => {
      const result = await pool.query(
        `UPDATE orders 
         SET assigned_worker_id = $1 
         WHERE id = $2 
         RETURNING *`,
        [workerId, orderId]
      );
      return result.rows[0];
    }),

    updateWorker: requireAdmin(async (_, { id, ...fields }, { pool }) => {
      // Build the update query dynamically
      const setClauses = []
      const values = []
      let index = 1
      
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
          setClauses.push(`${key} = $${index}`)
          values.push(value)
          index++
        }
      }

      if (setClauses.length === 0) {
        throw new Error('No fields to update')
      }

      const query = `
        UPDATE workers
        SET ${setClauses.join(', ')}
        WHERE id = $${index}
        RETURNING *
      `
      
      const result = await pool.query(query, [...values, id])
      
      if (result.rows.length === 0) {
        throw new Error('Worker not found')
      }

      return result.rows[0]
    }),

    updateWorkerPassword: requireAuth(async (_, { id, newPassword }, { pool, worker }) => {
      // Verify current user is admin or the worker themselves
      if (worker.role !== 'ADMIN' && worker.id !== id) {
        throw new Error('Unauthorized to change this password');
      }

      // Update password directly
      const newHash = await bcrypt.hash(newPassword, 10);
      const result = await pool.query(
        'UPDATE workers SET password_hash = $1 WHERE id = $2 RETURNING *',
        [newHash, id]
      );

      return result.rows[0];
    }),

    updateOrderWorker: requireAuth(async (_, { orderId, workerId }, { pool }) => {
      const result = await pool.query(
        `UPDATE orders 
         SET assigned_worker_id = $1 
         WHERE id = $2 
         RETURNING *`,
        [workerId, orderId]
      );
      console.log("resolvers - set worker to order")
      
      const updatedOrder = result.rows[0];
      
      // Fetch worker details if assigned
      let assignedWorker = null;
      if (updatedOrder.assigned_worker_id) {
        const workerRes = await pool.query(
          'SELECT id, name, email FROM workers WHERE id = $1',
          [updatedOrder.assigned_worker_id]
        );
        assignedWorker = workerRes.rows[0];
      }

      return {
        ...updatedOrder,
        assignedWorker,
        customerId: updatedOrder.customer_id,
        orderDate: updatedOrder.order_date
      };
    }),
  },
};

module.exports = { resolvers }; 