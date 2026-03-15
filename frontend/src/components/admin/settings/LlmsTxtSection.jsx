import React from 'react';
import { Textarea } from '../../ui/textarea';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Bot } from 'lucide-react';

export default function LlmsTxtSection({ settings, updateSetting }) {
  return (
    <AccordionItem value="llms" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-purple-500" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">llms.txt</h3>
            <p className="text-sm text-gray-400">Help AI answer engines understand your site — served at /llms.txt</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2">
        <div className="space-y-3">
          <p className="text-xs text-purple-300/80 bg-purple-500/10 border border-purple-500/20 rounded-md px-3 py-2">
            <strong className="text-purple-200">New 2025 standard.</strong> When ChatGPT, Perplexity, Claude, or Gemini crawl your site, they read /llms.txt to understand who you are and what content they can reference in answers. Use Markdown format.
          </p>
          <Textarea
            data-testid="llms-txt-editor"
            value={settings.seoFiles?.llmsTxt || ''}
            onChange={(e) => updateSetting('seoFiles', 'llmsTxt', e.target.value)}
            className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-xs"
            rows={18}
            spellCheck={false}
          />
          <div className="flex gap-2">
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 underline"
            >
              Preview /llms.txt
            </a>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
