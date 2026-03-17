import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Timer } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';

/**
 * Measures real page load / navigation time using the Performance API.
 * Sits in the admin topbar and shows a live ms reading per route change.
 * Click to see a log of the last N navigations.
 */
const PageSpeedIndicator = () => {
  const location = useLocation();
  const [currentMs, setCurrentMs] = useState(null);
  const [history, setHistory] = useState([]);
  const navStart = useRef(performance.now());

  /* On every route change, record how long the render took */
  useEffect(() => {
    navStart.current = performance.now();

    // Use requestAnimationFrame to measure after React paints
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const elapsed = Math.round(performance.now() - navStart.current);
        setCurrentMs(elapsed);
        setHistory(prev => {
          const entry = {
            path: location.pathname + location.search,
            ms: elapsed,
            time: new Date().toLocaleTimeString(),
          };
          return [entry, ...prev].slice(0, 20); // keep last 20
        });
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [location.pathname, location.search]);

  /* Also capture initial page load from Navigation Timing API */
  useEffect(() => {
    const entry = performance.getEntriesByType('navigation')[0];
    if (entry) {
      const loadMs = Math.round(entry.loadEventEnd || entry.domContentLoadedEventEnd || entry.responseEnd);
      if (loadMs > 0) {
        setHistory(prev => {
          const initial = { path: '(initial load)', ms: loadMs, time: new Date().toLocaleTimeString() };
          return [...prev, initial].slice(0, 20);
        });
      }
    }
  }, []);

  if (currentMs === null) return null;

  const color = currentMs < 100 ? 'text-green-400' : currentMs < 300 ? 'text-yellow-400' : 'text-red-400';
  const avgMs = history.length > 0 ? Math.round(history.reduce((s, h) => s + h.ms, 0) / history.length) : 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 px-1.5 py-1 rounded-md text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-colors" title="Page speed monitor">
          <Timer className="w-3.5 h-3.5" />
          <span className={`tabular-nums font-medium ${color}`}>{currentMs}ms</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-72 bg-gray-800 border-gray-700 text-gray-300 p-0 z-[10000]" align="end" sideOffset={8}>
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">Page Speed</span>
          </div>
          <span className="text-[10px] text-gray-500">Avg: {avgMs}ms</span>
        </div>

        {/* Navigation log */}
        <div className="max-h-52 overflow-y-auto">
          {history.map((h, i) => {
            const c = h.ms < 100 ? 'text-green-400' : h.ms < 300 ? 'text-yellow-400' : 'text-red-400';
            return (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 text-xs border-b border-gray-700/50 last:border-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-gray-500 flex-shrink-0">{h.time}</span>
                  <span className="text-gray-300 truncate">{h.path}</span>
                </div>
                <span className={`font-medium tabular-nums flex-shrink-0 ml-2 ${c}`}>{h.ms}ms</span>
              </div>
            );
          })}
          {history.length === 0 && (
            <div className="px-3 py-4 text-center text-gray-500 text-xs">Navigate to start tracking</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PageSpeedIndicator;
