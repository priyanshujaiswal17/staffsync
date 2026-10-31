import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../store/announcementsSlice';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export default function Announcements() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, loading, error, page, pages, total } = useSelector((state) => state.announcements);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    audience: 'All',
    pinned: false
  });
  const [creating, setCreating] = useState(false);

  // Edit Modal State
  const [editItem, setEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    body: '',
    audience: 'All',
    pinned: false
  });
  const [updating, setUpdating] = useState(false);

  const isHR = user?.role === 'HR';

  useEffect(() => {
    dispatch(fetchAnnouncements({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await dispatch(createAnnouncement(formData));
      if (!res.error) {
        setShowCreateModal(false);
        setFormData({ title: '', body: '', audience: 'All', pinned: false });
        dispatch(fetchAnnouncements({ page: 1, limit: 10 }));
      }
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setEditFormData({
      title: item.title,
      body: item.body,
      audience: item.audience || 'All',
      pinned: !!item.pinned
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    setUpdating(true);
    try {
      const res = await dispatch(updateAnnouncement({
        id: editItem._id,
        data: editFormData
      }));
      if (!res.error) {
        setEditItem(null);
        dispatch(fetchAnnouncements({ page: 1, limit: 10 }));
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      dispatch(deleteAnnouncement(id));
    }
  };

  return (
    <div>
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Company Announcements</h4>
          <p className="text-secondary small mb-0">Official updates, guidelines, and organization notices.</p>
        </div>
        {isHR && (
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowCreateModal(true)}>
            <i className="bi bi-megaphone"></i> Post Announcement
          </button>
        )}
      </div>

      {loading ? (
        <Skeleton count={4} height={100} />
      ) : error ? (
        <div className="alert alert-danger py-2 px-3 small">{error}</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="bi-megaphone"
          title="No announcements published"
          message="There are currently no company announcements to display."
          actionLabel={isHR ? 'Create First Announcement' : null}
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {items.map((a) => (
            <div key={a._id} className="card p-4 border-1 shadow-sm">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h6 className="fw-bold text-dark mb-0 fs-6">{a.title}</h6>
                    {a.pinned && (
                      <span className="badge bg-primary text-white" style={{ fontSize: 10 }}>
                        <i className="bi bi-pin-fill me-1"></i> Pinned
                      </span>
                    )}
                    <span className="badge bg-light text-secondary border" style={{ fontSize: 11 }}>
                      Audience: {a.audience}
                    </span>
                  </div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Posted by <span className="fw-medium text-dark">{a.postedBy?.name || 'HR Department'}</span> on{' '}
                    {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {isHR && (
                  <div className="d-flex align-items-center gap-1">
                    <button
                      className="btn btn-sm btn-outline-secondary py-1 px-2"
                      title="Edit Announcement"
                      onClick={() => openEditModal(a)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger py-1 px-2 text-danger"
                      title="Delete Announcement"
                      onClick={() => handleDelete(a._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                )}
              </div>
              <p className="text-secondary mb-0 small" style={{ whiteSpace: 'pre-line' }}>{a.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3 p-3">
          <div className="card shadow-lg border-1 w-100" style={{ maxWidth: 520 }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-dark mb-0">Publish New Announcement</h6>
              <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setShowCreateModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-3">
              <div className="mb-3">
                <label className="form-label" htmlFor="annTitle">Title</label>
                <input
                  id="annTitle"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Annual Company Offsite 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="annAudience">Target Audience</label>
                <select
                  id="annAudience"
                  className="form-select"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                >
                  <option value="All">All Staff Members</option>
                  <option value="Employee">Employees Only</option>
                  <option value="Manager">Managers Only</option>
                  <option value="HR">HR Team Only</option>
                </select>
              </div>
              <div className="mb-3 form-check">
                <input
                  id="annPin"
                  type="checkbox"
                  className="form-check-input"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                />
                <label className="form-check-label small" htmlFor="annPin">
                  Pin this announcement to top of feed
                </label>
              </div>
              <div className="mb-4">
                <label className="form-label" htmlFor="annBody">Message Body</label>
                <textarea
                  id="annBody"
                  className="form-control"
                  rows="4"
                  placeholder="Write clear and informative announcement copy..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={creating}>
                  {creating && <span className="spinner-border spinner-border-sm" role="status"></span>}
                  <span>Publish Announcement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Announcement Modal */}
      {editItem && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3 p-3">
          <div className="card shadow-lg border-1 w-100" style={{ maxWidth: 520 }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-dark mb-0">Edit Announcement</h6>
              <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setEditItem(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-3">
              <div className="mb-3">
                <label className="form-label" htmlFor="editAnnTitle">Title</label>
                <input
                  id="editAnnTitle"
                  type="text"
                  className="form-control"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="editAnnAudience">Target Audience</label>
                <select
                  id="editAnnAudience"
                  className="form-select"
                  value={editFormData.audience}
                  onChange={(e) => setEditFormData({ ...editFormData, audience: e.target.value })}
                >
                  <option value="All">All Staff Members</option>
                  <option value="Employee">Employees Only</option>
                  <option value="Manager">Managers Only</option>
                  <option value="HR">HR Team Only</option>
                </select>
              </div>
              <div className="mb-3 form-check">
                <input
                  id="editAnnPin"
                  type="checkbox"
                  className="form-check-input"
                  checked={editFormData.pinned}
                  onChange={(e) => setEditFormData({ ...editFormData, pinned: e.target.checked })}
                />
                <label className="form-check-label small" htmlFor="editAnnPin">
                  Pin this announcement to top of feed
                </label>
              </div>
              <div className="mb-4">
                <label className="form-label" htmlFor="editAnnBody">Message Body</label>
                <textarea
                  id="editAnnBody"
                  className="form-control"
                  rows="4"
                  value={editFormData.body}
                  onChange={(e) => setEditFormData({ ...editFormData, body: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setEditItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={updating}>
                  {updating && <span className="spinner-border spinner-border-sm" role="status"></span>}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
