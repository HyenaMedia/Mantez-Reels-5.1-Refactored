import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Accordion } from '../ui/accordion';
import { useToast } from '../../hooks/use-toast';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
} from 'lucide-react';

import {
  ThemeSwitcherSection,
  LanguageSelectorSection,
  AdminAppearanceSection,
  PerformanceSection,
  SeoSection,
  SocialProfilesSection,
  RobotsTxtSection,
  LlmsTxtSection,
  SiteConfigSection,
  MediaSettingsSection,
  CloudStorageSection,
  CookieBannerSection,
  AdvancedSection,
  SiteFeaturesSection,
  AdminTopbarSection,
  MarketingSection,
} from './settings/index';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function Settings() {
  const { toast } = useToast();
  const { theme, updateTheme, resetTheme } = useAdminTheme();
  const { refreshThemeSwitcherSetting } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [generatingSitemap, setGeneratingSitemap] = useState(false);
  const [testingStorage, setTestingStorage] = useState(false);
  const [storageTestResult, setStorageTestResult] = useState(null);

  const fetchSettings = useCallback(async (signal) => {
    try {
      const token = localStorage.getItem('token');
      const response = token
        ? await axios.get(`${BACKEND_URL}/api/settings/admin`, { headers: { Authorization: `Bearer ${token}` }, ...(signal && { signal }) })
        : await axios.get(`${BACKEND_URL}/api/settings/`, { ...(signal && { signal }) });
      setSettings(response.data);
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
      toast({
        title: 'Error',
        description: `Failed to load settings: ${error.response?.data?.detail || error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const controller = new AbortController();
    fetchSettings(controller.signal);
    return () => controller.abort();
  }, [fetchSettings]);

  const handleGenerateSitemap = async () => {
    setGeneratingSitemap(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BACKEND_URL}/api/settings/generate-sitemap`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { sitemap, url_count } = response.data;
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Sitemap Generated', description: `Downloaded sitemap.xml with ${url_count} URLs.` });
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.detail || 'Failed to generate sitemap', variant: 'destructive' });
    } finally {
      setGeneratingSitemap(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BACKEND_URL}/api/settings/`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (refreshThemeSwitcherSetting) {
        await refreshThemeSwitcherSetting();
      }

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to defaults?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BACKEND_URL}/api/settings/reset`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSettings(response.data.settings);
      toast({
        title: 'Success',
        description: 'Settings reset to defaults',
      });
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset settings',
        variant: 'destructive',
      });
    }
  };

  const updateSetting = (category, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const updateArraySetting = (category, field, value) => {
    const array = value
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    updateSetting(category, field, array);
  };

  const updateNestedSetting = (category, subKey, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subKey]: {
          ...prev[category][subKey],
          [field]: value,
        },
      },
    }));
  };

  const handleTestStorage = async () => {
    setTestingStorage(true);
    setStorageTestResult(null);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BACKEND_URL}/api/settings/`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.post(`${BACKEND_URL}/api/settings/test-storage`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStorageTestResult(response.data);
    } catch (error) {
      setStorageTestResult({ success: false, message: error.response?.data?.detail || 'Test failed' });
    } finally {
      setTestingStorage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-400">Failed to load settings</p>
          <Button onClick={fetchSettings} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-8 h-8" />
            Settings
          </h2>
          <p className="text-gray-400 mt-1">Configure your site settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Settings Accordion */}
      <Accordion type="single" collapsible defaultValue="performance" className="space-y-4">
        <ThemeSwitcherSection settings={settings} setSettings={setSettings} />
        <LanguageSelectorSection settings={settings} setSettings={setSettings} />
        <AdminAppearanceSection theme={theme} updateTheme={updateTheme} resetTheme={resetTheme} toast={toast} />
        <PerformanceSection settings={settings} updateSetting={updateSetting} />
        <SeoSection settings={settings} updateSetting={updateSetting} generatingSitemap={generatingSitemap} onGenerateSitemap={handleGenerateSitemap} />
        <SocialProfilesSection settings={settings} updateSetting={updateSetting} />
        <RobotsTxtSection settings={settings} updateSetting={updateSetting} />
        <LlmsTxtSection settings={settings} updateSetting={updateSetting} />
        <SiteConfigSection settings={settings} updateSetting={updateSetting} />
        <MediaSettingsSection settings={settings} updateSetting={updateSetting} updateArraySetting={updateArraySetting} />
        <CloudStorageSection
          settings={settings}
          updateSetting={updateSetting}
          updateNestedSetting={updateNestedSetting}
          testingStorage={testingStorage}
          storageTestResult={storageTestResult}
          onTestStorage={handleTestStorage}
        />
        <CookieBannerSection settings={settings} updateSetting={updateSetting} />
        <AdvancedSection settings={settings} updateSetting={updateSetting} updateArraySetting={updateArraySetting} />
        <SiteFeaturesSection settings={settings} updateSetting={updateSetting} />
        <AdminTopbarSection settings={settings} updateSetting={updateSetting} />
        <MarketingSection settings={settings} updateSetting={updateSetting} />
      </Accordion>

      {/* Save Button at Bottom */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="gap-2 bg-purple-600 hover:bg-purple-700"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving Changes...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
