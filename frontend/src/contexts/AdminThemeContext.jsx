import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminThemeContext = createContext();

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return context;
};

export const AdminThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    // Accent colors
    accentColor: '#9333ea', // purple-600
    accentColorHover: '#7e22ce', // purple-700
    accentColorLight: 'rgba(147, 51, 234, 0.2)', // purple with 20% opacity
    
    // Card backgrounds
    cardBg: 'rgba(17, 24, 39, 0.5)', // gray-900/50
    cardBgSolid: 'rgb(31, 41, 55)', // gray-800
    cardBorder: 'rgb(55, 65, 81)', // gray-700
    
    // Input fields
    inputBg: 'rgb(31, 41, 55)', // gray-800
    inputBorder: 'rgb(55, 65, 81)', // gray-700
    inputBorderFocus: '#9333ea', // purple-600
    
    // Text colors
    textPrimary: 'rgb(255, 255, 255)', // white
    textSecondary: 'rgb(209, 213, 219)', // gray-300
    textMuted: 'rgb(156, 163, 175)', // gray-400
    
    // Button gradients
    buttonGradientFrom: '#9333ea', // purple-600
    buttonGradientTo: '#ec4899', // pink-500
    
    // Stat cards (Dashboard)
    statCardBg: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
    statCardBorder: 'rgba(255, 255, 255, 0.1)',
    statCardBorderHover: 'rgba(255, 255, 255, 0.2)',
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    const controller = new AbortController();
    const fetchThemeSettingsInit = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/settings/`, { signal: controller.signal });
        if (response.data?.adminTheme) {
          setTheme(prevTheme => ({
            ...prevTheme,
            ...response.data.adminTheme
          }));
        }
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to fetch admin theme:', error);
        // Use default theme if fetch fails
      }
    };
    fetchThemeSettingsInit();
    return () => controller.abort();
  }, []);

  const fetchThemeSettings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/settings/`);
      if (response.data?.adminTheme) {
        setTheme(prevTheme => ({
          ...prevTheme,
          ...response.data.adminTheme
        }));
      }
    } catch (error) {
      console.error('Failed to fetch admin theme:', error);
      // Use default theme if fetch fails
    }
  };

  const updateTheme = async (newThemeData) => {
    try {
      // Use functional updater to get the latest theme and compute merged value
      let mergedTheme;
      setTheme(prevTheme => {
        mergedTheme = { ...prevTheme, ...newThemeData };
        return mergedTheme;
      });

      // Save to backend using the merged (non-stale) theme
      const token = localStorage.getItem('token');
      await axios.put(
        `${BACKEND_URL}/api/settings/`,
        { adminTheme: mergedTheme },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to update admin theme:', error);
    }
  };

  const resetTheme = () => {
    const defaultTheme = {
      accentColor: '#9333ea',
      accentColorHover: '#7e22ce',
      accentColorLight: 'rgba(147, 51, 234, 0.2)',
      cardBg: 'rgba(17, 24, 39, 0.5)',
      cardBgSolid: 'rgb(31, 41, 55)',
      cardBorder: 'rgb(55, 65, 81)',
      inputBg: 'rgb(31, 41, 55)',
      inputBorder: 'rgb(55, 65, 81)',
      inputBorderFocus: '#9333ea',
      textPrimary: 'rgb(255, 255, 255)',
      textSecondary: 'rgb(209, 213, 219)',
      textMuted: 'rgb(156, 163, 175)',
      buttonGradientFrom: '#9333ea',
      buttonGradientTo: '#ec4899',
      statCardBg: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
      statCardBorder: 'rgba(255, 255, 255, 0.1)',
      statCardBorderHover: 'rgba(255, 255, 255, 0.2)',
    };
    setTheme(defaultTheme);
    return defaultTheme;
  };

  const value = {
    theme,
    updateTheme,
    resetTheme,
    refreshTheme: fetchThemeSettings,
  };

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export default AdminThemeContext;
