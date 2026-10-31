const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const validate = require('../middleware/validate');
const { verifyToken, authorize } = require('../middleware/auth');

const LATE_THRESHOLD_HOUR = 9;
const LATE_THRESHOLD_MINUTE = 30;

const getTodayString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ==========================================
// EMPLOYEE ATTENDANCE ACTIONS
// ==========================================

// POST /api/attendance/check-in
router.post('/check-in', verifyToken, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const todayStr = getTodayString();
    const existing = await Attendance.findOne({ employee: employee._id, date: todayStr });

    if (existing && existing.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in for today'
      });
    }

    const now = new Date();
    const isLate = (now.getHours() > LATE_THRESHOLD_HOUR) ||
      (now.getHours() === LATE_THRESHOLD_HOUR && now.getMinutes() > LATE_THRESHOLD_MINUTE);

    const status = isLate ? 'Late' : 'Present';

    let record;
    if (existing) {
      existing.checkIn = now;
      existing.status = status;
      record = await existing.save();
    } else {
      record = await Attendance.create({
        employee: employee._id,
        date: todayStr,
        checkIn: now,
        status
      });
    }

    res.status(200).json({
      success: true,
      message: `Checked in successfully (${status})`,
      data: record
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/attendance/check-out
router.post('/check-out', verifyToken, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const todayStr = getTodayString();
    const record = await Attendance.findOne({ employee: employee._id, date: todayStr });

    if (!record || !record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out for today'
      });
    }

    record.checkOut = new Date();
    await record.save();

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: record
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance/today (Today's status for logged in employee)
router.get('/today', verifyToken, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const todayStr = getTodayString();
    const record = await Attendance.findOne({ employee: employee._id, date: todayStr }).lean();

    res.status(200).json({
      success: true,
      data: record || null
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance/my-history (Employee own history, paginated, month filter)
router.get('/my-history', [
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
    const limit = req.query.limit || 15;
    const skip = (page - 1) * limit;

    const filter = { employee: employee._id };
    if (req.query.month) {
      // month format: YYYY-MM
      filter.date = new RegExp(`^${req.query.month}`);
    }

    const total = await Attendance.countDocuments(filter);
    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: records,
      page,
      pages: Math.ceil(total / limit) || 1,
      total
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// MANAGER TEAM ATTENDANCE
// ==========================================

// GET /api/attendance/team (Manager team attendance)
router.get('/team', [
  verifyToken,
  authorize('Manager'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate
], async (req, res, next) => {
  try {
    const manager = await Manager.findOne({ user: req.user._id });
    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager profile not found' });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const teamEmployees = await Employee.find({ manager: manager._id }).select('_id');
    const teamIds = teamEmployees.map(e => e._id);

    const filter = { employee: { $in: teamIds } };
    if (req.query.date) {
      filter.date = req.query.date;
    } else if (req.query.month) {
      filter.date = new RegExp(`^${req.query.month}`);
    }

    const total = await Attendance.countDocuments(filter);
    const records = await Attendance.find(filter)
      .populate({
        path: 'employee',
        select: 'employeeId department designation user',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: records,
      page,
      pages: Math.ceil(total / limit) || 1,
      total
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// HR ALL ATTENDANCE
// ==========================================

// GET /api/attendance (HR All attendance with filters)
router.get('/', [
  verifyToken,
  authorize('HR'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate
], async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.date) {
      filter.date = req.query.date;
    } else if (req.query.month) {
      filter.date = new RegExp(`^${req.query.month}`);
    }

    if (req.query.department || req.query.search) {
      const empFilter = {};
      if (req.query.department) empFilter.department = req.query.department;
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        const userMatches = await require('../models/User').find({
          $or: [{ name: searchRegex }, { email: searchRegex }]
        }).select('_id');
        empFilter.$or = [
          { employeeId: searchRegex },
          { designation: searchRegex },
          { user: { $in: userMatches.map(u => u._id) } }
        ];
      }
      const matchedEmployees = await Employee.find(empFilter).select('_id');
      filter.employee = { $in: matchedEmployees.map(e => e._id) };
    }

    const total = await Attendance.countDocuments(filter);
    const records = await Attendance.find(filter)
      .populate({
        path: 'employee',
        select: 'employeeId department designation user',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: records,
      page,
      pages: Math.ceil(total / limit) || 1,
      total
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
