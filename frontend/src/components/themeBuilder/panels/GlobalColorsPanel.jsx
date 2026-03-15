import React from 'react';
import { useThemeEditor } from '../../../contexts/ThemeEditorContext';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';

const GlobalColorsPanel = () => {
  const { themeConfig, updateThemeConfig } = useThemeEditor();

  const colorGroups = [
    {
      title: 'Brand Colors',
      colors: [
        { key: 'primary', label: 'Primary', description: 'Main brand color' },
        { key: 'secondary', label: 'Secondary', description: 'Secondary brand color' },
        { key: 'accent', label: 'Accent', description: 'Accent highlights' }
      ]
    },
    {
      title: 'Semantic Colors',
      colors: [
        { key: 'success', label: 'Success', description: 'Success states' },
        { key: 'warning', label: 'Warning', description: 'Warning states' },
        { key: 'error', label: 'Error', description: 'Error states' },
        { key: 'info', label: 'Info', description: 'Information states' }
      ]
    }
  ];

  const handleColorChange = (key, value) => {
    updateThemeConfig({
      globalColors: {
        ...themeConfig.globalColors,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Global Colors</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Define your brand's color palette
        </p>
      </div>

      {colorGroups.map((group) => (
        <div key={group.title} className="space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            {group.title}
          </h4>
          {group.colors.map((color) => (
            <div key={color.key} className="space-y-2">
              <Label className="text-sm">{color.label}</Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={themeConfig.globalColors[color.key]}
                  onChange={(e) => handleColorChange(color.key, e.target.value)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <Input
                  value={themeConfig.globalColors[color.key]}
                  onChange={(e) => handleColorChange(color.key, e.target.value)}
                  className="flex-1 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">{color.description}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GlobalColorsPanel;