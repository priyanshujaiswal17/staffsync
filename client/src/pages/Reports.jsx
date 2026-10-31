import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Skeleton from '../components/Skeleton';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/dashboard');
      setData(res.data.data);
    } catch (err) {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) return <Skeleton count={4} height={120} />;

  const summary = data?.summary || {};
  const headcount = data?.headcountByDept || [];
  const attendance = data?.attendanceStats || [];
  const leaves = data?.leaveStats || [];
  const training = data?.trainingMetrics || {};

  return (
    <div>
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Workforce Reports & Analytics</h4>
          <p className="text-secondary small mb-0">High-efficiency aggregation metrics covering attendance, headcount, leaves, and trainings.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={loadReports}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
          <button className="btn btn-sm btn-primary d-flex align-items-center gap-1" onClick={() => window.print()}>
            <i className="bi bi-printer"></i> Print / Export
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Total Headcount"
            value={summary.totalEmployees || 0}
            caption="Active staff members"
            icon="bi-people"
            deltaType="positive"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Pending Leaves"
            value={summary.pendingLeaves || 0}
            caption="Awaiting resolution"
            icon="bi-hourglass-split"
            deltaType="neutral"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Training Enrolments"
            value={training.totalEnrolled || 0}
            caption={`${training.completed || 0} completed`}
            icon="bi-mortarboard"
            deltaType="positive"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Training Avg Score"
            value={`${training.avgScore || 0}%`}
            caption={`${training.completionRate || 0}% completion rate`}
            icon="bi-award"
            deltaType="positive"
          />
        </div>
      </div>

      {/* Grid: Visual Distribution Cards */}
      <div className="row g-4 mb-4">
        {/* Headcount by Department */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 p-4 border-1 shadow-sm">
            <h6 className="fw-semibold text-dark mb-3">Headcount by Department</h6>
            {headcount.length === 0 ? (
              <p className="text-muted small">No department data available.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {headcount.map((item) => (
                  <div key={item.department}>
                    <div className="d-flex justify-content-between align-items-center small mb-1">
                      <span className="fw-medium text-dark">{item.department}</span>
                      <span className="fw-semibold text-secondary tabular-nums">{item.count} staff</span>
                    </div>
                    <div className="progress" style={{ height: 8 }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${Math.min(100, (item.count / (summary.totalEmployees || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Attendance Ratios */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 p-4 border-1 shadow-sm">
            <h6 className="fw-semibold text-dark mb-3">Monthly Attendance Performance</h6>
            {attendance.length === 0 ? (
              <p className="text-muted small">No attendance records found for this period.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {attendance.map((att) => (
                  <div key={att.month}>
                    <div className="d-flex justify-content-between align-items-center small mb-1">
                      <span className="fw-medium text-dark tabular-nums">{att.month}</span>
                      <span className="fw-semibold text-success tabular-nums">{Math.round(att.rate)}% present</span>
                    </div>
                    <div className="progress" style={{ height: 8 }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${Math.min(100, att.rate)}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: 11, marginTop: 2 }}>
                      <span>Present: {att.presentCount}</span>
                      <span>Late: {att.lateCount}</span>
                      <span>Absent: {att.absentCount}</span>
                      <span>On Leave: {att.onLeaveCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Stats Table */}
      <div className="card p-4 border-1 shadow-sm">
        <h6 className="fw-semibold text-dark mb-3">Leave Distribution by Type & Status</h6>
        {leaves.length === 0 ? (
          <p className="text-muted small">No leave requests logged in system.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-custom mb-0">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Status</th>
                  <th className="text-end">Application Count</th>
                  <th className="text-end">Total Days</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l, i) => (
                  <tr key={i}>
                    <td className="fw-medium">{l.type}</td>
                    <td>
                      <span className={`badge rounded-pill ${l.status === 'Approved' ? 'bg-success-subtle text-success' : l.status === 'Pending' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-danger-subtle text-danger'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="text-end tabular-nums">{l.count}</td>
                    <td className="text-end tabular-nums fw-semibold">{l.totalDays} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
