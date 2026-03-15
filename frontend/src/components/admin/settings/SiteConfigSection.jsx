import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Globe, Image } from 'lucide-react';

export default function SiteConfigSection({ settings, updateSetting }) {
  return (
    <AccordionItem value="site" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-purple-500" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Site Configuration</h3>
            <p className="text-sm text-gray-400">Branding, colors, and general settings</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Site Name</Label>
            <Input
              value={settings.site.siteName}
              onChange={(e) => updateSetting('site', 'siteName', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Site URL</Label>
            <Input
              data-testid="site-url-input"
              value={settings.site.siteUrl || ''}
              onChange={(e) => updateSetting('site', 'siteUrl', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white"
              placeholder="https://yourdomain.com"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Contact Email</Label>
            <Input
              type="email"
              value={settings.site.contactEmail}
              onChange={(e) => updateSetting('site', 'contactEmail', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Primary Color (Hex)</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.site.primaryColor}
                onChange={(e) => updateSetting('site', 'primaryColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={settings.site.primaryColor}
                onChange={(e) => updateSetting('site', 'primaryColor', e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Copyright Text</Label>
            <Input
              value={settings.site.copyrightText}
              onChange={(e) => updateSetting('site', 'copyrightText', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white"
            />
          </div>

          {/* Logo Upload Section */}
          <div className="space-y-4 md:col-span-2 bg-white/[0.02] p-4 rounded-lg border border-white/[0.06]">
            <div className="flex items-start gap-2">
              <Image className="w-5 h-5 text-purple-500 mt-0.5" />
              <div className="flex-1">
                <Label className="text-gray-300 font-semibold">Site Logo</Label>
                <p className="text-xs text-gray-400 mt-1">
                  Logo displayed in navbar and footer. Leave empty to show site name as text.
                </p>
              </div>
            </div>
            <Input
              value={settings.site.logoUrl || ''}
              onChange={(e) => updateSetting('site', 'logoUrl', e.target.value)}
              placeholder="https://... or upload to Media Library and paste URL"
              className="bg-white/[0.04] border-white/[0.08] text-white"
            />
            {settings.site.logoUrl && (
              <div className="flex items-center gap-4">
                <div className="bg-white/[0.03] p-3 rounded-lg border border-white/[0.06]">
                  <img
                    src={settings.site.logoUrl}
                    alt="Logo Preview"
                    className="h-12 max-w-48 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <button
                  onClick={() => updateSetting('site', 'logoUrl', '')}
                  className="text-red-400 hover:text-red-300 text-sm underline"
                >
                  Remove Logo
                </button>
              </div>
            )}
          </div>

          {/* Favicon Upload Section */}
          <div className="space-y-4 md:col-span-2 bg-white/[0.02] p-4 rounded-lg border border-white/[0.06]">
            <div className="flex items-start gap-2">
              <Image className="w-5 h-5 text-purple-500 mt-0.5" />
              <div className="flex-1">
                <Label className="text-gray-300 font-semibold">Favicon (Browser Tab Icon)</Label>
                <p className="text-xs text-gray-400 mt-1">
                  Small icon shown in browser tabs and bookmarks. Recommended size: 32x32px or 64x64px.
                </p>
              </div>
            </div>
            <Input
              value={settings.site.faviconUrl || ''}
              onChange={(e) => updateSetting('site', 'faviconUrl', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white"
              placeholder="https://... (PNG, ICO, or SVG)"
            />
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Tip:</strong> Upload your favicon to the Media Library and paste the URL here</p>
              <p><strong>Formats:</strong> PNG, ICO, or SVG work best</p>
            </div>
            {settings.site.faviconUrl && (
              <div className="flex items-center gap-4">
                <div className="bg-white/[0.03] p-3 rounded-lg border border-white/[0.06]">
                  <img
                    src={settings.site.faviconUrl}
                    alt="Favicon Preview"
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <button
                  onClick={() => updateSetting('site', 'faviconUrl', '')}
                  className="text-red-400 hover:text-red-300 text-sm underline"
                >
                  Remove Favicon
                </button>
              </div>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
