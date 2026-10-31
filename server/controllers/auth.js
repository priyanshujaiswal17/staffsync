const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const Employee = require('../models/Employee');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'staffsync_super_secret_jwt_key_2026_modern_hrm',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  validate
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// POST /api/auth/register
router.post('/register', registerValidation, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

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

    // Create corresponding Employee profile
    const employeeId = 'EMP-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10);
    const employee = await Employee.create({
      user: user._id,
      employeeId,
      department: 'General',
      designation: 'Associate'
    });

    const token = generateToken(user._id, user.role);

    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.status(201).json({
      success: true,
      token,
      user: userObj,
      employee
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id, user.role);

    const userObj = user.toObject();
    delete userObj.passwordHash;

    // Fetch employee details if applicable
    const employee = await Employee.findOne({ user: user._id });

    res.status(200).json({
      success: true,
      token,
      user: userObj,
      employee
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    res.status(200).json({
      success: true,
      user: req.user,
      employee
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
