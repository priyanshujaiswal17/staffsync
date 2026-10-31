import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodayAttendance, checkIn, checkOut, clearAttendanceStatus } from '../store/attendanceSlice';
import { fetchMyLeaves } from '../store/leavesSlice';
import { fetchAnnouncements } from '../store/announcementsSlice';
import { fetchTrainings } from '../store/trainingsSlice';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Skeleton from '../components/Skeleton';

export default function EmployeeDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { today, loading: attLoading, successMessage: attMsg, error: attErr } = useSelector((state) => state.attendance);
  const { myLeaves } = useSelector((state) => state.leaves);
  const { items: announcements, loading: annLoading } = useSelector((state) => state.announcements);
  const { items: trainings } = useSelector((state) => state.trainings);

  useEffect(() => {
    dispatch(fetchTodayAttendance());
    dispatch(fetchMyLeaves());
    dispatch(fetchAnnouncements({ limit: 4 }));
    dispatch(fetchTrainings({ limit: 4 }));
  }, [dispatch]);

  const pendingLeavesCount = myLeaves.filter(l => l.status === 'Pending').length;
  const totalBalance = 37; // Standard annual aggregate

  return (
    <div>
      {/* Welcome Banner */}
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Welcome back, {user?.name}</h4>
          <p className="text-secondary small mb-0">Here is a summary of your workspace activity and daily presence.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {!today?.checkIn ? (
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => dispatch(checkIn())}
              disabled={attLoading}
            >
              <i className="bi bi-box-arrow-in-right"></i>
              <span>{attLoading ? 'Checking In...' : 'Quick Check-In'}</span>
            </button>
          ) : !today?.checkOut ? (
            <button
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              onClick={() => dispatch(checkOut())}
              disabled={attLoading}
            >
              <i className="bi bi-box-arrow-left"></i>
              <span>{attLoading ? 'Checking Out...' : 'Check-Out'}</span>
            </button>
          ) : (
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
              <i className="bi bi-check-circle me-1"></i> Checked Out Today
            </span>
          )}
        </div>
      </div>

      {/* Notifications / Feedback Alert */}
      {attMsg && (
        <div className="alert alert-success py-2 px-3 small d-flex justify-content-between align-items-center mb-4">
          <span><i className="bi bi-check-circle-fill me-2"></i>{attMsg}</span>
          <button className="btn btn-sm btn-link p-0 text-success" onClick={() => dispatch(clearAttendanceStatus())}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}
      {attErr && (
        <div className="alert alert-warning py-2 px-3 small d-flex justify-content-between align-items-center mb-4">
          <span><i className="bi bi-exclamation-triangle-fill me-2"></i>{attErr}</span>
          <button className="btn btn-sm btn-link p-0 text-dark" onClick={() => dispatch(clearAttendanceStatus())}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* 4 Stat Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Today's Status"
            value={today?.status || 'Not Checked In'}
            caption={today?.checkIn ? `At ${new Date(today.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Action required'}
            icon="bi-clock-history"
            deltaType={today?.checkIn ? 'positive' : 'negative'}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Pending Leaves"
            value={pendingLeavesCount}
            caption="Awaiting manager review"
            icon="bi-hourglass-split"
            deltaType="neutral"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Leave Allowance"
            value="37 Days"
            caption="Casual (12) + Sick (10) + Annual (15)"
            icon="bi-calendar-check"
            deltaType="positive"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Assigned Trainings"
            value={trainings.length}
            caption="Active developmental programs"
            icon="bi-mortarboard"
            deltaType="neutral"
          />
        </div>
      </div>

      {/* 2-Column Section: Latest Announcements & Training Programs */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card h-100 p-4 border-1 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold text-dark mb-0">Company Announcements</h6>
              <Link to="/announcements" className="text-primary small text-decoration-none fw-medium">
                View all <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            {annLoading ? (
              <Skeleton count={3} height={50} />
            ) : announcements.length === 0 ? (
              <p className="text-muted small py-4 text-center">No announcements published yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {announcements.slice(0, 3).map((a) => (
                  <div key={a._id} className="p-3 rounded border bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold text-dark small">{a.title}</span>
                      {a.pinned && (
                        <span className="badge bg-primary text-white" style={{ fontSize: 10 }}>
                          <i className="bi bi-pin-fill me-1"></i> Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-secondary small mb-2">{a.body}</p>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      Posted by {a.postedBy?.name || 'HR Team'} • {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card h-100 p-4 border-1 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold text-dark mb-0">Upcoming Trainings</h6>
              <Link to="/trainings" className="text-primary small text-decoration-none fw-medium">
                Browse <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            {trainings.length === 0 ? (
              <p className="text-muted small py-4 text-center">No active training programs enrolled.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {trainings.slice(0, 3).map((t) => (
                  <div key={t._id} className="p-2.5 rounded border bg-white d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold text-dark small">{t.title}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>
                        Trainer: {t.trainer} • Starts {new Date(t.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    <StatusBadge status={t.participants?.[0]?.status || 'Enrolled'} />
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
