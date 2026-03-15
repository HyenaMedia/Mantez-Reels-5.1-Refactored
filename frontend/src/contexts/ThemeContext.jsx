import React, { createContext, useContext, useState, useEffect } from 'react';
import themeService from '../services/themeService';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [themeSwitcherEnabled, setThemeSwitcherEnabled] = useState(false);

  useEffect(() => {
    // Load theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    updateThemeClass(savedTheme);
    
    // Fetch theme switcher setting from backend
    fetchThemeSwitcherSetting();
  }, []);

  const fetchThemeSwitcherSetting = async () => {
    try {
      const response = await themeService.getThemeSettings();
      if (response.data?.themeSwitcherEnabled !== undefined) {
        setThemeSwitcherEnabled(response.data.themeSwitcherEnabled);
        
        // If theme switcher is disabled, force dark mode
        if (!response.data.themeSwitcherEnabled) {
          setTheme('dark');
          localStorage.setItem('theme', 'dark');
          updateThemeClass('dark');
        }
      }
    } catch (error) {
      console.error('Failed to fetch theme switcher setting:', error);
      // Default to disabled (dark mode only)
      setThemeSwitcherEnabled(false);
    }
  };

  const updateThemeClass = (newTheme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  };

  const toggleTheme = () => {
    // Only allow toggling if theme switcher is enabled
    if (!themeSwitcherEnabled) return;
    
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeClass(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeSwitcherEnabled, refreshThemeSwitcherSetting: fetchThemeSwitcherSetting }}>
      {children}
    </ThemeContext.Provider>
  );
};
