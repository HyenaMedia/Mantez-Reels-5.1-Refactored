import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const FeatureFlagContext = createContext(null);

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
};

export const useFeatureFlag = (flagName) => {
  const { flags } = useFeatureFlags();
  return flags?.[flagName]?.enabled || false;
};

export const FeatureFlagProvider = ({ children }) => {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);

  const fetchFlags = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (signal) config.signal = signal;

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/features`,
        config
      );

      if (response.data && response.data.flags) {
        setFlags(response.data.flags);
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') return;
      console.error('Error fetching feature flags:', err);
      setError(err.message);
      // Set default flags if fetch fails
      setFlags({
        drag_and_drop: { enabled: true },
        element_library: { enabled: true },
        inspector_panel: { enabled: true },
        section_management: { enabled: true },
        navbar_editor: { enabled: true },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFlag = useCallback(async (flagName, enabled) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Use functional updater to avoid stale flags
      let updatedFlags;
      setFlags(prev => {
        updatedFlags = {
          ...prev,
          [flagName]: {
            ...prev[flagName],
            enabled,
          },
        };
        return updatedFlags;
      });

      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/features`,
        updatedFlags,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (err) {
      console.error('Error updating feature flag:', err);
      throw err;
    }
  }, []);

  const resetFlags = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/features/reset`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.flags) {
        setFlags(response.data.flags);
      }
    } catch (err) {
      console.error('Error resetting feature flags:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      const controller = new AbortController();
      fetchFlags(controller.signal);
      return () => controller.abort();
    }
  }, [fetchFlags]);

  const value = {
    flags,
    loading,
    error,
    updateFlag,
    resetFlags,
    refetchFlags: fetchFlags,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};
