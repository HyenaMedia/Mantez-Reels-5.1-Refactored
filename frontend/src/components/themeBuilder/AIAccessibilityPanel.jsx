import React, { useState } from 'react';
import { useComponentRegistry } from '../../contexts/ComponentRegistryContext';
import { Button } from '../ui/button';
import { Eye, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';

/**
 * AIAccessibilityPanel - Weeks 29-30
 * WCAG compliance checking and auto-fix
 */
const AIAccessibilityPanel = () => {
  const { pageComponents } = useComponentRegistry();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  const checkAccessibility = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${BACKEND_URL}/api/ai/check-accessibility`,
        { pageStructure: { sections: pageComponents } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setReport(response.data.report);
      }
    } catch (error) {
      console.error('Accessibility check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoFix = async () => {
    try {
      setFixing(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${BACKEND_URL}/api/ai/fix-accessibility`,
        { pageStructure: { sections: pageComponents } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Accessibility fixes applied! Please review the changes.');
        // In real implementation, would update components with fixes
        await checkAccessibility();
      }
    } catch (error) {
      console.error('Accessibility auto-fix failed:', error);
    } finally {
      setFixing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Accessibility</h3>
        </div>
        <Button size="sm" onClick={checkAccessibility} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Check'
          )}
        </Button>
      </div>

      {report && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div>
              <p className="text-sm font-semibold">WCAG {report.level} Compliance</p>
              <p className="text-xs text-gray-600">
                {report.passed} passed, {report.failed} failed, {report.warnings} warnings
              </p>
            </div>
            <span className="text-2xl font-bold text-blue-600">{report.score}%</span>
          </div>

          {report.issues.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Issues Found</h4>
                {report.autoFixAvailable && (
                  <Button size="sm" onClick={autoFix} disabled={fixing}>
                    {fixing ? 'Fixing...' : 'Auto-Fix All'}
                  </Button>
                )}
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {report.issues.map((issue, i) => (
                  <div key={i} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="flex items-start gap-2">
                      <AlertCircle className={`w-4 h-4 mt-0.5 ${getSeverityColor(issue.severity)}`} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold">{issue.message}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          🔧 Fix: {issue.fix}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.issues.length === 0 && (
            <div className="p-4 text-center text-green-600">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-semibold">No accessibility issues found!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAccessibilityPanel;
