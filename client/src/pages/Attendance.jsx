import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../api/axios';
import { checkIn, checkOut, fetchTodayAttendance, clearAttendanceStatus } from '../store/attendanceSlice';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function Attendance() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { today, loading: actionLoading, successMessage, error: actionError } = useSelector((state) => state.attendance);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/attendance/my-history';
      const params = { page, limit: 12 };

      if (user?.role === 'Manager') {
        url = '/attendance/team';
      } else if (user?.role === 'HR') {
        url = '/attendance';
        if (statusFilter) params.status = statusFilter;
        if (search) params.search = search;
      }

      if (monthFilter) params.month = monthFilter;

      const res = await api.get(url, { params });
      setRecords(res.data.data || []);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Employee') {
      dispatch(fetchTodayAttendance());
    }
  }, [dispatch, user]);

  useEffect(() => {
    loadAttendance();
  }, [page, monthFilter, statusFilter, search, user, successMessage]);

  const columns = [
    ...(user?.role !== 'Employee' ? [
      {
        header: 'Employee',
        render: (row) => (
          <div>
            <div className="fw-semibold text-dark">{row.employee?.user?.name || 'N/A'}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>{row.employee?.employeeId} • {row.employee?.department}</div>
          </div>
        )
      }
    ] : []),
    {
      header: 'Date',
      accessor: 'date',
      render: (row) => <span className="tabular-nums fw-medium">{row.date}</span>
    },
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
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div>
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            {user?.role === 'Employee' ? 'My Attendance' : user?.role === 'Manager' ? 'Team Attendance Tracking' : 'Organization Attendance Tracking'}
          </h4>
          <p className="text-secondary small mb-0">Review verified daily timestamp records and presence ratios.</p>
        </div>

        {user?.role === 'Employee' && (
          <div className="d-flex align-items-center gap-2">
            {!today?.checkIn ? (
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => dispatch(checkIn())}
                disabled={actionLoading}
              >
                <i className="bi bi-box-arrow-in-right"></i>
                <span>{actionLoading ? 'Recording...' : 'Check In Today'}</span>
              </button>
            ) : !today?.checkOut ? (
              <button
                className="btn btn-outline-danger d-flex align-items-center gap-2"
                onClick={() => dispatch(checkOut())}
                disabled={actionLoading}
              >
                <i className="bi bi-box-arrow-left"></i>
                <span>{actionLoading ? 'Recording...' : 'Check Out Today'}</span>
              </button>
            ) : (
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                <i className="bi bi-check-circle me-1"></i> Checked Out
              </span>
            )}
          </div>
        )}
      </div>

      {successMessage && (
        <div className="alert alert-success py-2 px-3 small d-flex justify-content-between align-items-center mb-4">
          <span><i className="bi bi-check-circle-fill me-2"></i>{successMessage}</span>
          <button className="btn btn-sm btn-link text-success p-0" onClick={() => dispatch(clearAttendanceStatus())}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}
      {actionError && (
        <div className="alert alert-warning py-2 px-3 small d-flex justify-content-between align-items-center mb-4">
          <span><i className="bi bi-exclamation-triangle-fill me-2"></i>{actionError}</span>
          <button className="btn btn-sm btn-link text-dark p-0" onClick={() => dispatch(clearAttendanceStatus())}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* Filter Component */}
      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        error={error}
        onRetry={loadAttendance}
        page={page}
        pages={pages}
        total={total}
        onPageChange={setPage}
        searchPlaceholder={user?.role === 'HR' ? 'Search employee name or ID...' : ''}
        searchTerm={search}
        onSearchChange={user?.role === 'HR' ? setSearch : null}
        filterComponent={
          <div className="d-flex align-items-center gap-2">
            <input
              type="month"
              className="form-control form-control-sm"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              title="Filter by Month"
            />
            {user?.role === 'HR' && (
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
            )}
            {(monthFilter || statusFilter || search) && (
              <button
                className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                onClick={() => { setMonthFilter(''); setStatusFilter(''); setSearch(''); }}
              >
                Reset
              </button>
            )}
          </div>
        }
        emptyTitle="No attendance records found"
        emptyMessage="There are no attendance records for the selected filters."
      />
    </div>
  );
}
