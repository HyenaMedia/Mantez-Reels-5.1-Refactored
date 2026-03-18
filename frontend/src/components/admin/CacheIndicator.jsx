import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Gauge, Trash2, Database, RotateCcw } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const CacheIndicator = () => {
  const [data, setData] = useState(null);
  const [flushing, setFlushing] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${BACKEND_URL}/api/dashboard/cache-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setData(res.data.cache);
    } catch {
      // silent — topbar widget should never disrupt the UI
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 30000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  const handleFlush = async () => {
    setFlushing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BACKEND_URL}/api/settings/flush-cache`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTimeout(fetchStatus, 500);
    } catch {
      // silent
    } finally {
      setFlushing(false);
    }
  };

  if (!data) return null;

  const pct = Math.round(data.hit_rate * 100);
  const color =
    data.status === 'cold'
      ? 'text-gray-500'
      : pct >= 70
        ? 'text-green-400'
        : pct >= 40
          ? 'text-yellow-400'
          : 'text-red-400';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-gray-300 hover:bg-gray-800 transition-colors"
          title="Cache Performance"
        >
          <Gauge className={`w-3.5 h-3.5 ${color}`} />
          <span className={`font-semibold tabular-nums ${color}`}>{pct}%</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 tabular-nums">{data.entries}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-64 bg-gray-800 border-gray-700 text-gray-300 p-0 z-[10000]"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">API Cache</span>
          </div>
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
              data.status === 'active'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-gray-600/30 text-gray-400'
            }`}
          >
            {data.status}
          </span>
        </div>

        {/* Metrics */}
        <div className="px-3 py-2 space-y-1.5 text-xs">
          <Row label="Hit Rate" value={`${pct}%`} valueClass={color} />
          <Row label="Entries" value={data.entries} />
          <Row label="Size" value={`${data.size_mb} MB`} />
          <Row
            label="Hits / Misses"
            value={
              <span>
                <span className="text-green-400">{data.hits}</span>
                {' / '}
                <span className="text-red-400">{data.misses}</span>
              </span>
            }
          />
        </div>

        {/* Flush button */}
        <div className="px-3 py-2 border-t border-gray-700">
          <button
            onClick={handleFlush}
            disabled={flushing}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
          >
            {flushing ? (
              <RotateCcw className="w-3 h-3 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
            {flushing ? 'Flushing...' : 'Flush Cache'}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Row = ({ label, value, valueClass = 'text-white' }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-400">{label}</span>
    <span className={`font-medium ${valueClass}`}>{value}</span>
  </div>
);

export default CacheIndicator;
