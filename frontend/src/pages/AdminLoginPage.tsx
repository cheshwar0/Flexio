import React from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLogin } from '../components/admin/AdminLogin.js';

export const AdminLoginPage: React.FC = () => {
  const token = localStorage.getItem('flexio_admin_token');
  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <AdminLogin />;
};
