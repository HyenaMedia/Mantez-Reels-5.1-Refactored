import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (in production, send to error tracking service)
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
          {/* Background Effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 text-center max-w-lg">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={40} />
              </div>
            </div>

            {/* Message */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-400 mb-8 text-lg">
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page or
              go back to the homepage.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <RefreshCw className="mr-2" size={18} />
                Try Again
              </Button>
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <RefreshCw className="mr-2" size={18} />
                Refresh Page
              </Button>
              <Button
                onClick={this.handleGoHome}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Home className="mr-2" size={18} />
                Back to Home
              </Button>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-gray-900 rounded-lg text-left overflow-auto max-h-48">
                <p className="text-red-400 text-sm font-mono">
                  {this.state.error.toString()}
                </p>
                <pre className="text-gray-500 text-xs mt-2 font-mono">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
