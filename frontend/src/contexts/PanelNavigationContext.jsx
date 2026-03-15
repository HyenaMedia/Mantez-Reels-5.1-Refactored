import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * PanelNavigationContext - Manages navigation history for each panel
 * Allows proper back button navigation within panels like professional builders
 */

const PanelNavigationContext = createContext();

export const usePanelNavigation = () => {
  const context = useContext(PanelNavigationContext);
  if (!context) {
    throw new Error('usePanelNavigation must be used within PanelNavigationProvider');
  }
  return context;
};

export const PanelNavigationProvider = ({ children }) => {
  // Store navigation history for each panel
  // { panelId: [screen1, screen2, screen3], ... }
  const [history, setHistory] = useState({});
  
  // Current screen for each panel
  const [currentScreens, setCurrentScreens] = useState({});

  /**
   * Navigate to a new screen within a panel
   * @param {string} panelId - ID of the panel (e.g., 'animations', 'performance')
   * @param {string} screenId - ID of the screen to navigate to
   * @param {object} screenData - Optional data for the screen
   */
  const navigateTo = useCallback((panelId, screenId, screenData = {}) => {
    setHistory(prev => ({
      ...prev,
      [panelId]: [...(prev[panelId] || []), { screenId, data: screenData }]
    }));
    
    setCurrentScreens(prev => ({
      ...prev,
      [panelId]: { screenId, data: screenData }
    }));
  }, []);

  /**
   * Go back to previous screen within a panel
   * @param {string} panelId - ID of the panel
   * @returns {boolean} - Returns true if went back, false if no history
   */
  const goBack = useCallback((panelId) => {
    const panelHistory = history[panelId];
    
    if (!panelHistory || panelHistory.length <= 1) {
      return false; // No history to go back to
    }

    // Remove last item from history
    const newHistory = panelHistory.slice(0, -1);
    const previousScreen = newHistory[newHistory.length - 1];

    setHistory(prev => ({
      ...prev,
      [panelId]: newHistory
    }));

    setCurrentScreens(prev => ({
      ...prev,
      [panelId]: previousScreen
    }));

    return true;
  }, [history]);

  /**
   * Clear navigation history for a panel
   * @param {string} panelId - ID of the panel
   */
  const clearHistory = useCallback((panelId) => {
    setHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[panelId];
      return newHistory;
    });

    setCurrentScreens(prev => {
      const newScreens = { ...prev };
      delete newScreens[panelId];
      return newScreens;
    });
  }, []);

  /**
   * Get current screen for a panel
   * @param {string} panelId - ID of the panel
   * @returns {object} - Current screen { screenId, data }
   */
  const getCurrentScreen = useCallback((panelId) => {
    return currentScreens[panelId] || { screenId: 'main', data: {} };
  }, [currentScreens]);

  /**
   * Get navigation history length for a panel
   * @param {string} panelId - ID of the panel
   * @returns {number} - History length
   */
  const getHistoryLength = useCallback((panelId) => {
    return history[panelId]?.length || 0;
  }, [history]);

  /**
   * Check if can go back
   * @param {string} panelId - ID of the panel
   * @returns {boolean} - True if can go back
   */
  const canGoBack = useCallback((panelId) => {
    return (history[panelId]?.length || 0) > 1;
  }, [history]);

  const value = {
    navigateTo,
    goBack,
    clearHistory,
    getCurrentScreen,
    getHistoryLength,
    canGoBack,
  };

  return (
    <PanelNavigationContext.Provider value={value}>
      {children}
    </PanelNavigationContext.Provider>
  );
};

export default PanelNavigationContext;
