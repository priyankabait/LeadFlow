import axios from 'axios';

/**
 * Axios instance for all API calls.
 *
 * In development (Vite proxy), set VITE_API_URL='' (empty) and configure
 * vite.config.js to proxy /api → http://localhost:5000.
 *
 * In production, set VITE_API_URL to your backend base URL.
 * Leave unset to default to a relative /api path (works when served from same origin).
 */
const baseURL = import.meta.env.VITE_API_URL !== undefined
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      // Could redirect to /salesforce-integration
    }
    return Promise.reject(err);
  }
);

export default api;
