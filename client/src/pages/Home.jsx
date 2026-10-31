import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Home() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const getDashboardRoute = () => {
    if (user?.role === 'HR') return '/hr/dashboard';
    if (user?.role === 'Manager') return '/manager/dashboard';
    return '/employee/dashboard';
  };

  return (
    <div className="bg-white min-vh-100 d-flex flex-column">
      {/* Top Navigation */}
      <nav className="navbar navbar-expand-lg border-bottom py-3">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary fs-4">
            <i className="bi bi-stack"></i>
            <span>StaffSync</span>
          </Link>
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <Link to={getDashboardRoute()} className="btn btn-primary">
                Open Dashboard <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-secondary">Sign In</Link>
                <Link to="/register" className="btn btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-5 text-center my-auto">
        <div className="container py-4" style={{ maxWidth: 760 }}>
          <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fw-medium mb-3">
            Modern Human Resource Management
          </span>
          <h1 className="display-5 fw-bold text-dark mb-3">
            Streamline employee records, attendance, and leave workflows with clarity.
          </h1>
          <p className="lead text-secondary mb-4">
            StaffSync delivers a fast, unified operating system designed specifically for HR leaders, managers, and growing teams.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
            {isAuthenticated ? (
              <Link to={getDashboardRoute()} className="btn btn-primary btn-lg px-4">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-lg px-4">
                  Sign In / Demo Access
                </Link>
                <Link to="/register" className="btn btn-outline-secondary btn-lg px-4">
                  Create Employee Account
                </Link>
              </>
            )}
          </div>

          {!isAuthenticated && (
            <div className="card p-3 border-1 bg-light shadow-sm text-center mx-auto" style={{ maxWidth: 620 }}>
              <div className="small fw-semibold text-dark mb-2 d-flex align-items-center justify-content-center gap-1.5">
                <i className="bi bi-lightning-charge-fill text-warning"></i>
                <span>1-Click Instant Demo Portals (Explore without signing up):</span>
              </div>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                <Link to="/login?demo=admin" className="btn btn-sm btn-white border bg-white text-primary fw-medium px-3">
                  <i className="bi bi-shield-check me-1"></i> Admin Portal
                </Link>
                <Link to="/login?demo=manager" className="btn btn-sm btn-white border bg-white text-dark fw-medium px-3">
                  <i className="bi bi-people me-1 text-warning"></i> Manager Suite
                </Link>
                <Link to="/login?demo=employee" className="btn btn-sm btn-white border bg-white text-dark fw-medium px-3">
                  <i className="bi bi-person me-1 text-success"></i> Employee Portal
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3-Column Role Features Row */}
      <section className="py-5 bg-light border-top border-bottom">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fs-3 fw-bold text-dark mb-2">Designed for every level of your organization</h2>
            <p className="text-secondary">Purpose-built toolsets tailored specifically to the responsibilities of each role.</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 p-4 border-1 shadow-sm">
                <div className="p-3 bg-primary-subtle text-primary rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 48, height: 48 }}>
                  <i className="bi bi-person fs-4"></i>
                </div>
                <h5 className="fw-semibold text-dark mb-2">Employee Portal</h5>
                <p className="text-secondary small mb-0">
                  Daily check-in and check-out tracking, leave balance visibility, seamless leave applications, company announcements, and professional training programs.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 p-4 border-1 shadow-sm">
                <div className="p-3 bg-warning-subtle text-warning-emphasis rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 48, height: 48 }}>
                  <i className="bi bi-people fs-4"></i>
                </div>
                <h5 className="fw-semibold text-dark mb-2">Manager Suite</h5>
                <p className="text-secondary small mb-0">
                  Direct team attendance monitoring, pending leave request review queue with instant approval notes, and team training performance tracking.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 p-4 border-1 shadow-sm">
                <div className="p-3 bg-success-subtle text-success rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 48, height: 48 }}>
                  <i className="bi bi-shield-check fs-4"></i>
                </div>
                <h5 className="fw-semibold text-dark mb-2">HR Command Center</h5>
                <p className="text-secondary small mb-0">
                  Comprehensive employee directory management, manager assignments, organization-wide attendance records, announcements publishing, and headcount analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5">
        <div className="container py-3">
          <div className="text-center mb-5">
            <h2 className="fs-3 fw-bold text-dark mb-2">How It Works</h2>
            <p className="text-secondary">Three simple steps to unified team operations.</p>
          </div>
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="fs-1 fw-bold text-primary mb-2">1</div>
              <h6 className="fw-semibold text-dark mb-1">Set Up Your Organization</h6>
              <p className="text-secondary small">HR initializes company profiles, departments, and managerial hierarchy.</p>
            </div>
            <div className="col-md-4">
              <div className="fs-1 fw-bold text-primary mb-2">2</div>
              <h6 className="fw-semibold text-dark mb-1">Record Daily Activity</h6>
              <p className="text-secondary small">Employees mark presence with timestamped check-ins and submit leaves.</p>
            </div>
            <div className="col-md-4">
              <div className="fs-1 fw-bold text-primary mb-2">3</div>
              <h6 className="fw-semibold text-dark mb-1">Gain Clear Insights</h6>
              <p className="text-secondary small">Review real-time attendance, leave trends, and department performance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 border-top text-center text-secondary small mt-auto">
        <div className="container">
          StaffSync &copy; 2026. Modern Human Resource Management Solution.
        </div>
      </footer>
    </div>
  );
}
