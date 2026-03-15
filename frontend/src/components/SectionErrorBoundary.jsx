import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Lightweight error boundary for wrapping individual page sections.
 * Shows a compact error UI with retry, without crashing the entire page.
 */
class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[${this.props.name || 'Section'}] Error:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
            {this.props.name || 'This section'} encountered an error
          </h3>
          <p className="text-xs text-red-600 dark:text-red-500 mb-4">
            Something went wrong. Try refreshing this section.
          </p>
          <Button variant="outline" size="sm" onClick={this.handleRetry}>
            <RefreshCw className="w-3 h-3 mr-1" /> Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default SectionErrorBoundary;
