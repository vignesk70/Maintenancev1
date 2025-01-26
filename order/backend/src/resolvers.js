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
    }
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
        
        for (const item of items) {
          await client.query(
            'INSERT INTO order_items (order_id, product_name, quantity, price) VALUES ($1, $2, $3, $4)',
            [order.id, item.productName, item.quantity, item.price]
          );
        }
        
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
    
    updateOrderStatus: async (_, { id, status }, { pool }) => {
      const result = await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );
      return result.rows[0];
    },

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
    }
  },
};

module.exports = { resolvers }; 