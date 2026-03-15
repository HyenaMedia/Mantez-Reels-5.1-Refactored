import React, { useState, useId } from 'react';
import { Palette, Sparkles, Type, Layers, Wand2 } from 'lucide-react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import NavbarSettings from './sections/NavbarSettings';

const ControlPanel = ({ renderSectionsOnly = false, renderPanelsOnly = false }) => {
  const { selectedSection, setSelectedSection, themeConfig, updateSection, updateThemeConfig } = useThemeEditor();
  const [activePanel, setActivePanel] = useState('customize'); // Default to customize instead of theme
  const color1Id = useId();
  const color2Id = useId();
  const headingColorId = useId();
  const bodyColorId = useId();
  const linkColorId = useId();
  const bgColorId = useId();

  const sections = [
    { id: 'navbar', label: 'Navbar', icon: '🧭' },
    { id: 'hero', label: 'Hero', icon: '🌟' },
    { id: 'about', label: 'About', icon: '📝' },
    { id: 'services', label: 'Services', icon: '⚙️' },
    { id: 'portfolio', label: 'Portfolio', icon: '🖼️' },
    { id: 'contact', label: 'Contact', icon: '📧' }
  ];

  // Quick theme presets - only for hero
  const quickThemes = [
    { 
      name: 'Glass Effect', 
      primary: '#8b5cf6', 
      secondary: '#7c3aed', 
      gradient: ['rgba(17, 24, 39, 0.8)', 'rgba(31, 41, 55, 0.8)'],
      isTransparent: true,
      description: 'Elegant transparent glass design'
    },
    { name: 'Purple Dreams', primary: '#8b5cf6', secondary: '#7c3aed', gradient: ['#9333ea', '#ec4899'] },
    { name: 'Ocean Blue', primary: '#3b82f6', secondary: '#06b6d4', gradient: ['#0ea5e9', '#06b6d4'] },
    { name: 'Sunset Glow', primary: '#f97316', secondary: '#ec4899', gradient: ['#f97316', '#ec4899'] },
    { name: 'Forest Green', primary: '#10b981', secondary: '#059669', gradient: ['#10b981', '#059669'] }
  ];

  const applyQuickTheme = (theme) => {
    updateThemeConfig({
      globalColors: {
        ...themeConfig.globalColors,
        primary: theme.primary,
        secondary: theme.secondary
      },
      sections: {
        ...themeConfig.sections,
        hero: {
          ...themeConfig.sections.hero,
          gradientColors: theme.gradient
        }
      }
    });
  };

  // Render horizontal sections
  if (renderSectionsOnly) {
    return (
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
          Customize:
        </span>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setSelectedSection(section.id);
            }}
            className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              selectedSection === section.id
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 scale-105'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-600 hover:scale-105'
            }`}
          >
            <span className="text-lg">{section.icon}</span>
            <span className="text-sm font-semibold">{section.label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Render sidebar panels
  if (renderPanelsOnly) {
    const section = themeConfig.sections[selectedSection];
    if (!section) return null;

    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        {/* Simple Tab Switcher */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 pt-4">
          <div className="flex gap-2">
            {/* Show Quick Themes tab only for Hero section */}
            {selectedSection === 'hero' && (
              <button
                onClick={() => setActivePanel('theme')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all ${
                  activePanel === 'theme'
                    ? 'bg-white dark:bg-gray-900 text-violet-600 dark:text-violet-400 border-t-2 border-x-2 border-violet-500'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Sparkles size={16} />
                Quick Themes
              </button>
            )}
            <button
              onClick={() => setActivePanel('customize')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all ${
                activePanel === 'customize'
                  ? 'bg-white dark:bg-gray-900 text-violet-600 dark:text-violet-400 border-t-2 border-x-2 border-violet-500'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Palette size={16} />
              Customize
            </button>
          </div>
        </div>

        {/* Panel Content - with scroll containment to prevent parent scroll */}
        <div className="flex-1 overflow-y-auto p-4" style={{ overscrollBehavior: 'contain' }}>
          {/* QUICK THEMES TAB - Only for Hero */}
          {activePanel === 'theme' && selectedSection === 'hero' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                  Choose a Theme
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Quick-start with a beautiful theme
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {quickThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => applyQuickTheme(theme)}
                    className="group relative p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-600 transition-all bg-white dark:bg-gray-800 hover:shadow-lg"
                  >
                    <div
                      className={`w-full h-16 rounded-lg mb-3 ${theme.isTransparent ? 'backdrop-blur-xl' : ''}`}
                      style={{
                        background: theme.isTransparent 
                          ? `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]}), url('data:image/svg+xml,%3Csvg width="40" height="40" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="20" height="20" fill="%23ddd"/%3E%3Crect x="20" y="20" width="20" height="20" fill="%23ddd"/%3E%3C/svg%3E')`
                          : `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`
                      }}
                    />
                    
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                        {theme.name}
                      </h4>
                      {theme.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                          {theme.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <div
                          className="w-6 h-6 rounded-md border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded-md border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: theme.secondary }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMIZE TAB - Navbar Specific Settings */}
          {activePanel === 'customize' && selectedSection === 'navbar' && (
            <NavbarSettings section={section} updateSection={updateSection} />
          )}

          {/* CUSTOMIZE TAB - Other Sections (Hero, About, etc.) */}
          {activePanel === 'customize' && selectedSection !== 'navbar' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-2xl">{sections.find(s => s.id === selectedSection)?.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {sections.find(s => s.id === selectedSection)?.label} Section
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Customize this page section
                  </p>
                </div>
              </div>

              {/* Background Style */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Layers size={16} />
                  Background Style
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      updateSection(selectedSection, { backgroundType: 'gradient' });
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      section.backgroundType === 'gradient'
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="w-full h-8 rounded bg-gradient-to-r from-violet-500 to-purple-600 mb-2" />
                    <span className="text-xs font-medium text-slate-900 dark:text-white">Gradient</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      updateSection(selectedSection, { backgroundType: 'solid' });
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      section.backgroundType === 'solid'
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="w-full h-8 rounded bg-gray-900 mb-2" />
                    <span className="text-xs font-medium text-slate-900 dark:text-white">Solid</span>
                  </button>
                </div>
              </div>

              {/* Gradient Controls */}
              {section.backgroundType === 'gradient' && section.gradientColors && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Wand2 size={16} />
                    Gradient Colors
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={color1Id} className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Color 1</label>
                      <div className="flex gap-2">
                        <input
                          id={color1Id}
                          type="color"
                          value={section.gradientColors[0] || '#9333ea'}
                          onChange={(e) => {
                            const newColors = section.gradientColors ? [...section.gradientColors] : ['#9333ea', '#ec4899'];
                            newColors[0] = e.target.value;
                            updateSection(selectedSection, { gradientColors: newColors });
                          }}
                          className="w-14 h-14 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <Input
                          value={section.gradientColors[0] || '#9333ea'}
                          onChange={(e) => {
                            const newColors = section.gradientColors ? [...section.gradientColors] : ['#9333ea', '#ec4899'];
                            newColors[0] = e.target.value;
                            updateSection(selectedSection, { gradientColors: newColors });
                          }}
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor={color2Id} className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Color 2</label>
                      <div className="flex gap-2">
                        <input
                          id={color2Id}
                          type="color"
                          value={section.gradientColors[1] || '#ec4899'}
                          onChange={(e) => {
                            const newColors = section.gradientColors ? [...section.gradientColors] : ['#9333ea', '#ec4899'];
                            newColors[1] = e.target.value;
                            updateSection(selectedSection, { gradientColors: newColors });
                          }}
                          className="w-14 h-14 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <Input
                          value={section.gradientColors[1] || '#ec4899'}
                          onChange={(e) => {
                            const newColors = section.gradientColors ? [...section.gradientColors] : ['#9333ea', '#ec4899'];
                            newColors[1] = e.target.value;
                            updateSection(selectedSection, { gradientColors: newColors });
                          }}
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gradient Controls */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Direction</span>
                      <span className="text-xs font-mono text-violet-600 dark:text-violet-400">
                        {section.gradientAngle || 135}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="15"
                      value={section.gradientAngle || 135}
                      onChange={(e) => updateSection(selectedSection, { gradientAngle: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Blur Effect</span>
                      <span className="text-xs font-mono text-violet-600 dark:text-violet-400">
                        {section.gradientBlur || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      step="5"
                      value={section.gradientBlur || 0}
                      onChange={(e) => updateSection(selectedSection, { gradientBlur: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Opacity</span>
                      <span className="text-xs font-mono text-violet-600 dark:text-violet-400">
                        {section.gradientOpacity || 100}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={section.gradientOpacity || 100}
                      onChange={(e) => updateSection(selectedSection, { gradientOpacity: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                  </div>
                </div>
              )}

              {/* Solid Color */}
              {section.backgroundType === 'solid' && (
                <div className="space-y-3">
                  <Label htmlFor={bgColorId} className="text-sm font-medium">Background Color</Label>
                  <div className="flex gap-3">
                    <input
                      id={bgColorId}
                      type="color"
                      value={section.solidColor || '#000000'}
                      onChange={(e) => updateSection(selectedSection, { solidColor: e.target.value })}
                      className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <Input
                      value={section.solidColor || '#000000'}
                      onChange={(e) => updateSection(selectedSection, { solidColor: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Text Colors */}
              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Type size={16} />
                  Text Colors
                </Label>
                <div className="space-y-3">
                  <div>
                    <label htmlFor={headingColorId} className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Heading Text</label>
                    <div className="flex gap-3">
                      <input
                        id={headingColorId}
                        type="color"
                        value={section.headingColor || '#ffffff'}
                        onChange={(e) => updateSection(selectedSection, { headingColor: e.target.value })}
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <Input
                        value={section.headingColor || '#ffffff'}
                        onChange={(e) => updateSection(selectedSection, { headingColor: e.target.value })}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor={bodyColorId} className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Body Text</label>
                    <div className="flex gap-3">
                      <input
                        id={bodyColorId}
                        type="color"
                        value={section.bodyColor || '#e5e7eb'}
                        onChange={(e) => updateSection(selectedSection, { bodyColor: e.target.value })}
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <Input
                        value={section.bodyColor || '#e5e7eb'}
                        onChange={(e) => updateSection(selectedSection, { bodyColor: e.target.value })}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                  {section.linkColor !== undefined && (
                    <div>
                      <label htmlFor={linkColorId} className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Link/Accent</label>
                      <div className="flex gap-3">
                        <input
                          id={linkColorId}
                          type="color"
                          value={section.linkColor || '#a855f7'}
                          onChange={(e) => updateSection(selectedSection, { linkColor: e.target.value })}
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <Input
                          value={section.linkColor || '#a855f7'}
                          onChange={(e) => updateSection(selectedSection, { linkColor: e.target.value })}
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Spacing */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Section Spacing</Label>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Top Padding</span>
                      <span className="text-xs font-mono text-violet-600 dark:text-violet-400">
                        {section.padding?.top || 80}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="10"
                      value={section.padding?.top || 80}
                      onChange={(e) => updateSection(selectedSection, {
                        padding: { ...(section.padding || { top: 80, bottom: 80 }), top: parseInt(e.target.value) }
                      })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Bottom Padding</span>
                      <span className="text-xs font-mono text-violet-600 dark:text-violet-400">
                        {section.padding?.bottom || 80}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="10"
                      value={section.padding?.bottom || 80}
                      onChange={(e) => updateSection(selectedSection, {
                        padding: { ...(section.padding || { top: 80, bottom: 80 }), bottom: parseInt(e.target.value) }
                      })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default ControlPanel;
