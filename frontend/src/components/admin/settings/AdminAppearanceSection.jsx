import React from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Palette, Activity, RefreshCw } from 'lucide-react';

export default function AdminAppearanceSection({ theme, updateTheme, resetTheme, toast }) {
  return (
    <AccordionItem
      value="admin-appearance"
      className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg"
    >
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-purple-500" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Admin Dashboard Appearance</h3>
            <p className="text-sm text-gray-400">
              Customize colors and styling for admin interface
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2">
        <div className="space-y-6">
          {/* Accent Color */}
          <div>
            <Label className="text-gray-300 mb-2 block">Primary Accent Color</Label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={theme.accentColor}
                onChange={(e) => updateTheme({ accentColor: e.target.value })}
                className="w-20 h-12 rounded border border-white/[0.08] cursor-pointer"
              />
              <div className="flex-1">
                <Input
                  value={theme.accentColor}
                  onChange={(e) => updateTheme({ accentColor: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08] text-white font-mono"
                  placeholder="#9333ea"
                />
                <p className="text-xs text-gray-500 mt-1">Used for buttons, links, and highlights</p>
              </div>
            </div>
          </div>

          {/* Button Gradient Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Button Gradient Start</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={theme.buttonGradientFrom}
                  onChange={(e) => updateTheme({ buttonGradientFrom: e.target.value })}
                  className="w-12 h-12 rounded border border-white/[0.08] cursor-pointer"
                />
                <Input
                  value={theme.buttonGradientFrom}
                  onChange={(e) => updateTheme({ buttonGradientFrom: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Button Gradient End</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={theme.buttonGradientTo}
                  onChange={(e) => updateTheme({ buttonGradientTo: e.target.value })}
                  className="w-12 h-12 rounded border border-white/[0.08] cursor-pointer"
                />
                <Input
                  value={theme.buttonGradientTo}
                  onChange={(e) => updateTheme({ buttonGradientTo: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-6 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Live Preview
            </h4>
            <div className="space-y-4">
              {/* Preview Button */}
              <button
                className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition-all"
                style={{
                  background: `linear-gradient(to right, ${theme.buttonGradientFrom}, ${theme.buttonGradientTo})`
                }}
              >
                Sample Button
              </button>

              {/* Preview Card */}
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <h5 className="font-semibold mb-2 text-white">Sample Card</h5>
                <p className="text-gray-300 text-sm">This is how cards will look with your theme.</p>
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <span style={{ color: theme.accentColor }} className="text-sm font-medium">Accent Color Text</span>
                </div>
              </div>

              {/* Preview Input */}
              <input
                type="text"
                placeholder="Sample Input Field"
                className="w-full px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <Label className="text-gray-300 mb-3 block">Quick Color Presets</Label>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => updateTheme({
                  accentColor: '#9333ea',
                  buttonGradientFrom: '#9333ea',
                  buttonGradientTo: '#ec4899'
                })}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
              >
                <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(to right, #9333ea, #ec4899)' }}></div>
                <span className="text-xs text-gray-400">Purple</span>
              </button>
              <button
                onClick={() => updateTheme({
                  accentColor: '#3b82f6',
                  buttonGradientFrom: '#3b82f6',
                  buttonGradientTo: '#06b6d4'
                })}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
              >
                <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(to right, #3b82f6, #06b6d4)' }}></div>
                <span className="text-xs text-gray-400">Blue</span>
              </button>
              <button
                onClick={() => updateTheme({
                  accentColor: '#10b981',
                  buttonGradientFrom: '#10b981',
                  buttonGradientTo: '#3b82f6'
                })}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
              >
                <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(to right, #10b981, #3b82f6)' }}></div>
                <span className="text-xs text-gray-400">Green</span>
              </button>
              <button
                onClick={() => updateTheme({
                  accentColor: '#f59e0b',
                  buttonGradientFrom: '#f59e0b',
                  buttonGradientTo: '#ef4444'
                })}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
              >
                <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(to right, #f59e0b, #ef4444)' }}></div>
                <span className="text-xs text-gray-400">Orange</span>
              </button>
            </div>
          </div>

          {/* Reset Theme Button */}
          <div className="pt-4 border-t border-white/[0.06]">
            <Button
              onClick={() => {
                resetTheme();
                toast({
                  title: 'Theme Reset',
                  description: 'Admin theme has been reset to default purple',
                });
              }}
              variant="outline"
              className="w-full border-white/[0.06] text-gray-300 hover:bg-white/[0.04]"
            >
              <RefreshCw size={16} className="mr-2" />
              Reset to Default Purple Theme
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This will restore the default purple color scheme
            </p>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
