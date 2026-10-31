import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Skeleton from './components/Skeleton';

// Lazy loading all pages (Locked requirement)
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const HRDashboard = lazy(() => import('./pages/HRDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Leaves = lazy(() => import('./pages/Leaves'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Trainings = lazy(() => import('./pages/Trainings'));
const Team = lazy(() => import('./pages/Team'));
const Employees = lazy(() => import('./pages/Employees'));
const Reports = lazy(() => import('./pages/Reports'));

const PageFallback = () => (
  <div className="p-4">
    <Skeleton count={4} height={40} />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated Protected Routes with Layout */}
          <Route element={<Layout />}>
            {/* Employee Routes */}
            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['Employee', 'Manager', 'HR']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Manager Routes */}
            <Route
              path="/manager/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute allowedRoles={['Manager']}>
                  <Team />
                </ProtectedRoute>
              }
            />

            {/* HR Routes */}
            <Route
              path="/hr/dashboard"
              element={
                <ProtectedRoute allowedRoles={['HR']}>
                  <HRDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={['HR']}>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['HR']}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Shared Module Routes (Role-adaptive views) */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={['Employee', 'Manager', 'HR']}>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaves"
              element={
                <ProtectedRoute allowedRoles={['Employee', 'Manager', 'HR']}>
                  <Leaves />
                </ProtectedRoute>
              }
            />
            <Route
              path="/announcements"
              element={
                <ProtectedRoute allowedRoles={['Employee', 'Manager', 'HR']}>
                  <Announcements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainings"
              element={
                <ProtectedRoute allowedRoles={['Employee', 'Manager', 'HR']}>
                  <Trainings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
