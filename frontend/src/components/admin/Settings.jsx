import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useToast } from '../../hooks/use-toast';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Zap,
  Search,
  Globe,
  Code,
  Image,
  Activity,
  Palette,
  RefreshCw,
  Share2,
  FileText,
  Bot,
  Link,
  Cloud,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import MarketingAnalyticsSection from './MarketingAnalyticsSection';

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
  const [storageTestResult, setStorageTestResult] = useState(null); // {success, message}

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
      // Download as file
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
      
      // Refresh theme switcher setting in ThemeContext
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

  // Update a deeply nested field: settings[category][subKey][field]
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
      // Save current settings first so the backend reads the latest credentials
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
        {/* Theme Switcher Control - NEW SECTION */}
        <AccordionItem
          value="theme-switcher"
          className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg"
        >
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-500" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">Website Theme Switcher</h3>
                <p className="text-sm text-gray-400">
                  Enable/disable light/dark mode toggle for visitors
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-6">
              {/* Theme Switcher Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <p className="text-white font-medium">Enable Theme Switcher</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Allow visitors to toggle between light and dark mode. When disabled, the site will only display in dark mode.
                  </p>
                </div>
                <Switch
                  checked={settings?.themeSwitcherEnabled || false}
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, themeSwitcherEnabled: checked }));
                  }}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex gap-3">
                  <Activity className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">How it works</p>
                    <p className="text-blue-200/70 text-sm">
                      When enabled, a sun/moon toggle button will appear in the website navigation, allowing visitors to switch between light and dark themes. 
                      When disabled, the toggle is hidden and the site remains in dark mode only.
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Current status:</span>
                {settings?.themeSwitcherEnabled ? (
                  <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                    Enabled - Visitors can toggle themes
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-gray-700 text-gray-300 border border-gray-600">
                    Disabled - Dark mode only
                  </span>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Language Selector Control - NEW SECTION */}
        <AccordionItem
          value="language-selector"
          className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg"
        >
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-green-500" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">Language Selector</h3>
                <p className="text-sm text-gray-400">
                  Enable/disable language dropdown for visitors
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-6">
              {/* Language Selector Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <p className="text-white font-medium">Enable Language Selector</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Show a language dropdown (EN, ES, FR, etc.) in the navigation bar. When disabled, the language selector is hidden.
                  </p>
                </div>
                <Switch
                  checked={settings?.languageSelectorEnabled || false}
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, languageSelectorEnabled: checked }));
                  }}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex gap-3">
                  <Globe className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-300 text-sm font-medium mb-1">How it works</p>
                    <p className="text-green-200/70 text-sm">
                      When enabled, a language dropdown with a globe icon will appear in the website navigation, allowing visitors to switch between available languages. 
                      When disabled, the language selector is hidden and the site displays in the default language only.
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Current status:</span>
                {settings?.languageSelectorEnabled ? (
                  <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                    Enabled - Multilingual support active
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-gray-700 text-gray-300 border border-gray-600">
                    Disabled - Default language only
                  </span>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Admin Dashboard Appearance - NEW SECTION */}
        <AccordionItem
          value="admin-appearance"
          className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg"
        >
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">Admin Dashboard Appearance</h3>
                <p className="text-sm text-gray-400">
                  Customize colors and styling for admin interface
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-6">
              {/* Accent Color */}
              <div>
                <Label className="text-gray-300 mb-2 block">Primary Accent Color</Label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => updateTheme({ accentColor: e.target.value })}
                    className="w-20 h-12 rounded border border-white/[0.08] cursor-pointer"
                  />
                  <div className="flex-1">
                    <Input
                      value={theme.accentColor}
                      onChange={(e) => updateTheme({ accentColor: e.target.value })}
                      className="bg-white/[0.04] border-white/[0.08] text-white font-mono"
                      placeholder="#9333ea"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used for buttons, links, and highlights</p>
                  </div>
                </div>
              </div>

              {/* Button Gradient Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 mb-2 block">Button Gradient Start</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={theme.buttonGradientFrom}
                      onChange={(e) => updateTheme({ buttonGradientFrom: e.target.value })}
                      className="w-12 h-12 rounded border border-white/[0.08] cursor-pointer"
                    />
                    <Input
                      value={theme.buttonGradientFrom}
                      onChange={(e) => updateTheme({ buttonGradientFrom: e.target.value })}
                      className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300 mb-2 block">Button Gradient End</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={theme.buttonGradientTo}
                      onChange={(e) => updateTheme({ buttonGradientTo: e.target.value })}
                      className="w-12 h-12 rounded border border-white/[0.08] cursor-pointer"
                    />
                    <Input
                      value={theme.buttonGradientTo}
                      onChange={(e) => updateTheme({ buttonGradientTo: e.target.value })}
                      className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="p-6 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Live Preview
                </h4>
                <div className="space-y-4">
                  {/* Preview Button */}
                  <button
                    className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition-all"
                    style={{
                      background: `linear-gradient(to right, ${theme.buttonGradientFrom}, ${theme.buttonGradientTo})`
                    }}
                  >
                    Sample Button
                  </button>

                  {/* Preview Card */}
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <h5 className="font-semibold mb-2 text-white">Sample Card</h5>
                    <p className="text-gray-300 text-sm">This is how cards will look with your theme.</p>
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      <span style={{ color: theme.accentColor }} className="text-sm font-medium">Accent Color Text</span>
                    </div>
                  </div>

                  {/* Preview Input */}
                  <input
                    type="text"
                    placeholder="Sample Input Field"
                    className="w-full px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <Label className="text-gray-300 mb-3 block">Quick Color Presets</Label>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => updateTheme({
                      accentColor: '#9333ea',
                      buttonGradientFrom: '#9333ea',
                      buttonGradientTo: '#ec4899'
                    })}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
                  >
                    <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(to right, #9333ea, #ec4899)' }}></div>
                    <span className="text-xs text-gray-400">Purple</span>
                  </button>
                  <button
                    onClick={() => updateTheme({
                      accentColor: '#3b82f6',
                      buttonGradientFrom: '#3b82f6',
                      buttonGradientTo: '#06b6d4'
                    })}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
                  >
                    <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(to right, #3b82f6, #06b6d4)' }}></div>
                    <span className="text-xs text-gray-400">Blue</span>
                  </button>
                  <button
                    onClick={() => updateTheme({
                      accentColor: '#10b981',
                      buttonGradientFrom: '#10b981',
                      buttonGradientTo: '#3b82f6'
                    })}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
                  >
                    <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(to right, #10b981, #3b82f6)' }}></div>
                    <span className="text-xs text-gray-400">Green</span>
                  </button>
                  <button
                    onClick={() => updateTheme({
                      accentColor: '#f59e0b',
                      buttonGradientFrom: '#f59e0b',
                      buttonGradientTo: '#ef4444'
                    })}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
                  >
                    <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(to right, #f59e0b, #ef4444)' }}></div>
                    <span className="text-xs text-gray-400">Orange</span>
                  </button>
                </div>
              </div>

              {/* Reset Theme Button */}
              <div className="pt-4 border-t border-white/[0.06]">
                <Button
                  onClick={() => {
                    resetTheme();
                    toast({
                      title: 'Theme Reset',
                      description: 'Admin theme has been reset to default purple',
                    });
                  }}
                  variant="outline"
                  className="w-full border-white/[0.06] text-gray-300 hover:bg-white/[0.04]"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Reset to Default Purple Theme
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This will restore the default purple color scheme
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Performance Settings */}
        <AccordionItem
          value="performance"
          className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg"
        >
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">Performance Settings</h3>
                <p className="text-sm text-gray-400">
                  Cache duration, compression, and optimization
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Static Assets Cache (seconds)</Label>
                <Input
                  type="number"
                  value={settings.performance.cacheStaticAssets}
                  onChange={(e) =>
                    updateSetting('performance', 'cacheStaticAssets', parseInt(e.target.value))
                  }
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                />
                <p className="text-xs text-gray-500">31536000 = 1 year (recommended)</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Media Cache (seconds)</Label>
                <Input
                  type="number"
                  value={settings.performance.cacheMedia}
                  onChange={(e) =>
                    updateSetting('performance', 'cacheMedia', parseInt(e.target.value))
                  }
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                />
                <p className="text-xs text-gray-500">604800 = 1 week (recommended)</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">GZip Compression Level</Label>
                <Input
                  type="number"
                  min="1"
                  max="9"
                  value={settings.performance.gzipLevel}
                  onChange={(e) =>
                    updateSetting('performance', 'gzipLevel', parseInt(e.target.value))
                  }
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                />
                <p className="text-xs text-gray-500">1-9 (6 recommended for balance)</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">GZip Enabled</Label>
                  <Switch
                    checked={settings.performance.gzipEnabled}
                    onCheckedChange={(checked) =>
                      updateSetting('performance', 'gzipEnabled', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Image Lazy Loading</Label>
                  <Switch
                    checked={settings.performance.imageLazyLoad}
                    onCheckedChange={(checked) =>
                      updateSetting('performance', 'imageLazyLoad', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Code Splitting</Label>
                  <Switch
                    checked={settings.performance.codeSplitting}
                    onCheckedChange={(checked) =>
                      updateSetting('performance', 'codeSplitting', checked)
                    }
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SEO Settings */}
        <AccordionItem value="seo" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">SEO & Meta Settings</h3>
                <p className="text-sm text-gray-400">
                  Search engine optimization and social sharing
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Site Title</Label>
                <Input
                  value={settings.seo.siteTitle}
                  onChange={(e) => updateSetting('seo', 'siteTitle', e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                  placeholder="Mantez Reels"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Meta Description</Label>
                <Textarea
                  value={settings.seo.metaDescription}
                  onChange={(e) => updateSetting('seo', 'metaDescription', e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                  placeholder="Professional videographer portfolio..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Meta Keywords</Label>
                <Input
                  value={settings.seo.metaKeywords}
                  onChange={(e) => updateSetting('seo', 'metaKeywords', e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                  placeholder="videographer, photography, video production"
                />
              </div>

              <div className="space-y-4 bg-white/[0.02] p-4 rounded-lg border border-white/[0.06]">
                <div className="flex items-start gap-2">
                  <Image className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-300 font-semibold">
                      Open Graph Image (Social Sharing)
                    </Label>
                    <p className="text-xs text-gray-400 mt-1">
                      This image appears when your website link is shared on social media platforms
                      like Facebook, Twitter, LinkedIn, WhatsApp, etc.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    value={settings.seo.ogImage}
                    onChange={(e) => updateSetting('seo', 'ogImage', e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white"
                    placeholder="https://images.unsplash.com/photo-xxx or upload to Media tab"
                  />
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      📸 <strong>Recommended:</strong> 1200x630px (1.91:1 ratio)
                    </p>
                    <p>
                      💡 <strong>Tip:</strong> Upload an image to the Media tab and paste the URL
                      here, or use any image URL
                    </p>
                    <p>
                      ✨ <strong>Best Practice:</strong> Use branded image with your logo and
                      portfolio work
                    </p>
                  </div>
                </div>

                {/* Image Preview */}
                {settings.seo.ogImage && (
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Preview:</Label>
                    <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-white/[0.02]">
                      <img
                        src={settings.seo.ogImage}
                        alt="OG Image Preview"
                        className="w-full h-auto max-h-48 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div
                        style={{ display: 'none' }}
                        className="p-4 text-center text-gray-500 text-sm"
                      >
                        ❌ Failed to load image. Check if the URL is valid.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">OG Description</Label>
                <Textarea
                  value={settings.seo.ogDescription}
                  onChange={(e) => updateSetting('seo', 'ogDescription', e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                  placeholder="Description for social media sharing..."
                  rows={2}
                />
              </div>

              {/* Sitemap Generator */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-semibold text-white">Sitemap Generator</h4>
                </div>
                <p className="text-xs text-gray-400">
                  Generate a fresh sitemap.xml including all published portfolio items. Download and place it in your domain root.
                </p>
                <Button
                  data-testid="generate-sitemap-btn"
                  onClick={handleGenerateSitemap}
                  disabled={generatingSitemap}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                >
                  {generatingSitemap ? (
                    <><RefreshCw className="w-3 h-3 mr-2 animate-spin" />Generating...</>
                  ) : (
                    <><RefreshCw className="w-3 h-3 mr-2" />Generate &amp; Download Sitemap</>
                  )}
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Social Links */}
        <AccordionItem value="social" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">Social Profiles</h3>
                <p className="text-sm text-gray-400">Linked in JSON-LD structured data for AI &amp; search discoverability</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-2 mb-3">
              <p className="text-xs text-purple-300/80 bg-purple-500/10 border border-purple-500/20 rounded-md px-3 py-2">
                These links power the <code className="text-purple-300">sameAs</code> field in your Schema.org Person markup — helping AI platforms (ChatGPT, Perplexity, Gemini) and Google Knowledge Graph recognise your identity across the web.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
                { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
                { key: 'vimeo', label: 'Vimeo', placeholder: 'https://vimeo.com/yourprofile' },
                { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourhandle' },
                { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourname' },
                { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/yourhandle' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Link className="w-3 h-3 text-gray-500" />
                    {label}
                  </Label>
                  <Input
                    data-testid={`social-${key}-input`}
                    value={settings.social?.[key] || ''}
                    onChange={(e) => updateSetting('social', key, e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white text-sm"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* robots.txt Editor */}
        <AccordionItem value="robots" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">robots.txt</h3>
                <p className="text-sm text-gray-400">Control which crawlers can index your site — served at /robots.txt</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                Changes are live immediately. The default allows all beneficial AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) while blocking the admin area.
              </p>
              <Textarea
                data-testid="robots-txt-editor"
                value={settings.seoFiles?.robotsTxt || ''}
                onChange={(e) => updateSetting('seoFiles', 'robotsTxt', e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-xs"
                rows={18}
                spellCheck={false}
              />
              <div className="flex gap-2">
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  Preview /robots.txt ↗
                </a>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* llms.txt Editor */}
        <AccordionItem value="llms" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">llms.txt</h3>
                <p className="text-sm text-gray-400">Help AI answer engines understand your site — served at /llms.txt</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-3">
              <p className="text-xs text-purple-300/80 bg-purple-500/10 border border-purple-500/20 rounded-md px-3 py-2">
                <strong className="text-purple-200">New 2025 standard.</strong> When ChatGPT, Perplexity, Claude, or Gemini crawl your site, they read /llms.txt to understand who you are and what content they can reference in answers. Use Markdown format.
              </p>
              <Textarea
                data-testid="llms-txt-editor"
                value={settings.seoFiles?.llmsTxt || ''}
                onChange={(e) => updateSetting('seoFiles', 'llmsTxt', e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-xs"
                rows={18}
                spellCheck={false}
              />
              <div className="flex gap-2">
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  Preview /llms.txt ↗
                </a>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Site Configuration */}
        <AccordionItem value="site" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">Site Configuration</h3>
                <p className="text-sm text-gray-400">Branding, colors, and general settings</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Site Name</Label>
                <Input
                  value={settings.site.siteName}
                  onChange={(e) => updateSetting('site', 'siteName', e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Site URL</Label>
                <Input
                  data-testid="site-url-input"
                  value={settings.site.siteUrl || ''}
                  onChange={(e) => updateSetting('site', 'siteUrl', e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                  placeholder="https://yourdomain.com"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Contact Email</Label>
                <Input
                  type="email"
                  value={settings.site.contactEmail}
                  onChange={(e) => updateSetting('site', 'contactEmail', e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Primary Color (Hex)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.site.primaryColor}
                    onChange={(e) => updateSetting('site', 'primaryColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={settings.site.primaryColor}
                    onChange={(e) => updateSetting('site', 'primaryColor', e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Copyright Text</Label>
                <Input
                  value={settings.site.copyrightText}
                  onChange={(e) => updateSetting('site', 'copyrightText', e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                />
              </div>

              {/* Logo Upload Section */}
              <div className="space-y-4 md:col-span-2 bg-white/[0.02] p-4 rounded-lg border border-white/[0.06]">
                <div className="flex items-start gap-2">
                  <Image className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-300 font-semibold">Site Logo</Label>
                    <p className="text-xs text-gray-400 mt-1">
                      Logo displayed in navbar and footer. Leave empty to show site name as text.
                    </p>
                  </div>
                </div>
                <Input
                  value={settings.site.logoUrl || ''}
                  onChange={(e) => updateSetting('site', 'logoUrl', e.target.value)}
                  placeholder="https://... or upload to Media Library and paste URL"
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                />
                {settings.site.logoUrl && (
                  <div className="flex items-center gap-4">
                    <div className="bg-white/[0.03] p-3 rounded-lg border border-white/[0.06]">
                      <img
                        src={settings.site.logoUrl}
                        alt="Logo Preview"
                        className="h-12 max-w-48 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <button
                      onClick={() => updateSetting('site', 'logoUrl', '')}
                      className="text-red-400 hover:text-red-300 text-sm underline"
                    >
                      Remove Logo
                    </button>
                  </div>
                )}
              </div>

              {/* Favicon Upload Section */}
              <div className="space-y-4 md:col-span-2 bg-white/[0.02] p-4 rounded-lg border border-white/[0.06]">
                <div className="flex items-start gap-2">
                  <Image className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-gray-300 font-semibold">Favicon (Browser Tab Icon)</Label>
                    <p className="text-xs text-gray-400 mt-1">
                      Small icon shown in browser tabs and bookmarks. Recommended size: 32x32px or 64x64px.
                    </p>
                  </div>
                </div>
                <Input
                  value={settings.site.faviconUrl || ''}
                  onChange={(e) => updateSetting('site', 'faviconUrl', e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                  placeholder="https://... (PNG, ICO, or SVG)"
                />
                <div className="text-xs text-gray-500 space-y-1">
                  <p>💡 <strong>Tip:</strong> Upload your favicon to the Media Library and paste the URL here</p>
                  <p>📸 <strong>Formats:</strong> PNG, ICO, or SVG work best</p>
                </div>
                {settings.site.faviconUrl && (
                  <div className="flex items-center gap-4">
                    <div className="bg-white/[0.03] p-3 rounded-lg border border-white/[0.06]">
                      <img
                        src={settings.site.faviconUrl}
                        alt="Favicon Preview"
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <button
                      onClick={() => updateSetting('site', 'faviconUrl', '')}
                      className="text-red-400 hover:text-red-300 text-sm underline"
                    >
                      Remove Favicon
                    </button>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Media Settings */}
        <AccordionItem value="media" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Image className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">Media Settings</h3>
                <p className="text-sm text-gray-400">Upload limits and optimization preferences</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Max Upload Size (MB)</Label>
                <Input
                  type="number"
                  value={settings.media.maxUploadSizeMB}
                  onChange={(e) =>
                    updateSetting('media', 'maxUploadSizeMB', parseInt(e.target.value))
                  }
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                />
                <p className="text-xs text-gray-500">10 MB recommended</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Image Quality (1-100)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.media.imageQuality}
                  onChange={(e) => updateSetting('media', 'imageQuality', parseInt(e.target.value))}
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                />
                <p className="text-xs text-gray-500">80 recommended</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-300">Allowed File Types (one per line)</Label>
                <Textarea
                  value={settings.media.allowedFileTypes.join('\n')}
                  onChange={(e) => updateArraySetting('media', 'allowedFileTypes', e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                  rows={5}
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <div>
                    <Label className="text-gray-300 font-semibold">Auto Optimize Images</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically convert to WebP & compress images on upload
                    </p>
                  </div>
                  <Switch
                    checked={settings.media.autoOptimizeImages}
                    onCheckedChange={(checked) =>
                      updateSetting('media', 'autoOptimizeImages', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <div>
                    <Label className="text-gray-300 font-semibold">Auto Optimize Videos</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically optimize videos for web delivery
                    </p>
                  </div>
                  <Switch
                    checked={settings.media.autoOptimizeVideos}
                    onCheckedChange={(checked) =>
                      updateSetting('media', 'autoOptimizeVideos', checked)
                    }
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Cloud Storage */}
        <AccordionItem value="cloudStorage" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">Cloud Storage</h3>
                <p className="text-sm text-gray-400">Cloudflare R2 for persistent media hosting</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            {settings.cloudStorage && (
              <div className="space-y-6">
                {/* Enable toggle */}
                <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <div>
                    <Label className="text-gray-300 font-semibold">Enable Cloudflare R2</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Use R2 to store uploaded media files in the cloud
                    </p>
                  </div>
                  <Switch
                    checked={settings.cloudStorage.enabled}
                    onCheckedChange={(v) => updateSetting('cloudStorage', 'enabled', v)}
                    data-testid="r2-enabled-toggle"
                  />
                </div>

                {/* Default storage target */}
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">Default Storage for New Uploads</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'local', label: 'Local only', desc: 'Stored on server disk' },
                      { value: 'r2', label: 'R2 only', desc: 'Stored in Cloudflare R2' },
                      { value: 'both', label: 'Both', desc: 'Local + R2 redundancy' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        data-testid={`storage-option-${opt.value}`}
                        onClick={() => updateSetting('cloudStorage', 'defaultStorage', opt.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          settings.cloudStorage.defaultStorage === opt.value
                            ? 'border-blue-500 bg-blue-500/10 text-white'
                            : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <p className="font-medium text-sm">{opt.label}</p>
                        <p className="text-xs mt-0.5 opacity-70">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* R2 Credentials */}
                <div className="space-y-4 p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold text-sm">R2 Credentials</h4>
                    <a
                      href="https://dash.cloudflare.com/?to=/:account/r2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Link className="w-3 h-3" /> Cloudflare Dashboard
                    </a>
                  </div>
                  <p className="text-xs text-gray-500">
                    Create an R2 API token at Cloudflare Dashboard → R2 → Manage R2 API tokens.
                    Token needs <strong className="text-gray-400">Object Read & Write</strong> permission.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-gray-400 text-xs">Account ID</Label>
                      <Input
                        value={settings.cloudStorage.r2.accountId}
                        onChange={(e) => updateNestedSetting('cloudStorage', 'r2', 'accountId', e.target.value)}
                        placeholder="abcdef1234567890..."
                        className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                        data-testid="r2-account-id"
                      />
                      <p className="text-xs text-gray-600">Found on the right side of your R2 dashboard</p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-gray-400 text-xs">Bucket Name</Label>
                      <Input
                        value={settings.cloudStorage.r2.bucket}
                        onChange={(e) => updateNestedSetting('cloudStorage', 'r2', 'bucket', e.target.value)}
                        placeholder="my-portfolio-media"
                        className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                        data-testid="r2-bucket"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-gray-400 text-xs">Access Key ID</Label>
                      <Input
                        value={settings.cloudStorage.r2.accessKeyId}
                        onChange={(e) => updateNestedSetting('cloudStorage', 'r2', 'accessKeyId', e.target.value)}
                        placeholder="API token Access Key ID"
                        className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                        data-testid="r2-access-key-id"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-gray-400 text-xs">Secret Access Key</Label>
                      <Input
                        type="password"
                        value={settings.cloudStorage.r2.secretAccessKey}
                        onChange={(e) => updateNestedSetting('cloudStorage', 'r2', 'secretAccessKey', e.target.value)}
                        placeholder="Secret Access Key"
                        className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                        data-testid="r2-secret-key"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-gray-400 text-xs">Public Domain</Label>
                      <Input
                        value={settings.cloudStorage.r2.publicDomain}
                        onChange={(e) => updateNestedSetting('cloudStorage', 'r2', 'publicDomain', e.target.value)}
                        placeholder="https://pub-xxxxxxxx.r2.dev  or  https://files.yourdomain.com"
                        className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                        data-testid="r2-public-domain"
                      />
                      <p className="text-xs text-gray-600">
                        Enable "Public access" on your R2 bucket to get a <code className="text-gray-500">pub-xxx.r2.dev</code> URL,
                        or connect your own custom domain.
                      </p>
                    </div>
                  </div>

                  {/* Test Connection */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={handleTestStorage}
                      disabled={testingStorage}
                      variant="outline"
                      size="sm"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      data-testid="test-r2-connection-btn"
                    >
                      {testingStorage ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Testing...</>
                      ) : (
                        'Test Connection'
                      )}
                    </Button>
                    {storageTestResult && (
                      <div className={`flex items-center gap-2 text-sm ${storageTestResult.success ? 'text-green-400' : 'text-red-400'}`}>
                        {storageTestResult.success
                          ? <CheckCircle className="w-4 h-4" />
                          : <XCircle className="w-4 h-4" />}
                        {storageTestResult.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Cookie Banner Settings */}
        <AccordionItem
          value="cookieBanner"
          className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg"
        >
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="text-xl">🍪</span>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">Cookie Banner</h3>
                <p className="text-sm text-gray-400">
                  Customize cookie consent banner appearance
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <div>
                  <Label className="text-gray-300 font-semibold">Enable Cookie Banner</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Show cookie consent banner to visitors
                  </p>
                </div>
                <Switch
                  checked={settings.cookieBanner?.enabled ?? true}
                  onCheckedChange={(checked) =>
                    updateSetting('cookieBanner', 'enabled', checked)
                  }
                />
              </div>

              {/* Banner Colors */}
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
                  Banner Colors
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cookieBanner?.backgroundColor || '#111827'}
                        onChange={(e) => updateSetting('cookieBanner', 'backgroundColor', e.target.value)}
                        className="w-12 h-10 p-1 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.cookieBanner?.backgroundColor || '#111827'}
                        onChange={(e) => updateSetting('cookieBanner', 'backgroundColor', e.target.value)}
                        className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Heading Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cookieBanner?.headingColor || '#ffffff'}
                        onChange={(e) => updateSetting('cookieBanner', 'headingColor', e.target.value)}
                        className="w-12 h-10 p-1 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.cookieBanner?.headingColor || '#ffffff'}
                        onChange={(e) => updateSetting('cookieBanner', 'headingColor', e.target.value)}
                        className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cookieBanner?.textColor || '#9ca3af'}
                        onChange={(e) => updateSetting('cookieBanner', 'textColor', e.target.value)}
                        className="w-12 h-10 p-1 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.cookieBanner?.textColor || '#9ca3af'}
                        onChange={(e) => updateSetting('cookieBanner', 'textColor', e.target.value)}
                        className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Accept Button Colors */}
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  Accept Button
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Button Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cookieBanner?.acceptButtonColor || '#9333ea'}
                        onChange={(e) => updateSetting('cookieBanner', 'acceptButtonColor', e.target.value)}
                        className="w-12 h-10 p-1 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.cookieBanner?.acceptButtonColor || '#9333ea'}
                        onChange={(e) => updateSetting('cookieBanner', 'acceptButtonColor', e.target.value)}
                        className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Button Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cookieBanner?.acceptButtonTextColor || '#ffffff'}
                        onChange={(e) => updateSetting('cookieBanner', 'acceptButtonTextColor', e.target.value)}
                        className="w-12 h-10 p-1 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.cookieBanner?.acceptButtonTextColor || '#ffffff'}
                        onChange={(e) => updateSetting('cookieBanner', 'acceptButtonTextColor', e.target.value)}
                        className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reject Button Colors */}
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                  Reject Button
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Button Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cookieBanner?.rejectButtonColor || '#374151'}
                        onChange={(e) => updateSetting('cookieBanner', 'rejectButtonColor', e.target.value)}
                        className="w-12 h-10 p-1 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.cookieBanner?.rejectButtonColor || '#374151'}
                        onChange={(e) => updateSetting('cookieBanner', 'rejectButtonColor', e.target.value)}
                        className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Button Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cookieBanner?.rejectButtonTextColor || '#ffffff'}
                        onChange={(e) => updateSetting('cookieBanner', 'rejectButtonTextColor', e.target.value)}
                        className="w-12 h-10 p-1 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.cookieBanner?.rejectButtonTextColor || '#ffffff'}
                        onChange={(e) => updateSetting('cookieBanner', 'rejectButtonTextColor', e.target.value)}
                        className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggle Colors */}
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Toggle Switch Colors
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Active (On) Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cookieBanner?.toggleActiveColor || '#9333ea'}
                        onChange={(e) => updateSetting('cookieBanner', 'toggleActiveColor', e.target.value)}
                        className="w-12 h-10 p-1 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.cookieBanner?.toggleActiveColor || '#9333ea'}
                        onChange={(e) => updateSetting('cookieBanner', 'toggleActiveColor', e.target.value)}
                        className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Inactive (Off) Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cookieBanner?.toggleInactiveColor || '#4b5563'}
                        onChange={(e) => updateSetting('cookieBanner', 'toggleInactiveColor', e.target.value)}
                        className="w-12 h-10 p-1 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.cookieBanner?.toggleInactiveColor || '#4b5563'}
                        onChange={(e) => updateSetting('cookieBanner', 'toggleInactiveColor', e.target.value)}
                        className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <h4 className="text-white font-medium">Preview</h4>
                <div 
                  className="p-4 rounded-xl border border-gray-600"
                  style={{ backgroundColor: settings.cookieBanner?.backgroundColor || '#111827' }}
                >
                  <p 
                    className="text-sm font-medium mb-1"
                    style={{ color: settings.cookieBanner?.headingColor || '#ffffff' }}
                  >
                    Cookie Settings
                  </p>
                  <p 
                    className="text-xs mb-3"
                    style={{ color: settings.cookieBanner?.textColor || '#9ca3af' }}
                  >
                    We use cookies to enhance your experience.
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1.5 rounded text-xs border"
                      style={{ 
                        borderColor: settings.cookieBanner?.manageButtonBorderColor || '#4b5563',
                        color: settings.cookieBanner?.manageButtonTextColor || '#d1d5db'
                      }}
                    >
                      Manage Cookies
                    </button>
                    <button
                      className="px-3 py-1.5 rounded text-xs"
                      style={{ 
                        backgroundColor: settings.cookieBanner?.rejectButtonColor || '#374151',
                        color: settings.cookieBanner?.rejectButtonTextColor || '#ffffff'
                      }}
                    >
                      Reject All
                    </button>
                    <button
                      className="px-3 py-1.5 rounded text-xs"
                      style={{ 
                        backgroundColor: settings.cookieBanner?.acceptButtonColor || '#9333ea',
                        color: settings.cookieBanner?.acceptButtonTextColor || '#ffffff'
                      }}
                    >
                      Accept All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Advanced Settings */}
        <AccordionItem
          value="advanced"
          className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg"
        >
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">Advanced Settings</h3>
                <p className="text-sm text-gray-400">
                  Custom code, maintenance mode, and debugging
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Preconnect Domains (one per line)</Label>
                <Textarea
                  value={settings.advanced.preconnectDomains.join('\n')}
                  onChange={(e) =>
                    updateArraySetting('advanced', 'preconnectDomains', e.target.value)
                  }
                  className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Custom CSS</Label>
                <Textarea
                  value={settings.advanced.customCSS}
                  onChange={(e) => updateSetting('advanced', 'customCSS', e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                  rows={6}
                  placeholder="/* Your custom CSS */"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Custom JavaScript</Label>
                <Textarea
                  value={settings.advanced.customJS}
                  onChange={(e) => updateSetting('advanced', 'customJS', e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                  rows={6}
                  placeholder="// Your custom JavaScript"
                />
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Maintenance Mode</Label>
                    <p className="text-xs text-gray-500">Show maintenance page to visitors</p>
                  </div>
                  <Switch
                    checked={settings.advanced.maintenanceMode}
                    onCheckedChange={(checked) =>
                      updateSetting('advanced', 'maintenanceMode', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Debug Mode</Label>
                    <p className="text-xs text-gray-500">Enable debug logging</p>
                  </div>
                  <Switch
                    checked={settings.advanced.debugMode}
                    onCheckedChange={(checked) => updateSetting('advanced', 'debugMode', checked)}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Site Features Section */}
        <AccordionItem value="site-features" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <div className="text-left">
                <div className="text-lg font-semibold text-white">Site Features & UI Elements</div>
                <div className="text-sm text-gray-400 font-normal">
                  Configure site-wide UI elements and visual features
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              <p className="text-sm text-gray-400">
                Control global UI elements that appear across your site. These are utility components that enhance user experience.
              </p>

              {/* Scroll Progress Bar */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Scroll Progress Indicator</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20">
                        <Activity className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Enable Scroll Progress Bar</p>
                        <p className="text-xs text-gray-400">Shows progress bar at top of page while scrolling</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings?.siteFeatures?.scrollProgress?.enabled ?? true}
                      onCheckedChange={(checked) => updateSetting('siteFeatures.scrollProgress.enabled', checked)}
                    />
                  </div>

                  {settings?.siteFeatures?.scrollProgress?.enabled !== false && (
                    <>
                      <div className="p-4 bg-gray-800/30 rounded-lg space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="scrollProgressColor" className="text-white">Bar Color</Label>
                          <Input
                            id="scrollProgressColor"
                            type="color"
                            value={settings?.siteFeatures?.scrollProgress?.color || '#a855f7'}
                            onChange={(e) => updateSetting('siteFeatures.scrollProgress.color', e.target.value)}
                            className="h-10 w-20"
                          />
                          <p className="text-xs text-gray-500">Color of the progress bar</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="scrollProgressHeight" className="text-white">Bar Height (px)</Label>
                          <Input
                            id="scrollProgressHeight"
                            type="number"
                            min="1"
                            max="10"
                            value={settings?.siteFeatures?.scrollProgress?.height || 3}
                            onChange={(e) => updateSetting('siteFeatures.scrollProgress.height', parseInt(e.target.value))}
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                          <p className="text-xs text-gray-500">Height in pixels (1-10)</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">Position at Bottom</p>
                            <p className="text-xs text-gray-400">Show progress bar at bottom instead of top</p>
                          </div>
                          <Switch
                            checked={settings?.siteFeatures?.scrollProgress?.bottom ?? false}
                            onCheckedChange={(checked) => updateSetting('siteFeatures.scrollProgress.bottom', checked)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 p-4">
                <p className="text-sm text-cyan-300">
                  💡 <strong>Tip:</strong> More site features will be added here as we build them (floating action button, back-to-top, etc.)
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Admin Topbar Configuration Section */}
        <AccordionItem value="admin-topbar" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <div className="text-left">
                <div className="text-lg font-semibold text-white">Admin Topbar Elements</div>
                <div className="text-sm text-gray-400 font-normal">
                  Configure which tools and features appear in the admin topbar
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              <p className="text-sm text-gray-400">
                Control which quick-access tools and features appear in the admin topbar. As you implement more features, you can toggle them on/off here.
              </p>

              {/* Quick Actions Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Quick Actions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Activity className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Notifications</p>
                        <p className="text-xs text-gray-400">Show notification bell with alerts</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings?.adminTopbar?.showNotifications ?? false}
                      onCheckedChange={(checked) => updateSetting('adminTopbar.showNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <RefreshCw className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Clear Cache</p>
                        <p className="text-xs text-gray-400">Quick cache clearing button</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings?.adminTopbar?.showClearCache ?? false}
                      onCheckedChange={(checked) => updateSetting('adminTopbar.showClearCache', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <FileText className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Ecommerce Orders</p>
                        <p className="text-xs text-gray-400">Quick view of pending orders</p>
                      </div>
                    </div>
                    <div className="px-2 py-1 text-xs bg-gray-700 rounded text-gray-400">Coming Soon</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <Search className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Quick Search</p>
                        <p className="text-xs text-gray-400">Global admin search (Cmd+K)</p>
                      </div>
                    </div>
                    <div className="px-2 py-1 text-xs bg-gray-700 rounded text-gray-400">Coming Soon</div>
                  </div>
                </div>
              </div>

              {/* Display Options */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Display Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Show Preview Toggle</p>
                      <p className="text-xs text-gray-400">Quick toggle between edit/preview modes</p>
                    </div>
                    <Switch
                      checked={settings?.adminTopbar?.showPreviewToggle ?? true}
                      onCheckedChange={(checked) => updateSetting('adminTopbar.showPreviewToggle', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Show Save Status</p>
                      <p className="text-xs text-gray-400">Display auto-save indicator</p>
                    </div>
                    <Switch
                      checked={settings?.adminTopbar?.showSaveStatus ?? true}
                      onCheckedChange={(checked) => updateSetting('adminTopbar.showSaveStatus', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4">
                <p className="text-sm text-amber-300">
                  💡 <strong>Note:</strong> More topbar elements will be added as we implement additional features throughout the page builder development.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Marketing & Analytics Section */}
        <AccordionItem value="marketing" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <div className="text-lg font-semibold text-white">Marketing & Analytics</div>
                <div className="text-sm text-gray-400 font-normal">
                  Google Tag Manager, Analytics, Pixels, and Custom Scripts
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <MarketingAnalyticsSection settings={settings} updateSetting={updateSetting} />
          </AccordionContent>
        </AccordionItem>
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
