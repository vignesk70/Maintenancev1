const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = (worker) => {
  return jwt.sign(
    { 
      id: worker.id,
      email: worker.email,
      role: worker.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const getWorkerFromToken = async (token, pool) => {
  console.log('Received token:', token);
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    const result = await pool.query(
      'SELECT * FROM workers WHERE id = $1 AND active = true',
      [decoded.id]
    );
    return result.rows[0];
  } catch (e) {
    console.error('Token verification error:', e);
    return null;
  }
};

const requireAuth = (resolver) => {
  return async (parent, args, context, info) => {
    console.log('Context worker:', context.worker);
    if (!context.worker) {
      throw new Error('Authentication required');
    }
    return resolver(parent, args, context, info);
  };
};

const requireAdmin = (resolver) => {
  return async (parent, args, context, info) => {
    console.log('Checking admin. Worker:', context.worker);
    if (!context.worker) {
      throw new Error('Authentication required');
    }
    if (context.worker.role !== 'ADMIN') {
      throw new Error('Admin access required');
    }
    return resolver(parent, args, context, info);
  };
};

module.exports = {
  generateToken,
  getWorkerFromToken,
  requireAuth,
  requireAdmin
}; 