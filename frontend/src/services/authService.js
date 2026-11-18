import api from './api';

/**
 * The backend OAuth initiation URL — clicking "Connect Salesforce" navigates here.
 * In dev this is the absolute backend URL; in production use relative /api/... if same-origin.
 */
const BACKEND_AUTH_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/auth/salesforce`
  : '/api/auth/salesforce';

export const authService = {
  getStatus:   () => api.get('/auth/status'),
  connect:     () => { window.location.href = BACKEND_AUTH_URL; },
  disconnect:  () => api.post('/auth/disconnect'),
};
