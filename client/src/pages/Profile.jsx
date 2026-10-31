import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Skeleton from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Editable personal fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    dateOfBirth: ''
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees/profile/me');
      const emp = res.data.data;
      setProfile(emp);
      setFormData({
        name: emp.user?.name || '',
        phone: emp.phone || '',
        address: emp.address || '',
        dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.slice(0, 10) : ''
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);
      const res = await api.put('/employees/profile/me', formData);
      setProfile(res.data.data);
      setSuccessMsg('Personal information updated successfully');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton count={4} height={40} />;

  return (
    <div style={{ maxWidth: 840 }}>
      <div className="page-header mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Personal Profile</h4>
          <p className="text-secondary small mb-0">View your employment records and manage your personal contact information.</p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success py-2 px-3 small d-flex justify-content-between align-items-center mb-3">
          <span><i className="bi bi-check-circle-fill me-2"></i>{successMsg}</span>
          <button className="btn btn-sm btn-link text-success p-0" onClick={() => setSuccessMsg(null)}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger py-2 px-3 small d-flex justify-content-between align-items-center mb-3">
          <span><i className="bi bi-exclamation-circle-fill me-2"></i>{errorMsg}</span>
          <button className="btn btn-sm btn-link text-danger p-0" onClick={() => setErrorMsg(null)}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* Employment Overview Card (Read-only managed fields) */}
      <div className="card p-4 border-1 shadow-sm mb-4">
        <h6 className="fw-semibold text-dark mb-3">Employment Details (Managed by HR)</h6>
        <div className="row g-3 small">
          <div className="col-md-4">
            <span className="text-muted d-block">Employee ID</span>
            <span className="fw-semibold text-dark tabular-nums">{profile?.employeeId}</span>
          </div>
          <div className="col-md-4">
            <span className="text-muted d-block">Department</span>
            <span className="fw-semibold text-dark">{profile?.department}</span>
          </div>
          <div className="col-md-4">
            <span className="text-muted d-block">Designation</span>
            <span className="fw-semibold text-dark">{profile?.designation}</span>
          </div>
          <div className="col-md-4">
            <span className="text-muted d-block">Role</span>
            <span className="fw-semibold text-primary">{profile?.user?.role}</span>
          </div>
          <div className="col-md-4">
            <span className="text-muted d-block">Assigned Manager</span>
            <span className="fw-semibold text-dark">{profile?.manager?.user?.name || 'Unassigned'}</span>
          </div>
          <div className="col-md-4">
            <span className="text-muted d-block">Status</span>
            <StatusBadge status={profile?.status} />
          </div>
        </div>

        {/* Leave Balances Pill */}
        <div className="mt-3 pt-3 border-top d-flex gap-4 small flex-wrap">
          <div>
            <span className="text-muted">Casual Leave Balance: </span>
            <span className="fw-bold text-dark tabular-nums">{profile?.leaveBalance?.casual ?? 0}</span>
          </div>
          <div>
            <span className="text-muted">Sick Leave Balance: </span>
            <span className="fw-bold text-dark tabular-nums">{profile?.leaveBalance?.sick ?? 0}</span>
          </div>
          <div>
            <span className="text-muted">Annual Leave Balance: </span>
            <span className="fw-bold text-dark tabular-nums">{profile?.leaveBalance?.annual ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Edit Personal Information Form */}
      <div className="card p-4 border-1 shadow-sm">
        <h6 className="fw-semibold text-dark mb-3">Update Personal Information</h6>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="profName">Full Name</label>
              <input
                id="profName"
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="profEmail">Work Email (Read-only)</label>
              <input
                id="profEmail"
                type="text"
                className="form-control bg-light"
                value={profile?.user?.email || ''}
                disabled
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="profPhone">Phone Number</label>
              <input
                id="profPhone"
                type="text"
                className="form-control"
                placeholder="+1-555-0100"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="profDob">Date of Birth</label>
              <input
                id="profDob"
                type="date"
                className="form-control"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="profAddress">Residential Address</label>
              <textarea
                id="profAddress"
                className="form-control"
                rows="2"
                placeholder="Street address, city, state, postal code"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              ></textarea>
            </div>
            <div className="col-12 mt-4 text-end">
              <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-2" disabled={saving}>
                {saving && <span className="spinner-border spinner-border-sm" role="status"></span>}
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
