import api from './api';

const authService = {
  login: (username, password) => api.post('/api/auth/login', { username, password }),
  register: (username, email, password) => 
    api.post('/api/auth/register', { username, email, password }),
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  
  setToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }
};

export default authService;
