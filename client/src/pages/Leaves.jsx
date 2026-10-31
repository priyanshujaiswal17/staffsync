import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../api/axios';
import { fetchMyLeaves, applyLeave, reviewLeave, clearLeaveStatus } from '../store/leavesSlice';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function Leaves() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myLeaves, total, page, pages, loading, error, successMessage } = useSelector((state) => state.leaves);

  // Apply form state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyData, setApplyData] = useState({
    type: 'Casual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState(null);

  // Manager & HR review state
  const [pendingList, setPendingList] = useState([]);
  const [reviewModalLeave, setReviewModalLeave] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewAction, setReviewAction] = useState('Approved');
  const [reviewLoading, setReviewLoading] = useState(false);

  // HR all organization leaves state
  const [allLeaves, setAllLeaves] = useState([]);
  const [allLeavesLoading, setAllLeavesLoading] = useState(false);
  const [allLeavesPage, setAllLeavesPage] = useState(1);
  const [allLeavesPages, setAllLeavesPages] = useState(1);
  const [allLeavesTotal, setAllLeavesTotal] = useState(0);
  const [allStatusFilter, setAllStatusFilter] = useState('');
  const [allDeptFilter, setAllDeptFilter] = useState('');
  const [activeTab, setActiveTab] = useState(user?.role === 'HR' ? 'pending' : user?.role === 'Manager' ? 'pending' : 'my');

  const isReviewer = user?.role === 'Manager' || user?.role === 'HR';

  const loadPending = async () => {
    if (isReviewer) {
      try {
        const res = await api.get('/leaves/pending');
        setPendingList(res.data.data || []);
      } catch (err) {
        // Handled silently
      }
    }
  };

  const loadAllLeaves = async () => {
    if (user?.role === 'HR') {
      try {
        setAllLeavesLoading(true);
        const params = { page: allLeavesPage, limit: 10 };
        if (allStatusFilter) params.status = allStatusFilter;
        if (allDeptFilter) params.department = allDeptFilter;
        const res = await api.get('/leaves', { params });
        setAllLeaves(res.data.data || []);
        setAllLeavesPage(res.data.page || 1);
        setAllLeavesPages(res.data.pages || 1);
        setAllLeavesTotal(res.data.total || 0);
      } catch (err) {
        // Handled silently
      } finally {
        setAllLeavesLoading(false);
      }
    }
  };

  useEffect(() => {
    dispatch(fetchMyLeaves());
    loadPending();
  }, [dispatch, user]);

  useEffect(() => {
    if (user?.role === 'HR') {
      loadAllLeaves();
    }
  }, [user, allLeavesPage, allStatusFilter, allDeptFilter]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError(null);
    try {
      const res = await dispatch(applyLeave(applyData));
      if (!res.error) {
        setShowApplyModal(false);
        setApplyData({ type: 'Casual', startDate: '', endDate: '', reason: '' });
        dispatch(fetchMyLeaves());
        if (user?.role === 'HR') loadAllLeaves();
      } else {
        setApplyError(res.payload);
      }
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setApplyLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewModalLeave) return;
    setReviewLoading(true);
    try {
      const res = await dispatch(reviewLeave({
        id: reviewModalLeave._id,
        status: reviewAction,
        reviewNote
      }));
      if (!res.error) {
        setReviewModalLeave(null);
        setReviewNote('');
        loadPending();
        if (user?.role === 'HR') loadAllLeaves();
        dispatch(fetchMyLeaves());
      }
    } catch (err) {
      // Handled silently
    } finally {
      setReviewLoading(false);
    }
  };

  const myColumns = [
    { header: 'Type', accessor: 'type', render: (row) => <span className="fw-medium">{row.type} Leave</span> },
    {
      header: 'Dates',
      render: (row) => (
        <span className="tabular-nums">
          {new Date(row.startDate).toLocaleDateString()} &rarr; {new Date(row.endDate).toLocaleDateString()} ({row.days}d)
        </span>
      )
    },
    { header: 'Reason', accessor: 'reason', render: (row) => <span className="text-secondary small">{row.reason}</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Reviewer Note',
      render: (row) => (
        <span className="text-muted small">
          {row.reviewNote || (row.reviewedBy ? `Reviewed by ${row.reviewedBy.name}` : '—')}
        </span>
      )
    }
  ];

  const pendingColumns = [
    {
      header: 'Applicant',
      render: (row) => (
        <div>
          <div className="fw-semibold text-dark">{row.employee?.user?.name || 'Staff Member'}</div>
          <div className="text-muted" style={{ fontSize: 11 }}>{row.employee?.department} • {row.employee?.employeeId}</div>
        </div>
      )
    },
    { header: 'Type', render: (row) => <span className="fw-medium">{row.type}</span> },
    {
      header: 'Duration',
      render: (row) => (
        <span className="tabular-nums">
          {new Date(row.startDate).toLocaleDateString()} &rarr; {new Date(row.endDate).toLocaleDateString()} ({row.days} days)
        </span>
      )
    },
    { header: 'Reason', render: (row) => <span className="text-secondary small fst-italic">"{row.reason}"</span> },
    {
      header: 'Action',
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-success py-1 px-2.5"
            onClick={() => {
              setReviewModalLeave(row);
              setReviewAction('Approved');
              setReviewNote('');
            }}
          >
            <i className="bi bi-check-lg me-1"></i> Approve
          </button>
          <button
            className="btn btn-sm btn-outline-danger py-1 px-2.5"
            onClick={() => {
              setReviewModalLeave(row);
              setReviewAction('Rejected');
              setReviewNote('');
            }}
          >
            <i className="bi bi-x-lg me-1"></i> Reject
          </button>
        </div>
      )
    }
  ];

  const allColumns = [
    {
      header: 'Applicant',
      render: (row) => (
        <div>
          <div className="fw-semibold text-dark">{row.employee?.user?.name || 'Staff Member'}</div>
          <div className="text-muted" style={{ fontSize: 11 }}>{row.employee?.department} • {row.employee?.employeeId}</div>
        </div>
      )
    },
    { header: 'Type', render: (row) => <span className="fw-medium">{row.type}</span> },
    {
      header: 'Duration',
      render: (row) => (
        <span className="tabular-nums">
          {new Date(row.startDate).toLocaleDateString()} &rarr; {new Date(row.endDate).toLocaleDateString()} ({row.days}d)
        </span>
      )
    },
    { header: 'Reason', render: (row) => <span className="text-secondary small text-truncate d-inline-block" style={{ maxWidth: 180 }}>{row.reason}</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Reviewer',
      render: (row) => (
        <span className="text-muted small">
          {row.reviewedBy?.name ? `${row.reviewedBy.name}` : row.status === 'Pending' ? 'Pending' : '—'}
        </span>
      )
    },
    {
      header: 'Action',
      align: 'right',
      render: (row) => (
        row.status === 'Pending' ? (
          <div className="d-flex justify-content-end gap-1">
            <button
              className="btn btn-sm btn-success py-0.5 px-2"
              title="Approve"
              onClick={() => {
                setReviewModalLeave(row);
                setReviewAction('Approved');
                setReviewNote('');
              }}
            >
              <i className="bi bi-check"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-danger py-0.5 px-2"
              title="Reject"
              onClick={() => {
                setReviewModalLeave(row);
                setReviewAction('Rejected');
                setReviewNote('');
              }}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        ) : (
          <span className="text-muted small">—</span>
        )
      )
    }
  ];

  return (
    <div>
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Leave Management</h4>
          <p className="text-secondary small mb-0">Apply for time off and manage team review queues seamlessly.</p>
        </div>
        <div>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowApplyModal(true)}>
            <i className="bi bi-calendar-plus"></i> Apply for Leave
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success py-2 px-3 small d-flex justify-content-between align-items-center mb-4">
          <span><i className="bi bi-check-circle-fill me-2"></i>{successMessage}</span>
          <button className="btn btn-sm btn-link text-success p-0" onClick={() => dispatch(clearLeaveStatus())}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* Tabs navigation for Reviewers */}
      {isReviewer && (
        <div className="d-flex gap-2 border-bottom pb-2 mb-4">
          <button
            className={`btn btn-sm ${activeTab === 'pending' ? 'btn-primary' : 'btn-light border'} d-flex align-items-center gap-2`}
            onClick={() => setActiveTab('pending')}
          >
            <i className="bi bi-hourglass-split"></i>
            <span>Pending Review Queue ({pendingList.length})</span>
          </button>
          {user?.role === 'HR' && (
            <button
              className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-light border'} d-flex align-items-center gap-2`}
              onClick={() => setActiveTab('all')}
            >
              <i className="bi bi-building"></i>
              <span>All Company Leaves ({allLeavesTotal})</span>
            </button>
          )}
          <button
            className={`btn btn-sm ${activeTab === 'my' ? 'btn-primary' : 'btn-light border'} d-flex align-items-center gap-2`}
            onClick={() => setActiveTab('my')}
          >
            <i className="bi bi-person-badge"></i>
            <span>My Applications ({total})</span>
          </button>
        </div>
      )}

      {/* Review Queue Tab */}
      {isReviewer && activeTab === 'pending' && (
        <div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="fw-semibold text-dark mb-0">
              Pending Review Queue ({pendingList.length})
            </h6>
          </div>
          <DataTable
            columns={pendingColumns}
            data={pendingList}
            emptyTitle="Queue is empty"
            emptyMessage="There are currently no pending leave requests awaiting your review."
          />
        </div>
      )}

      {/* All Leaves Tab for HR */}
      {user?.role === 'HR' && activeTab === 'all' && (
        <div>
          <DataTable
            columns={allColumns}
            data={allLeaves}
            loading={allLeavesLoading}
            page={allLeavesPage}
            pages={allLeavesPages}
            total={allLeavesTotal}
            onPageChange={setAllLeavesPage}
            filterComponent={
              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select form-select-sm"
                  value={allDeptFilter}
                  onChange={(e) => { setAllDeptFilter(e.target.value); setAllLeavesPage(1); }}
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                </select>
                <select
                  className="form-select form-select-sm"
                  value={allStatusFilter}
                  onChange={(e) => { setAllStatusFilter(e.target.value); setAllLeavesPage(1); }}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                {(allDeptFilter || allStatusFilter) && (
                  <button
                    className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                    onClick={() => { setAllDeptFilter(''); setAllStatusFilter(''); setAllLeavesPage(1); }}
                  >
                    Reset
                  </button>
                )}
              </div>
            }
            emptyTitle="No leaves found"
            emptyMessage="No leave records matched your selected filters."
          />
        </div>
      )}

      {/* My Leave Requests Section */}
      {(!isReviewer || activeTab === 'my') && (
        <div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="fw-semibold text-dark mb-0">My Leave Applications</h6>
          </div>
          <DataTable
            columns={myColumns}
            data={myLeaves}
            loading={loading}
            error={error}
            onRetry={() => dispatch(fetchMyLeaves())}
            page={page}
            pages={pages}
            total={total}
            onPageChange={(p) => dispatch(fetchMyLeaves({ page: p }))}
            emptyTitle="No leave applications yet"
            emptyMessage="You have not submitted any leave requests."
            emptyActionLabel="Apply for Leave"
            onEmptyAction={() => setShowApplyModal(true)}
          />
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3 p-3">
          <div className="card shadow-lg border-1 w-100" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-dark mb-0">Apply for Time Off</h6>
              <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setShowApplyModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleApplySubmit} className="p-3">
              {applyError && (
                <div className="alert alert-danger py-2 px-3 small mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>{applyError}
                </div>
              )}
              <div className="mb-3">
                <label className="form-label" htmlFor="leaveType">Leave Type</label>
                <select
                  id="leaveType"
                  className="form-select"
                  value={applyData.type}
                  onChange={(e) => setApplyData({ ...applyData, type: e.target.value })}
                >
                  <option value="Casual">Casual Leave (12 Days Max)</option>
                  <option value="Sick">Sick Leave (10 Days Max)</option>
                  <option value="Annual">Annual Leave (15 Days Max)</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label" htmlFor="leaveStart">Start Date</label>
                  <input
                    id="leaveStart"
                    type="date"
                    className="form-control"
                    value={applyData.startDate}
                    onChange={(e) => setApplyData({ ...applyData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label" htmlFor="leaveEnd">End Date</label>
                  <input
                    id="leaveEnd"
                    type="date"
                    className="form-control"
                    value={applyData.endDate}
                    onChange={(e) => setApplyData({ ...applyData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label" htmlFor="leaveReason">Reason</label>
                <textarea
                  id="leaveReason"
                  className="form-control"
                  rows="3"
                  placeholder="Provide context for your manager..."
                  value={applyData.reason}
                  onChange={(e) => setApplyData({ ...applyData, reason: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={applyLoading}>
                  {applyLoading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Dialog Modal */}
      {reviewModalLeave && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3 p-3">
          <div className="card shadow-lg border-1 w-100" style={{ maxWidth: 460 }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-dark mb-0">Confirm {reviewAction} Decision</h6>
              <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setReviewModalLeave(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-3">
              <p className="small text-secondary mb-3">
                You are about to mark the leave request for <strong className="text-dark">{reviewModalLeave.employee?.user?.name}</strong> as <strong className={reviewAction === 'Approved' ? 'text-success' : 'text-danger'}>{reviewAction}</strong>.
              </p>
              <div className="mb-3">
                <label className="form-label" htmlFor="revNote">Review Note (Optional)</label>
                <textarea
                  id="revNote"
                  className="form-control"
                  rows="2"
                  placeholder="Add feedback or justification for the applicant..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-outline-secondary" onClick={() => setReviewModalLeave(null)}>
                  Cancel
                </button>
                <button
                  className={`btn ${reviewAction === 'Approved' ? 'btn-success' : 'btn-danger'} d-flex align-items-center gap-2`}
                  onClick={handleReviewSubmit}
                  disabled={reviewLoading}
                >
                  {reviewLoading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                  <span>Confirm {reviewAction}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
