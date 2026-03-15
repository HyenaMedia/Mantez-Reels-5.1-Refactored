import api from './api';

const settingsService = {
  getSettings: () => api.get('/api/settings/'),
};

export default settingsService;
