import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Skeleton from '../components/Skeleton';

export default function ManagerDashboard() {
  const [team, setTeam] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [teamRes, leavesRes, attRes, trainRes] = await Promise.all([
          api.get('/managers/team'),
          api.get('/leaves/pending'),
          api.get('/attendance/team?limit=5'),
          api.get('/trainings?limit=5')
        ]);
        setTeam(teamRes.data.data || []);
        setPendingLeaves(leavesRes.data.data || []);
        setTeamAttendance(attRes.data.data || []);
        setTrainings(trainRes.data.data || []);
      } catch (err) {
        // Handled silently
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const teamPresentToday = teamAttendance.filter(a =>
    a.date === new Date().toISOString().slice(0, 10) && ['Present', 'Late'].includes(a.status)
  ).length;

  if (loading) return <Skeleton type="table" count={4} />;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Manager Overview</h4>
          <p className="text-secondary small mb-0">Monitor your team's presence, pending leave requests, and training development.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/leaves" className="btn btn-primary d-flex align-items-center gap-2">
            <i className="bi bi-check2-circle"></i> Review Leaves ({pendingLeaves.length})
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Total Team Members"
            value={team.length}
            caption="Direct departmental reports"
            icon="bi-people"
            deltaType="neutral"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Pending Leave Queue"
            value={pendingLeaves.length}
            caption="Awaiting your approval"
            icon="bi-calendar2-range"
            deltaType={pendingLeaves.length > 0 ? 'negative' : 'positive'}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Team Present Today"
            value={`${teamPresentToday} / ${team.length}`}
            caption="Checked in on site / remote"
            icon="bi-check-all"
            deltaType="positive"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Managed Trainings"
            value={trainings.length}
            caption="Active skill programs"
            icon="bi-mortarboard"
            deltaType="neutral"
          />
        </div>
      </div>

      {/* 2 Column Details: Pending Approvals & Team Attendance */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card h-100 p-4 border-1 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold text-dark mb-0">Pending Leave Requests</h6>
              <Link to="/leaves" className="text-primary small text-decoration-none fw-medium">
                Full Queue <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            {pendingLeaves.length === 0 ? (
              <p className="text-muted small py-4 text-center">No pending leave requests in your queue.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {pendingLeaves.map((l) => (
                  <div key={l._id} className="p-3 rounded border bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold text-dark small">{l.employee?.user?.name}</div>
                      <div className="text-muted small">
                        {l.type} Leave • {l.days} day(s) from {new Date(l.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-secondary small fst-italic">"{l.reason}"</div>
                    </div>
                    <Link to="/leaves" className="btn btn-sm btn-outline-primary">
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card h-100 p-4 border-1 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold text-dark mb-0">Team Presence</h6>
              <Link to="/team" className="text-primary small text-decoration-none fw-medium">
                Team Directory <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            {team.length === 0 ? (
              <p className="text-muted small py-4 text-center">No members assigned to your team yet.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {team.map((m) => (
                  <div key={m._id} className="p-2.5 rounded border bg-white d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-semibold" style={{ width: 32, height: 32, fontSize: 12 }}>
                        {m.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="fw-semibold text-dark small">{m.user?.name}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>{m.designation}</div>
                      </div>
                    </div>
                    <StatusBadge status={m.status} />
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
