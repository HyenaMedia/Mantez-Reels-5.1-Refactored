import api from './api';

export const getDashboardStats = () => api.get('/api/analytics/dashboard');
export const getVisitorData = (params) => api.get('/api/analytics/visitors', { params });
