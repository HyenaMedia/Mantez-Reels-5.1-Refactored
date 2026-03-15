import React from 'react';
import { useThemeEditor } from '../../../contexts/ThemeEditorContext';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

const SectionEditorPanel = () => {
  const { themeConfig, selectedSection, updateSection } = useThemeEditor();
  const section = themeConfig.sections[selectedSection];

  if (!section) return <div>Select a section from Layers</div>;

  const handleBackgroundTypeChange = (type) => {
    updateSection(selectedSection, { backgroundType: type });
  };

  const handleGradientColorChange = (index, value) => {
    const newColors = [...section.gradientColors];
    newColors[index] = value;
    updateSection(selectedSection, { gradientColors: newColors });
  };

  const handleColorChange = (key, value) => {
    updateSection(selectedSection, { [key]: value });
  };

  const handlePaddingChange = (key, value) => {
    updateSection(selectedSection, {
      padding: { ...section.padding, [key]: parseInt(value) || 0 }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
          {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} Section
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Customize the appearance of this section
        </p>
      </div>

      <Tabs defaultValue="background" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="background">Background</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
        </TabsList>

        {/* Background Tab */}
        <TabsContent value="background" className="space-y-4 mt-4">
          <div>
            <Label className="text-sm mb-3 block">Background Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {['gradient', 'solid', 'image', 'video'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleBackgroundTypeChange(type)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    section.backgroundType === type
                      ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-500 dark:border-violet-600 text-violet-700 dark:text-violet-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Gradient Controls */}
          {section.backgroundType === 'gradient' && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">Gradient Color 1</Label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={section.gradientColors[0]}
                    onChange={(e) => handleGradientColorChange(0, e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <Input
                    value={section.gradientColors[0]}
                    onChange={(e) => handleGradientColorChange(0, e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Gradient Color 2</Label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={section.gradientColors[1]}
                    onChange={(e) => handleGradientColorChange(1, e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <Input
                    value={section.gradientColors[1]}
                    onChange={(e) => handleGradientColorChange(1, e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Opacity: {section.gradientOpacity}%</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={section.gradientOpacity}
                  onChange={(e) => handleColorChange('gradientOpacity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm mb-2 block">Blur: {section.gradientBlur}px</Label>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={section.gradientBlur}
                  onChange={(e) => handleColorChange('gradientBlur', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm mb-2 block">Angle: {section.gradientAngle}°</Label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={section.gradientAngle || 135}
                  onChange={(e) => handleColorChange('gradientAngle', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Solid Color Controls */}
          {section.backgroundType === 'solid' && (
            <div>
              <Label className="text-sm mb-2 block">Background Color</Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={section.solidColor}
                  onChange={(e) => handleColorChange('solidColor', e.target.value)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <Input
                  value={section.solidColor}
                  onChange={(e) => handleColorChange('solidColor', e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Image Upload Placeholder */}
          {section.backgroundType === 'image' && (
            <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                📸 Image Upload
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Coming in Phase 4
              </p>
            </div>
          )}

          {/* Video Upload Placeholder */}
          {section.backgroundType === 'video' && (
            <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                🎥 Video Upload
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Coming in Phase 4
              </p>
            </div>
          )}
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4 mt-4">
          <div>
            <Label className="text-sm mb-2 block">Heading Color</Label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={section.headingColor}
                onChange={(e) => handleColorChange('headingColor', e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <Input
                value={section.headingColor}
                onChange={(e) => handleColorChange('headingColor', e.target.value)}
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Body Text Color</Label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={section.bodyColor}
                onChange={(e) => handleColorChange('bodyColor', e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <Input
                value={section.bodyColor}
                onChange={(e) => handleColorChange('bodyColor', e.target.value)}
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>

          {section.linkColor !== undefined && (
            <div>
              <Label className="text-sm mb-2 block">Link Color</Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={section.linkColor}
                  onChange={(e) => handleColorChange('linkColor', e.target.value)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <Input
                  value={section.linkColor}
                  onChange={(e) => handleColorChange('linkColor', e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Spacing Tab */}
        <TabsContent value="spacing" className="space-y-4 mt-4">
          <div>
            <Label className="text-sm mb-2 block">Top Padding: {section.padding?.top || 80}px</Label>
            <input
              type="range"
              min="0"
              max="200"
              value={section.padding?.top || 80}
              onChange={(e) => handlePaddingChange('top', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Label className="text-sm mb-2 block">Bottom Padding: {section.padding?.bottom || 80}px</Label>
            <input
              type="range"
              min="0"
              max="200"
              value={section.padding?.bottom || 80}
              onChange={(e) => handlePaddingChange('bottom', e.target.value)}
              className="w-full"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SectionEditorPanel;
