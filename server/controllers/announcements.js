const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Notification = require('../models/Notification');
const validate = require('../middleware/validate');
const { verifyToken, authorize } = require('../middleware/auth');

// GET /api/announcements (All authenticated roles, paginated, pinned first)
router.get('/', [
  verifyToken,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate
], async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.user.role !== 'HR') {
      filter.audience = { $in: ['All', req.user.role] };
    }

    const total = await Announcement.countDocuments(filter);
    const announcements = await Announcement.find(filter)
      .populate('postedBy', 'name email role')
      .sort({ pinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: announcements,
      page,
      pages: Math.ceil(total / limit) || 1,
      total
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/announcements (HR Only - generates notifications with insertMany)
router.post('/', [
  verifyToken,
  authorize('HR'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('body').trim().notEmpty().withMessage('Body is required'),
  body('audience').optional().isIn(['All', 'HR', 'Manager', 'Employee']),
  body('pinned').optional().isBoolean(),
  validate
], async (req, res, next) => {
  try {
    const { title, body, audience = 'All', pinned = false } = req.body;

    const announcement = await Announcement.create({
      title,
      body,
      audience,
      pinned,
      postedBy: req.user._id
    });

    // Determine targeted users for notification
    const targetFilter = { isActive: true, _id: { $ne: req.user._id } };
    if (audience !== 'All') {
      targetFilter.role = audience;
    }

    const targetUsers = await User.find(targetFilter).select('_id').lean();

    if (targetUsers.length > 0) {
      const notifications = targetUsers.map(u => ({
        user: u._id,
        type: 'Announcement',
        message: `New announcement: ${title}`,
        link: '/announcements'
      }));
      await Notification.insertMany(notifications);
    }

    const populated = await Announcement.findById(announcement._id)
      .populate('postedBy', 'name email role')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: populated
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/announcements/:id (HR Only)
router.put('/:id', [
  verifyToken,
  authorize('HR'),
  body('title').optional().trim().notEmpty(),
  body('body').optional().trim().notEmpty(),
  body('audience').optional().isIn(['All', 'HR', 'Manager', 'Employee']),
  body('pinned').optional().isBoolean(),
  validate
], async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const { title, body, audience, pinned } = req.body;
    if (title) announcement.title = title;
    if (body) announcement.body = body;
    if (audience) announcement.audience = audience;
    if (pinned !== undefined) announcement.pinned = pinned;

    await announcement.save();

    const updated = await Announcement.findById(announcement._id)
      .populate('postedBy', 'name email role')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/announcements/:id (HR Only)
router.delete('/:id', [verifyToken, authorize('HR')], async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
