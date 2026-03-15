import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Share2, Link } from 'lucide-react';

export default function SocialProfilesSection({ settings, updateSetting }) {
  return (
    <AccordionItem value="social" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center gap-3">
          <Share2 className="w-5 h-5 text-purple-500" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Social Profiles</h3>
            <p className="text-sm text-gray-400">Linked in JSON-LD structured data for AI &amp; search discoverability</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2">
        <div className="space-y-2 mb-3">
          <p className="text-xs text-purple-300/80 bg-purple-500/10 border border-purple-500/20 rounded-md px-3 py-2">
            These links power the <code className="text-purple-300">sameAs</code> field in your Schema.org Person markup — helping AI platforms (ChatGPT, Perplexity, Gemini) and Google Knowledge Graph recognise your identity across the web.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
            { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
            { key: 'vimeo', label: 'Vimeo', placeholder: 'https://vimeo.com/yourprofile' },
            { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourhandle' },
            { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourname' },
            { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/yourhandle' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1">
              <Label className="text-gray-300 flex items-center gap-2">
                <Link className="w-3 h-3 text-gray-500" />
                {label}
              </Label>
              <Input
                data-testid={`social-${key}-input`}
                value={settings.social?.[key] || ''}
                onChange={(e) => updateSetting('social', key, e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white text-sm"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
