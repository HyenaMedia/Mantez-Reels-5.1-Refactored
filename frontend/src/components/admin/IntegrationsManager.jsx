import React, { useState, useEffect } from 'react';
import {
  Mail,
  Cloud,
  Shield,
  Database,
  BarChart3,
  Loader2,
  Eye,
  EyeOff,
  TestTube,
  Save,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const IntegrationsManager = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});
  const { toast } = useToast();

  // State for each integration
  const [emailConfig, setEmailConfig] = useState({
    enabled: false,
    provider: 'smtp',
    smtp: { host: '', port: 587, secure: false, user: '', password: '' },
    sendgrid: { apiKey: '' },
    resend: { apiKey: '' },
    fromEmail: '',
    fromName: '',
    contactEmail: '',
  });

  const [storageConfig, setStorageConfig] = useState({
    enabled: false,
    provider: 'local',
    s3: { accessKeyId: '', secretAccessKey: '', region: 'us-east-1', bucket: '', endpoint: '' },
  });

  const [monitoringConfig, setMonitoringConfig] = useState({
    sentry: { enabled: false, dsn: '' },
    uptimeRobot: { enabled: false, apiKey: '' },
  });

  const [backupConfig, setBackupConfig] = useState({
    enabled: false,
    schedule: 'daily',
    retention: 7,
    destination: 'local',
  });

  const [analyticsConfig, setAnalyticsConfig] = useState({
    enabled: false,
    apiKey: '',
    host: 'https://app.posthog.com',
  });

  useEffect(() => {
    const controller = new AbortController();
    const loadSettingsInit = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/integrations/settings`, { signal: controller.signal });
        const data = response.data;

        if (data.emailService) setEmailConfig(data.emailService);
        if (data.cloudStorage) setStorageConfig(data.cloudStorage);
        if (data.monitoring) setMonitoringConfig(data.monitoring);
        if (data.backup) setBackupConfig(data.backup);
        if (data.analytics?.posthog) {
          setAnalyticsConfig({
            enabled: data.analytics.posthog.enabled || false,
            apiKey: data.analytics.posthog.apiKey || '',
            host: data.analytics.posthog.host || 'https://app.posthog.com',
          });
        }
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to load integration settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load integration settings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadSettingsInit();
    return () => controller.abort();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/integrations/settings`);
      const data = response.data;

      if (data.emailService) setEmailConfig(data.emailService);
      if (data.cloudStorage) setStorageConfig(data.cloudStorage);
      if (data.monitoring) setMonitoringConfig(data.monitoring);
      if (data.backup) setBackupConfig(data.backup);
      if (data.analytics?.posthog) {
        setAnalyticsConfig({
          enabled: data.analytics.posthog.enabled || false,
          apiKey: data.analytics.posthog.apiKey || '',
          host: data.analytics.posthog.host || 'https://app.posthog.com',
        });
      }
    } catch (error) {
      console.error('Failed to load integration settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integration settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveEmailSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/integrations/email`, emailConfig);
      toast({
        title: 'Success',
        description: 'Email settings saved successfully',
      });
    } catch (error) {
      console.error('Failed to save email settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save email settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    const testEmailAddress = prompt('Enter email address to send test email:');
    if (!testEmailAddress) return;

    setTesting(true);
    try {
      await axios.post(`${API_URL}/api/integrations/email/test`, null, {
        params: { test_email: testEmailAddress },
      });
      toast({
        title: 'Success',
        description: `Test email sent to ${testEmailAddress}`,
      });
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to send test email',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const saveStorageSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/integrations/storage`, storageConfig);
      toast({
        title: 'Success',
        description: 'Storage settings saved successfully',
      });
    } catch (error) {
      console.error('Failed to save storage settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save storage settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const testStorage = async () => {
    setTesting(true);
    try {
      await axios.post(`${API_URL}/api/integrations/storage/test`);
      toast({
        title: 'Success',
        description: 'Storage connection test successful',
      });
    } catch (error) {
      console.error('Storage connection test failed:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Storage test failed',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const saveMonitoringSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/integrations/monitoring`, monitoringConfig);
      toast({
        title: 'Success',
        description: 'Monitoring settings saved successfully',
      });
    } catch (error) {
      console.error('Failed to save monitoring settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save monitoring settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveBackupSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/integrations/backup`, backupConfig);
      toast({
        title: 'Success',
        description: 'Backup settings saved successfully',
      });
    } catch (error) {
      console.error('Failed to save backup settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save backup settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAnalyticsSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/integrations/analytics/posthog`, analyticsConfig);
      toast({
        title: 'Success',
        description: 'Analytics settings saved successfully',
      });
    } catch (error) {
      console.error('Failed to save analytics settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save analytics settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSecret = (field) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const tabs = [
    { id: 'email', label: 'Email Service', icon: Mail, color: '#9333ea' },
    { id: 'storage', label: 'Cloud Storage', icon: Cloud, color: '#10b981' },
    { id: 'monitoring', label: 'Monitoring', icon: Shield, color: '#f59e0b' },
    { id: 'backup', label: 'Backup', icon: Database, color: '#8b5cf6' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: '#ec4899' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Integrations</h2>
        <p className="text-gray-400 text-sm">Configure third-party services and integrations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-gray-400 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={18} style={{ color: activeTab === tab.id ? tab.color : undefined }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Email Service Tab */}
      {activeTab === 'email' && (
        <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail size={20} className="text-purple-500" />
              Email Service Configuration
            </CardTitle>
            <CardDescription>Configure email service for contact form notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div>
                <p className="text-white font-medium">Enable Email Service</p>
                <p className="text-gray-400 text-sm">Send email notifications for contact form submissions</p>
              </div>
              <button
                onClick={() => setEmailConfig({ ...emailConfig, enabled: !emailConfig.enabled })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  emailConfig.enabled ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    emailConfig.enabled ? 'transform translate-x-7' : ''
                  }`}
                />
              </button>
            </div>

            {/* Provider Selection */}
            <div className="space-y-2">
              <Label className="text-white">Email Provider</Label>
              <div className="grid grid-cols-3 gap-2">
                {['smtp', 'sendgrid', 'resend'].map((provider) => (
                  <button
                    key={provider}
                    onClick={() => setEmailConfig({ ...emailConfig, provider })}
                    className={`p-3 rounded-lg border transition-all ${
                      emailConfig.provider === provider
                        ? 'bg-purple-500/20 border-purple-500 text-white'
                        : 'bg-white/[0.03] border-gray-700 text-gray-400 hover:bg-white/[0.06]'
                    }`}
                  >
                    {provider.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* SMTP Configuration */}
            {emailConfig.provider === 'smtp' && (
              <div className="space-y-4 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h4 className="text-white font-medium">SMTP Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Host</Label>
                    <Input
                      value={emailConfig.smtp.host}
                      onChange={(e) =>
                        setEmailConfig({
                          ...emailConfig,
                          smtp: { ...emailConfig.smtp, host: e.target.value },
                        })
                      }
                      placeholder="smtp.gmail.com"
                      className="bg-white/[0.04] border-white/[0.08] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Port</Label>
                    <Input
                      type="number"
                      value={emailConfig.smtp.port}
                      onChange={(e) =>
                        setEmailConfig({
                          ...emailConfig,
                          smtp: { ...emailConfig.smtp, port: parseInt(e.target.value) },
                        })
                      }
                      className="bg-white/[0.04] border-white/[0.08] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Username</Label>
                    <Input
                      value={emailConfig.smtp.user}
                      onChange={(e) =>
                        setEmailConfig({
                          ...emailConfig,
                          smtp: { ...emailConfig.smtp, user: e.target.value },
                        })
                      }
                      placeholder="your@email.com"
                      className="bg-white/[0.04] border-white/[0.08] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets['smtp-password'] ? 'text' : 'password'}
                        value={emailConfig.smtp.password}
                        onChange={(e) =>
                          setEmailConfig({
                            ...emailConfig,
                            smtp: { ...emailConfig.smtp, password: e.target.value },
                          })
                        }
                        placeholder="••••••••"
                        className="bg-white/5 border-gray-700 text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('smtp-password')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showSecrets['smtp-password'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={emailConfig.smtp.secure}
                    onChange={(e) =>
                      setEmailConfig({
                        ...emailConfig,
                        smtp: { ...emailConfig.smtp, secure: e.target.checked },
                      })
                    }
                    className="rounded"
                  />
                  <Label className="text-gray-300">Use TLS/SSL</Label>
                </div>
              </div>
            )}

            {/* SendGrid Configuration */}
            {emailConfig.provider === 'sendgrid' && (
              <div className="space-y-4 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h4 className="text-white font-medium">SendGrid Settings</h4>
                <div>
                  <Label className="text-gray-300">API Key</Label>
                  <div className="relative">
                    <Input
                      type={showSecrets['sendgrid-key'] ? 'text' : 'password'}
                      value={emailConfig.sendgrid.apiKey}
                      onChange={(e) =>
                        setEmailConfig({
                          ...emailConfig,
                          sendgrid: { ...emailConfig.sendgrid, apiKey: e.target.value },
                        })
                      }
                      placeholder="SG.••••••••••••••••••••"
                      className="bg-white/5 border-gray-700 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('sendgrid-key')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showSecrets['sendgrid-key'] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Get your API key from{' '}
                    <a
                      href="https://app.sendgrid.com/settings/api_keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline"
                    >
                      SendGrid Dashboard
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Resend Configuration */}
            {emailConfig.provider === 'resend' && (
              <div className="space-y-4 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h4 className="text-white font-medium">Resend Settings</h4>
                <div>
                  <Label className="text-gray-300">API Key</Label>
                  <div className="relative">
                    <Input
                      type={showSecrets['resend-key'] ? 'text' : 'password'}
                      value={emailConfig.resend.apiKey}
                      onChange={(e) =>
                        setEmailConfig({
                          ...emailConfig,
                          resend: { ...emailConfig.resend, apiKey: e.target.value },
                        })
                      }
                      placeholder="re_••••••••••••••••••••"
                      className="bg-white/5 border-gray-700 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('resend-key')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showSecrets['resend-key'] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Get your API key from{' '}
                    <a
                      href="https://resend.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline"
                    >
                      Resend Dashboard
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Common Email Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">From Email</Label>
                <Input
                  type="email"
                  value={emailConfig.fromEmail}
                  onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                  placeholder="noreply@yoursite.com"
                  style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: '1px',
                        color: 'white'
                      }}
                />
              </div>
              <div>
                <Label className="text-gray-300">From Name</Label>
                <Input
                  value={emailConfig.fromName}
                  onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                  placeholder="Your Portfolio"
                  style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: '1px',
                        color: 'white'
                      }}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Contact Email (Receive Notifications)</Label>
                <Input
                  type="email"
                  value={emailConfig.contactEmail}
                  onChange={(e) => setEmailConfig({ ...emailConfig, contactEmail: e.target.value })}
                  placeholder="admin@yoursite.com"
                  style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: '1px',
                        color: 'white'
                      }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={saveEmailSettings}
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-500"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button
                onClick={testEmail}
                disabled={!emailConfig.enabled || testing}
                variant="outline"
                className="border-gray-700 hover:bg-white/5"
              >
                {testing ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube size={16} className="mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
              <Button
                onClick={loadSettings}
                variant="outline"
                className="border-gray-700 hover:bg-white/5"
              >
                <RefreshCw size={16} className="mr-2" />
                Reload
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage Tab */}
      {activeTab === 'storage' && (
        <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Cloud size={20} className="text-green-400" />
              Cloud Storage Configuration
            </CardTitle>
            <CardDescription>Store media files in the cloud instead of local server</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div>
                <p className="text-white font-medium">Enable Cloud Storage</p>
                <p className="text-gray-400 text-sm">Upload files to cloud storage service</p>
              </div>
              <button
                onClick={() => setStorageConfig({ ...storageConfig, enabled: !storageConfig.enabled })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  storageConfig.enabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    storageConfig.enabled ? 'transform translate-x-7' : ''
                  }`}
                />
              </button>
            </div>

            {/* Provider Selection */}
            <div className="space-y-2">
              <Label className="text-white">Storage Provider</Label>
              <div className="grid grid-cols-4 gap-2">
                {['local', 's3', 'spaces', 'r2'].map((provider) => (
                  <button
                    key={provider}
                    onClick={() => setStorageConfig({ ...storageConfig, provider })}
                    className={`p-3 rounded-lg border transition-all text-sm ${
                      storageConfig.provider === provider
                        ? 'bg-green-500/20 border-green-500 text-white'
                        : 'bg-white/[0.03] border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {provider === 'local' && 'Local Storage'}
                    {provider === 's3' && 'AWS S3'}
                    {provider === 'spaces' && 'DO Spaces'}
                    {provider === 'r2' && 'Cloudflare R2'}
                  </button>
                ))}
              </div>
            </div>

            {/* S3 Configuration (for s3, spaces, r2) */}
            {storageConfig.provider !== 'local' && (
              <div className="space-y-4 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h4 className="text-white font-medium">
                  {storageConfig.provider === 's3' && 'AWS S3 Settings'}
                  {storageConfig.provider === 'spaces' && 'DigitalOcean Spaces Settings'}
                  {storageConfig.provider === 'r2' && 'Cloudflare R2 Settings'}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Access Key ID</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets['s3-access-key'] ? 'text' : 'password'}
                        value={storageConfig.s3.accessKeyId}
                        onChange={(e) =>
                          setStorageConfig({
                            ...storageConfig,
                            s3: { ...storageConfig.s3, accessKeyId: e.target.value },
                          })
                        }
                        placeholder="AKIAIOSFODNN7EXAMPLE"
                        className="bg-white/5 border-gray-700 text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('s3-access-key')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showSecrets['s3-access-key'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Secret Access Key</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets['s3-secret-key'] ? 'text' : 'password'}
                        value={storageConfig.s3.secretAccessKey}
                        onChange={(e) =>
                          setStorageConfig({
                            ...storageConfig,
                            s3: { ...storageConfig.s3, secretAccessKey: e.target.value },
                          })
                        }
                        placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                        className="bg-white/5 border-gray-700 text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('s3-secret-key')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showSecrets['s3-secret-key'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Region</Label>
                    <Input
                      value={storageConfig.s3.region}
                      onChange={(e) =>
                        setStorageConfig({
                          ...storageConfig,
                          s3: { ...storageConfig.s3, region: e.target.value },
                        })
                      }
                      placeholder="us-east-1"
                      className="bg-white/[0.04] border-white/[0.08] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Bucket Name</Label>
                    <Input
                      value={storageConfig.s3.bucket}
                      onChange={(e) =>
                        setStorageConfig({
                          ...storageConfig,
                          s3: { ...storageConfig.s3, bucket: e.target.value },
                        })
                      }
                      placeholder="my-portfolio-media"
                      className="bg-white/[0.04] border-white/[0.08] text-white"
                    />
                  </div>
                  {(storageConfig.provider === 'spaces' || storageConfig.provider === 'r2') && (
                    <div className="col-span-2">
                      <Label className="text-gray-300">Endpoint URL (Optional)</Label>
                      <Input
                        value={storageConfig.s3.endpoint}
                        onChange={(e) =>
                          setStorageConfig({
                            ...storageConfig,
                            s3: { ...storageConfig.s3, endpoint: e.target.value },
                          })
                        }
                        placeholder={
                          storageConfig.provider === 'spaces'
                            ? 'https://nyc3.digitaloceanspaces.com'
                            : 'https://[account-id].r2.cloudflarestorage.com'
                        }
                        style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: '1px',
                        color: 'white'
                      }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={saveStorageSettings}
                disabled={saving}
                className="bg-green-600 hover:bg-green-500"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button
                onClick={testStorage}
                disabled={!storageConfig.enabled || testing}
                variant="outline"
                className="border-gray-700 hover:bg-white/5"
              >
                {testing ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube size={16} className="mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield size={20} className="text-yellow-400" />
              Monitoring Configuration
            </CardTitle>
            <CardDescription>Configure error tracking and uptime monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sentry Integration */}
            <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Shield size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Sentry Error Tracking</p>
                    <p className="text-gray-400 text-sm">Track and fix errors in real-time</p>
                  </div>
                </div>
                <button
                  onClick={() => setMonitoringConfig({
                    ...monitoringConfig,
                    sentry: { ...monitoringConfig.sentry, enabled: !monitoringConfig.sentry?.enabled }
                  })}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    monitoringConfig.sentry?.enabled ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      monitoringConfig.sentry?.enabled ? 'transform translate-x-7' : ''
                    }`}
                  />
                </button>
              </div>
              
              {monitoringConfig.sentry?.enabled && (
                <div className="mt-4">
                  <Label className="text-gray-300">Sentry DSN</Label>
                  <div className="relative">
                    <Input
                      type={showSecrets['sentry-dsn'] ? 'text' : 'password'}
                      value={monitoringConfig.sentry?.dsn || ''}
                      onChange={(e) =>
                        setMonitoringConfig({
                          ...monitoringConfig,
                          sentry: { ...monitoringConfig.sentry, dsn: e.target.value },
                        })
                      }
                      placeholder="https://xxxxx@sentry.io/xxxxx"
                      className="bg-white/5 border-gray-700 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('sentry-dsn')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showSecrets['sentry-dsn'] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Get your DSN from{' '}
                    <a
                      href="https://sentry.io/settings/projects/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:underline"
                    >
                      Sentry Dashboard
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={saveMonitoringSettings}
                disabled={saving}
                className="bg-yellow-600 hover:bg-yellow-500"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database size={20} className="text-violet-400" />
              Backup Configuration
            </CardTitle>
            <CardDescription>Configure automatic database backups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div>
                <p className="text-white font-medium">Enable Automatic Backups</p>
                <p className="text-gray-400 text-sm">Schedule regular database backups</p>
              </div>
              <button
                onClick={() => setBackupConfig({ ...backupConfig, enabled: !backupConfig.enabled })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  backupConfig.enabled ? 'bg-violet-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    backupConfig.enabled ? 'transform translate-x-7' : ''
                  }`}
                />
              </button>
            </div>

            {/* Schedule Selection */}
            <div className="space-y-2">
              <Label className="text-white">Backup Schedule</Label>
              <div className="grid grid-cols-3 gap-2">
                {['daily', 'weekly', 'monthly'].map((schedule) => (
                  <button
                    key={schedule}
                    onClick={() => setBackupConfig({ ...backupConfig, schedule })}
                    className={`p-3 rounded-lg border transition-all capitalize ${
                      backupConfig.schedule === schedule
                        ? 'bg-violet-500/20 border-violet-500 text-white'
                        : 'bg-white/[0.03] border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {schedule}
                  </button>
                ))}
              </div>
            </div>

            {/* Retention */}
            <div className="space-y-2">
              <Label className="text-white">Retention Period (days)</Label>
              <Input
                type="number"
                value={backupConfig.retention}
                onChange={(e) => setBackupConfig({ ...backupConfig, retention: parseInt(e.target.value) || 7 })}
                min={1}
                max={365}
                className="bg-white/[0.04] border-white/[0.08] text-white"
              />
              <p className="text-gray-500 text-xs">Keep backups for up to 365 days</p>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <Label className="text-white">Backup Destination</Label>
              <div className="grid grid-cols-2 gap-2">
                {['local', 's3'].map((dest) => (
                  <button
                    key={dest}
                    onClick={() => setBackupConfig({ ...backupConfig, destination: dest })}
                    className={`p-3 rounded-lg border transition-all ${
                      backupConfig.destination === dest
                        ? 'bg-violet-500/20 border-violet-500 text-white'
                        : 'bg-white/[0.03] border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {dest === 'local' ? 'Local Storage' : 'Cloud Storage (S3)'}
                  </button>
                ))}
              </div>
              {backupConfig.destination === 's3' && (
                <p className="text-yellow-500 text-xs mt-2">
                  Make sure to configure Cloud Storage in the Storage tab first
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={saveBackupSettings}
                disabled={saving}
                className="bg-violet-600 hover:bg-violet-500"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-pink-400" />
              Analytics Configuration
            </CardTitle>
            <CardDescription>Configure product analytics with PostHog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <BarChart3 size={20} className="text-pink-400" />
                </div>
                <div>
                  <p className="text-white font-medium">PostHog Analytics</p>
                  <p className="text-gray-400 text-sm">Track user behavior and product analytics</p>
                </div>
              </div>
              <button
                onClick={() => setAnalyticsConfig({ ...analyticsConfig, enabled: !analyticsConfig.enabled })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  analyticsConfig.enabled ? 'bg-pink-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    analyticsConfig.enabled ? 'transform translate-x-7' : ''
                  }`}
                />
              </button>
            </div>

            {analyticsConfig.enabled && (
              <div className="space-y-4 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <Label className="text-gray-300">API Key</Label>
                  <div className="relative">
                    <Input
                      type={showSecrets['posthog-key'] ? 'text' : 'password'}
                      value={analyticsConfig.apiKey}
                      onChange={(e) =>
                        setAnalyticsConfig({ ...analyticsConfig, apiKey: e.target.value })
                      }
                      placeholder="phc_••••••••••••••••"
                      className="bg-white/5 border-gray-700 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('posthog-key')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showSecrets['posthog-key'] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Get your API key from{' '}
                    <a
                      href="https://app.posthog.com/project/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-400 hover:underline"
                    >
                      PostHog Settings
                    </a>
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300">Host URL</Label>
                  <Input
                    value={analyticsConfig.host}
                    onChange={(e) =>
                      setAnalyticsConfig({ ...analyticsConfig, host: e.target.value })
                    }
                    placeholder="https://app.posthog.com"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: '1px',
                        color: 'white'
                      }}
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Use default URL or your self-hosted PostHog instance
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={saveAnalyticsSettings}
                disabled={saving}
                className="bg-pink-600 hover:bg-pink-500"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntegrationsManager;
