import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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
