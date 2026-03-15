import React from 'react';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Code } from 'lucide-react';

export default function AdvancedSection({ settings, updateSetting, updateArraySetting }) {
  return (
    <AccordionItem
      value="advanced"
      className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg"
    >
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center gap-3">
          <Code className="w-5 h-5 text-purple-500" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Advanced Settings</h3>
            <p className="text-sm text-gray-400">
              Custom code, maintenance mode, and debugging
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Preconnect Domains (one per line)</Label>
            <Textarea
              value={settings.advanced.preconnectDomains.join('\n')}
              onChange={(e) =>
                updateArraySetting('advanced', 'preconnectDomains', e.target.value)
              }
              className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Custom CSS</Label>
            <Textarea
              value={settings.advanced.customCSS}
              onChange={(e) => updateSetting('advanced', 'customCSS', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
              rows={6}
              placeholder="/* Your custom CSS */"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Custom JavaScript</Label>
            <Textarea
              value={settings.advanced.customJS}
              onChange={(e) => updateSetting('advanced', 'customJS', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
              rows={6}
              placeholder="// Your custom JavaScript"
            />
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Maintenance Mode</Label>
                <p className="text-xs text-gray-500">Show maintenance page to visitors</p>
              </div>
              <Switch
                checked={settings.advanced.maintenanceMode}
                onCheckedChange={(checked) =>
                  updateSetting('advanced', 'maintenanceMode', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Debug Mode</Label>
                <p className="text-xs text-gray-500">Enable debug logging</p>
              </div>
              <Switch
                checked={settings.advanced.debugMode}
                onCheckedChange={(checked) => updateSetting('advanced', 'debugMode', checked)}
              />
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
