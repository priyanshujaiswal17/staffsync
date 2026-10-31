import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [clientErrors, setClientErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Full name is required';
    }
    if (!email) {
      errs.email = 'Valid email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid work email';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      errs.password = 'Password must contain at least one letter and one number';
    }
    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    if (!validate()) return;

    const res = await dispatch(registerUser({ name, email, password }));
    if (!res.error) {
      navigate('/employee/dashboard');
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row bg-white">
      {/* Left Form Column */}
      <div className="d-flex flex-column justify-content-between p-4 p-md-5 col-12 col-lg-6 col-xl-5">
        <div>
          <Link to="/" className="d-flex align-items-center gap-2 fw-bold text-primary fs-4 text-decoration-none mb-5">
            <i className="bi bi-stack"></i>
            <span>StaffSync</span>
          </Link>
        </div>

        <div className="mx-auto w-100" style={{ maxWidth: 380 }}>
          <h2 className="fs-3 fw-bold text-dark mb-1">Create an employee account</h2>
          <p className="text-secondary small mb-3">Join your team workspace and access your self-service portal.</p>

          {/* Quick Demo Access Callout */}
          <div className="card p-2.5 border-primary-subtle bg-primary-subtle bg-opacity-25 mb-3 text-center">
            <div className="small fw-semibold text-primary mb-1">
              <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Want to test without registering?
            </div>
            <Link to="/login" className="btn btn-sm btn-primary py-1 px-3 fw-medium">
              Use 1-Click Demo Logins &rarr;
            </Link>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3" role="alert">
              <i className="bi bi-exclamation-circle-fill"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="nameInput">Full Name</label>
              <input
                id="nameInput"
                type="text"
                className={`form-control ${clientErrors.name ? 'is-invalid' : ''}`}
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {clientErrors.name && <div className="invalid-feedback small">{clientErrors.name}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="emailInput">Work Email</label>
              <input
                id="emailInput"
                type="email"
                className={`form-control ${clientErrors.email ? 'is-invalid' : ''}`}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {clientErrors.email && <div className="invalid-feedback small">{clientErrors.email}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label" htmlFor="passwordInput">Password</label>
              <div className="input-group">
                <input
                  id="passwordInput"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${clientErrors.password ? 'is-invalid' : ''}`}
                  placeholder="Min. 8 characters with letters & numbers"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary border-start-0"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              {clientErrors.password && <div className="text-danger small mt-1">{clientErrors.password}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
              <span>{loading ? 'Creating Account...' : 'Register'}</span>
            </button>
          </form>

          <div className="text-center mt-4 text-secondary small">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-semibold text-decoration-none">
              Sign In
            </Link>
          </div>
        </div>

        <div className="text-muted small mt-5">
          &copy; 2026 StaffSync Inc. All rights reserved.
        </div>
      </div>

      {/* Right Brand Panel Column */}
      <div className="d-none d-lg-flex col-lg-6 col-xl-7 bg-slate-900 text-white p-5 flex-column justify-content-between" style={{ backgroundColor: '#0F172A' }}>
        <div className="d-flex justify-content-end">
          <span className="badge rounded-pill bg-light bg-opacity-10 text-white border border-light border-opacity-25 px-3 py-1.5">
            Modern Human Resource Management
          </span>
        </div>

        <div className="my-auto" style={{ maxWidth: 520 }}>
          <h3 className="display-6 fw-bold text-white mb-4">
            Everything you need for seamless daily workplace management.
          </h3>
          <p className="lead fs-6 mb-4" style={{ color: '#94A3B8' }}>
            From single-click attendance check-ins to automated leave allowances and company announcements, StaffSync keeps your workflow synchronized.
          </p>

          <div className="row g-3">
            <div className="col-sm-6">
              <div className="p-3 rounded-3 border border-secondary border-opacity-25 bg-black bg-opacity-20">
                <div className="fw-semibold text-white mb-1">Instant Leave Tracking</div>
                <div className="small" style={{ color: '#94A3B8' }}>Monitor casual, sick, and annual balances in real-time.</div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="p-3 rounded-3 border border-secondary border-opacity-25 bg-black bg-opacity-20">
                <div className="fw-semibold text-white mb-1">Automated Attendance</div>
                <div className="small" style={{ color: '#94A3B8' }}>Precise timestamps with configurable threshold markers.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-4 small" style={{ color: '#64748B' }}>
          <span>Privacy & Security</span>
          <span>Terms of Service</span>
          <span>Support Contact</span>
        </div>
      </div>
    </div>
  );
}
