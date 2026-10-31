const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Training = require('../models/Training');
const { verifyToken, authorize } = require('../middleware/auth');

// GET /api/reports/dashboard (HR Only - Aggregated metrics & analytics)
router.get('/dashboard', [verifyToken, authorize('HR')], async (req, res, next) => {
  try {
    // 1. Headcount by department
    const headcountByDept = await Employee.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $project: { department: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    // 2. Attendance rate by month (last 6 months)
    const attendanceStats = await Attendance.aggregate([
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] }, // YYYY-MM
          totalRecords: { $sum: 1 },
          presentCount: {
            $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] }
          },
          lateCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] }
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          },
          onLeaveCount: {
            $sum: { $cond: [{ $eq: ['$status', 'On Leave'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          month: '$_id',
          totalRecords: 1,
          presentCount: 1,
          lateCount: 1,
          absentCount: 1,
          onLeaveCount: 1,
          rate: {
            $cond: [
              { $gt: ['$totalRecords', 0] },
              { $multiply: [{ $divide: ['$presentCount', '$totalRecords'] }, 100] },
              0
            ]
          },
          _id: 0
        }
      },
      { $sort: { month: -1 } },
      { $limit: 6 }
    ]);

    // 3. Leave stats by type and status
    const leaveStats = await Leave.aggregate([
      {
        $group: {
          _id: { type: '$type', status: '$status' },
          count: { $sum: 1 },
          totalDays: { $sum: '$days' }
        }
      },
      {
        $project: {
          type: '$_id.type',
          status: '$_id.status',
          count: 1,
          totalDays: 1,
          _id: 0
        }
      }
    ]);

    // 4. Training completion rate
    const trainingAgg = await Training.aggregate([
      { $unwind: { path: '$participants', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: null,
          totalEnrolled: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$participants.status', 'Completed'] }, 1, 0] }
          },
          avgScore: { $avg: '$participants.score' }
        }
      },
      {
        $project: {
          _id: 0,
          totalEnrolled: 1,
          completed: 1,
          completionRate: {
            $cond: [
              { $gt: ['$totalEnrolled', 0] },
              { $multiply: [{ $divide: ['$completed', '$totalEnrolled'] }, 100] },
              0
            ]
          },
          avgScore: { $round: ['$avgScore', 1] }
        }
      }
    ]);

    const trainingMetrics = trainingAgg.length > 0 ? trainingAgg[0] : {
      totalEnrolled: 0,
      completed: 0,
      completionRate: 0,
      avgScore: 0
    };

    // Overall summary counts
    const totalEmployees = await Employee.countDocuments({ status: 'Active' });
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEmployees,
          pendingLeaves
        },
        headcountByDept,
        attendanceStats,
        leaveStats,
        trainingMetrics
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
