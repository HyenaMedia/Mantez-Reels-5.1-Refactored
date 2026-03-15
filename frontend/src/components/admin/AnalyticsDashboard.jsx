import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Clock,
  Globe,
  BarChart3,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // 24h, 7d, 30d, 90d

  const fetchAnalytics = useCallback(async (signal) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/analytics-proxy/stats?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` },
        ...(signal && { signal }),
      });
      if (response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
      /* silent - analytics not configured */
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAnalytics(controller.signal);
    return () => controller.abort();
  }, [fetchAnalytics]);

  const timeRanges = [
    { label: 'Last 24h', value: '24h' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
  ];

  const Sparkline = ({ data, color }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const height = 30;

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg className="w-full" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  const StatCard = ({ icon: Icon, title, value, change, trend, color }) => {
    const isPositive = change > 0;
    return (
      <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(change)}%
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-xs mb-1">{title}</p>
          <p className="text-white text-2xl font-bold mb-2">{value}</p>
          {trend && (
            <div className="h-8">
              <Sparkline data={trend} color={color} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h2>
          <p className="text-gray-400 text-sm">Track your site performance</p>
        </div>
        <div className="rounded-3xl p-12 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 text-center">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Connect PostHog Analytics in Integrations &gt; Analytics to start tracking visitor data, page views, and more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h2>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Calendar size={14} />
            Data from PostHog Analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                size="sm"
                variant={timeRange === range.value ? 'default' : 'outline'}
                onClick={() => setTimeRange(range.value)}
                className={
                  timeRange === range.value
                    ? 'bg-violet-600 hover:bg-violet-500'
                    : 'border-white/10 hover:bg-white/5'
                }
              >
                {range.label}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAnalytics}
            className="border-white/10 hover:bg-white/5"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          title="Page Views"
          value={(analytics?.pageViews?.total ?? 0).toLocaleString()}
          change={analytics?.pageViews?.change ?? 0}
          trend={analytics?.pageViews?.trend}
          color="#3b82f6"
        />
        <StatCard
          icon={Users}
          title="Unique Visitors"
          value={(analytics?.uniqueVisitors?.total ?? 0).toLocaleString()}
          change={analytics?.uniqueVisitors?.change ?? 0}
          trend={analytics?.uniqueVisitors?.trend}
          color="#10b981"
        />
        <StatCard
          icon={Clock}
          title="Avg. Session"
          value={analytics?.avgSessionDuration?.total ?? 0}
          change={analytics?.avgSessionDuration?.change ?? 0}
          color="#8b5cf6"
        />
        <StatCard
          icon={MousePointer}
          title="Bounce Rate"
          value={analytics?.bounceRate?.total ?? 0}
          change={analytics?.bounceRate?.change ?? 0}
          color="#f59e0b"
        />
      </div>

      {/* Top Pages & Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 size={20} className="text-blue-400" />
              Top Pages
            </CardTitle>
            <CardDescription>Most visited pages on your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analytics?.topPages || []).map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{page.path}</p>
                    <p className="text-gray-500 text-xs">{page.views.toLocaleString()} views</p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${page.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {page.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(page.change)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Referrers */}
        <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe size={20} className="text-green-400" />
              Traffic Sources
            </CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analytics?.topReferrers || []).map((referrer, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{referrer.source}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                          style={{ width: `${referrer.percentage}%` }}
                        />
                      </div>
                      <span className="text-gray-500 text-xs">{referrer.percentage}%</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm ml-4">{referrer.visits.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices, Browsers & Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Distribution */}
        <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics?.devices || {}).map(([device, percentage]) => (
                <div key={device} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 capitalize">{device}</span>
                    <span className="text-white font-semibold">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Browser Distribution */}
        <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics?.browsers || {}).map(([browser, percentage]) => (
                <div key={browser} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{browser}</span>
                    <span className="text-white font-semibold">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(analytics?.countries || []).map((country, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{country.flag}</span>
                    <span className="text-gray-300 text-sm">{country.country}</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{country.visitors}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Events */}
      <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp size={20} className="text-purple-400" />
            Custom Events
          </CardTitle>
          <CardDescription>Track user interactions and conversions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(analytics?.events || []).map((event, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all"
              >
                <p className="text-gray-400 text-xs mb-1">{event.name}</p>
                <p className="text-white text-xl font-bold">{event.count}</p>
                <div className={`flex items-center gap-1 text-xs mt-1 ${event.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {event.change > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(event.change)}% from last period
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <BarChart3 size={20} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">About PostHog Analytics</h4>
              <p className="text-gray-400 text-sm">
                PostHog tracks user behavior, page views, and custom events on your portfolio website.
                All data is anonymized and respects user privacy. Visitors can opt-out via the cookie banner.
                This dashboard shows aggregated insights to help you understand your audience better.
              </p>
              <div className="mt-3 flex gap-3">
                <a
                  href="https://posthog.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                >
                  Learn more about PostHog
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
