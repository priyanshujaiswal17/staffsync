const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const Training = require('../models/Training');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const Notification = require('../models/Notification');
const validate = require('../middleware/validate');
const { verifyToken, authorize } = require('../middleware/auth');

// GET /api/trainings (List trainings by role)
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

    if (req.user.role === 'Manager') {
      filter.createdBy = req.user._id;
    } else if (req.user.role === 'Employee') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (employee) {
        // Enrolled trainings or available trainings
        filter.$or = [
          { 'participants.employee': employee._id },
          { participants: { $size: 0 } }
        ];
      }
    }
    // HR sees all trainings

    const total = await Training.countDocuments(filter);
    const trainings = await Training.find(filter)
      .populate('createdBy', 'name email role')
      .populate({
        path: 'participants.employee',
        select: 'employeeId department designation user',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: trainings,
      page,
      pages: Math.ceil(total / limit) || 1,
      total
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/trainings/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate({
        path: 'participants.employee',
        select: 'employeeId department designation user',
        populate: { path: 'user', select: 'name email' }
      })
      .lean();

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    res.status(200).json({
      success: true,
      data: training
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/trainings (Manager Only - creates program and notifies enrolled employees)
router.post('/', [
  verifyToken,
  authorize('Manager'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('trainer').trim().notEmpty().withMessage('Trainer name is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('participantIds').optional().isArray(),
  validate
], async (req, res, next) => {
  try {
    const { title, description, trainer, startDate, endDate, participantIds = [] } = req.body;

    const participants = participantIds.map(empId => ({
      employee: empId,
      status: 'Enrolled',
      score: 0
    }));

    const training = await Training.create({
      title,
      description,
      trainer,
      startDate,
      endDate,
      createdBy: req.user._id,
      participants
    });

    // Notify enrolled participants
    if (participantIds.length > 0) {
      const employees = await Employee.find({ _id: { $in: participantIds } }).select('user');
      const notifications = employees.map(emp => ({
        user: emp.user,
        type: 'Training',
        message: `You have been enrolled in training: ${title}`,
        link: '/trainings'
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    const populated = await Training.findById(training._id)
      .populate('createdBy', 'name email role')
      .populate({
        path: 'participants.employee',
        select: 'employeeId designation user',
        populate: { path: 'user', select: 'name email' }
      })
      .lean();

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      data: populated
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/trainings/:id (Manager Only - updates details, enrolls/removes members, sets score/completion)
router.put('/:id', [
  verifyToken,
  authorize('Manager'),
  validate
], async (req, res, next) => {
  try {
    const training = await Training.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found or unauthorized'
      });
    }

    const { title, description, trainer, startDate, endDate, participants } = req.body;
    if (title) training.title = title;
    if (description) training.description = description;
    if (trainer) training.trainer = trainer;
    if (startDate) training.startDate = startDate;
    if (endDate) training.endDate = endDate;

    // Update participants list and performance scores
    if (participants && Array.isArray(participants)) {
      training.participants = participants.map(p => ({
        employee: p.employee || p.employeeId,
        status: p.status || 'Enrolled',
        score: p.score !== undefined ? Number(p.score) : 0
      }));
    }

    await training.save();

    const updated = await Training.findById(training._id)
      .populate('createdBy', 'name email role')
      .populate({
        path: 'participants.employee',
        select: 'employeeId department designation user',
        populate: { path: 'user', select: 'name email' }
      })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Training program updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/trainings/:id (Manager Only - deletes own training)
router.delete('/:id', [verifyToken, authorize('Manager')], async (req, res, next) => {
  try {
    const training = await Training.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Training program deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
