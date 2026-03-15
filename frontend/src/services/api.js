import axios from 'axios';

const getRuntimeUrl = () =>
  (typeof window !== 'undefined' && window.__BACKEND_URL__) || '';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || '',
});

// Runtime URL override interceptor
api.interceptors.request.use((config) => {
  const runtime = getRuntimeUrl();
  if (runtime) {
    if (config.baseURL === process.env.REACT_APP_BACKEND_URL) {
      config.baseURL = runtime;
    }
  }
  // Auto-attach auth token when present (skips if header already set)
  if (!config.headers.Authorization) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
