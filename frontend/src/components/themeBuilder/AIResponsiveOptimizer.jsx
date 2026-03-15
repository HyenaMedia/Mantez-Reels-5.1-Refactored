import React, { useState } from 'react';
import { useComponentRegistry } from '../../contexts/ComponentRegistryContext';
import { Button } from '../ui/button';
import { Smartphone, Zap, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

/**
 * AIResponsiveOptimizer - Weeks 23-26
 * Auto-optimize layouts for mobile/tablet
 */
const AIResponsiveOptimizer = ({ targetDevice = 'mobile' }) => {
  const { pageComponents, selectedComponent, componentContent, saveComponentContent } = useComponentRegistry();
  const [loading, setLoading] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  const handleOptimize = async () => {
    if (!selectedComponent) {
      alert('Please select a component first');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const currentContent = componentContent[selectedComponent] || {};
      
      const response = await axios.post(
        `${BACKEND_URL}/api/ai/optimize-responsive`,
        {
          componentId: selectedComponent,
          content: currentContent,
          targetDevice: targetDevice
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Apply AI optimizations
        const optimizedContent = response.data.optimizedContent;
        
        // Save optimized content
        await saveComponentContent(selectedComponent, optimizedContent);
        
        setOptimized(true);
        setTimeout(() => setOptimized(false), 3000);
      }
    } catch (error) {
      console.error('Responsive optimization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (targetDevice === 'desktop') {
    return null;
  }

  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600" />
          <label className="text-xs font-semibold">AI Optimization</label>
        </div>
        {optimized && (
          <CheckCircle className="w-4 h-4 text-green-600" />
        )}
      </div>

      <Button
        size="sm"
        onClick={handleOptimize}
        disabled={loading || !selectedComponent}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            Optimizing...
          </>
        ) : (
          <>
            <Smartphone className="w-3 h-3 mr-2" />
            Auto-optimize for {targetDevice}
          </>
        )}
      </Button>

      <p className="text-xs text-blue-600 dark:text-blue-400">
        AI will adjust sizing, spacing, and layout for {targetDevice}
      </p>
    </div>
  );
};

export default AIResponsiveOptimizer;
