import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../api/axios';
import { fetchTrainings, createTraining, updateTraining } from '../store/trainingsSlice';
import Skeleton from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

export default function Trainings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: trainings, loading, error } = useSelector((state) => state.trainings);

  const [teamMembers, setTeamMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trainer: '',
    startDate: '',
    endDate: '',
    participantIds: []
  });
  const [submitting, setSubmitting] = useState(false);

  // Score modal state
  const [scoreModalTraining, setScoreModalTraining] = useState(null);
  const [participantScores, setParticipantScores] = useState([]);

  const isManager = user?.role === 'Manager';

  useEffect(() => {
    dispatch(fetchTrainings());
    if (isManager) {
      api.get('/managers/team').then(res => setTeamMembers(res.data.data || []));
    }
  }, [dispatch, isManager]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await dispatch(createTraining(formData));
      if (!res.error) {
        setShowModal(false);
        setFormData({ title: '', description: '', trainer: '', startDate: '', endDate: '', participantIds: [] });
        dispatch(fetchTrainings());
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openScoreModal = (training) => {
    setScoreModalTraining(training);
    setParticipantScores(training.participants || []);
  };

  const handleSaveScores = async () => {
    if (!scoreModalTraining) return;
    setSubmitting(true);
    try {
      await dispatch(updateTraining({
        id: scoreModalTraining._id,
        data: { participants: participantScores }
      }));
      setScoreModalTraining(null);
      dispatch(fetchTrainings());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Training Programs</h4>
          <p className="text-secondary small mb-0">Professional skill programs and workforce development initiatives.</p>
        </div>
        {isManager && (
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
            <i className="bi bi-mortarboard"></i> Create Training Program
          </button>
        )}
      </div>

      {loading ? (
        <Skeleton count={3} height={120} />
      ) : error ? (
        <div className="alert alert-danger py-2 px-3 small">{error}</div>
      ) : trainings.length === 0 ? (
        <EmptyState
          icon="bi-mortarboard"
          title="No training programs found"
          message="There are no active training programs enrolled or scheduled."
          actionLabel={isManager ? 'Create Program' : null}
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="row g-4">
          {trainings.map((t) => (
            <div key={t._id} className="col-12 col-lg-6">
              <div className="card h-100 p-4 border-1 shadow-sm d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-semibold text-dark fs-6 mb-0">{t.title}</h5>
                    <span className="badge bg-light text-secondary border small">
                      Trainer: {t.trainer}
                    </span>
                  </div>
                  <p className="text-secondary small mb-3">{t.description}</p>
                  <div className="small text-muted mb-3 d-flex gap-3">
                    <span>
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(t.startDate).toLocaleDateString()} &rarr; {new Date(t.endDate).toLocaleDateString()}
                    </span>
                    <span>
                      <i className="bi bi-people me-1"></i>
                      {t.participants?.length || 0} enrolled
                    </span>
                  </div>
                </div>

                {isManager && (
                  <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Created by You</span>
                    <button
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                      onClick={() => openScoreModal(t)}
                    >
                      <i className="bi bi-pencil-square"></i> Manage Scores & Status
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Training Modal (Manager Only) */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3 p-3">
          <div className="card shadow-lg border-1 w-100" style={{ maxWidth: 520 }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-dark mb-0">Create New Training Program</h6>
              <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setShowModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-3">
              <div className="mb-3">
                <label className="form-label" htmlFor="trTitle">Program Title</label>
                <input
                  id="trTitle"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Advanced System Architecture"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="trTrainer">Trainer / Instructor</label>
                <input
                  id="trTrainer"
                  type="text"
                  className="form-control"
                  placeholder="Instructor Name or Organization"
                  value={formData.trainer}
                  onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                  required
                />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label" htmlFor="trStart">Start Date</label>
                  <input
                    id="trStart"
                    type="date"
                    className="form-control"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label" htmlFor="trEnd">End Date</label>
                  <input
                    id="trEnd"
                    type="date"
                    className="form-control"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Enrol Team Members</label>
                <div className="d-flex flex-column gap-1 border p-2 rounded" style={{ maxHeight: 120, overflowY: 'auto' }}>
                  {teamMembers.map(m => (
                    <label key={m._id} className="small d-flex align-items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.participantIds.includes(m._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, participantIds: [...formData.participantIds, m._id] });
                          } else {
                            setFormData({ ...formData, participantIds: formData.participantIds.filter(id => id !== m._id) });
                          }
                        }}
                      />
                      <span>{m.user?.name} ({m.designation})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label" htmlFor="trDesc">Description</label>
                <textarea
                  id="trDesc"
                  className="form-control"
                  rows="3"
                  placeholder="Curriculum and objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={submitting}>
                  {submitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
                  <span>Create Program</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Participant Scores Modal */}
      {scoreModalTraining && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3 p-3">
          <div className="card shadow-lg border-1 w-100" style={{ maxWidth: 520 }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-dark mb-0">Manage Training Performance</h6>
              <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setScoreModalTraining(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-3">
              <div className="small text-muted mb-3">
                Update completion status and performance evaluation score (0-100) for enrolled team members.
              </div>
              {participantScores.length === 0 ? (
                <p className="text-muted small">No participants enrolled in this program.</p>
              ) : (
                <div className="d-flex flex-column gap-3 mb-3">
                  {participantScores.map((p, idx) => (
                    <div key={idx} className="p-2 border rounded d-flex align-items-center justify-content-between gap-2">
                      <div className="small fw-semibold text-dark flex-grow-1">
                        {p.employee?.user?.name || `Participant ${idx + 1}`}
                      </div>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: 130 }}
                        value={p.status}
                        onChange={(e) => {
                          const updated = [...participantScores];
                          updated[idx] = { ...updated[idx], status: e.target.value };
                          setParticipantScores(updated);
                        }}
                      >
                        <option value="Enrolled">Enrolled</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="form-control form-control-sm text-end tabular-nums"
                        style={{ width: 70 }}
                        placeholder="Score"
                        value={p.score || 0}
                        onChange={(e) => {
                          const updated = [...participantScores];
                          updated[idx] = { ...updated[idx], score: Number(e.target.value) };
                          setParticipantScores(updated);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-outline-secondary" onClick={() => setScoreModalTraining(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveScores} disabled={submitting}>
                  Save Performance Scores
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
