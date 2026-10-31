const express = require('express');
const router = express.Router();
const authRoutes = require('../controllers/auth');
const { verifyToken, authorize } = require('../middleware/auth');

// GET /api/health
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime()
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Test RBAC route (HR protected)
router.get('/test-hr-only', verifyToken, authorize('HR'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome HR' });
});

module.exports = router;
