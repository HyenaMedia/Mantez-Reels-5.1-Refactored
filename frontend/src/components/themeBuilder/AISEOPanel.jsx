import React, { useState } from 'react';
import { useComponentRegistry } from '../../contexts/ComponentRegistryContext';
import { Button } from '../ui/button';
import { Search, TrendingUp, Loader2 } from 'lucide-react';
import axios from 'axios';

/**
 * AISEOPanel - Weeks 27-28
 * SEO analysis and optimization
 */
const AISEOPanel = () => {
  const { pageComponents, componentContent } = useComponentRegistry();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  const analyzeSEO = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Extract page content
      let content = '';
      pageComponents.forEach(comp => {
        const compContent = componentContent[comp.id] || {};
        Object.values(compContent).forEach(value => {
          if (typeof value === 'string') {
            content += value + ' ';
          }
        });
      });

      const response = await axios.post(
        `${BACKEND_URL}/api/ai/analyze-seo`,
        { content, targetKeywords: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAnalysis(response.data.analysis);
      }
    } catch (error) {
      console.error('SEO analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">SEO Analysis</h3>
        </div>
        <Button size="sm" onClick={analyzeSEO} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Analyze'
          )}
        </Button>
      </div>

      {analysis && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-sm font-semibold">SEO Score</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{analysis.score}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Suggestions</h4>
            <ul className="space-y-1">
              {analysis.suggestions.map((suggestion, i) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-xs font-semibold mb-2">Generated Schema</h4>
            <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
              {JSON.stringify(analysis.schema, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISEOPanel;
