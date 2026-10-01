const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const usersRoutes = require('./routes/users.routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// The Express app is built and exported separately from src/index.js
// so that tests can import it directly with supertest WITHOUT starting
// a real server / binding a port.
function createApp() {
  const app = express();

  // --- Global middleware ---
  app.use(helmet()); // sets sane security-related HTTP headers
  app.use(cors()); // allows cross-origin requests (configure origins for prod)
  app.use(express.json()); // parses application/json bodies
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev')); // request logging (silenced during tests)
  }

  // --- Health check (useful for Docker/K8s/load balancer probes) ---
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  // --- Routes ---
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the sample Node.js API. See /health and /api/users.' });
  });
  app.use('/api/users', usersRoutes);

  // --- 404 + error handling (must be registered last) ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
