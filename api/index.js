const express = require('express');
const cors = require('cors');
const connectDB = require('../server/config/db');
const routes = require('../server/routes/index');
const { notFoundHandler, errorHandler } = require('../server/middleware/error');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Fast health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Serverless DB connection & auto-seeder middleware
let isSeeded = false;
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!isSeeded) {
      try {
        const User = require('../server/models/User');
        const count = await User.countDocuments();
        if (count === 0) {
          const seed = require('../server/scripts/seed');
          await seed({ disconnect: false });
        }
        isSeeded = true;
      } catch (sErr) {
        isSeeded = true;
      }
    }
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGO_URI is configured.',
      error: err.message
    });
  }
});

// Mount routes at both /api and / to handle different rewrite structures
app.use('/api', routes);
app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
