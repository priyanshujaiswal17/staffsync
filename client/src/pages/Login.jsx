import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [clientErrors, setClientErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setClientErrors({});
    dispatch(clearError());
    const res = await dispatch(loginUser({ email: demoEmail, password: demoPassword }));
    if (!res.error) {
      const role = res.payload.user?.role;
      if (role === 'HR') navigate('/hr/dashboard');
      else if (role === 'Manager') navigate('/manager/dashboard');
      else navigate('/employee/dashboard');
    }
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demo = params.get('demo');
    if (demo === 'admin' || demo === 'hr') {
      handleDemoLogin('admin@staffsync.com', 'Password123');
    } else if (demo === 'manager') {
      handleDemoLogin('manager@staffsync.com', 'Password123');
    } else if (demo === 'employee') {
      handleDemoLogin('emp1@staffsync.com', 'Password123');
    }
  }, []);

  const validate = () => {
    const errs = {};
    if (!email) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    if (!validate()) return;

    const cleanEmail = email.trim().toLowerCase();
    const res = await dispatch(loginUser({ email: cleanEmail, password }));
    if (!res.error) {
      const role = res.payload.user?.role;
      if (role === 'HR') navigate('/hr/dashboard');
      else if (role === 'Manager') navigate('/manager/dashboard');
      else navigate('/employee/dashboard');
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row bg-white">
      {/* Left Form Column */}
      <div className="d-flex flex-column justify-content-between p-4 p-md-5 col-12 col-lg-6 col-xl-5">
        <div>
          <Link to="/" className="d-flex align-items-center gap-2 fw-bold text-primary fs-4 text-decoration-none mb-4">
            <i className="bi bi-stack"></i>
            <span>StaffSync</span>
          </Link>
        </div>

        <div className="mx-auto w-100" style={{ maxWidth: 420 }}>
          <h2 className="fs-3 fw-bold text-dark mb-1">Sign in to your account</h2>
          <p className="text-secondary small mb-3">Enter your credentials or choose a 1-click demo role below.</p>

          {/* Quick 1-Click Demo Section */}
          <div className="card p-3 border-primary-subtle bg-primary-subtle bg-opacity-25 shadow-sm mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-semibold text-primary small d-flex align-items-center gap-1.5">
                <i className="bi bi-lightning-charge-fill text-warning"></i> 1-Click Instant Demo Access
              </span>
              <span className="badge bg-primary text-white" style={{ fontSize: 9 }}>No Signup Needed</span>
            </div>
            <p className="text-secondary" style={{ fontSize: 11, marginBottom: 10 }}>
              Click any role to sign in instantly with demo data:
            </p>
            <div className="d-grid gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-between bg-white text-dark py-1.5 px-3"
                onClick={() => handleDemoLogin('admin@staffsync.com', 'Password123')}
                disabled={loading}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-primary"></i>
                  <div className="text-start">
                    <div className="fw-semibold" style={{ fontSize: 12 }}>Admin / HR Portal</div>
                    <div className="text-muted" style={{ fontSize: 10 }}>admin@staffsync.com</div>
                  </div>
                </div>
                <span className="badge bg-primary-subtle text-primary" style={{ fontSize: 10 }}>Explore &rarr;</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-between bg-white text-dark py-1.5 px-3"
                onClick={() => handleDemoLogin('manager@staffsync.com', 'Password123')}
                disabled={loading}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-people text-warning"></i>
                  <div className="text-start">
                    <div className="fw-semibold" style={{ fontSize: 12 }}>Manager Suite</div>
                    <div className="text-muted" style={{ fontSize: 10 }}>manager@staffsync.com</div>
                  </div>
                </div>
                <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: 10 }}>Explore &rarr;</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-between bg-white text-dark py-1.5 px-3"
                onClick={() => handleDemoLogin('emp1@staffsync.com', 'Password123')}
                disabled={loading}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-person text-success"></i>
                  <div className="text-start">
                    <div className="fw-semibold" style={{ fontSize: 12 }}>Employee Self-Service</div>
                    <div className="text-muted" style={{ fontSize: 10 }}>emp1@staffsync.com</div>
                  </div>
                </div>
                <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: 10 }}>Explore &rarr;</span>
              </button>
            </div>
          </div>

          <div className="position-relative text-center my-3">
            <hr className="text-muted" />
            <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small" style={{ fontSize: 11 }}>
              or enter credentials manually
            </span>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3" role="alert">
              <i className="bi bi-exclamation-circle-fill"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
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
              <div className="d-flex justify-content-between">
                <label className="form-label" htmlFor="passwordInput">Password</label>
              </div>
              <div className="input-group">
                <input
                  id="passwordInput"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${clientErrors.password ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="text-center mt-3 text-secondary small">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary fw-semibold text-decoration-none">
              Register employee account
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
            StaffSync Platform v1.0
          </span>
        </div>

        <div className="my-auto" style={{ maxWidth: 520 }}>
          <h3 className="display-6 fw-bold text-white mb-4">
            Unified HR operations with real-time clarity and control.
          </h3>
          <p className="text-slate-400 lead fs-6 mb-4" style={{ color: '#94A3B8' }}>
            Empower HR teams and department managers to track staff presence, handle leave approvals, and monitor workforce development without friction.
          </p>

          <div className="p-4 rounded-3 border border-secondary border-opacity-25 bg-black bg-opacity-20">
            <div className="d-flex align-items-center gap-3 mb-2">
              <i className="bi bi-shield-lock text-primary fs-4"></i>
              <div className="fw-semibold text-white">Role-Based Access Control</div>
            </div>
            <div className="small" style={{ color: '#94A3B8' }}>
              Granular access separation across Human Resources, Department Managers, and Staff ensure enterprise data security.
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
