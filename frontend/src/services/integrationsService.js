import api from './api';

export const getIntegrationSettings = () => api.get('/api/integrations/settings');
export const saveEmailSettings = (config) => api.put('/api/integrations/email', config);
export const testEmailSettings = (testEmail) => api.post('/api/integrations/email/test', null, { params: { test_email: testEmail } });
export const saveStorageSettings = (config) => api.put('/api/integrations/storage', config);
export const testStorageSettings = () => api.post('/api/integrations/storage/test');
export const saveMonitoringSettings = (config) => api.put('/api/integrations/monitoring', config);
export const saveBackupSettings = (config) => api.put('/api/integrations/backup', config);
export const saveAnalyticsSettings = (config) => api.put('/api/integrations/analytics', config);
