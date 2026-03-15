import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { useThemeEditor } from '../../../contexts/ThemeEditorContext';
import { Button } from '../../ui/button';

const PresetsPanel = () => {
  const { themeConfig, applyPreset, updateThemeConfig } = useThemeEditor();

  const builtInPresets = [
    {
      name: 'Default',
      description: 'Purple gradient with modern dark theme',
      colors: { primary: '#8b5cf6', secondary: '#7c3aed' },
      preview: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
      config: {
        globalColors: {
          primary: '#8b5cf6',
          secondary: '#7c3aed',
          accent: '#a855f7',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        },
        sections: {
          hero: {
            backgroundType: 'gradient',
            gradientColors: ['#9333ea', '#ec4899'],
            gradientOpacity: 40,
            gradientBlur: 70,
            gradientAngle: 135,
            solidColor: '#000000',
            imageUrl: '',
            videoUrl: '',
            headingColor: '#ffffff',
            bodyColor: '#e5e7eb',
            linkColor: '#a855f7',
            padding: { top: 120, bottom: 120 }
          }
        }
      }
    },
    {
      name: 'Ocean',
      description: 'Cool blue gradient with oceanic vibes',
      colors: { primary: '#3b82f6', secondary: '#06b6d4' },
      preview: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
      config: {
        globalColors: {
          primary: '#3b82f6',
          secondary: '#06b6d4',
          accent: '#0ea5e9',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        },
        sections: {
          hero: {
            backgroundType: 'gradient',
            gradientColors: ['#0ea5e9', '#06b6d4'],
            gradientOpacity: 40,
            gradientBlur: 70,
            gradientAngle: 135,
            solidColor: '#000000',
            imageUrl: '',
            videoUrl: '',
            headingColor: '#ffffff',
            bodyColor: '#e5e7eb',
            linkColor: '#0ea5e9',
            padding: { top: 120, bottom: 120 }
          }
        }
      }
    },
    {
      name: 'Sunset',
      description: 'Warm orange and pink gradient',
      colors: { primary: '#f97316', secondary: '#ec4899' },
      preview: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
      config: {
        globalColors: {
          primary: '#f97316',
          secondary: '#ec4899',
          accent: '#fb923c',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        },
        sections: {
          hero: {
            backgroundType: 'gradient',
            gradientColors: ['#f97316', '#ec4899'],
            gradientOpacity: 40,
            gradientBlur: 70,
            gradientAngle: 135,
            solidColor: '#000000',
            imageUrl: '',
            videoUrl: '',
            headingColor: '#ffffff',
            bodyColor: '#e5e7eb',
            linkColor: '#fb923c',
            padding: { top: 120, bottom: 120 }
          }
        }
      }
    },
    {
      name: 'Forest',
      description: 'Green nature-inspired theme',
      colors: { primary: '#10b981', secondary: '#059669' },
      preview: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      config: {
        globalColors: {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#34d399',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        },
        sections: {
          hero: {
            backgroundType: 'gradient',
            gradientColors: ['#10b981', '#059669'],
            gradientOpacity: 40,
            gradientBlur: 70,
            gradientAngle: 135,
            solidColor: '#000000',
            imageUrl: '',
            videoUrl: '',
            headingColor: '#ffffff',
            bodyColor: '#e5e7eb',
            linkColor: '#34d399',
            padding: { top: 120, bottom: 120 }
          }
        }
      }
    },
    {
      name: 'Midnight',
      description: 'Deep indigo with electric accents',
      colors: { primary: '#6366f1', secondary: '#8b5cf6' },
      preview: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      config: {
        globalColors: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#818cf8',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        },
        sections: {
          hero: {
            backgroundType: 'gradient',
            gradientColors: ['#4f46e5', '#7c3aed'],
            gradientOpacity: 40,
            gradientBlur: 70,
            gradientAngle: 135,
            solidColor: '#000000',
            imageUrl: '',
            videoUrl: '',
            headingColor: '#ffffff',
            bodyColor: '#e5e7eb',
            linkColor: '#818cf8',
            padding: { top: 120, bottom: 120 }
          }
        }
      }
    },
    {
      name: 'Minimalist',
      description: 'Clean grayscale with subtle accents',
      colors: { primary: '#64748b', secondary: '#475569' },
      preview: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
      config: {
        globalColors: {
          primary: '#64748b',
          secondary: '#475569',
          accent: '#94a3b8',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        },
        sections: {
          hero: {
            backgroundType: 'gradient',
            gradientColors: ['#64748b', '#334155'],
            gradientOpacity: 40,
            gradientBlur: 70,
            gradientAngle: 135,
            solidColor: '#000000',
            imageUrl: '',
            videoUrl: '',
            headingColor: '#ffffff',
            bodyColor: '#e5e7eb',
            linkColor: '#94a3b8',
            padding: { top: 120, bottom: 120 }
          }
        }
      }
    }
  ];

  const isCurrentPreset = (preset) => {
    return themeConfig.name === preset.name;
  };

  const handleApplyPreset = (preset) => {
    // Merge preset config with current theme config, keeping other sections intact
    updateThemeConfig({
      name: preset.name,
      globalColors: preset.config.globalColors,
      sections: {
        ...themeConfig.sections,
        ...preset.config.sections
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Theme Presets</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Quick-start with professionally designed themes
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {builtInPresets.map((preset) => (
          <div
            key={preset.name}
            className={`relative p-4 rounded-lg border transition-all cursor-pointer ${
              isCurrentPreset(preset)
                ? 'border-violet-500 dark:border-violet-600 bg-violet-50 dark:bg-violet-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
            }`}
            onClick={() => handleApplyPreset(preset)}
          >
            {isCurrentPreset(preset) && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}

            {/* Preview Gradient */}
            <div
              className="w-full h-12 rounded-md mb-3"
              style={{ background: preset.preview }}
            />

            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              {preset.name}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {preset.description}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" className="w-full gap-2">
          <Sparkles size={16} />
          Create Custom Preset
        </Button>
      </div>
    </div>
  );
};

export default PresetsPanel;