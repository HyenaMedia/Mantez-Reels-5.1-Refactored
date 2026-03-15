import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Activity } from 'lucide-react';
import MarketingAnalyticsSection from '../MarketingAnalyticsSection';

export default function MarketingSection({ settings, updateSetting }) {
  return (
    <AccordionItem value="marketing" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-purple-400" />
          <div className="text-left">
            <div className="text-lg font-semibold text-white">Marketing & Analytics</div>
            <div className="text-sm text-gray-400 font-normal">
              Google Tag Manager, Analytics, Pixels, and Custom Scripts
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <MarketingAnalyticsSection settings={settings} updateSetting={updateSetting} />
      </AccordionContent>
    </AccordionItem>
  );
}
