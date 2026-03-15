import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Trash2, Zap, AlertTriangle, Users, TrendingUp, Activity } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function AdminDashboardHeader() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    errorCount: 0,
    totalViews: 0,
    cacheStatus: 'active',
    serverStatus: 'healthy',
    lastUpdated: null,
  });
  const [flushing, setFlushing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchMetricsWithSignal = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BACKEND_URL}/api/dashboard/insights`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (response.data.success) {
          const insights = response.data.insights;
          setMetrics({
            loadTime: insights.avg_load_time.value_ms,
            errorCount: insights.errors_24h.count,
            totalViews: insights.total_views.count,
            cacheStatus: insights.cache_status.status,
            serverStatus: insights.server_status.status,
            cpuPercent: insights.server_status.cpu_percent,
            memoryPercent: insights.server_status.memory_percent,
            uptimeHours: insights.server_status.uptime_hours,
            apiCalls: insights.total_views.api_calls,
            lastUpdated: new Date(),
          });
        }
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to fetch dashboard metrics:', error);
        setMetrics((prev) => ({
          ...prev,
          serverStatus: 'error',
          errorCount: prev.errorCount + 1,
        }));
      }
    };
    fetchMetricsWithSignal();
    const interval = setInterval(fetchMetricsWithSignal, 30000);
    return () => { controller.abort(); clearInterval(interval); };
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/dashboard/insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const insights = response.data.insights;
        setMetrics({
          loadTime: insights.avg_load_time.value_ms,
          errorCount: insights.errors_24h.count,
          totalViews: insights.total_views.count,
          cacheStatus: insights.cache_status.status,
          serverStatus: insights.server_status.status,
          cpuPercent: insights.server_status.cpu_percent,
          memoryPercent: insights.server_status.memory_percent,
          uptimeHours: insights.server_status.uptime_hours,
          apiCalls: insights.total_views.api_calls,
          lastUpdated: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      setMetrics((prev) => ({
        ...prev,
        serverStatus: 'error',
        errorCount: prev.errorCount + 1,
      }));
    }
  };

  const handleFlushCache = async () => {
    setFlushing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BACKEND_URL}/api/settings/flush-cache`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: 'Success',
        description: 'Cache flushed successfully',
      });
      setTimeout(fetchMetrics, 1000);
    } catch (error) {
      console.error('Failed to flush cache:', error);
      toast({
        title: 'Error',
        description: 'Failed to flush cache',
        variant: 'destructive',
      });
    } finally {
      setFlushing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getLoadTimeColor = (time) => {
    if (time < 200) return 'text-green-500';
    if (time < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  const MetricModal = () => {
    if (!selectedMetric) return null;

    const modalContent = {
      server: {
        title: 'Server Status',
        description: 'Current server health and uptime',
        details: [
          {
            label: 'Status',
            value:
              metrics.serverStatus === 'healthy'
                ? 'All systems operational'
                : metrics.serverStatus === 'warning'
                  ? 'Warning'
                  : 'Critical',
          },
          { label: 'CPU Usage', value: `${metrics.cpuPercent || 0}%` },
          { label: 'Memory Usage', value: `${metrics.memoryPercent || 0}%` },
          { label: 'Uptime', value: `${metrics.uptimeHours || 0} hours` },
          { label: 'Response Time', value: `${metrics.loadTime}ms` },
        ],
      },
      loadTime: {
        title: 'Load Time Analysis',
        description: 'Average API response performance',
        details: [
          { label: 'Average Load Time', value: `${metrics.loadTime}ms` },
          { label: 'Target', value: '< 100ms' },
          {
            label: 'Performance',
            value:
              metrics.loadTime < 100
                ? 'Excellent'
                : metrics.loadTime < 500
                  ? 'Good'
                  : 'Needs Improvement',
          },
          {
            label: 'Status',
            value: metrics.loadTime < 100 ? 'Fast' : metrics.loadTime < 500 ? 'Moderate' : 'Slow',
          },
          {
            label: 'Recommendation',
            value:
              metrics.loadTime < 100 ? 'Optimal performance!' : 'Consider caching optimization',
          },
        ],
      },
      errors: {
        title: 'Error Log (24h)',
        description: 'Recent errors and issues',
        details: [
          { label: 'Total Errors (24h)', value: metrics.errorCount },
          {
            label: 'Status',
            value:
              metrics.errorCount === 0
                ? 'No errors detected'
                : metrics.errorCount < 10
                  ? 'Minor issues'
                  : 'Critical issues',
          },
          {
            label: 'Error Rate',
            value:
              metrics.errorCount === 0
                ? '0%'
                : `${((metrics.errorCount / (metrics.apiCalls || 1)) * 100).toFixed(2)}%`,
          },
          {
            label: 'Health',
            value:
              metrics.errorCount === 0 ? 'Excellent' : metrics.errorCount < 10 ? 'Good' : 'Poor',
          },
        ],
      },
      cache: {
        title: 'Cache Status',
        description: 'Caching system information',
        details: [
          {
            label: 'Status',
            value: metrics.cacheStatus === 'active' ? 'Active & Working' : 'Inactive',
          },
          { label: 'GZip Compression', value: 'Enabled (Level 6)' },
          { label: 'Browser Caching', value: 'Configured (1 year)' },
          { label: 'Cache Type', value: 'Browser + Server' },
          { label: 'Performance', value: 'Optimal' },
        ],
      },
      views: {
        title: 'Site Analytics',
        description: 'Visitor and interaction statistics',
        details: [
          { label: 'Total Page Views', value: metrics.totalViews },
          { label: 'Total API Calls', value: metrics.apiCalls || 0 },
          { label: 'Tracking Since', value: 'Session Start' },
          { label: 'Status', value: 'Real-time tracking active' },
        ],
      },
    };

    const content = modalContent[selectedMetric];

    return (
      <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
        <DialogContent className="bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl">{content.title}</DialogTitle>
            <DialogDescription className="text-gray-400">{content.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {content.details.map((detail, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg"
              >
                <span className="text-gray-400 text-sm">{detail.label}</span>
                <span className="text-white font-semibold">{detail.value}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 py-3 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Row - Compact */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-4">
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <span className="text-xs text-gray-500">
                Updated{' '}
                {metrics.lastUpdated ? new Date(metrics.lastUpdated).toLocaleTimeString() : '...'}
              </span>
            </div>
            <Button
              onClick={handleFlushCache}
              disabled={flushing}
              size="sm"
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Trash2 className="w-3 h-3" />
              {flushing ? 'Flushing...' : 'Flush Cache'}
            </Button>
          </div>

          {/* Metrics Cards - Compact */}
          <div className="grid grid-cols-5 gap-3">
            <Card
              className="bg-gray-800/50 border-gray-700 p-3 cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => setSelectedMetric('server')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Server</p>
                  <p className={`text-lg font-bold mt-0.5 ${getStatusColor(metrics.serverStatus)}`}>
                    {metrics.serverStatus === 'healthy' ? '✓' : '⚠'}
                  </p>
                </div>
                <Activity className={`w-6 h-6 ${getStatusColor(metrics.serverStatus)}`} />
              </div>
            </Card>

            <Card
              className="bg-gray-800/50 border-gray-700 p-3 cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => setSelectedMetric('loadTime')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Load Time</p>
                  <p className={`text-lg font-bold mt-0.5 ${getLoadTimeColor(metrics.loadTime)}`}>
                    {metrics.loadTime}ms
                  </p>
                </div>
                <Zap className={`w-6 h-6 ${getLoadTimeColor(metrics.loadTime)}`} />
              </div>
            </Card>

            <Card
              className="bg-gray-800/50 border-gray-700 p-3 cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => setSelectedMetric('errors')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Errors</p>
                  <p
                    className={`text-lg font-bold mt-0.5 ${metrics.errorCount > 0 ? 'text-red-500' : 'text-green-500'}`}
                  >
                    {metrics.errorCount}
                  </p>
                </div>
                <AlertTriangle
                  className={`w-6 h-6 ${metrics.errorCount > 0 ? 'text-red-500' : 'text-gray-600'}`}
                />
              </div>
            </Card>

            <Card
              className="bg-gray-800/50 border-gray-700 p-3 cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => setSelectedMetric('cache')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Cache</p>
                  <p className="text-lg font-bold text-blue-500 mt-0.5">Active</p>
                </div>
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </Card>

            <Card
              className="bg-gray-800/50 border-gray-700 p-3 cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => setSelectedMetric('views')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Views</p>
                  <p className="text-lg font-bold text-purple-500 mt-0.5">
                    {metrics.totalViews || 0}
                  </p>
                </div>
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      <MetricModal />
    </>
  );
}
