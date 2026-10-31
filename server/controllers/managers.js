const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, query } = require('express-validator');
const User = require('../models/User');
const Manager = require('../models/Manager');
const Employee = require('../models/Employee');
const validate = require('../middleware/validate');
const { verifyToken, authorize } = require('../middleware/auth');

// ==========================================
// MANAGER TEAM ENDPOINT (Manager View)
// ==========================================

// GET /api/managers/team (Manager views own team members)
router.get('/team', [verifyToken, authorize('Manager')], async (req, res, next) => {
  try {
    const manager = await Manager.findOne({ user: req.user._id });
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found'
      });
    }

    const team = await Employee.find({ manager: manager._id })
      .select('employeeId department designation phone status leaveBalance user joinDate')
      .populate('user', 'name email role isActive')
      .lean();

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// HR MANAGER MANAGEMENT ENDPOINTS
// ==========================================

// GET /api/managers (HR lists all managers)
router.get('/', [
  verifyToken,
  authorize('HR'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate
], async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.department) {
      filter.department = req.query.department;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }]
      }).select('_id').lean();
      filter.user = { $in: matchingUsers.map(u => u._id) };
    }

    const total = await Manager.countDocuments(filter);
    const managers = await Manager.find(filter)
      .select('department team user createdAt')
      .populate('user', 'name email role isActive')
      .populate({
        path: 'team',
        select: 'employeeId department designation user status',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: managers,
      page,
      pages: Math.ceil(total / limit) || 1,
      total
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/managers (HR creates Manager User + Profile)
router.post('/', [
  verifyToken,
  authorize('HR'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  validate
], async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'Manager'
    });

    const manager = await Manager.create({
      user: user._id,
      department,
      team: []
    });

    const populated = await Manager.findById(manager._id)
      .populate('user', 'name email role isActive')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Manager created successfully',
      data: populated
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/managers/:id (HR updates manager)
router.put('/:id', [verifyToken, authorize('HR')], async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found'
      });
    }

    const { name, department, isActive } = req.body;

    if (name) {
      await User.findByIdAndUpdate(manager.user, { name });
    }
    if (department) manager.department = department;

    if (isActive !== undefined) {
      await User.findByIdAndUpdate(manager.user, { isActive });
    }

    await manager.save();

    const updated = await Manager.findById(manager._id)
      .populate('user', 'name email role isActive')
      .populate({
        path: 'team',
        select: 'employeeId department designation user status',
        populate: { path: 'user', select: 'name email' }
      })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Manager updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/managers/:id (HR deactivates manager)
router.delete('/:id', [verifyToken, authorize('HR')], async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found'
      });
    }

    await User.findByIdAndUpdate(manager.user, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Manager deactivated successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
