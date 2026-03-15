import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Image } from 'lucide-react';

export default function MediaSettingsSection({ settings, updateSetting, updateArraySetting }) {
  return (
    <AccordionItem value="media" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center gap-3">
          <Image className="w-5 h-5 text-purple-500" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Media Settings</h3>
            <p className="text-sm text-gray-400">Upload limits and optimization preferences</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Max Upload Size (MB)</Label>
            <Input
              type="number"
              value={settings.media.maxUploadSizeMB}
              onChange={(e) =>
                updateSetting('media', 'maxUploadSizeMB', parseInt(e.target.value))
              }
              className="bg-white/[0.04] border-white/[0.08] text-white"
            />
            <p className="text-xs text-gray-500">10 MB recommended</p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Image Quality (1-100)</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={settings.media.imageQuality}
              onChange={(e) => updateSetting('media', 'imageQuality', parseInt(e.target.value))}
              className="bg-white/[0.04] border-white/[0.08] text-white"
            />
            <p className="text-xs text-gray-500">80 recommended</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-gray-300">Allowed File Types (one per line)</Label>
            <Textarea
              value={settings.media.allowedFileTypes.join('\n')}
              onChange={(e) => updateArraySetting('media', 'allowedFileTypes', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white"
              rows={5}
            />
          </div>

          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
              <div>
                <Label className="text-gray-300 font-semibold">Auto Optimize Images</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Automatically convert to WebP & compress images on upload
                </p>
              </div>
              <Switch
                checked={settings.media.autoOptimizeImages}
                onCheckedChange={(checked) =>
                  updateSetting('media', 'autoOptimizeImages', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
              <div>
                <Label className="text-gray-300 font-semibold">Auto Optimize Videos</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Automatically optimize videos for web delivery
                </p>
              </div>
              <Switch
                checked={settings.media.autoOptimizeVideos}
                onCheckedChange={(checked) =>
                  updateSetting('media', 'autoOptimizeVideos', checked)
                }
              />
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
