import React from 'react';
import { Switch } from '../../ui/switch';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Globe } from 'lucide-react';

export default function LanguageSelectorSection({ settings, setSettings }) {
  return (
    <AccordionItem
      value="language-selector"
      className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg"
    >
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-green-500" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Language Selector</h3>
            <p className="text-sm text-gray-400">
              Enable/disable language dropdown for visitors
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2">
        <div className="space-y-6">
          {/* Language Selector Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div>
              <p className="text-white font-medium">Enable Language Selector</p>
              <p className="text-gray-400 text-sm mt-1">
                Show a language dropdown (EN, ES, FR, etc.) in the navigation bar. When disabled, the language selector is hidden.
              </p>
            </div>
            <Switch
              checked={settings?.languageSelectorEnabled || false}
              onCheckedChange={(checked) => {
                setSettings(prev => ({ ...prev, languageSelectorEnabled: checked }));
              }}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex gap-3">
              <Globe className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-300 text-sm font-medium mb-1">How it works</p>
                <p className="text-green-200/70 text-sm">
                  When enabled, a language dropdown with a globe icon will appear in the website navigation, allowing visitors to switch between available languages.
                  When disabled, the language selector is hidden and the site displays in the default language only.
                </p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Current status:</span>
            {settings?.languageSelectorEnabled ? (
              <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                Enabled - Multilingual support active
              </span>
            ) : (
              <span className="px-2 py-1 rounded bg-gray-700 text-gray-300 border border-gray-600">
                Disabled - Default language only
              </span>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
