import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute.js';

describe('ProtectedRoute Auth Guard Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects unauthenticated visitors to /admin/login when no token is present', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret Admin Dashboard Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<div>Admin Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Protected content must NOT be visible
    expect(screen.queryByText('Secret Admin Dashboard Content')).toBeNull();
    // Must be redirected to login page
    expect(screen.getByText('Admin Login Page')).toBeDefined();
  });

  it('renders protected children when valid token is present in localStorage', () => {
    localStorage.setItem('flexio_admin_token', 'valid-mock-jwt-token');

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret Admin Dashboard Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<div>Admin Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Protected content should be rendered
    expect(screen.getByText('Secret Admin Dashboard Content')).toBeDefined();
    expect(screen.queryByText('Admin Login Page')).toBeNull();
  });
});
