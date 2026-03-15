import React from 'react';
import { useThemeEditor } from '../../../contexts/ThemeEditorContext';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';

const TypographyPanel = () => {
  const { themeConfig, updateThemeConfig } = useThemeEditor();

  const fontOptions = [
    'Inter',
    'Poppins',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Raleway',
    'Playfair Display',
    'Merriweather'
  ];

  const handleTypographyChange = (key, value) => {
    updateThemeConfig({
      typography: {
        ...themeConfig.typography,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Typography</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Customize fonts and text scale
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block">Heading Font</Label>
          <select
            value={themeConfig.typography.headingFont}
            onChange={(e) => handleTypographyChange('headingFont', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-slate-900 dark:text-white"
          >
            {fontOptions.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Body Font</Label>
          <select
            value={themeConfig.typography.bodyFont}
            onChange={(e) => handleTypographyChange('bodyFont', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-slate-900 dark:text-white"
          >
            {fontOptions.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Font Scale: {themeConfig.typography.scale}%</Label>
          <input
            type="range"
            min="75"
            max="150"
            step="5"
            value={themeConfig.typography.scale}
            onChange={(e) => handleTypographyChange('scale', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
            <span>Small</span>
            <span>Normal</span>
            <span>Large</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">💡 Preview</p>
        <h2
          className="text-2xl font-bold text-slate-900 dark:text-white mb-2"
          style={{ fontFamily: themeConfig.typography.headingFont }}
        >
          Heading Text
        </h2>
        <p
          className="text-sm text-gray-600 dark:text-gray-400"
          style={{ fontFamily: themeConfig.typography.bodyFont }}
        >
          This is how your body text will look with the selected font.
        </p>
      </div>
    </div>
  );
};

export default TypographyPanel;