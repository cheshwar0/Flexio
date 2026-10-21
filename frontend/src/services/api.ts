import axios from 'axios';

const rawUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '/api').trim();
const cleanUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
const API_BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('flexio_admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to catch 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/admin/login')) {
      // If unauthorized on admin page, clear token
      if (window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('flexio_admin_token');
        localStorage.removeItem('flexio_admin_user');
      }
    }
    return Promise.reject(error);
  }
);
