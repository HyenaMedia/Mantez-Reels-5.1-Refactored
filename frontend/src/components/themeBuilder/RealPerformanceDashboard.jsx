import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * RealPerformanceDashboard - Shows actual performance metrics
 * Uses browser Performance API for real data
 */
const RealPerformanceDashboard = ({ pageStructure }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const analyzePerformance = () => {
    setLoading(true);
    
    // Get real browser performance metrics
    const perfData = window.performance.timing;
    const navigation = window.performance.navigation;
    const memory = window.performance.memory;
    
    // Calculate real metrics
    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;
    const firstPaint = perfData.responseStart - perfData.navigationStart;
    
    // Get resource timing
    const resources = window.performance.getEntriesByType('resource');
    const totalResources = resources.length;
    const totalResourceSize = resources.reduce((sum, resource) => 
      sum + (resource.transferSize || 0), 0);
    
    // Calculate scores
    const loadScore = loadTime < 3000 ? 95 : loadTime < 5000 ? 75 : loadTime < 8000 ? 50 : 25;
    const domScore = domReady < 2000 ? 95 : domReady < 4000 ? 75 : domReady < 6000 ? 50 : 25;
    const overallScore = Math.round((loadScore + domScore) / 2);
    
    // Component analysis
    const componentCount = pageStructure?.length || 0;
    const recommendations = [];
    const issues = [];
    
    if (totalResources > 50) {
      issues.push({
        severity: 'warning',
        message: `${totalResources} resources loaded. Consider reducing HTTP requests.`,
        fix: 'Bundle files, use image sprites, or implement lazy loading'
      });
      recommendations.push({
        title: 'Reduce HTTP Requests',
        description: `Currently loading ${totalResources} resources. Combine CSS/JS files and optimize images.`,
        impact: 'High'
      });
    }
    
    if (loadTime > 5000) {
      issues.push({
        severity: 'error',
        message: `Page load time is ${(loadTime / 1000).toFixed(2)}s. Should be under 3s.`,
        fix: 'Enable compression, optimize images, reduce bundle size'
      });
      recommendations.push({
        title: 'Optimize Load Time',
        description: 'Page takes too long to load. Enable Gzip compression and optimize assets.',
        impact: 'High'
      });
    }
    
    if (totalResourceSize > 2 * 1024 * 1024) { // 2MB
      recommendations.push({
        title: 'Reduce Page Weight',
        description: `Total page size is ${(totalResourceSize / 1024 / 1024).toFixed(2)}MB. Compress images and minify code.`,
        impact: 'High'
      });
    }
    
    if (componentCount > 8) {
      recommendations.push({
        title: 'Component Count High',
        description: `Page has ${componentCount} components. Consider pagination or lazy loading.`,
        impact: 'Medium'
      });
    }
    
    if (memory && memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
      recommendations.push({
        title: 'Memory Usage High',
        description: `JavaScript heap size is ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB. Check for memory leaks.`,
        impact: 'Medium'
      });
    }
    
    setMetrics({
      score: overallScore,
      metrics: {
        loadTime: (loadTime / 1000).toFixed(2),
        domReady: (domReady / 1000).toFixed(2),
        firstPaint: (firstPaint / 1000).toFixed(2),
        resources: totalResources,
        pageSize: (totalResourceSize / 1024 / 1024).toFixed(2),
        jsHeapSize: memory ? (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) : 'N/A'
      },
      issues,
      recommendations,
      componentCount
    });
    
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    // Auto-analyze on mount
    if (document.readyState === 'complete') {
      setTimeout(analyzePerformance, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(analyzePerformance, 1000);
      });
    }
  }, []);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreRing = (score) => {
    if (score >= 90) return 'border-green-500';
    if (score >= 70) return 'border-yellow-500';
    if (score >= 50) return 'border-orange-500';
    return 'border-red-500';
  };

  return (
    <div className="performance-dashboard p-6 bg-gradient-to-b from-white to-slate-50 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
            <Zap className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Real Performance</h2>
            <p className="text-sm text-slate-500">Live metrics from your browser</p>
          </div>
        </div>
        
        <Button
          size="sm"
          onClick={analyzePerformance}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {metrics && (
        <>
          {/* Performance Score */}
          <div className="mb-8">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div 
                  className={`w-32 h-32 rounded-full border-8 ${getScoreRing(metrics.score)} flex items-center justify-center`}
                >
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(metrics.score)}`}>
                      {metrics.score}
                    </div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="text-xs text-gray-500 mb-1">Page Load Time</div>
                    <div className="text-lg font-semibold">{metrics.metrics.loadTime}s</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="text-xs text-gray-500 mb-1">DOM Ready</div>
                    <div className="text-lg font-semibold">{metrics.metrics.domReady}s</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="text-xs text-gray-500 mb-1">Total Resources</div>
                    <div className="text-lg font-semibold">{metrics.metrics.resources}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="text-xs text-gray-500 mb-1">Page Size</div>
                    <div className="text-lg font-semibold">{metrics.metrics.pageSize}MB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Component Analysis */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Page Structure</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{metrics.componentCount}</div>
                <div className="text-xs text-blue-700">Components</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{metrics.metrics.resources}</div>
                <div className="text-xs text-blue-700">Resources</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{metrics.metrics.jsHeapSize}</div>
                <div className="text-xs text-blue-700">JS Heap (MB)</div>
              </div>
            </div>
          </div>

          {/* Issues */}
          {metrics.issues.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="text-yellow-500" size={20} />
                Issues Found ({metrics.issues.length})
              </h3>
              <div className="space-y-3">
                {metrics.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="p-4 border-l-4 rounded bg-yellow-50 border-yellow-400"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">{issue.message}</div>
                        <div className="text-sm text-gray-600">
                          <strong>Fix:</strong> {issue.fix}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded">
                        {issue.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {metrics.recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Info className="text-blue-500" size={20} />
                Optimization Recommendations
              </h3>
              <div className="space-y-3">
                {metrics.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-blue-50 border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rec.impact === 'High' ? 'bg-red-200 text-red-800' : 
                        rec.impact === 'Medium' ? 'bg-yellow-200 text-yellow-800' : 
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {rec.impact} Impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {metrics.issues.length === 0 && metrics.recommendations.length === 0 && (
            <div className="p-6 text-center bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <h4 className="font-medium text-green-900 mb-1">Excellent Performance!</h4>
              <p className="text-sm text-green-700">
                Your page is well-optimized with no major issues detected.
              </p>
            </div>
          )}

          {lastUpdate && (
            <div className="mt-6 text-xs text-center text-slate-500">
              Last analyzed: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </>
      )}

      {!metrics && loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Analyzing performance...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealPerformanceDashboard;
