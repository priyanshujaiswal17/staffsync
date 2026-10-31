const express = require('express');
const router = express.Router();
const authRoutes = require('../controllers/auth');
const employeeRoutes = require('../controllers/employees');
const managerRoutes = require('../controllers/managers');
const attendanceRoutes = require('../controllers/attendance');
const leaveRoutes = require('../controllers/leaves');
const announcementRoutes = require('../controllers/announcements');
const trainingRoutes = require('../controllers/trainings');
const notificationRoutes = require('../controllers/notifications');
const reportRoutes = require('../controllers/reports');
const { verifyToken, authorize } = require('../middleware/auth');

// GET /api/health
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime()
  });
});

// Mount all route groups
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/managers', managerRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/announcements', announcementRoutes);
router.use('/trainings', trainingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);

// Test RBAC route (HR protected)
router.get('/test-hr-only', verifyToken, authorize('HR'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome HR' });
});

module.exports = router;
