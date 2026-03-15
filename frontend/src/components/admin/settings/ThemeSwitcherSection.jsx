import React from 'react';
import { Switch } from '../../ui/switch';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Globe, Activity } from 'lucide-react';

export default function ThemeSwitcherSection({ settings, setSettings }) {
  return (
    <AccordionItem
      value="theme-switcher"
      className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg"
    >
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-500" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Website Theme Switcher</h3>
            <p className="text-sm text-gray-400">
              Enable/disable light/dark mode toggle for visitors
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2">
        <div className="space-y-6">
          {/* Theme Switcher Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div>
              <p className="text-white font-medium">Enable Theme Switcher</p>
              <p className="text-gray-400 text-sm mt-1">
                Allow visitors to toggle between light and dark mode. When disabled, the site will only display in dark mode.
              </p>
            </div>
            <Switch
              checked={settings?.themeSwitcherEnabled || false}
              onCheckedChange={(checked) => {
                setSettings(prev => ({ ...prev, themeSwitcherEnabled: checked }));
              }}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex gap-3">
              <Activity className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 text-sm font-medium mb-1">How it works</p>
                <p className="text-blue-200/70 text-sm">
                  When enabled, a sun/moon toggle button will appear in the website navigation, allowing visitors to switch between light and dark themes.
                  When disabled, the toggle is hidden and the site remains in dark mode only.
                </p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Current status:</span>
            {settings?.themeSwitcherEnabled ? (
              <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                Enabled - Visitors can toggle themes
              </span>
            ) : (
              <span className="px-2 py-1 rounded bg-gray-700 text-gray-300 border border-gray-600">
                Disabled - Dark mode only
              </span>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
