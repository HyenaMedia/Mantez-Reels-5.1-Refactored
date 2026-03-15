import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading Spinner Component
 * Provides consistent loading states across the app
 */

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <Loader2
      className={`animate-spin text-purple-500 ${sizeClasses[size]} ${className}`}
    />
  );
};

// Full-page loading overlay
export const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-8 flex flex-col items-center gap-4">
      <Spinner size="xl" />
      <p className="text-white font-medium">{message}</p>
    </div>
  </div>
);

// Inline loading state
export const LoadingInline = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center gap-3 p-8">
    <Spinner size="md" />
    <p className="text-gray-400">{message}</p>
  </div>
);

// Button loading state
export const ButtonLoading = ({ children, loading, ...props }) => (
  <button disabled={loading} {...props}>
    {loading ? (
      <>
        <Spinner size="sm" className="mr-2" />
        Loading...
      </>
    ) : (
      children
    )}
  </button>
);

// Content loading placeholder
export const ContentLoading = () => (
  <div className="space-y-4 p-8">
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-white/10 rounded w-3/4"></div>
      <div className="h-4 bg-white/10 rounded w-1/2"></div>
      <div className="h-4 bg-white/10 rounded w-5/6"></div>
    </div>
  </div>
);

export default Spinner;
