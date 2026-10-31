const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const Notification = require('../models/Notification');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');

// GET /api/notifications (User's own notifications, paginated)
router.get('/', [
  verifyToken,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate
], async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 15;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };

    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: notifications,
      page,
      pages: Math.ceil(total / limit) || 1,
      total
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', verifyToken, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/:id/read (Mark single as read)
router.put('/:id/read', verifyToken, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/mark-all-read (Mark all user's notifications as read)
router.put('/mark-all-read', verifyToken, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
