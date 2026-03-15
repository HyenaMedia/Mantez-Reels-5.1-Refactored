import React, { useState, useEffect } from 'react';
import {
  Activity,
  User,
  FileText,
  Image,
  Trash2,
  Edit,
  Plus,
  Eye,
  EyeOff,
  Filter,
  Calendar,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ListSkeleton } from '../ui/skeleton';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const ActivityLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    actionType: 'all',
    resourceType: 'all',
    days: 30,
    limit: 50,
  });
  const { toast } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    const loadLogsAndStats = async () => {
      setLoading(true);
      try {
        const params = {
          limit: filters.limit,
          days: filters.days,
        };
        if (filters.actionType !== 'all') params.action_type = filters.actionType;
        if (filters.resourceType !== 'all') params.resource_type = filters.resourceType;

        const response = await axios.get(`${API_URL}/api/activity/logs`, { params, signal: controller.signal });
        setLogs(response.data.logs || []);
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        toast({
          title: 'Error',
          description: 'Failed to load activity logs',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }

      try {
        const response = await axios.get(`${API_URL}/api/activity/stats`, {
          params: { days: filters.days },
          signal: controller.signal,
        });
        setStats(response.data);
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to load activity stats:', error);
      }
    };
    loadLogsAndStats();
    return () => controller.abort();
  }, [filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {
        limit: filters.limit,
        days: filters.days,
      };
      if (filters.actionType !== 'all') params.action_type = filters.actionType;
      if (filters.resourceType !== 'all') params.resource_type = filters.resourceType;

      const response = await axios.get(`${API_URL}/api/activity/logs`, { params });
      setLogs(response.data.logs || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load activity logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource Name', 'IP Address'],
      ...logs.map((log) => [
        log.timestamp,
        log.user_email,
        log.action_type,
        log.resource_type,
        log.resource_name || '',
        log.ip_address || '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${Date.now()}.csv`;
    a.click();
  };

  const getActionIcon = (actionType) => {
    const icons = {
      create: Plus,
      update: Edit,
      delete: Trash2,
      publish: Eye,
      unpublish: EyeOff,
    };
    return icons[actionType] || Activity;
  };

  const getActionColor = (actionType) => {
    const colors = {
      create: 'text-green-400',
      update: 'text-blue-400',
      delete: 'text-red-400',
      publish: 'text-purple-400',
      unpublish: 'text-gray-400',
    };
    return colors[actionType] || 'text-white';
  };

  const getResourceIcon = (resourceType) => {
    const icons = {
      portfolio: FileText,
      media: Image,
      user: User,
      settings: Activity,
    };
    return icons[resourceType] || FileText;
  };

  const formatTimestamp = (timestamp) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Activity Log</h2>
          <p className="text-gray-400 text-sm">Track all admin actions and changes</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportLogs}
            variant="outline"
            className="border-white/10 hover:bg-white/5"
            disabled={logs.length === 0}
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={loadLogs}
            variant="outline"
            className="border-white/10 hover:bg-white/5"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.total_activities}</p>
              <p className="text-xs text-gray-500 mt-1">Last {stats.period_days} days</p>
            </CardContent>
          </Card>

          {stats.by_type.slice(0, 3).map((item, index) => (
            <Card key={index} className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 capitalize">
                  {item._id} Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{item.count}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((item.count / stats.total_activities) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter size={20} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Action Type</label>
              <Select
                value={filters.actionType}
                onValueChange={(value) => setFilters({ ...filters, actionType: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="publish">Publish</SelectItem>
                  <SelectItem value="unpublish">Unpublish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Resource Type</label>
              <Select
                value={filters.resourceType}
                onValueChange={(value) => setFilters({ ...filters, resourceType: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Time Period</label>
              <Select
                value={filters.days.toString()}
                onValueChange={(value) => setFilters({ ...filters, days: parseInt(value) })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Results Limit</label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) => setFilters({ ...filters, limit: parseInt(value) })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  <SelectItem value="25">25 results</SelectItem>
                  <SelectItem value="50">50 results</SelectItem>
                  <SelectItem value="100">100 results</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Activity History</CardTitle>
          <CardDescription>
            {logs.length} activities found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ListSkeleton items={5} />
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No activities found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => {
                const ActionIcon = getActionIcon(log.action_type);
                const ResourceIcon = getResourceIcon(log.resource_type);
                const actionColor = getActionColor(log.action_type);

                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/5"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <ActionIcon size={20} className={actionColor} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs border-white/20">
                          {log.action_type}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-white/20">
                          <ResourceIcon size={12} className="mr-1" />
                          {log.resource_type}
                        </Badge>
                      </div>
                      <p className="text-white text-sm">
                        <span className="font-medium">{log.user_email}</span>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-gray-300">
                          {log.action_type} {log.resource_type}
                          {log.resource_name && (
                            <>
                              {' '}
                              <span className="font-medium">"{ log.resource_name}"</span>
                            </>
                          )}
                        </span>
                      </p>
                      <p className="text-gray-500 text-xs mt-1 flex items-center gap-2">
                        <Calendar size={12} />
                        {formatTimestamp(log.timestamp)}
                        {log.ip_address && (
                          <>
                            <span>•</span>
                            <span>IP: {log.ip_address}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogViewer;
