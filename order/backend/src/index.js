const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./schema');
const { resolvers } = require('./resolvers');
const { pool } = require('./db');
const cors = require('cors');
const { Pool } = require('pg');
const { getWorkerFromToken } = require('./auth');

async function startServer() {
  const app = express();
  
  // Configure CORS
  app.use(cors({
    origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'authorization', 'apollo-require-preflight']
  }));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      // console.log('Request headers:', req.headers);
      // Try to get token from different possible header formats
      const authHeader = req.headers.authorization || req.headers.Authorization || '';
      // console.log('Auth header:', authHeader);
      
      const token = authHeader.replace('Bearer ', '').trim();
      // console.log('Extracted token:', token);
      
      const worker = await getWorkerFromToken(token, pool);
      // console.log('Context worker:', worker); // Debug log
      
      return {
        pool,
        worker
      };
    },
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return error;
    },
  });

  await server.start();
  server.applyMiddleware({ 
    app,
    cors: false // We're handling CORS with Express middleware
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.info(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer(); 