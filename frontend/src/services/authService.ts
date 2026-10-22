import { apiClient } from './api.js';
import { AdminUser } from '../types/index.js';

export async function checkSetupStatus() {
  const response = await apiClient.get<{ success: boolean; setupNeeded: boolean; adminCount: number }>(
    '/auth/setup-status'
  );
  return response.data;
}

export async function setupFirstAdmin(data: { name: string; email: string; password: string }) {
  const response = await apiClient.post<{
    success: boolean;
    token: string;
    admin: AdminUser;
    message: string;
  }>('/auth/setup', data);
  if (response.data.token) {
    localStorage.setItem('flexio_admin_token', response.data.token);
    localStorage.setItem('flexio_admin_user', JSON.stringify(response.data.admin));
  }
  return response.data;
}

export async function loginAdmin(data: { email: string; password: string }) {
  const response = await apiClient.post<{
    success: boolean;
    token: string;
    admin: AdminUser;
    message: string;
  }>('/auth/login', data);
  if (response.data.token) {
    localStorage.setItem('flexio_admin_token', response.data.token);
    localStorage.setItem('flexio_admin_user', JSON.stringify(response.data.admin));
  }
  return response.data;
}

export async function resetAdminPassword(data: { email: string; newPassword: string }) {
  const response = await apiClient.post<{
    success: boolean;
    token: string;
    admin: AdminUser;
    message: string;
  }>('/auth/reset-password', data);
  if (response.data.token && response.data.admin) {
    localStorage.setItem('flexio_admin_token', response.data.token);
    localStorage.setItem('flexio_admin_user', JSON.stringify(response.data.admin));
  }
  return response.data;
}

export async function getAdminProfile() {
  const response = await apiClient.get<{ success: boolean; admin: AdminUser }>('/auth/me');
  return response.data.admin;
}

export function logoutAdmin() {
  localStorage.removeItem('flexio_admin_token');
  localStorage.removeItem('flexio_admin_user');
}

export function getStoredAdminUser(): AdminUser | null {
  const user = localStorage.getItem('flexio_admin_user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}
