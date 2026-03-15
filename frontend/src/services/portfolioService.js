import api from './api';

const portfolioService = {
  getAll: () => api.get('/api/portfolio/list'),
  getById: (id) => api.get(`/api/portfolio/${id}`),
};

export default portfolioService;
