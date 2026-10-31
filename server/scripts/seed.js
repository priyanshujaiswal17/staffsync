const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');
const Notification = require('../models/Notification');

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);

    // 1. HR Users (Admin and HR Director)
    let hrUser = await User.findOne({ email: 'hr@staffsync.com' });
    if (!hrUser) {
      hrUser = await User.create({
        name: 'Sarah HR Director',
        email: 'hr@staffsync.com',
        passwordHash,
        role: 'HR'
      });
    }

    let adminUser = await User.findOne({ email: 'admin@staffsync.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@staffsync.com',
        passwordHash,
        role: 'HR'
      });
    }

    // 2. Managers
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

    let manager2User = await User.findOne({ email: 'manager2@staffsync.com' });
    if (!manager2User) {
      manager2User = await User.create({
        name: 'Marcus Product Director',
        email: 'manager2@staffsync.com',
        passwordHash,
        role: 'Manager'
      });
    }

    let manager2Profile = await Manager.findOne({ user: manager2User._id });
    if (!manager2Profile) {
      manager2Profile = await Manager.create({
        user: manager2User._id,
        department: 'Product & Design',
        team: []
      });
    }

    // 3. Employees
    // Employee 1
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
    } else {
      emp1Profile.leaveBalance = { casual: 12, sick: 10, annual: 15 };
      await emp1Profile.save();
      await Leave.deleteMany({ employee: emp1Profile._id, reason: 'Personal family event' });
    }

    // Employee 2
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
    } else {
      emp2Profile.leaveBalance = { casual: 12, sick: 10, annual: 15 };
      await emp2Profile.save();
    }

    // Employee 3 (Product & Design)
    let emp3User = await User.findOne({ email: 'emp3@staffsync.com' });
    if (!emp3User) {
      emp3User = await User.create({
        name: 'David UX Designer',
        email: 'emp3@staffsync.com',
        passwordHash,
        role: 'Employee'
      });
    }

    let emp3Profile = await Employee.findOne({ user: emp3User._id });
    if (!emp3Profile) {
      emp3Profile = await Employee.create({
        user: emp3User._id,
        employeeId: 'EMP-1003',
        department: 'Product & Design',
        designation: 'Senior Product Designer',
        phone: '+1-555-0103',
        address: '789 Creative Blvd',
        dateOfBirth: new Date('1993-11-12'),
        manager: manager2Profile._id,
        leaveBalance: { casual: 10, sick: 8, annual: 14 },
        status: 'Active'
      });
    }

    // Employee 4 (DevOps / Infrastructure)
    let emp4User = await User.findOne({ email: 'emp4@staffsync.com' });
    if (!emp4User) {
      emp4User = await User.create({
        name: 'Sophia Cloud Architect',
        email: 'emp4@staffsync.com',
        passwordHash,
        role: 'Employee'
      });
    }

    let emp4Profile = await Employee.findOne({ user: emp4User._id });
    if (!emp4Profile) {
      emp4Profile = await Employee.create({
        user: emp4User._id,
        employeeId: 'EMP-1004',
        department: 'Engineering',
        designation: 'DevOps & Cloud Engineer',
        phone: '+1-555-0104',
        address: '321 Cloud Summit Road',
        dateOfBirth: new Date('1991-03-25'),
        manager: managerProfile._id,
        leaveBalance: { casual: 8, sick: 10, annual: 12 },
        status: 'Active'
      });
    }

    // Employee 5 (Marketing)
    let emp5User = await User.findOne({ email: 'emp5@staffsync.com' });
    if (!emp5User) {
      emp5User = await User.create({
        name: 'Liam Growth Marketer',
        email: 'emp5@staffsync.com',
        passwordHash,
        role: 'Employee'
      });
    }

    let emp5Profile = await Employee.findOne({ user: emp5User._id });
    if (!emp5Profile) {
      emp5Profile = await Employee.create({
        user: emp5User._id,
        employeeId: 'EMP-1005',
        department: 'Marketing',
        designation: 'Growth Marketing Manager',
        phone: '+1-555-0105',
        address: '654 Market Plaza',
        dateOfBirth: new Date('1995-07-08'),
        manager: manager2Profile._id,
        leaveBalance: { casual: 11, sick: 10, annual: 15 },
        status: 'Active'
      });
    }

    // Employee 6 (Human Resources)
    let emp6User = await User.findOne({ email: 'emp6@staffsync.com' });
    if (!emp6User) {
      emp6User = await User.create({
        name: 'Olivia People Specialist',
        email: 'emp6@staffsync.com',
        passwordHash,
        role: 'Employee'
      });
    }

    let emp6Profile = await Employee.findOne({ user: emp6User._id });
    if (!emp6Profile) {
      emp6Profile = await Employee.create({
        user: emp6User._id,
        employeeId: 'EMP-1006',
        department: 'Human Resources',
        designation: 'Talent & Culture Partner',
        phone: '+1-555-0106',
        address: '987 Harmony Lane',
        dateOfBirth: new Date('1996-02-14'),
        manager: null,
        leaveBalance: { casual: 12, sick: 10, annual: 15 },
        status: 'Active'
      });
    }

    // Update Manager teams
    managerProfile.team = [emp1Profile._id, emp2Profile._id, emp4Profile._id];
    await managerProfile.save();

    manager2Profile.team = [emp3Profile._id, emp5Profile._id];
    await manager2Profile.save();

    // 4. Seed Demo Attendance Records
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayDate = new Date(Date.now() - 86400000);
    const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);
    const twoDaysAgoDate = new Date(Date.now() - 86400000 * 2);
    const twoDaysAgoStr = twoDaysAgoDate.toISOString().slice(0, 10);

    const attendanceData = [
      // Today
      { employee: emp1Profile._id, date: todayStr, checkIn: new Date(`${todayStr}T09:05:00Z`), checkOut: new Date(`${todayStr}T17:30:00Z`), status: 'Present' },
      { employee: emp2Profile._id, date: todayStr, checkIn: new Date(`${todayStr}T09:45:00Z`), status: 'Late' },
      { employee: emp3Profile._id, date: todayStr, checkIn: new Date(`${todayStr}T08:55:00Z`), checkOut: new Date(`${todayStr}T17:15:00Z`), status: 'Present' },
      { employee: emp4Profile._id, date: todayStr, status: 'On Leave' },
      { employee: emp5Profile._id, date: todayStr, checkIn: new Date(`${todayStr}T09:12:00Z`), status: 'Present' },
      // Yesterday
      { employee: emp1Profile._id, date: yesterdayStr, checkIn: new Date(`${yesterdayStr}T09:00:00Z`), checkOut: new Date(`${yesterdayStr}T17:00:00Z`), status: 'Present' },
      { employee: emp2Profile._id, date: yesterdayStr, checkIn: new Date(`${yesterdayStr}T09:10:00Z`), checkOut: new Date(`${yesterdayStr}T17:30:00Z`), status: 'Present' },
      { employee: emp3Profile._id, date: yesterdayStr, checkIn: new Date(`${yesterdayStr}T09:02:00Z`), checkOut: new Date(`${yesterdayStr}T17:10:00Z`), status: 'Present' },
      { employee: emp4Profile._id, date: yesterdayStr, checkIn: new Date(`${yesterdayStr}T08:50:00Z`), checkOut: new Date(`${yesterdayStr}T16:50:00Z`), status: 'Present' },
      // Two days ago
      { employee: emp1Profile._id, date: twoDaysAgoStr, checkIn: new Date(`${twoDaysAgoStr}T08:58:00Z`), checkOut: new Date(`${twoDaysAgoStr}T17:05:00Z`), status: 'Present' },
      { employee: emp2Profile._id, date: twoDaysAgoStr, checkIn: new Date(`${twoDaysAgoStr}T09:35:00Z`), checkOut: new Date(`${twoDaysAgoStr}T17:40:00Z`), status: 'Late' },
      { employee: emp3Profile._id, date: twoDaysAgoStr, checkIn: new Date(`${twoDaysAgoStr}T09:00:00Z`), checkOut: new Date(`${twoDaysAgoStr}T17:00:00Z`), status: 'Present' }
    ];

    for (const att of attendanceData) {
      const exists = await Attendance.findOne({ employee: att.employee, date: att.date });
      if (!exists) {
        await Attendance.create(att);
      }
    }

    // 5. Seed Demo Leaves
    const futureDate1 = new Date(Date.now() + 86400000 * 3);
    const futureDate2 = new Date(Date.now() + 86400000 * 6);
    const futureDate3 = new Date(Date.now() + 86400000 * 8);
    const futureDate4 = new Date(Date.now() + 86400000 * 10);

    const leavesData = [
      {
        employee: emp3Profile._id,
        type: 'Annual',
        startDate: futureDate1,
        endDate: futureDate2,
        days: 3,
        reason: 'Family annual reunion trip abroad',
        status: 'Pending'
      },
      {
        employee: emp4Profile._id,
        type: 'Casual',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 2),
        days: 2,
        reason: 'House relocation and utility setup',
        status: 'Approved',
        reviewedBy: hrUser._id,
        reviewNote: 'Approved. Enjoy your new home!'
      },
      {
        employee: emp5Profile._id,
        type: 'Sick',
        startDate: futureDate3,
        endDate: futureDate4,
        days: 2,
        reason: 'Medical dental appointment and surgery recovery',
        status: 'Pending'
      }
    ];

    for (const lv of leavesData) {
      const exists = await Leave.findOne({ employee: lv.employee, reason: lv.reason });
      if (!exists) {
        await Leave.create(lv);
      }
    }

    // 6. Seed Demo Announcements
    const announcementsData = [
      {
        title: 'Welcome to StaffSync Modern HRM System',
        body: 'Welcome to StaffSync 2.0! Use your central dashboard to submit leave requests, record daily attendance, track assigned training programs, and stay updated with organizational announcements.',
        postedBy: hrUser._id,
        audience: 'All',
        pinned: true
      },
      {
        title: 'Q4 Global Townhall & Strategic Roadmap',
        body: 'Join executive leadership this coming Friday at 3:00 PM EST for our Q4 Townhall meeting. We will review company milestones, employee recognitions, and the 2027 technical roadmap.',
        postedBy: hrUser._id,
        audience: 'All',
        pinned: true
      },
      {
        title: 'Annual Health Benefits & Wellness Enrollment',
        body: 'Open enrollment for healthcare benefits, dental coverage, and company gym subsidies begins on the 1st of next month. Review your benefits guide on the HR portal.',
        postedBy: hrUser._id,
        audience: 'All',
        pinned: false
      }
    ];

    for (const ann of announcementsData) {
      const exists = await Announcement.findOne({ title: ann.title });
      if (!exists) {
        await Announcement.create(ann);
      }
    }

    // 7. Seed Demo Trainings
    const trainingsData = [
      {
        title: 'Cloud Architecture & Microservices Mastery',
        description: 'Comprehensive deep dive into modern cloud architecture, container orchestration, and high-availability design patterns.',
        trainer: 'Alex Rivera',
        startDate: new Date(Date.now() - 86400000 * 5),
        endDate: new Date(Date.now() + 86400000 * 10),
        createdBy: managerUser._id,
        participants: [
          { employee: emp1Profile._id, status: 'Completed', score: 96 },
          { employee: emp2Profile._id, status: 'Completed', score: 92 },
          { employee: emp4Profile._id, status: 'Enrolled', score: 0 }
        ]
      },
      {
        title: 'Design Systems & UI Accessibility Standards',
        description: 'Hands-on workshop establishing design tokens, WCAG AA compliance, and building reusable component libraries.',
        trainer: 'Marcus Chen',
        startDate: new Date(Date.now() - 86400000 * 2),
        endDate: new Date(Date.now() + 86400000 * 12),
        createdBy: manager2User._id,
        participants: [
          { employee: emp3Profile._id, status: 'Completed', score: 94 },
          { employee: emp5Profile._id, status: 'Enrolled', score: 0 }
        ]
      }
    ];

    for (const tr of trainingsData) {
      const exists = await Training.findOne({ title: tr.title });
      if (!exists) {
        await Training.create(tr);
      }
    }

    // 8. Seed Demo Notifications
    const notificationsData = [
      {
        user: emp1User._id,
        type: 'Announcement',
        message: 'New Pinned Announcement: Welcome to StaffSync Modern HRM System',
        read: false,
        link: '/announcements'
      },
      {
        user: emp3User._id,
        type: 'Leave',
        message: 'Your leave application for 3 days has been submitted and is currently Pending review.',
        read: false,
        link: '/leaves'
      },
      {
        user: hrUser._id,
        type: 'Leave',
        message: 'David UX Designer submitted a new Annual Leave request awaiting review.',
        read: false,
        link: '/leaves'
      },
      {
        user: adminUser._id,
        type: 'System',
        message: 'System initialization complete. All HR services and reporting modules operational.',
        read: false,
        link: '/hr/dashboard'
      }
    ];

    for (const notif of notificationsData) {
      const exists = await Notification.findOne({ user: notif.user, message: notif.message });
      if (!exists) {
        await Notification.create(notif);
      }
    }

    console.log(`Seed completed: 2 HR/Admins, 2 Managers, 6 Employees across 4 departments, with Attendance, Leaves, Announcements, Trainings, and Notifications.`);
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

