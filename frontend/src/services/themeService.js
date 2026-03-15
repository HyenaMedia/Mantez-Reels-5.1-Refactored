import api from './api';

const themeService = {
  // Currently, theme settings are part of global settings
  getThemeSettings: () => api.get('/api/settings/'),
};

export default themeService;
