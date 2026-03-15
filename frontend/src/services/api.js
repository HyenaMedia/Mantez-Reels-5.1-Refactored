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
    // Override baseURL if it matches the build-time env var
    if (config.baseURL === process.env.REACT_APP_BACKEND_URL) {
      config.baseURL = runtime;
    }
  }
  return config;
});

export default api;
