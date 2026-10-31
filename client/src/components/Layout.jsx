import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { fetchUnreadCount, fetchNotifications, markAllRead } from '../store/notificationsSlice';

export default function Layout() {
  const { user } = useSelector((state) => state.auth);
  const { unreadCount, items: notifications } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.topbar')) {
        setShowNotifMenu(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes('/dashboard')) return `${user?.role || 'Staff'} Dashboard`;
    if (p.includes('/profile')) return 'Employee Profile';
    if (p.includes('/attendance')) return 'Attendance Management';
    if (p.includes('/leaves')) return 'Leave Management';
    if (p.includes('/announcements')) return 'Company Announcements';
    if (p.includes('/trainings')) return 'Training Programs';
    if (p.includes('/team')) return 'Team Overview';
    if (p.includes('/employees')) return 'Employee Directory';
    if (p.includes('/reports')) return 'Reports & Analytics';
    return 'StaffSync';
  };

  // Role based navigation links
  const navItems = [];

  if (user?.role === 'Employee') {
    navItems.push(
      { to: '/employee/dashboard', label: 'Dashboard', icon: 'bi-grid' },
      { to: '/profile', label: 'My Profile', icon: 'bi-person' },
      { to: '/attendance', label: 'Attendance', icon: 'bi-calendar-check' },
      { to: '/leaves', label: 'Leave Requests', icon: 'bi-calendar-x' },
      { to: '/announcements', label: 'Announcements', icon: 'bi-megaphone' },
      { to: '/trainings', label: 'Trainings', icon: 'bi-mortarboard' }
    );
  } else if (user?.role === 'Manager') {
    navItems.push(
      { to: '/manager/dashboard', label: 'Dashboard', icon: 'bi-grid' },
      { to: '/team', label: 'My Team', icon: 'bi-people' },
      { to: '/attendance', label: 'Team Attendance', icon: 'bi-calendar-check' },
      { to: '/leaves', label: 'Leave Approvals', icon: 'bi-calendar-x' },
      { to: '/trainings', label: 'Trainings', icon: 'bi-mortarboard' },
      { to: '/announcements', label: 'Announcements', icon: 'bi-megaphone' }
    );
  } else if (user?.role === 'HR') {
    navItems.push(
      { to: '/hr/dashboard', label: 'Dashboard', icon: 'bi-grid' },
      { to: '/employees', label: 'Employees & Managers', icon: 'bi-people' },
      { to: '/attendance', label: 'Attendance Tracking', icon: 'bi-calendar-check' },
      { to: '/leaves', label: 'Leave Management', icon: 'bi-calendar-x' },
      { to: '/announcements', label: 'Announcements', icon: 'bi-megaphone' },
      { to: '/reports', label: 'Reports & Analytics', icon: 'bi-graph-up' }
    );
  }

  const renderNavLinks = () => (
    <ul className="sidebar-nav">
      {navItems.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <i className={`bi ${item.icon} fs-5`}></i>
            <span>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="app-wrapper">
      {/* Desktop Fixed Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <i className="bi bi-stack me-2 fs-4 text-primary"></i>
          <span>StaffSync</span>
        </div>
        {renderNavLinks()}
        <div className="sidebar-user">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 36, height: 36 }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden flex-grow-1">
              <div className="text-truncate fw-semibold text-dark small">{user?.name}</div>
              <div className="text-truncate text-muted" style={{ fontSize: 11 }}>{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Offcanvas Drawer (<992px) */}
      {mobileOpen && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-3" onClick={() => setMobileOpen(false)}>
          <div
            className="bg-white h-100 position-relative d-flex flex-column shadow"
            style={{ width: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sidebar-brand justify-content-between">
              <div className="d-flex align-items-center">
                <i className="bi bi-stack me-2 fs-4 text-primary"></i>
                <span>StaffSync</span>
              </div>
              <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setMobileOpen(false)}>
                <i className="bi bi-x-lg fs-5"></i>
              </button>
            </div>
            {renderNavLinks()}
            <div className="sidebar-user mt-auto">
              <button className="btn btn-outline-danger btn-sm w-100" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i> Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Header Bar */}
        <header className="topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-link text-dark p-0 d-lg-none"
              onClick={() => setMobileOpen(true)}
              aria-label="Open Navigation"
            >
              <i className="bi bi-list fs-3"></i>
            </button>
            <h5 className="mb-0 fw-semibold text-dark">{getPageTitle()}</h5>
          </div>

          <div className="d-flex align-items-center gap-3 position-relative">
            {/* Notification Bell */}
            <div className="position-relative">
              <button
                className="btn btn-link text-secondary p-1 position-relative"
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  if (!showNotifMenu) {
                    dispatch(fetchNotifications());
                  }
                }}
                aria-label="Notifications"
              >
                <i className="bi bi-bell fs-5"></i>
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: 10 }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Menu */}
              {showNotifMenu && (
                <div
                  className="card position-absolute end-0 mt-2 shadow-lg border-1"
                  style={{ width: 320, zIndex: 1050 }}
                >
                  <div className="p-2.5 border-bottom d-flex justify-content-between align-items-center">
                    <span className="fw-semibold small">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        className="btn btn-link btn-sm p-0 text-primary small text-decoration-none"
                        onClick={() => dispatch(markAllRead())}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="overflow-auto" style={{ maxHeight: 300 }}>
                    {notifications?.length === 0 ? (
                      <div className="p-3 text-center text-muted small">No notifications</div>
                    ) : (
                      notifications?.map((n) => (
                        <div
                          key={n._id}
                          className={`p-2.5 border-bottom small ${n.read ? 'bg-white' : 'bg-light'}`}
                        >
                          <div className="text-dark fw-medium mb-1">{n.message}</div>
                          <div className="text-muted" style={{ fontSize: 11 }}>
                            {new Date(n.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar Menu */}
            <div className="position-relative">
              <button
                className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-semibold" style={{ width: 34, height: 34, fontSize: 13 }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <i className="bi bi-chevron-down text-muted small"></i>
              </button>

              {showUserMenu && (
                <div
                  className="card position-absolute end-0 mt-2 shadow-lg border-1 py-1"
                  style={{ width: 180, zIndex: 1050 }}
                >
                  <div className="px-3 py-2 border-bottom">
                    <div className="fw-semibold small text-truncate">{user?.name}</div>
                    <div className="text-muted text-truncate" style={{ fontSize: 11 }}>{user?.email}</div>
                  </div>
                  <NavLink
                    to="/profile"
                    className="dropdown-item px-3 py-2 small d-flex align-items-center gap-2"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <i className="bi bi-person"></i> My Profile
                  </NavLink>
                  <button
                    className="dropdown-item px-3 py-2 small text-danger d-flex align-items-center gap-2"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right"></i> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page View Body */}
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
