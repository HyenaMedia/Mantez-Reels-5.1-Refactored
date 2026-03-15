import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Zap } from 'lucide-react';

export default function PerformanceSection({ settings, updateSetting }) {
  return (
    <AccordionItem
      value="performance"
      className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg"
    >
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-purple-500" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Performance Settings</h3>
            <p className="text-sm text-gray-400">
              Cache duration, compression, and optimization
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Static Assets Cache (seconds)</Label>
            <Input
              type="number"
              value={settings.performance.cacheStaticAssets}
              onChange={(e) =>
                updateSetting('performance', 'cacheStaticAssets', parseInt(e.target.value))
              }
              className="bg-white/[0.04] border-white/[0.08] text-white"
            />
            <p className="text-xs text-gray-500">31536000 = 1 year (recommended)</p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Media Cache (seconds)</Label>
            <Input
              type="number"
              value={settings.performance.cacheMedia}
              onChange={(e) =>
                updateSetting('performance', 'cacheMedia', parseInt(e.target.value))
              }
              className="bg-white/[0.04] border-white/[0.08] text-white"
            />
            <p className="text-xs text-gray-500">604800 = 1 week (recommended)</p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">GZip Compression Level</Label>
            <Input
              type="number"
              min="1"
              max="9"
              value={settings.performance.gzipLevel}
              onChange={(e) =>
                updateSetting('performance', 'gzipLevel', parseInt(e.target.value))
              }
              className="bg-white/[0.04] border-white/[0.08] text-white"
            />
            <p className="text-xs text-gray-500">1-9 (6 recommended for balance)</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">GZip Enabled</Label>
              <Switch
                checked={settings.performance.gzipEnabled}
                onCheckedChange={(checked) =>
                  updateSetting('performance', 'gzipEnabled', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Image Lazy Loading</Label>
              <Switch
                checked={settings.performance.imageLazyLoad}
                onCheckedChange={(checked) =>
                  updateSetting('performance', 'imageLazyLoad', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Code Splitting</Label>
              <Switch
                checked={settings.performance.codeSplitting}
                onCheckedChange={(checked) =>
                  updateSetting('performance', 'codeSplitting', checked)
                }
              />
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
