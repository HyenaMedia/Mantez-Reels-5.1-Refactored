import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { performanceMonitor } from '../../utils/performanceHelpers';

const PerformanceDashboard = ({ pageStructure }) => {
  const [performanceScore, setPerformanceScore] = useState(null);
  const [issues, setIssues] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Get initial performance score
    const score = performanceMonitor.getPerformanceScore();
    setPerformanceScore(score);
  }, []);

  const analyzePerformance = async () => {
    setIsAnalyzing(true);
    
    // Simulate performance analysis
    setTimeout(() => {
      const foundIssues = [];
      const foundRecommendations = [];
      
      // Check page structure for performance issues
      if (pageStructure?.sections) {
        const totalElements = pageStructure.sections.reduce(
          (sum, section) => sum + (section.elements?.length || 0),
          0
        );
        
        if (totalElements > 100) {
          foundIssues.push({
            severity: 'warning',
            type: 'element-count',
            message: `High element count (${totalElements}). Consider pagination or lazy loading.`,
            fix: 'Implement virtual scrolling or pagination'
          });
        }
        
        // Check for large images
        let imageCount = 0;
        pageStructure.sections.forEach(section => {
          section.elements?.forEach(element => {
            if (element.type === 'image') {
              imageCount++;
              if (!element.props?.loading || element.props.loading !== 'lazy') {
                foundIssues.push({
                  severity: 'info',
                  type: 'image-optimization',
                  message: `Image ${element.id} not set to lazy load`,
                  fix: 'Enable lazy loading for images'
                });
              }
            }
          });
        });
        
        if (imageCount > 20) {
          foundRecommendations.push({
            title: 'Optimize Images',
            description: `Your page has ${imageCount} images. Consider using lazy loading and WebP format.`,
            impact: 'High'
          });
        }
        
        // Check for animations
        const animatedElements = pageStructure.sections.reduce((count, section) => {
          return count + (section.elements?.filter(e => e.animations?.length > 0)?.length || 0);
        }, 0);
        
        if (animatedElements > 10) {
          foundRecommendations.push({
            title: 'Reduce Animations',
            description: `${animatedElements} animated elements detected. Too many can impact performance.`,
            impact: 'Medium'
          });
        }
        
        // Check for inline styles
        foundRecommendations.push({
          title: 'CSS Optimization',
          description: 'Extract critical CSS and defer non-critical styles.',
          impact: 'Medium'
        });
        
        foundRecommendations.push({
          title: 'Code Splitting',
          description: 'Use dynamic imports to split code and reduce initial bundle size.',
          impact: 'High'
        });
      }
      
      setIssues(foundIssues);
      setRecommendations(foundRecommendations);
      setIsAnalyzing(false);
    }, 1500);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreRing = (score) => {
    if (score >= 90) return 'border-green-500';
    if (score >= 50) return 'border-yellow-500';
    return 'border-red-500';
  };

  return (
    <div className="performance-dashboard p-6 bg-gradient-to-b from-white to-slate-50 min-h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
          <Zap className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Performance</h2>
          <p className="text-sm text-slate-500">Optimize for 95+ Lighthouse score</p>
        </div>
      </div>

      {/* Performance Score */}
      {performanceScore && (
        <div className="mb-8">
          <div className="flex items-center gap-8">
            <div className="relative">
              <div 
                className={`w-32 h-32 rounded-full border-8 ${getScoreRing(performanceScore.score)} flex items-center justify-center`}
              >
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(performanceScore.score)}`}>
                    {performanceScore.score}
                  </div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">First Contentful Paint</div>
                  <div className="text-lg font-semibold">
                    {performanceScore.metrics.fcp ? `${performanceScore.metrics.fcp.toFixed(0)}ms` : 'N/A'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">Time to First Byte</div>
                  <div className="text-lg font-semibold">
                    {performanceScore.metrics.ttfb.toFixed(0)}ms
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">DOM Content Loaded</div>
                  <div className="text-lg font-semibold">
                    {performanceScore.metrics.dcl.toFixed(0)}ms
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">Page Load Complete</div>
                  <div className="text-lg font-semibold">
                    {performanceScore.metrics.load.toFixed(0)}ms
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={analyzePerformance}
        disabled={isAnalyzing}
        className="w-full mb-6 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            Analyzing...
          </>
        ) : (
          <>
            <TrendingUp size={20} />
            Run Performance Analysis
          </>
        )}
      </button>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="text-yellow-500" size={20} />
            Issues Found ({issues.length})
          </h3>
          <div className="space-y-3">
            {issues.map((issue, index) => (
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
      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Info className="text-blue-500" size={20} />
            Optimization Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg bg-blue-50 border-blue-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded">
                    {rec.impact} Impact
                  </span>
                </div>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target Score */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-medium text-green-900 mb-1">Target: Lighthouse Score 95+</h4>
            <p className="text-sm text-green-700">
              The Visual Builder is optimized for performance-first architecture.
              Follow these recommendations to achieve a 95+ Lighthouse score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;