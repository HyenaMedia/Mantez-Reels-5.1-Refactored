import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';

export default function CookieBannerSection({ settings, updateSetting }) {
  return (
    <AccordionItem
      value="cookieBanner"
      className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg"
    >
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center gap-3">
          <span className="text-xl">🍪</span>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Cookie Banner</h3>
            <p className="text-sm text-gray-400">
              Customize cookie consent banner appearance
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2">
        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
            <div>
              <Label className="text-gray-300 font-semibold">Enable Cookie Banner</Label>
              <p className="text-xs text-gray-500 mt-1">
                Show cookie consent banner to visitors
              </p>
            </div>
            <Switch
              checked={settings.cookieBanner?.enabled ?? true}
              onCheckedChange={(checked) =>
                updateSetting('cookieBanner', 'enabled', checked)
              }
            />
          </div>

          {/* Banner Colors */}
          <div className="space-y-4">
            <h4 className="text-white font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
              Banner Colors
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.cookieBanner?.backgroundColor || '#111827'}
                    onChange={(e) => updateSetting('cookieBanner', 'backgroundColor', e.target.value)}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cookieBanner?.backgroundColor || '#111827'}
                    onChange={(e) => updateSetting('cookieBanner', 'backgroundColor', e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Heading Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.cookieBanner?.headingColor || '#ffffff'}
                    onChange={(e) => updateSetting('cookieBanner', 'headingColor', e.target.value)}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cookieBanner?.headingColor || '#ffffff'}
                    onChange={(e) => updateSetting('cookieBanner', 'headingColor', e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.cookieBanner?.textColor || '#9ca3af'}
                    onChange={(e) => updateSetting('cookieBanner', 'textColor', e.target.value)}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cookieBanner?.textColor || '#9ca3af'}
                    onChange={(e) => updateSetting('cookieBanner', 'textColor', e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Accept Button Colors */}
          <div className="space-y-4">
            <h4 className="text-white font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              Accept Button
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Button Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.cookieBanner?.acceptButtonColor || '#9333ea'}
                    onChange={(e) => updateSetting('cookieBanner', 'acceptButtonColor', e.target.value)}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cookieBanner?.acceptButtonColor || '#9333ea'}
                    onChange={(e) => updateSetting('cookieBanner', 'acceptButtonColor', e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Button Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.cookieBanner?.acceptButtonTextColor || '#ffffff'}
                    onChange={(e) => updateSetting('cookieBanner', 'acceptButtonTextColor', e.target.value)}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cookieBanner?.acceptButtonTextColor || '#ffffff'}
                    onChange={(e) => updateSetting('cookieBanner', 'acceptButtonTextColor', e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reject Button Colors */}
          <div className="space-y-4">
            <h4 className="text-white font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              Reject Button
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Button Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.cookieBanner?.rejectButtonColor || '#374151'}
                    onChange={(e) => updateSetting('cookieBanner', 'rejectButtonColor', e.target.value)}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cookieBanner?.rejectButtonColor || '#374151'}
                    onChange={(e) => updateSetting('cookieBanner', 'rejectButtonColor', e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Button Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.cookieBanner?.rejectButtonTextColor || '#ffffff'}
                    onChange={(e) => updateSetting('cookieBanner', 'rejectButtonTextColor', e.target.value)}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cookieBanner?.rejectButtonTextColor || '#ffffff'}
                    onChange={(e) => updateSetting('cookieBanner', 'rejectButtonTextColor', e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Colors */}
          <div className="space-y-4">
            <h4 className="text-white font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Toggle Switch Colors
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Active (On) Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.cookieBanner?.toggleActiveColor || '#9333ea'}
                    onChange={(e) => updateSetting('cookieBanner', 'toggleActiveColor', e.target.value)}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cookieBanner?.toggleActiveColor || '#9333ea'}
                    onChange={(e) => updateSetting('cookieBanner', 'toggleActiveColor', e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Inactive (Off) Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.cookieBanner?.toggleInactiveColor || '#4b5563'}
                    onChange={(e) => updateSetting('cookieBanner', 'toggleInactiveColor', e.target.value)}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cookieBanner?.toggleInactiveColor || '#4b5563'}
                    onChange={(e) => updateSetting('cookieBanner', 'toggleInactiveColor', e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3 pt-4 border-t border-white/[0.06]">
            <h4 className="text-white font-medium">Preview</h4>
            <div
              className="p-4 rounded-xl border border-gray-600"
              style={{ backgroundColor: settings.cookieBanner?.backgroundColor || '#111827' }}
            >
              <p
                className="text-sm font-medium mb-1"
                style={{ color: settings.cookieBanner?.headingColor || '#ffffff' }}
              >
                Cookie Settings
              </p>
              <p
                className="text-xs mb-3"
                style={{ color: settings.cookieBanner?.textColor || '#9ca3af' }}
              >
                We use cookies to enhance your experience.
              </p>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 rounded text-xs border"
                  style={{
                    borderColor: settings.cookieBanner?.manageButtonBorderColor || '#4b5563',
                    color: settings.cookieBanner?.manageButtonTextColor || '#d1d5db'
                  }}
                >
                  Manage Cookies
                </button>
                <button
                  className="px-3 py-1.5 rounded text-xs"
                  style={{
                    backgroundColor: settings.cookieBanner?.rejectButtonColor || '#374151',
                    color: settings.cookieBanner?.rejectButtonTextColor || '#ffffff'
                  }}
                >
                  Reject All
                </button>
                <button
                  className="px-3 py-1.5 rounded text-xs"
                  style={{
                    backgroundColor: settings.cookieBanner?.acceptButtonColor || '#9333ea',
                    color: settings.cookieBanner?.acceptButtonTextColor || '#ffffff'
                  }}
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
