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
        const [repRes, annRes, empRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/announcements?limit=3'),
          api.get('/employees?limit=5')
        ]);
        setData({
          reports: repRes.data.data,
          announcements: annRes.data.data,
          employees: empRes.data.data
        });
      } catch (err) {
        // Handled silently
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <Skeleton type="table" count={4} />;

  const summary = data?.reports?.summary || {};
  const attendanceRate = data?.reports?.attendanceStats?.[0]?.rate || 95;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Human Resources Command Center</h4>
          <p className="text-secondary small mb-0">Complete organization overview: headcount, attendance ratios, and employee operations.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/employees" className="btn btn-primary d-flex align-items-center gap-2">
            <i className="bi bi-person-plus"></i> Manage Directory
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Total Active Headcount"
            value={summary.totalEmployees || 0}
            caption="Across all departments"
            icon="bi-people"
            deltaType="positive"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Pending Leave Requests"
            value={summary.pendingLeaves || 0}
            caption="Across all business units"
            icon="bi-hourglass-split"
            deltaType={summary.pendingLeaves > 0 ? 'negative' : 'positive'}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Average Attendance Rate"
            value={`${Math.round(attendanceRate)}%`}
            caption="Current billing cycle"
            icon="bi-calendar-check"
            deltaType="positive"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Training Programs"
            value={data?.reports?.trainingMetrics?.totalEnrolled || 0}
            caption={`${data?.reports?.trainingMetrics?.completionRate || 0}% Completion`}
            icon="bi-mortarboard"
            deltaType="neutral"
          />
        </div>
      </div>

      {/* 2 Column Details: Recent Employee Updates & Department Distribution */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card h-100 p-4 border-1 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold text-dark mb-0">Recent Employees Added</h6>
              <Link to="/employees" className="text-primary small text-decoration-none fw-medium">
                Full Directory <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            {data?.employees?.length === 0 ? (
              <p className="text-muted small py-4 text-center">No employee records found.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {data?.employees?.map((e) => (
                  <div key={e._id} className="p-2.5 rounded border bg-white d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold text-dark small">{e.user?.name}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>
                        {e.employeeId} • {e.department} — {e.designation}
                      </div>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card h-100 p-4 border-1 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold text-dark mb-0">Headcount by Department</h6>
              <Link to="/reports" className="text-primary small text-decoration-none fw-medium">
                View Reports <i className="bi bi-arrow-right"></i>
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
                      <span className="fw-semibold text-secondary tabular-nums">{d.count} staff</span>
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
    </div>
  );
}
