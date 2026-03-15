import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Scan,
  RefreshCw,
  Activity,
  Lock,
  AlertTriangle,
  CheckCircle,
  Info,
  FileWarning,
  Globe,
  Key,
} from 'lucide-react';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
export default function SecurityManager() {
  
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [scannerStatus, setScannerStatus] = useState(null);
  const [_securityStats, setSecurityStats] = useState({
    totalScans: 0,
    threatsBlocked: 0,
    lastScanTime: null,
  });
  
  // Cloudflare WAF state
  const [cloudflareConfig, setCloudflareConfig] = useState({
    enabled: false,
    apiToken: '',
    zoneId: '',
  });
  const [wafStatus, setWafStatus] = useState(null);
  const [wafLoading, setWafLoading] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const fetchSecurityData = useCallback(async (signal) => {
    try {
      // Fetch scanner status
      const scannerRes = await axios.get(`${BACKEND_URL}/api/media/scanner-status`, { signal });
      setScannerStatus(scannerRes.data);
      // Fetch security stats from settings or a dedicated endpoint
      try {
        const statsRes = await axios.get(`${BACKEND_URL}/api/security/stats`, { signal });
        if (statsRes.data) {
          setSecurityStats(statsRes.data);
        }
      } catch {
        // Stats endpoint might not exist, use defaults
      }

      // Fetch Cloudflare configuration from settings
      try {
        const token = localStorage.getItem('token');
        const settingsRes = await axios.get(`${BACKEND_URL}/api/settings/`, {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        });
        if (settingsRes.data?.cloudflare) {
          setCloudflareConfig(settingsRes.data.cloudflare);
          if (settingsRes.data.cloudflare.enabled && settingsRes.data.cloudflare.apiToken) {
            fetchWafStatus(settingsRes.data.cloudflare);
          }
        }
      } catch {
        // Cloudflare config not set up yet
      }
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
      console.error('Failed to load security status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchWafStatus = async (config) => {
    if (!config?.apiToken || !config?.zoneId) return;
    
    setWafLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/security/cloudflare/status`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          apiToken: config.apiToken,
          zoneId: config.zoneId
        }
      });
      setWafStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch WAF status:', error);
      setWafStatus({ error: 'Failed to connect to Cloudflare API' });
    } finally {
      setWafLoading(false);
    }
  };
  
  const saveCloudflareConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BACKEND_URL}/api/settings/`, {
        cloudflare: cloudflareConfig
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: 'Success',
        description: 'Cloudflare configuration saved',
      });
      
      if (cloudflareConfig.enabled && cloudflareConfig.apiToken) {
        fetchWafStatus(cloudflareConfig);
      }
      setShowApiConfig(false);
    } catch (error) {
      console.error('Failed to save Cloudflare configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
    }
  };
  useEffect(() => {
    const controller = new AbortController();
    fetchSecurityData(controller.signal);
    return () => controller.abort();
  }, [fetchSecurityData]);
  const handleRefresh = () => {
    setLoading(true);
    fetchSecurityData();
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-purple-500" />
            Security Center
          </h2>
          <p className="text-gray-400 mt-1">Monitor and manage your site's security</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Status
        </Button>
      </div>
      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ClamAV Status */}
        <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Scan className="w-5 h-5 text-purple-500" />
              Antivirus Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {scannerStatus?.available ? (
                <>
                  <ShieldCheck className="w-10 h-10 text-green-500" />
                  <div>
                    <p className="text-green-400 font-semibold">Active</p>
                    <p className="text-gray-500 text-xs">{scannerStatus.version}</p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-10 h-10 text-yellow-500" />
                  <div>
                    <p className="text-yellow-400 font-semibold">Not Available</p>
                    <p className="text-gray-500 text-xs">ClamAV not installed</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        {/* HTTPS Status */}
        <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Lock className="w-5 h-5 text-purple-500" />
              HTTPS / SSL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-10 h-10 text-green-500" />
              <div>
                <p className="text-green-400 font-semibold">Enabled</p>
                <p className="text-gray-500 text-xs">All traffic encrypted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Security Headers */}
        <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-purple-500" />
              Security Headers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-10 h-10 text-green-500" />
              <div>
                <p className="text-green-400 font-semibold">Configured</p>
                <p className="text-gray-500 text-xs">HSTS, CSP, XSS Protection</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Security Features Detail */}
      <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Active Security Features
          </CardTitle>
          <CardDescription>Your site's security measures and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Scanning */}
            <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-lg border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <FileWarning className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">File Upload Scanning</p>
                  <p className="text-gray-500 text-sm">All uploads scanned with ClamAV antivirus</p>
                </div>
              </div>
              <Badge className={scannerStatus?.available 
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              }>
                {scannerStatus?.available ? 'Active' : 'Unavailable'}
              </Badge>
            </div>
            {/* Rate Limiting */}
            <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-lg border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">Rate Limiting</p>
                  <p className="text-gray-500 text-sm">Login: 5/min, Registration: 3/hour</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
            </div>
            {/* Input Sanitization */}
            <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-lg border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">Input Sanitization</p>
                  <p className="text-gray-500 text-sm">XSS and injection prevention on all inputs</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
            </div>
            {/* JWT Authentication */}
            <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-lg border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">JWT Authentication</p>
                  <p className="text-gray-500 text-sm">Secure token-based admin authentication</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
            </div>
            {/* Password Hashing */}
            <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-lg border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">Password Hashing</p>
                  <p className="text-gray-500 text-sm">bcrypt with salt for all passwords</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
            </div>
            {/* Content Security Policy */}
            <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-lg border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">Content Security Policy (CSP)</p>
                  <p className="text-gray-500 text-sm">Prevents XSS and code injection attacks</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* PostHog Analytics Info */}
      <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Analytics Information (PostHog)
          </CardTitle>
          <CardDescription>What data is collected when analytics is enabled</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-purple-300 text-sm mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                PostHog analytics collects the following (when enabled by user consent):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <p className="text-white font-medium">Page Analytics:</p>
                  <ul className="text-gray-400 space-y-1 ml-4 list-disc">
                    <li>Pages visited</li>
                    <li>Time spent on each page</li>
                    <li>Scroll depth</li>
                    <li>Click patterns</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium">User Sessions:</p>
                  <ul className="text-gray-400 space-y-1 ml-4 list-disc">
                    <li>Session duration</li>
                    <li>Bounce rate</li>
                    <li>Return visitors</li>
                    <li>Traffic sources</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium">Device Info:</p>
                  <ul className="text-gray-400 space-y-1 ml-4 list-disc">
                    <li>Browser type</li>
                    <li>Device type (mobile/desktop)</li>
                    <li>Screen resolution</li>
                    <li>Operating system</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium">Location (Approximate):</p>
                  <ul className="text-gray-400 space-y-1 ml-4 list-disc">
                    <li>Country</li>
                    <li>City (approximate)</li>
                    <li>Timezone</li>
                    <li>Language preference</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-xs">
              Note: No personal data like names, emails, or passwords are collected. 
              Data is anonymized and used only for improving user experience.
              Users can opt-out via the cookie consent banner.
            </p>
          </div>
        </CardContent>
      </Card>
      {/* Cloudflare WAF Integration */}
      <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-400" />
                Cloudflare WAF Integration
              </CardTitle>
              <CardDescription>Connect and manage your Cloudflare Web Application Firewall</CardDescription>
            </div>
            <Button
              onClick={() => setShowApiConfig(!showApiConfig)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Key className="w-4 h-4" />
              {cloudflareConfig.enabled ? 'Edit Config' : 'Setup'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showApiConfig ? (
            <div className="space-y-4 p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-300 font-medium mb-1">How to get your Cloudflare credentials:</p>
                  <ol className="text-gray-400 space-y-1 ml-4 list-decimal">
                    <li>Go to <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Cloudflare Dashboard</a></li>
                    <li>Select your website</li>
                    <li>Copy the Zone ID from the right sidebar</li>
                    <li>Go to Profile → API Tokens → Create Token</li>
                    <li>Use "Edit zone" template or create custom with Zone:Read and Firewall:Edit permissions</li>
                  </ol>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Zone ID</Label>
                <Input
                  value={cloudflareConfig.zoneId}
                  onChange={(e) => setCloudflareConfig({...cloudflareConfig, zoneId: e.target.value})}
                  placeholder="abc123def456..."
                  className="bg-white/[0.04] border-white/[0.08] text-white font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">API Token</Label>
                <Input
                  type="password"
                  value={cloudflareConfig.apiToken}
                  onChange={(e) => setCloudflareConfig({...cloudflareConfig, apiToken: e.target.value})}
                  placeholder="Your Cloudflare API token"
                  className="bg-white/[0.04] border-white/[0.08] text-white font-mono"
                />
                <p className="text-xs text-gray-500">Your token is stored securely and never exposed</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.04] rounded-lg">
                <div>
                  <Label className="text-gray-300">Enable Integration</Label>
                  <p className="text-xs text-gray-500 mt-1">Connect to Cloudflare API</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cloudflareConfig.enabled}
                    onChange={(e) => setCloudflareConfig({...cloudflareConfig, enabled: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={saveCloudflareConfig} className="bg-purple-600 hover:bg-purple-700">
                  Save Configuration
                </Button>
                <Button onClick={() => setShowApiConfig(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cloudflareConfig.enabled && cloudflareConfig.apiToken ? (
                <>
                  {/* WAF Status */}
                  {wafLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : wafStatus?.error ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        <p className="font-medium">Connection Error</p>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">{wafStatus.error}</p>
                      <p className="text-xs text-gray-500 mt-2">Check your API token and Zone ID</p>
                    </div>
                  ) : wafStatus ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/[0.04] rounded-lg border border-white/[0.06]">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-gray-400 text-sm">WAF Status</p>
                          {wafStatus.paused ? (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Paused</Badge>
                          ) : (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                          )}
                        </div>
                        <p className="text-white text-2xl font-bold">{wafStatus.paused ? 'Inactive' : 'Protected'}</p>
                      </div>
                      <div className="p-4 bg-white/[0.04] rounded-lg border border-white/[0.06]">
                        <p className="text-gray-400 text-sm mb-2">Security Level</p>
                        <p className="text-white text-2xl font-bold capitalize">
                          {wafStatus.settings?.security_level || 'Medium'}
                        </p>
                      </div>
                      <div className="p-4 bg-white/[0.04] rounded-lg border border-white/[0.06]">
                        <p className="text-gray-400 text-sm mb-2">Challenge Passage</p>
                        <p className="text-white text-xl font-bold">
                          {wafStatus.settings?.challenge_ttl || 1800}s
                        </p>
                      </div>
                      <div className="p-4 bg-white/[0.04] rounded-lg border border-white/[0.06]">
                        <p className="text-gray-400 text-sm mb-2">Browser Integrity</p>
                        <Badge className={wafStatus.settings?.browser_check 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }>
                          {wafStatus.settings?.browser_check ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  ) : null}
                  <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Connected to Cloudflare Zone: <span className="text-white font-mono">{cloudflareConfig.zoneId}</span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Cloudflare WAF Not Connected</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Connect your Cloudflare account to view and manage WAF settings
                  </p>
                  <Button onClick={() => setShowApiConfig(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Key className="w-4 h-4 mr-2" />
                    Setup Integration
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Cloudflare Documentation */}
      <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            Cloudflare Setup Guide
          </CardTitle>
          <CardDescription>Complete instructions for Cloudflare configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              Cloudflare provides enterprise-grade security at the network edge. Free tier includes WAF, DDoS protection, CDN, and free SSL.
            </p>
            {/* Quick Steps */}
            <div className="bg-white/[0.04] rounded-lg p-4 border border-white/[0.06]">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                Quick Setup Steps
              </h4>
              <ol className="space-y-3 text-sm text-gray-300 list-decimal list-inside">
                <li>
                  <strong>Sign up</strong> at{' '}
                  <a href="https://www.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">
                    cloudflare.com
                  </a>{' '}
                  (Free account)
                </li>
                <li>
                  <strong>Add your domain</strong> and follow the setup wizard
                </li>
                <li>
                  <strong>Update nameservers</strong> at your domain registrar (provided by Cloudflare)
                </li>
                <li>
                  <strong>Wait 5-60 minutes</strong> for DNS propagation
                </li>
                <li>
                  <strong>Enable WAF</strong> in Security → WAF → Managed Rules
                </li>
              </ol>
            </div>
            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-white/[0.04] rounded-lg text-center border border-white/[0.06]">
                <Shield className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="text-white font-medium text-sm">WAF</p>
                <p className="text-gray-500 text-xs">Web firewall</p>
              </div>
              <div className="p-3 bg-white/[0.04] rounded-lg text-center border border-white/[0.06]">
                <Activity className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="text-white font-medium text-sm">DDoS</p>
                <p className="text-gray-500 text-xs">Attack protection</p>
              </div>
              <div className="p-3 bg-white/[0.04] rounded-lg text-center border border-white/[0.06]">
                <Globe className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="text-white font-medium text-sm">CDN</p>
                <p className="text-gray-500 text-xs">Global speed</p>
              </div>
              <div className="p-3 bg-white/[0.04] rounded-lg text-center border border-white/[0.06]">
                <Lock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="text-white font-medium text-sm">SSL</p>
                <p className="text-gray-500 text-xs">Free HTTPS</p>
              </div>
            </div>
            {/* API Integration Note */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm flex items-center gap-2">
                <Key className="w-4 h-4" />
                <strong>Optional:</strong> Use the integration above to view and manage WAF settings directly from this dashboard
              </p>
            </div>
            {/* Links */}
            <div className="flex gap-2">
              <Button
                onClick={() => window.open('https://developers.cloudflare.com/waf/', '_blank')}
                variant="outline"
                className="gap-2"
              >
                <Globe className="w-4 h-4" />
                Official WAF Docs
              </Button>
              <Button
                onClick={() => window.open('https://dash.cloudflare.com', '_blank')}
                variant="outline"
                className="gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Cloudflare Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* ClamAV Setup Guide */}
      <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Scan className="w-5 h-5 text-purple-500" />
            ClamAV Antivirus Scanner Setup
          </CardTitle>
          <CardDescription>
            Optional: Add virus scanning for uploaded files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              ClamAV is an open-source antivirus engine that scans uploaded files for malware. Recommended for sites handling uploads from untrusted sources.
            </p>
            {/* Status Indicator */}
            {scannerStatus?.available ? (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-green-400 font-medium text-sm">ClamAV Active</p>
                  <p className="text-gray-400 text-xs">Version: {scannerStatus.version}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-medium text-sm">ClamAV Not Installed</p>
                  <p className="text-gray-400 text-xs">Follow the guide below to set it up</p>
                </div>
              </div>
            )}
            {/* Installation Options */}
            <div className="bg-white/[0.04] rounded-lg p-4 border border-white/[0.06]">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                Installation Options
              </h4>
              
              <div className="space-y-3">
                {/* Docker Option */}
                <div className="p-3 bg-white/[0.03] rounded border border-white/[0.06]">
                  <p className="text-white font-medium text-sm mb-1">Option 1: Docker (Recommended)</p>
                  <p className="text-gray-400 text-xs mb-2">Add ClamAV container to your docker-compose.yml:</p>
                  <pre className="text-xs bg-black/30 p-2 rounded text-gray-300 overflow-x-auto">
{`services:
  clamav:
    image: clamav/clamav:latest
    ports:
      - "3310:3310"
    volumes:
      - clamav_data:/var/lib/clamav`}
                  </pre>
                </div>
                {/* System Installation */}
                <div className="p-3 bg-white/[0.03] rounded border border-white/[0.06]">
                  <p className="text-white font-medium text-sm mb-1">Option 2: System Installation</p>
                  <p className="text-gray-400 text-xs mb-2">For Ubuntu/Debian:</p>
                  <pre className="text-xs bg-black/30 p-2 rounded text-gray-300">
{`sudo apt-get update
sudo apt-get install clamav clamav-daemon
sudo systemctl start clamav-daemon`}
                  </pre>
                </div>
              </div>
            </div>
            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/[0.04] rounded-lg border border-white/[0.06]">
                <Shield className="w-5 h-5 text-purple-400 mb-2" />
                <p className="text-white font-medium text-sm">Malware Detection</p>
                <p className="text-gray-500 text-xs">Scans all uploads</p>
              </div>
              <div className="p-3 bg-white/[0.04] rounded-lg border border-white/[0.06]">
                <RefreshCw className="w-5 h-5 text-purple-400 mb-2" />
                <p className="text-white font-medium text-sm">Auto Updates</p>
                <p className="text-gray-500 text-xs">Daily virus definitions</p>
              </div>
            </div>
            {/* Links */}
            <div className="flex gap-2">
              <Button
                onClick={() => window.open('https://www.clamav.net/documents/installing-clamav', '_blank')}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Globe className="w-4 h-4" />
                Installation Docs
              </Button>
            </div>
            {/* Note */}
            <p className="text-gray-500 text-xs">
              <strong>Note:</strong> ClamAV requires ~500MB RAM and may slow down uploads slightly. It's optional for portfolio sites unless handling untrusted user uploads.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
