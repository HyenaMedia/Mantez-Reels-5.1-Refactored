import React, { useState } from 'react';
import { X, RotateCcw, Search, Loader2 } from 'lucide-react';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import { Switch } from '../ui/switch';

const FeatureFlagsPanel = ({ isOpen, onClose }) => {
  const { flags, loading, updateFlag, resetFlags, refetchFlags } = useFeatureFlags();
  const [searchQuery, setSearchQuery] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Refetch flags when panel opens
  React.useEffect(() => {
    if (isOpen) {
      refetchFlags();
    }
  }, [isOpen, refetchFlags]);

  const handleToggle = async (flagName, currentValue) => {
    try {
      await updateFlag(flagName, !currentValue);
    } catch (error) {
      console.error('Failed to update flag:', error);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all feature flags to defaults?')) {
      return;
    }
    
    try {
      setIsResetting(true);
      await resetFlags();
    } catch (error) {
      console.error('Failed to reset flags:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const groupedFlags = React.useMemo(() => {
    const filtered = Object.entries(flags).filter(([name, flag]) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        name.toLowerCase().includes(query) ||
        flag.label?.toLowerCase().includes(query) ||
        flag.description?.toLowerCase().includes(query)
      );
    });

    return filtered.reduce((acc, [name, flag]) => {
      const category = flag.category || 'core';
      if (!acc[category]) acc[category] = [];
      acc[category].push({ name, ...flag });
      return acc;
    }, {});
  }, [flags, searchQuery]);

  const categoryLabels = {
    core: { label: 'Core Features', color: 'text-blue-400' },
    navigation: { label: 'Navigation', color: 'text-purple-400' },
    advanced: { label: 'Advanced', color: 'text-orange-400' },
    premium: { label: 'Premium', color: 'text-pink-400' },
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-gray-900 shadow-2xl z-[9999] flex flex-col animate-in slide-in-from-right duration-300" aria-label="Feature flag details">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Feature Flags</h2>
            <p className="text-sm text-gray-400 mt-1">
              Control which builder features are enabled
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search features..."
              aria-label="Search feature flags"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            </div>
          ) : Object.keys(groupedFlags).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center" role="status">
              <p className="text-gray-400 text-sm">No feature flags found</p>
              <button
                onClick={() => refetchFlags()}
                className="mt-2 text-purple-400 hover:text-purple-300 text-xs underline"
              >
                Try refreshing
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFlags).map(([category, categoryFlags]) => (
                <div key={category}>
                  <h3 className={`text-sm font-semibold mb-3 ${categoryLabels[category]?.color || 'text-gray-400'}`}>
                    {categoryLabels[category]?.label || category.toUpperCase()}
                  </h3>
                  <div className="space-y-3">
                    {categoryFlags.map((flag) => (
                      <div
                        key={flag.name}
                        className="flex items-start justify-between gap-4 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-white">
                              {flag.label}
                            </h4>
                            {flag.enabled && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          {flag.description && (
                            <p className="text-xs text-gray-400 mt-1">
                              {flag.description}
                            </p>
                          )}
                        </div>
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={() => handleToggle(flag.name, flag.enabled)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Reset to Defaults
          </button>
        </div>
      </div>
    </>
  );
};

export default FeatureFlagsPanel;
