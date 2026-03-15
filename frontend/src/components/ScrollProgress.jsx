import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const { settings } = useSettings();
  
  // Get settings with defaults
  const isEnabled = settings?.siteFeatures?.scrollProgress?.enabled ?? true;
  const color = settings?.siteFeatures?.scrollProgress?.color || '#a855f7';
  const height = settings?.siteFeatures?.scrollProgress?.height || 3;
  const isBottom = settings?.siteFeatures?.scrollProgress?.bottom || false;

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress(); // Initial calculation

    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  // Don't render if disabled
  if (!isEnabled) {
    return null;
  }

  const positionClass = isBottom ? 'bottom-0' : 'top-0';

  return (
    <div 
      className={`fixed ${positionClass} left-0 right-0 z-[100] pointer-events-none`}
      style={{ height: `${height}px` }}
    >
      {/* Glassmorphic container with backdrop blur */}
      <div
        className="absolute left-0 right-0 bg-white/10 backdrop-blur-md border-b border-white/20 origin-left"
        style={{ 
          transform: `scaleX(${scrollProgress / 100})`,
          height: `${height}px`,
          [isBottom ? 'bottom' : 'top']: 0
        }}
      />
      {/* Glow effect layer */}
      <div
        className="absolute left-0 right-0 blur-md opacity-60 origin-left"
        style={{
          transform: `scaleX(${scrollProgress / 100})`,
          height: `${height}px`,
          background: color,
          [isBottom ? 'bottom' : 'top']: 0
        }}
      />
      {/* Main progress bar */}
      <div
        className="absolute left-0 right-0 shadow-xl overflow-hidden origin-left"
        style={{
          transform: `scaleX(${scrollProgress / 100})`,
          height: `${height}px`,
          background: color,
          boxShadow: `0 0 20px ${color}40`,
          [isBottom ? 'bottom' : 'top']: 0
        }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Page scroll progress"
      >
        {/* Animated shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] animate-[shimmer_2s_ease-in-out_infinite]" />
        {/* Glass reflection effect on top */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </div>
  );
};

export default ScrollProgress;
