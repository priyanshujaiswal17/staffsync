const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const validate = require('../middleware/validate');
const { verifyToken, authorize } = require('../middleware/auth');

const formatDateStr = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ==========================================
// EMPLOYEE LEAVE ACTIONS
// ==========================================

// POST /api/leaves/apply
router.post('/apply', [
  verifyToken,
  body('type').isIn(['Casual', 'Sick', 'Annual', 'Unpaid']).withMessage('Valid leave type is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required'),
  validate
], async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const { type, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date cannot be before start date' });
    }

    // No past start date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startZero = new Date(start);
    startZero.setHours(0, 0, 0, 0);
    if (startZero < today) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
    }

    // Calculate days (inclusive)
    const diffTime = Math.abs(end - start);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check overlap with existing Approved or Pending leaves
    const overlap = await Leave.findOne({
      employee: employee._id,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: 'Leave dates overlap with an existing pending or approved request'
      });
    }

    // Check leave balance (for casual, sick, annual)
    const typeKey = type.toLowerCase();
    if (typeKey !== 'unpaid') {
      const balance = employee.leaveBalance[typeKey] || 0;
      if (balance < days) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${type} leave balance. Available: ${balance}, Requested: ${days}`
        });
      }
    }

    const leave = await Leave.create({
      employee: employee._id,
      type,
      startDate: start,
      endDate: end,
      days,
      reason,
      status: 'Pending'
    });

    // Notify Manager or HR
    if (employee.manager) {
      const mgr = await Manager.findById(employee.manager);
      if (mgr) {
        await Notification.create({
          user: mgr.user,
          type: 'Leave',
          message: `${req.user.name} applied for ${days} day(s) of ${type} leave`,
          link: '/leaves'
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/leaves/my-leaves (Employee views own leaves)
router.get('/my-leaves', [
  verifyToken,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate
], async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const filter = { employee: employee._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const total = await Leave.countDocuments(filter);
    const leaves = await Leave.find(filter)
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: leaves,
      page,
      pages: Math.ceil(total / limit) || 1,
      total
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// MANAGER & HR REVIEW ENDPOINTS
// ==========================================

// GET /api/leaves/pending (Manager sees team pending, HR sees all pending)
router.get('/pending', [verifyToken, authorize('Manager', 'HR')], async (req, res, next) => {
  try {
    const filter = { status: 'Pending' };

    if (req.user.role === 'Manager') {
      const manager = await Manager.findOne({ user: req.user._id });
      if (!manager) {
        return res.status(404).json({ success: false, message: 'Manager profile not found' });
      }
      const teamEmployees = await Employee.find({ manager: manager._id }).select('_id');
      const teamIds = teamEmployees.map(e => e._id);
      filter.employee = { $in: teamIds };
    }

    const leaves = await Leave.find(filter)
      .populate({
        path: 'employee',
        select: 'employeeId department designation user leaveBalance',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: leaves
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/leaves (HR views all leaves with filters)
router.get('/', [
  verifyToken,
  authorize('HR'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate
], async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 15;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    if (req.query.department) {
      const emps = await Employee.find({ department: req.query.department }).select('_id');
      filter.employee = { $in: emps.map(e => e._id) };
    }

    const total = await Leave.countDocuments(filter);
    const leaves = await Leave.find(filter)
      .populate({
        path: 'employee',
        select: 'employeeId department designation user leaveBalance',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: leaves,
      page,
      pages: Math.ceil(total / limit) || 1,
      total
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/leaves/:id/review (Manager or HR reviews leave)
router.put('/:id/review', [
  verifyToken,
  authorize('Manager', 'HR'),
  body('status').isIn(['Approved', 'Rejected']).withMessage('Status must be Approved or Rejected'),
  body('reviewNote').optional().trim(),
  validate
], async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const employee = await Employee.findById(leave.employee).populate('user');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Associated employee not found' });
    }

    // Manager authorization check: Cannot review own leave or other team's leave
    if (req.user.role === 'Manager') {
      const manager = await Manager.findOne({ user: req.user._id });
      if (!manager) {
        return res.status(403).json({ success: false, message: 'Manager profile not found' });
      }

      // Check if employee belongs to manager's team
      if (!employee.manager || String(employee.manager) !== String(manager._id)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only review leave requests for your own team members'
        });
      }

      // Cannot review own leave (if manager is also an employee)
      if (String(employee.user._id) === String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Cannot review your own leave request'
        });
      }
    }

    const { status, reviewNote } = req.body;
    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewNote = reviewNote || '';
    await leave.save();

    // On Approval: Deduct balance & mark Attendance as 'On Leave'
    if (status === 'Approved') {
      const typeKey = leave.type.toLowerCase();
      if (typeKey !== 'unpaid' && employee.leaveBalance[typeKey] !== undefined) {
        employee.leaveBalance[typeKey] = Math.max(0, employee.leaveBalance[typeKey] - leave.days);
        await employee.save();
      }

      // Mark attendance as On Leave for all days in the range
      const curr = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      while (curr <= end) {
        const dateStr = formatDateStr(curr);
        await Attendance.findOneAndUpdate(
          { employee: employee._id, date: dateStr },
          { employee: employee._id, date: dateStr, status: 'On Leave' },
          { upsert: true, new: true }
        );
        curr.setDate(curr.getDate() + 1);
      }
    }

    // Create Notification for employee
    await Notification.create({
      user: employee.user._id,
      type: 'Leave',
      message: `Your ${leave.type} leave request (${leave.days} day(s)) has been ${status.toLowerCase()}${reviewNote ? ': ' + reviewNote : ''}.`,
      link: '/leaves'
    });

    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: leave
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
