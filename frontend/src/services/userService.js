import api from './api';

export const fetchUsers = () => api.get('/api/users/list');
export const createUser = (data) => api.post('/api/auth/register', data);
export const updateUser = (id, data) => api.put(`/api/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/api/users/${id}`);
export const changeUserPassword = (id, newPassword) => api.put(`/api/users/${id}/password`, { new_password: newPassword });
