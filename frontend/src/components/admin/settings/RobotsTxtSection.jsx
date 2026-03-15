import React from 'react';
import { Textarea } from '../../ui/textarea';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { FileText } from 'lucide-react';

export default function RobotsTxtSection({ settings, updateSetting }) {
  return (
    <AccordionItem value="robots" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-purple-500" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">robots.txt</h3>
            <p className="text-sm text-gray-400">Control which crawlers can index your site — served at /robots.txt</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2">
        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            Changes are live immediately. The default allows all beneficial AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) while blocking the admin area.
          </p>
          <Textarea
            data-testid="robots-txt-editor"
            value={settings.seoFiles?.robotsTxt || ''}
            onChange={(e) => updateSetting('seoFiles', 'robotsTxt', e.target.value)}
            className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-xs"
            rows={18}
            spellCheck={false}
          />
          <div className="flex gap-2">
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 underline"
            >
              Preview /robots.txt
            </a>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
