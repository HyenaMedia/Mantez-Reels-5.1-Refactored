import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';

const ThemeToggle = () => {
  const { theme, toggleTheme, themeSwitcherEnabled } = useTheme();

  // Don't render if theme switcher is disabled
  if (!themeSwitcherEnabled) {
    return null;
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      className="relative w-9 h-9 p-0 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-400" />
      )}
    </Button>
  );
};

export default ThemeToggle;
