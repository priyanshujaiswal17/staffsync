import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Skeleton from '../components/Skeleton';

export default function HRDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [repRes, annRes, empRes, leaveRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/announcements?limit=3'),
          api.get('/employees?limit=6'),
          api.get('/leaves/pending')
        ]);
        setData({
          reports: repRes.data.data,
          announcements: annRes.data.data,
          employees: empRes.data.data,
          pendingLeaves: leaveRes.data.data || []
        });
      } catch (err) {
        // Handled silently
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <Skeleton type="table" count={5} />;

  const summary = data?.reports?.summary || {};
  const attendanceRate = data?.reports?.attendanceStats?.[0]?.rate || 94;
  const pendingCount = data?.pendingLeaves?.length || summary.pendingLeaves || 0;

  return (
    <div>
      {/* Admin Command Center Header */}
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary-subtle text-primary fw-medium px-2 py-1 rounded" style={{ fontSize: 11 }}>
              <i className="bi bi-shield-check me-1"></i> Admin Portal
            </span>
            <span className="text-muted small">• StaffSync Executive Suite</span>
          </div>
          <h4 className="fw-bold text-dark mb-1">Human Resources & Operations Command Center</h4>
          <p className="text-secondary small mb-0">Complete organization overview: headcount, attendance ratios, pending requests, and employee management.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/employees" className="btn btn-primary d-flex align-items-center gap-2">
            <i className="bi bi-person-plus"></i> Add Employee
          </Link>
          <Link to="/leaves" className="btn btn-outline-secondary d-flex align-items-center gap-2 position-relative">
            <i className="bi bi-calendar-x"></i> Review Leaves
            {pendingCount > 0 && (
              <span className="badge rounded-pill bg-danger ms-1" style={{ fontSize: 10 }}>
                {pendingCount}
              </span>
            )}
          </Link>
          <Link to="/announcements" className="btn btn-outline-secondary d-flex align-items-center gap-2">
            <i className="bi bi-megaphone"></i> Post Notice
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Total Active Headcount"
            value={summary.totalEmployees || 0}
            caption="Across all business units"
            icon="bi-people"
            deltaType="positive"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Pending Leave Requests"
            value={pendingCount}
            caption={pendingCount > 0 ? "Requires administrative action" : "All requests resolved"}
            icon="bi-hourglass-split"
            deltaType={pendingCount > 0 ? 'negative' : 'positive'}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Monthly Attendance Rate"
            value={`${Math.round(attendanceRate)}%`}
            caption="Staff presence ratio"
            icon="bi-calendar-check"
            deltaType="positive"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Active Training Programs"
            value={data?.reports?.trainingMetrics?.totalEnrolled || 0}
            caption={`${data?.reports?.trainingMetrics?.completionRate || 0}% Completion (${data?.reports?.trainingMetrics?.avgScore || 0}% avg score)`}
            icon="bi-mortarboard"
            deltaType="neutral"
          />
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="card p-3 border-1 shadow-sm mb-4 bg-light">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-lightning-charge-fill text-warning fs-5"></i>
            <span className="fw-semibold text-dark small">Administrative Quick Links:</span>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/employees" className="btn btn-sm btn-white border bg-white text-dark fw-medium">
              <i className="bi bi-person-lines-fill me-1 text-primary"></i> Personnel Directory
            </Link>
            <Link to="/attendance" className="btn btn-sm btn-white border bg-white text-dark fw-medium">
              <i className="bi bi-clock-history me-1 text-success"></i> Attendance Monitor
            </Link>
            <Link to="/leaves" className="btn btn-sm btn-white border bg-white text-dark fw-medium">
              <i className="bi bi-calendar2-week me-1 text-warning"></i> Leave Queue
            </Link>
            <Link to="/announcements" className="btn btn-sm btn-white border bg-white text-dark fw-medium">
              <i className="bi bi-broadcast me-1 text-info"></i> Broadcast Center
            </Link>
            <Link to="/reports" className="btn btn-sm btn-white border bg-white text-dark fw-medium">
              <i className="bi bi-bar-chart-line-fill me-1 text-secondary"></i> Comprehensive Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Row: Pending Approvals & Department Distribution */}
      <div className="row g-4 mb-4">
        {/* Pending Leave Requests Queue */}
        <div className="col-12 col-lg-7">
          <div className="card h-100 p-4 border-1 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <h6 className="fw-semibold text-dark mb-0">Pending Leave Applications</h6>
                {pendingCount > 0 && (
                  <span className="badge bg-warning-subtle text-warning-emphasis small px-2 py-0.5 rounded-pill">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <Link to="/leaves" className="text-primary small text-decoration-none fw-medium">
                Manage Queue <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            {data?.pendingLeaves?.length === 0 ? (
              <div className="py-4 text-center">
                <i className="bi bi-check2-circle fs-2 text-success mb-2 d-block"></i>
                <p className="text-muted small mb-0">All leave requests have been reviewed and resolved.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2.5">
                {data?.pendingLeaves?.slice(0, 4).map((l) => (
                  <div key={l._id} className="p-3 rounded border bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold text-dark small">{l.employee?.user?.name}</span>
                        <span className="badge bg-light text-muted border px-1.5 py-0.5" style={{ fontSize: 10 }}>
                          {l.employee?.department}
                        </span>
                      </div>
                      <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                        <span className="fw-medium text-dark">{l.type} Leave</span> • {l.days} day(s) • Reason: "{l.reason}"
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <StatusBadge status={l.status} />
                      <Link to="/leaves" className="btn btn-sm btn-outline-primary py-1 px-2.5" style={{ fontSize: 12 }}>
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Headcount by Department Breakdown */}
        <div className="col-12 col-lg-5">
          <div className="card h-100 p-4 border-1 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold text-dark mb-0">Headcount by Department</h6>
              <Link to="/reports" className="text-primary small text-decoration-none fw-medium">
                Analytics <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            {data?.reports?.headcountByDept?.length === 0 ? (
              <p className="text-muted small py-4 text-center">No department records available.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {data?.reports?.headcountByDept?.map((d) => (
                  <div key={d.department}>
                    <div className="d-flex justify-content-between align-items-center small mb-1">
                      <span className="fw-medium text-dark">{d.department}</span>
                      <span className="fw-semibold text-secondary tabular-nums">
                        {d.count} staff ({Math.round((d.count / (summary.totalEmployees || 1)) * 100)}%)
                      </span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${Math.min(100, (d.count / (summary.totalEmployees || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Personnel Added & Organization Announcements */}
      <div className="row g-4">
        {/* Recent Employees Table */}
        <div className="col-12 col-lg-7">
          <div className="card h-100 p-4 border-1 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold text-dark mb-0">Recently Added Personnel</h6>
              <Link to="/employees" className="text-primary small text-decoration-none fw-medium">
                Full Directory ({summary.totalEmployees || 0}) <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            {data?.employees?.length === 0 ? (
              <p className="text-muted small py-4 text-center">No employee records found.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {data?.employees?.slice(0, 5).map((e) => (
                  <div key={e._id} className="p-2.5 rounded border bg-white d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2.5">
                      <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-semibold" style={{ width: 32, height: 32, fontSize: 12 }}>
                        {e.user?.name?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <div className="fw-semibold text-dark small">{e.user?.name}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          {e.employeeId} • {e.department} — {e.designation}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Company Announcements Feed */}
        <div className="col-12 col-lg-5">
          <div className="card h-100 p-4 border-1 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold text-dark mb-0">Active Notices & Announcements</h6>
              <Link to="/announcements" className="text-primary small text-decoration-none fw-medium">
                Broadcast Center <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            {data?.announcements?.length === 0 ? (
              <p className="text-muted small py-4 text-center">No announcements posted yet.</p>
            ) : (
              <div className="d-flex flex-column gap-2.5">
                {data?.announcements?.map((a) => (
                  <div key={a._id} className="p-2.5 rounded border bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-1.5">
                        {a.pinned && (
                          <span className="badge bg-primary text-white" style={{ fontSize: 9 }}>
                            <i className="bi bi-pin-angle-fill me-0.5"></i> PINNED
                          </span>
                        )}
                        <span className="fw-semibold text-dark small text-truncate" style={{ maxWidth: 220 }}>
                          {a.title}
                        </span>
                      </div>
                      <span className="text-muted" style={{ fontSize: 10 }}>
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-muted text-truncate" style={{ fontSize: 11 }}>
                      {a.body}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

