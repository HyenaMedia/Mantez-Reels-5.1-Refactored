import React from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Search, Image, RefreshCw } from 'lucide-react';

export default function SeoSection({ settings, updateSetting, generatingSitemap, onGenerateSitemap }) {
  return (
    <AccordionItem value="seo" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-purple-500" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">SEO & Meta Settings</h3>
            <p className="text-sm text-gray-400">
              Search engine optimization and social sharing
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Site Title</Label>
            <Input
              value={settings.seo.siteTitle}
              onChange={(e) => updateSetting('seo', 'siteTitle', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white"
              placeholder="Mantez Reels"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Meta Description</Label>
            <Textarea
              value={settings.seo.metaDescription}
              onChange={(e) => updateSetting('seo', 'metaDescription', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white"
              placeholder="Professional videographer portfolio..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Meta Keywords</Label>
            <Input
              value={settings.seo.metaKeywords}
              onChange={(e) => updateSetting('seo', 'metaKeywords', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white"
              placeholder="videographer, photography, video production"
            />
          </div>

          <div className="space-y-4 bg-white/[0.02] p-4 rounded-lg border border-white/[0.06]">
            <div className="flex items-start gap-2">
              <Image className="w-5 h-5 text-purple-500 mt-0.5" />
              <div className="flex-1">
                <Label className="text-gray-300 font-semibold">
                  Open Graph Image (Social Sharing)
                </Label>
                <p className="text-xs text-gray-400 mt-1">
                  This image appears when your website link is shared on social media platforms
                  like Facebook, Twitter, LinkedIn, WhatsApp, etc.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Input
                value={settings.seo.ogImage}
                onChange={(e) => updateSetting('seo', 'ogImage', e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white"
                placeholder="https://images.unsplash.com/photo-xxx or upload to Media tab"
              />
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <strong>Recommended:</strong> 1200x630px (1.91:1 ratio)
                </p>
                <p>
                  <strong>Tip:</strong> Upload an image to the Media tab and paste the URL
                  here, or use any image URL
                </p>
                <p>
                  <strong>Best Practice:</strong> Use branded image with your logo and
                  portfolio work
                </p>
              </div>
            </div>

            {/* Image Preview */}
            {settings.seo.ogImage && (
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Preview:</Label>
                <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-white/[0.02]">
                  <img
                    src={settings.seo.ogImage}
                    alt="OG Image Preview"
                    className="w-full h-auto max-h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div
                    style={{ display: 'none' }}
                    className="p-4 text-center text-gray-500 text-sm"
                  >
                    Failed to load image. Check if the URL is valid.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">OG Description</Label>
            <Textarea
              value={settings.seo.ogDescription}
              onChange={(e) => updateSetting('seo', 'ogDescription', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white"
              placeholder="Description for social media sharing..."
              rows={2}
            />
          </div>

          {/* Sitemap Generator */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-semibold text-white">Sitemap Generator</h4>
            </div>
            <p className="text-xs text-gray-400">
              Generate a fresh sitemap.xml including all published portfolio items. Download and place it in your domain root.
            </p>
            <Button
              data-testid="generate-sitemap-btn"
              onClick={onGenerateSitemap}
              disabled={generatingSitemap}
              variant="outline"
              size="sm"
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              {generatingSitemap ? (
                <><RefreshCw className="w-3 h-3 mr-2 animate-spin" />Generating...</>
              ) : (
                <><RefreshCw className="w-3 h-3 mr-2" />Generate &amp; Download Sitemap</>
              )}
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
