import api from './api';

export const authService = {
  getStatus: () => api.get('/auth/status'),
  connect: () => { window.location.href = 'http://localhost:5000/api/auth/salesforce'; },
  disconnect: () => api.post('/auth/disconnect'),
};
