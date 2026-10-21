import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomeLanding } from './pages/HomeLanding.js';
import { TvDisplayPage } from './pages/TvDisplayPage.js';
import { AdminLoginPage } from './pages/AdminLoginPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { ProtectedRoute } from './components/auth/ProtectedRoute.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<HomeLanding />} />

        {/* Public TV Display Screen */}
        <Route path="/display" element={<TvDisplayPage />} />

        {/* HR Admin Authentication */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* HR Admin Protected Portal (All Sub-Pages Strictly Guarded) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage initialTab="overview" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/top10"
          element={
            <ProtectedRoute>
              <AdminDashboardPage initialTab="select-top10" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute>
              <AdminDashboardPage initialTab="employees" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teams"
          element={
            <ProtectedRoute>
              <AdminDashboardPage initialTab="teams" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/weeks"
          element={
            <ProtectedRoute>
              <AdminDashboardPage initialTab="overview" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/history"
          element={
            <ProtectedRoute>
              <AdminDashboardPage initialTab="history" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminDashboardPage initialTab="settings" />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
