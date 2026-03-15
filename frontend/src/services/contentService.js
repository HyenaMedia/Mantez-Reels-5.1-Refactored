import api from './api';

export const getContent = (section) => api.get(`/api/content/${section}`);
export const updateContent = (section, data) => api.put(`/api/content/${section}`, data);
