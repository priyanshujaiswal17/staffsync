const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, query } = require('express-validator');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const validate = require('../middleware/validate');
const { verifyToken, authorize } = require('../middleware/auth');

// ==========================================
// EMPLOYEE PROFILE (Self-Service)
// ==========================================

// GET /api/employees/profile/me
router.get('/profile/me', verifyToken, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('user', 'name email role isActive')
      .populate({
        path: 'manager',
        populate: { path: 'user', select: 'name email' }
      })
      .lean();

    if (!employee) {
      const manager = await Manager.findOne({ user: req.user._id }).populate('user', 'name email role isActive').lean();
      if (manager) {
        return res.status(200).json({
          success: true,
          data: {
            _id: manager._id,
            user: manager.user,
            employeeId: 'MGR-' + req.user._id.toString().slice(-4).toUpperCase(),
            department: manager.department,
            designation: 'Department Manager',
            phone: '',
            address: '',
            status: 'Active',
            leaveBalance: { casual: 12, sick: 10, annual: 15 }
          }
        });
      }

      const user = await User.findById(req.user._id).select('name email role isActive').lean();
      if (user) {
        return res.status(200).json({
          success: true,
          data: {
            _id: user._id,
            user,
            employeeId: 'HR-' + user._id.toString().slice(-4).toUpperCase(),
            department: 'Human Resources',
            designation: user.role === 'HR' ? 'HR Administrator' : 'Staff Member',
            phone: '',
            address: '',
            status: 'Active',
            leaveBalance: { casual: 12, sick: 10, annual: 15 }
          }
        });
      }

      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/profile/me (Personal fields only)
router.put('/profile/me', [
  verifyToken,
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
  validate
], async (req, res, next) => {
  try {
    let employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      const { name } = req.body;
      if (name) {
        await User.findByIdAndUpdate(req.user._id, { name });
      }
      const updatedUser = await User.findById(req.user._id).select('name email role isActive').lean();
      return res.status(200).json({
        success: true,
        data: {
          _id: req.user._id,
          user: updatedUser,
          employeeId: (req.user.role === 'Manager' ? 'MGR-' : 'HR-') + req.user._id.toString().slice(-4).toUpperCase(),
          department: req.user.role === 'Manager' ? 'Management' : 'Human Resources',
          designation: req.user.role === 'Manager' ? 'Department Manager' : 'HR Administrator',
          phone: req.body.phone || '',
          address: req.body.address || '',
          status: 'Active',
          leaveBalance: { casual: 12, sick: 10, annual: 15 }
        }
      });
    }

    const { name, phone, address, dateOfBirth } = req.body;

    // Only update allowed personal fields
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }
    if (phone !== undefined) employee.phone = phone;
    if (address !== undefined) employee.address = address;
    if (dateOfBirth !== undefined) employee.dateOfBirth = dateOfBirth;

    await employee.save();

    const updatedEmployee = await Employee.findById(employee._id)
      .populate('user', 'name email role isActive')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedEmployee
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// HR MANAGEMENT ENDPOINTS
// ==========================================

// GET /api/employees (HR Only - Paginated with filters & projection)
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
    if (req.query.status) {
      filter.status = req.query.status;
    }

    let userFilter = {};
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }]
      }).select('_id').lean();

      const userIds = matchingUsers.map(u => u._id);
      filter.$or = [
        { employeeId: searchRegex },
        { designation: searchRegex },
        { user: { $in: userIds } }
      ];
    }

    const total = await Employee.countDocuments(filter);
    const employees = await Employee.find(filter)
      .select('employeeId department designation phone status joinDate leaveBalance user manager createdAt')
      .populate('user', 'name email role isActive')
      .populate({
        path: 'manager',
        select: 'department user',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: employees,
      page,
      pages: Math.ceil(total / limit) || 1,
      total
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/employees (HR Only - Creates User + Employee)
router.post('/', [
  verifyToken,
  authorize('HR'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  validate
], async (req, res, next) => {
  try {
    const { name, email, password, department, designation, phone, address, dateOfBirth, managerId } = req.body;

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
      role: 'Employee'
    });

    const employeeId = 'EMP-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10);
    const employeeData = {
      user: user._id,
      employeeId,
      department,
      designation,
      phone: phone || '',
      address: address || '',
      dateOfBirth: dateOfBirth || null,
      status: 'Active'
    };

    if (managerId) {
      employeeData.manager = managerId;
    }

    const employee = await Employee.create(employeeData);

    // If manager assigned, add to manager team
    if (managerId) {
      await Manager.findByIdAndUpdate(managerId, {
        $addToSet: { team: employee._id }
      });
    }

    const populated = await Employee.findById(employee._id)
      .populate('user', 'name email role isActive')
      .populate({
        path: 'manager',
        populate: { path: 'user', select: 'name email' }
      })
      .lean();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: populated
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/:id (HR Only)
router.get('/:id', [verifyToken, authorize('HR')], async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'name email role isActive')
      .populate({
        path: 'manager',
        populate: { path: 'user', select: 'name email' }
      })
      .lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/:id (HR Only - Assign manager, activate/deactivate, update info)
router.put('/:id', [verifyToken, authorize('HR')], async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const { name, department, designation, phone, address, status, managerId, leaveBalance } = req.body;

    if (name) {
      await User.findByIdAndUpdate(employee.user, { name });
    }

    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (phone !== undefined) employee.phone = phone;
    if (address !== undefined) employee.address = address;
    if (leaveBalance) {
      if (leaveBalance.casual !== undefined) employee.leaveBalance.casual = leaveBalance.casual;
      if (leaveBalance.sick !== undefined) employee.leaveBalance.sick = leaveBalance.sick;
      if (leaveBalance.annual !== undefined) employee.leaveBalance.annual = leaveBalance.annual;
    }

    if (status) {
      employee.status = status;
      // Sync user isActive
      const isActive = status === 'Active';
      await User.findByIdAndUpdate(employee.user, { isActive });
    }

    // Manager reassignment
    if (managerId !== undefined) {
      // Remove from old manager team if changed
      if (employee.manager && String(employee.manager) !== String(managerId)) {
        await Manager.findByIdAndUpdate(employee.manager, {
          $pull: { team: employee._id }
        });
      }
      employee.manager = managerId || null;
      if (managerId) {
        await Manager.findByIdAndUpdate(managerId, {
          $addToSet: { team: employee._id }
        });
      }
    }

    await employee.save();

    const updated = await Employee.findById(employee._id)
      .populate('user', 'name email role isActive')
      .populate({
        path: 'manager',
        populate: { path: 'user', select: 'name email' }
      })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/employees/:id (HR Only - Deactivates employee)
router.delete('/:id', [verifyToken, authorize('HR')], async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employee.status = 'Inactive';
    await employee.save();
    await User.findByIdAndUpdate(employee.user, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
