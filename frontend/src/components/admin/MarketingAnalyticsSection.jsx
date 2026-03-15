import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { 
 
 
  BarChart3, 
  Tag, 
  Code2, 
  Facebook, 
  Linkedin, 
  Twitter,
  Video } from 'lucide-react';

const MarketingAnalyticsSection = ({ settings, updateSetting }) => {
  return (
    <div className="space-y-8">
      {/* Google Tag Manager */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-orange-500/10 rounded-lg">
            <Tag className="w-6 h-6 text-orange-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold text-lg mb-1">Google Tag Manager</h4>
            <p className="text-gray-400 text-sm">
              Manage all your marketing tags in one place. Get your container ID from{' '}
              <a 
                href="https://tagmanager.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Google Tag Manager
              </a>
            </p>
          </div>
          <Switch
            checked={settings?.marketing?.gtmEnabled || false}
            onCheckedChange={(checked) => updateSetting('marketing', 'gtmEnabled', checked)}
          />
        </div>

        {settings?.marketing?.gtmEnabled && (
          <div className="space-y-2 pl-16">
            <Label className="text-gray-300">Container ID</Label>
            <Input
              value={settings?.marketing?.gtmContainerId || ''}
              onChange={(e) => updateSetting('marketing', 'gtmContainerId', e.target.value)}
              placeholder="GTM-XXXXXXX"
              className="bg-gray-800 border-gray-700 text-white font-mono"
            />
            <p className="text-xs text-gray-500">Format: GTM-XXXXXXX</p>
          </div>
        )}
      </div>

      {/* Google Analytics 4 */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold text-lg mb-1">Google Analytics 4</h4>
            <p className="text-gray-400 text-sm">
              Track visitor behavior and site performance. Get your Measurement ID from{' '}
              <a 
                href="https://analytics.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Google Analytics
              </a>
            </p>
          </div>
          <Switch
            checked={settings?.marketing?.ga4Enabled || false}
            onCheckedChange={(checked) => updateSetting('marketing', 'ga4Enabled', checked)}
          />
        </div>

        {settings?.marketing?.ga4Enabled && (
          <div className="space-y-4 pl-16">
            <div className="space-y-2">
              <Label className="text-gray-300">Measurement ID</Label>
              <Input
                value={settings?.marketing?.ga4MeasurementId || ''}
                onChange={(e) => updateSetting('marketing', 'ga4MeasurementId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="bg-gray-800 border-gray-700 text-white font-mono"
              />
              <p className="text-xs text-gray-500">Format: G-XXXXXXXXXX</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div>
                <Label className="text-gray-300 text-sm">Enhanced Measurement</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Track page views, scrolls, outbound clicks, site search, video engagement
                </p>
              </div>
              <Switch
                checked={settings?.marketing?.ga4EnhancedMeasurement || false}
                onCheckedChange={(checked) => updateSetting('marketing', 'ga4EnhancedMeasurement', checked)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Facebook/Meta Pixel */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-600/10 rounded-lg">
            <Facebook className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold text-lg mb-1">Facebook Pixel (Meta)</h4>
            <p className="text-gray-400 text-sm">
              Track conversions and build audiences for Facebook/Instagram ads. Get your Pixel ID from{' '}
              <a 
                href="https://business.facebook.com/events_manager" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Meta Events Manager
              </a>
            </p>
          </div>
          <Switch
            checked={settings?.marketing?.fbPixelEnabled || false}
            onCheckedChange={(checked) => updateSetting('marketing', 'fbPixelEnabled', checked)}
          />
        </div>

        {settings?.marketing?.fbPixelEnabled && (
          <div className="space-y-2 pl-16">
            <Label className="text-gray-300">Pixel ID</Label>
            <Input
              value={settings?.marketing?.fbPixelId || ''}
              onChange={(e) => updateSetting('marketing', 'fbPixelId', e.target.value)}
              placeholder="1234567890123456"
              className="bg-gray-800 border-gray-700 text-white font-mono"
            />
            <p className="text-xs text-gray-500">16-digit number</p>
          </div>
        )}
      </div>

      {/* LinkedIn Insight Tag */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-700/10 rounded-lg">
            <Linkedin className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold text-lg mb-1">LinkedIn Insight Tag</h4>
            <p className="text-gray-400 text-sm">
              Track conversions and build audiences for LinkedIn ads. Get your Partner ID from{' '}
              <a 
                href="https://www.linkedin.com/campaignmanager" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                LinkedIn Campaign Manager
              </a>
            </p>
          </div>
          <Switch
            checked={settings?.marketing?.linkedinEnabled || false}
            onCheckedChange={(checked) => updateSetting('marketing', 'linkedinEnabled', checked)}
          />
        </div>

        {settings?.marketing?.linkedinEnabled && (
          <div className="space-y-2 pl-16">
            <Label className="text-gray-300">Partner ID</Label>
            <Input
              value={settings?.marketing?.linkedinPartnerId || ''}
              onChange={(e) => updateSetting('marketing', 'linkedinPartnerId', e.target.value)}
              placeholder="1234567"
              className="bg-gray-800 border-gray-700 text-white font-mono"
            />
          </div>
        )}
      </div>

      {/* Twitter/X Pixel */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-gray-700/10 rounded-lg">
            <Twitter className="w-6 h-6 text-gray-300" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold text-lg mb-1">Twitter/X Pixel</h4>
            <p className="text-gray-400 text-sm">
              Track conversions for Twitter/X ads. Get your Pixel ID from{' '}
              <a 
                href="https://ads.twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Twitter Ads
              </a>
            </p>
          </div>
          <Switch
            checked={settings?.marketing?.twitterPixelEnabled || false}
            onCheckedChange={(checked) => updateSetting('marketing', 'twitterPixelEnabled', checked)}
          />
        </div>

        {settings?.marketing?.twitterPixelEnabled && (
          <div className="space-y-2 pl-16">
            <Label className="text-gray-300">Pixel ID</Label>
            <Input
              value={settings?.marketing?.twitterPixelId || ''}
              onChange={(e) => updateSetting('marketing', 'twitterPixelId', e.target.value)}
              placeholder="o1234"
              className="bg-gray-800 border-gray-700 text-white font-mono"
            />
          </div>
        )}
      </div>

      {/* TikTok Pixel */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-pink-500/10 rounded-lg">
            <Video className="w-6 h-6 text-pink-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold text-lg mb-1">TikTok Pixel</h4>
            <p className="text-gray-400 text-sm">
              Track conversions for TikTok ads. Get your Pixel ID from{' '}
              <a 
                href="https://ads.tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                TikTok Ads Manager
              </a>
            </p>
          </div>
          <Switch
            checked={settings?.marketing?.tiktokPixelEnabled || false}
            onCheckedChange={(checked) => updateSetting('marketing', 'tiktokPixelEnabled', checked)}
          />
        </div>

        {settings?.marketing?.tiktokPixelEnabled && (
          <div className="space-y-2 pl-16">
            <Label className="text-gray-300">Pixel ID</Label>
            <Input
              value={settings?.marketing?.tiktokPixelId || ''}
              onChange={(e) => updateSetting('marketing', 'tiktokPixelId', e.target.value)}
              placeholder="C9XXXXXXXXXXXXXXXXXXXXX"
              className="bg-gray-800 border-gray-700 text-white font-mono"
            />
          </div>
        )}
      </div>

      {/* Custom Scripts */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-violet-500/10 rounded-lg">
            <Code2 className="w-6 h-6 text-violet-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold text-lg mb-1">Custom Scripts</h4>
            <p className="text-gray-400 text-sm">
              Add custom JavaScript/HTML code for third-party tools and tracking pixels
            </p>
          </div>
        </div>

        <div className="space-y-6 pl-16">
          <div className="space-y-2">
            <Label className="text-gray-300">Header Scripts (before &lt;/head&gt;)</Label>
            <Textarea
              value={settings?.marketing?.customHeadScripts || ''}
              onChange={(e) => updateSetting('marketing', 'customHeadScripts', e.target.value)}
              placeholder="<!-- Your custom scripts here -->"
              className="bg-gray-800 border-gray-700 text-white font-mono text-xs"
              rows={6}
            />
            <p className="text-xs text-gray-500">
              💡 Use for meta tags, fonts, or scripts that need to load early
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Body Start Scripts (after &lt;body&gt;)</Label>
            <Textarea
              value={settings?.marketing?.customBodyStartScripts || ''}
              onChange={(e) => updateSetting('marketing', 'customBodyStartScripts', e.target.value)}
              placeholder="<!-- Your custom scripts here -->"
              className="bg-gray-800 border-gray-700 text-white font-mono text-xs"
              rows={6}
            />
            <p className="text-xs text-gray-500">
              💡 Use for tracking pixels that need to load immediately
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Footer Scripts (before &lt;/body&gt;)</Label>
            <Textarea
              value={settings?.marketing?.customFooterScripts || ''}
              onChange={(e) => updateSetting('marketing', 'customFooterScripts', e.target.value)}
              placeholder="<!-- Your custom scripts here -->"
              className="bg-gray-800 border-gray-700 text-white font-mono text-xs"
              rows={6}
            />
            <p className="text-xs text-gray-500">
              💡 Use for analytics, chat widgets, or scripts that can load last
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">JSON-LD Structured Data</Label>
            <Textarea
              value={settings?.marketing?.jsonLdSchema || ''}
              onChange={(e) => updateSetting('marketing', 'jsonLdSchema', e.target.value)}
              placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Person",\n  "name": "Your Name"\n}'}
              className="bg-gray-800 border-gray-700 text-white font-mono text-xs"
              rows={8}
            />
            <p className="text-xs text-gray-500">
              💡 Add Schema.org structured data for better SEO. Use{' '}
              <a 
                href="https://schema.org/Person" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Schema.org
              </a>
              {' '}for examples
            </p>
          </div>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="text-yellow-500 text-xl">⚠️</div>
          <div>
            <p className="text-yellow-400 font-medium text-sm mb-1">Important Notes</p>
            <ul className="text-gray-400 text-xs space-y-1 list-disc list-inside">
              <li>Only add scripts from trusted sources to avoid security risks</li>
              <li>Test your site after adding custom scripts to ensure they work correctly</li>
              <li>Some tracking pixels may impact page load speed</li>
              <li>Remember to update your privacy policy when adding tracking pixels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingAnalyticsSection;
