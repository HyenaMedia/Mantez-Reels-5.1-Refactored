import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Activity } from 'lucide-react';

export default function SiteFeaturesSection({ settings, updateSetting }) {
  return (
    <AccordionItem value="site-features" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-cyan-400" />
          <div className="text-left">
            <div className="text-lg font-semibold text-white">Site Features & UI Elements</div>
            <div className="text-sm text-gray-400 font-normal">
              Configure site-wide UI elements and visual features
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          <p className="text-sm text-gray-400">
            Control global UI elements that appear across your site. These are utility components that enhance user experience.
          </p>

          {/* Scroll Progress Bar */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Scroll Progress Indicator</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Activity className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Enable Scroll Progress Bar</p>
                    <p className="text-xs text-gray-400">Shows progress bar at top of page while scrolling</p>
                  </div>
                </div>
                <Switch
                  checked={settings?.siteFeatures?.scrollProgress?.enabled ?? true}
                  onCheckedChange={(checked) => updateSetting('siteFeatures.scrollProgress.enabled', checked)}
                />
              </div>

              {settings?.siteFeatures?.scrollProgress?.enabled !== false && (
                <>
                  <div className="p-4 bg-gray-800/30 rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="scrollProgressColor" className="text-white">Bar Color</Label>
                      <Input
                        id="scrollProgressColor"
                        type="color"
                        value={settings?.siteFeatures?.scrollProgress?.color || '#a855f7'}
                        onChange={(e) => updateSetting('siteFeatures.scrollProgress.color', e.target.value)}
                        className="h-10 w-20"
                      />
                      <p className="text-xs text-gray-500">Color of the progress bar</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scrollProgressHeight" className="text-white">Bar Height (px)</Label>
                      <Input
                        id="scrollProgressHeight"
                        type="number"
                        min="1"
                        max="10"
                        value={settings?.siteFeatures?.scrollProgress?.height || 3}
                        onChange={(e) => updateSetting('siteFeatures.scrollProgress.height', parseInt(e.target.value))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <p className="text-xs text-gray-500">Height in pixels (1-10)</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Position at Bottom</p>
                        <p className="text-xs text-gray-400">Show progress bar at bottom instead of top</p>
                      </div>
                      <Switch
                        checked={settings?.siteFeatures?.scrollProgress?.bottom ?? false}
                        onCheckedChange={(checked) => updateSetting('siteFeatures.scrollProgress.bottom', checked)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 p-4">
            <p className="text-sm text-cyan-300">
              <strong>Tip:</strong> More site features will be added here as we build them (floating action button, back-to-top, etc.)
            </p>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
