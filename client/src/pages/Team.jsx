import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Skeleton from '../components/Skeleton';

export default function Team() {
  const [team, setTeam] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    async function loadTeamData() {
      try {
        setLoading(true);
        const [teamRes, attRes] = await Promise.all([
          api.get('/managers/team'),
          api.get(`/attendance/team?date=${dateFilter}`)
        ]);
        setTeam(teamRes.data.data || []);
        setAttendance(attRes.data.data || []);
      } catch (err) {
        // Handled silently
      } finally {
        setLoading(false);
      }
    }
    loadTeamData();
  }, [dateFilter]);

  const teamColumns = [
    {
      header: 'Member',
      render: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 34, height: 34, fontSize: 13 }}>
            {row.user?.name?.charAt(0)}
          </div>
          <div>
            <div className="fw-semibold text-dark">{row.user?.name}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>{row.user?.email}</div>
          </div>
        </div>
      )
    },
    { header: 'Employee ID', accessor: 'employeeId', render: (row) => <span className="tabular-nums fw-medium">{row.employeeId}</span> },
    { header: 'Designation', accessor: 'designation' },
    { header: 'Department', accessor: 'department' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Attendance Rate',
      render: (row) => (
        <div className="d-flex align-items-center gap-2" style={{ minWidth: 100 }}>
          <div className="progress flex-grow-1" style={{ height: 6 }}>
            <div
              className={`progress-bar ${(row.attendanceRate ?? 100) >= 80 ? 'bg-success' : (row.attendanceRate ?? 100) >= 60 ? 'bg-warning' : 'bg-danger'}`}
              style={{ width: `${row.attendanceRate ?? 100}%` }}
            ></div>
          </div>
          <span className="small tabular-nums fw-medium">{row.attendanceRate ?? 100}%</span>
        </div>
      )
    },
    {
      header: 'Training Performance',
      render: (row) => (
        <span className="badge bg-light text-secondary border small">
          <i className="bi bi-mortarboard me-1 text-primary"></i>
          {row.completedTrainings || 0} / {row.enrolledTrainings || 0} Completed
        </span>
      )
    },
    {
      header: 'Leave Balance',
      render: (row) => (
        <span className="small tabular-nums text-muted">
          C:{row.leaveBalance?.casual || 0} / S:{row.leaveBalance?.sick || 0} / A:{row.leaveBalance?.annual || 0}
        </span>
      )
    }
  ];

  const attColumns = [
    {
      header: 'Member',
      render: (row) => (
        <span className="fw-semibold text-dark">{row.employee?.user?.name || 'Team Member'}</span>
      )
    },
    { header: 'Date', render: (row) => <span className="tabular-nums">{row.date}</span> },
    {
      header: 'Check In',
      render: (row) => (
        <span className="tabular-nums text-muted">
          {row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      )
    },
    {
      header: 'Check Out',
      render: (row) => (
        <span className="tabular-nums text-muted">
          {row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      )
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  if (loading) return <Skeleton type="table" count={4} />;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">My Departmental Team</h4>
          <p className="text-secondary small mb-0">Overview of assigned team members, leave allowances, and attendance presence.</p>
        </div>
      </div>

      {/* Team Members List */}
      <div className="mb-5">
        <h6 className="fw-semibold text-dark mb-3">Direct Team Reports ({team.length})</h6>
        <DataTable
          columns={teamColumns}
          data={team}
          emptyTitle="No team members assigned"
          emptyMessage="You currently have no direct reports in your department team."
        />
      </div>

      {/* Daily Team Attendance Table */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h6 className="fw-semibold text-dark mb-0">Daily Team Presence</h6>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Filter Date:</span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
        <DataTable
          columns={attColumns}
          data={attendance}
          emptyTitle="No attendance logs"
          emptyMessage={`No team check-in records found for ${dateFilter}.`}
        />
      </div>
    </div>
  );
}
