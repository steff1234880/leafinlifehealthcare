import axios from 'axios';

// Base URL configured from environment variable or falls back to backend port 5001 / relative proxy
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Check user token first, then admin token if making an admin request
    const userToken = localStorage.getItem('leafinlife_user_token');
    const adminToken = localStorage.getItem('leafinlife_admin_token');

    const token = config.url && config.url.includes('/admin')
      ? adminToken || userToken
      : userToken || adminToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors uniformly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthenticated on a protected action, token may have expired
      console.warn('[API Auth Error] 401 Unauthorized encountered:', error.response.data?.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

