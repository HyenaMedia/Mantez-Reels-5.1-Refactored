import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useSettings } from '../contexts/SettingsContext';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { settings } = useSettings();
  const languageSelectorEnabled = settings?.languageSelectorEnabled ?? false;

  // Don't render if language selector is disabled
  if (!languageSelectorEnabled) {
    return null;
  }

  const languages = [
    { code: 'en', name: 'English' },
    // Add more languages here as needed:
    // { code: 'es', name: 'Español' },
    // { code: 'fr', name: 'Français' },
    // { code: 'de', name: 'Deutsch' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:bg-slate-700/50 dark:hover:bg-slate-700/50"
        >
          <Globe className="w-4 h-4" />
          <span>{currentLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
        {languages.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className="hover:bg-slate-700 cursor-pointer"
          >
            <span>{lang.name}</span>
            {i18n.language === lang.code && (
              <span className="ml-auto text-indigo-400">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
