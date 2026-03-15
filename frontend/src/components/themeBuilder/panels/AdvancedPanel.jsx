import React from 'react';
import { useThemeEditor } from '../../../contexts/ThemeEditorContext';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';

const AdvancedPanel = () => {
  const { themeConfig, updateThemeConfig } = useThemeEditor();

  const handleEffectToggle = (key, value) => {
    updateThemeConfig({
      effects: {
        ...themeConfig.effects,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Advanced Settings</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Configure visual effects and performance
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <Label className="text-sm font-medium">Enable Animations</Label>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Smooth transitions and entrance animations
            </p>
          </div>
          <Switch
            checked={themeConfig.effects.enableAnimations}
            onCheckedChange={(checked) => handleEffectToggle('enableAnimations', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <Label className="text-sm font-medium">Enable Parallax</Label>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Depth effect on scroll
            </p>
          </div>
          <Switch
            checked={themeConfig.effects.enableParallax}
            onCheckedChange={(checked) => handleEffectToggle('enableParallax', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <Label className="text-sm font-medium">Glass Effect</Label>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Frosted glass backdrop blur
            </p>
          </div>
          <Switch
            checked={themeConfig.effects.enableGlassEffect}
            onCheckedChange={(checked) => handleEffectToggle('enableGlassEffect', checked)}
          />
        </div>
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-xs text-amber-800 dark:text-amber-400">
          ⚠️ <strong>Performance Note:</strong> Disabling effects may improve performance on lower-end devices.
        </p>
      </div>
    </div>
  );
};

export default AdvancedPanel;