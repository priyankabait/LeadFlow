import api from './api';

export const accountService = {
  getAccounts: (params = {}) => api.get('/accounts', { params }),
  getAccountById: (id) => api.get(`/accounts/${id}`),
  createAccount: (data) => api.post('/accounts', data),
  updateAccount: (id, data) => api.put(`/accounts/${id}`, data),
  deleteAccount: (id) => api.delete(`/accounts/${id}`),
};
