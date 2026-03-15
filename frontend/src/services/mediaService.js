import api from './api';

export const fetchMedia = (params) => api.get('/api/media', { params });
export const uploadMedia = (formData, onProgress) => api.post('/api/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: onProgress });
export const deleteMedia = (id) => api.delete(`/api/media/${id}`);
export const batchDeleteMedia = (ids) => api.post('/api/media/batch-delete', { ids });
