const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);

    // 1. HR User
    let hrUser = await User.findOne({ email: 'hr@staffsync.com' });
    if (!hrUser) {
      hrUser = await User.create({
        name: 'Sarah HR Director',
        email: 'hr@staffsync.com',
        passwordHash,
        role: 'HR'
      });
    }

    // 2. Manager User
    let managerUser = await User.findOne({ email: 'manager@staffsync.com' });
    if (!managerUser) {
      managerUser = await User.create({
        name: 'Alex Tech Lead',
        email: 'manager@staffsync.com',
        passwordHash,
        role: 'Manager'
      });
    }

    let managerProfile = await Manager.findOne({ user: managerUser._id });
    if (!managerProfile) {
      managerProfile = await Manager.create({
        user: managerUser._id,
        department: 'Engineering',
        team: []
      });
    }

    // 3. Employee 1
    let emp1User = await User.findOne({ email: 'emp1@staffsync.com' });
    if (!emp1User) {
      emp1User = await User.create({
        name: 'John Developer',
        email: 'emp1@staffsync.com',
        passwordHash,
        role: 'Employee'
      });
    }

    let emp1Profile = await Employee.findOne({ user: emp1User._id });
    if (!emp1Profile) {
      emp1Profile = await Employee.create({
        user: emp1User._id,
        employeeId: 'EMP-1001',
        department: 'Engineering',
        designation: 'Senior Frontend Engineer',
        phone: '+1-555-0101',
        address: '123 Tech Park, Suite 400',
        dateOfBirth: new Date('1992-05-15'),
        manager: managerProfile._id,
        leaveBalance: { casual: 12, sick: 10, annual: 15 },
        status: 'Active'
      });
    }

    // 4. Employee 2
    let emp2User = await User.findOne({ email: 'emp2@staffsync.com' });
    if (!emp2User) {
      emp2User = await User.create({
        name: 'Emily Quality Specialist',
        email: 'emp2@staffsync.com',
        passwordHash,
        role: 'Employee'
      });
    }

    let emp2Profile = await Employee.findOne({ user: emp2User._id });
    if (!emp2Profile) {
      emp2Profile = await Employee.create({
        user: emp2User._id,
        employeeId: 'EMP-1002',
        department: 'Engineering',
        designation: 'Lead QA Engineer',
        phone: '+1-555-0102',
        address: '456 Innovation Way',
        dateOfBirth: new Date('1994-08-20'),
        manager: managerProfile._id,
        leaveBalance: { casual: 12, sick: 10, annual: 15 },
        status: 'Active'
      });
    }

    // Update Manager team
    managerProfile.team = [emp1Profile._id, emp2Profile._id];
    await managerProfile.save();

    console.log(`Seed completed: 1 HR, 1 Manager, 2 Employees.`);
    if (connectDB.disconnectDB) {
      await connectDB.disconnectDB();
    } else {
      await mongoose.disconnect();
    }
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();
