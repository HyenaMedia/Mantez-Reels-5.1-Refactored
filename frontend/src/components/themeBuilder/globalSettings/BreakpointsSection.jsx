import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { LayoutGrid, Smartphone, Tablet, Monitor, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';

/* ── Shared helpers ──────────────────────────────────────────────── */

const Section = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-gray-500" />}
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{title}</span>
        </div>
        {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-gray-600 dark:text-gray-400">{label}</Label>
    {children}
  </div>
);

/* ── Constants ───────────────────────────────────────────────────── */

const DEFAULT_BREAKPOINTS = {
  mobile:  { label: 'Mobile',  max: 767,  icon: 'smartphone' },
  tablet:  { label: 'Tablet',  min: 768,  max: 1199, icon: 'tablet' },
  desktop: { label: 'Desktop', min: 1200, icon: 'monitor' },
};

const BREAKPOINT_ICONS = { smartphone: Smartphone, tablet: Tablet, monitor: Monitor };

/* ── Main component ──────────────────────────────────────────────── */

const BreakpointsSection = ({ breakpoints, setBreakpoint, resetBreakpoints }) => {
  return (
    <Section title="Responsive Breakpoints" icon={LayoutGrid} defaultOpen={false}>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        Set the pixel thresholds where layouts switch between mobile, tablet, and desktop views.
      </p>

      <div className="space-y-3 mt-1">
        {Object.entries(DEFAULT_BREAKPOINTS).map(([device, defaults]) => {
          const bp = breakpoints[device] || defaults;
          const IconComp = BREAKPOINT_ICONS[defaults.icon];
          const isCustomized = JSON.stringify(bp) !== JSON.stringify(defaults);
          return (
            <div key={device} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComp size={13} className="text-gray-500" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{device}</span>
                  {isCustomized && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full">custom</span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  {device === 'mobile'  && `\u2264 ${bp.max ?? defaults.max}px`}
                  {device === 'tablet'  && `${bp.min ?? defaults.min}\u2013${bp.max ?? defaults.max}px`}
                  {device === 'desktop' && `\u2265 ${bp.min ?? defaults.min}px`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {device !== 'desktop' && (
                  <Field label="Max width (px)">
                    <Input
                      type="number"
                      value={bp.max ?? defaults.max ?? ''}
                      onChange={e => setBreakpoint(device, 'max', e.target.value)}
                      placeholder={String(defaults.max)}
                      min={320} max={2560}
                      className="h-7 text-xs"
                    />
                  </Field>
                )}
                {device !== 'mobile' && (
                  <Field label="Min width (px)">
                    <Input
                      type="number"
                      value={bp.min ?? defaults.min ?? ''}
                      onChange={e => setBreakpoint(device, 'min', e.target.value)}
                      placeholder={String(defaults.min)}
                      min={320} max={2560}
                      className="h-7 text-xs"
                    />
                  </Field>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual scale */}
      <div className="mt-3">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Breakpoint Scale</p>
        <div className="relative h-6 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {(() => {
            const mobileMax = breakpoints.mobile?.max ?? 767;
            const desktopMin = breakpoints.desktop?.min ?? 1200;
            const total = 1440;
            const mobileW = Math.round((mobileMax / total) * 100);
            const tabletW = Math.round(((desktopMin - mobileMax) / total) * 100);
            const desktopW = 100 - mobileW - tabletW;
            return (
              <>
                <div className="absolute left-0 top-0 h-full bg-blue-300 dark:bg-blue-700/60 flex items-center justify-center" style={{ width: `${mobileW}%` }}>
                  <span className="text-[9px] font-medium text-blue-800 dark:text-blue-200 truncate px-1">Mobile</span>
                </div>
                <div className="absolute top-0 h-full bg-indigo-300 dark:bg-indigo-700/60 flex items-center justify-center" style={{ left: `${mobileW}%`, width: `${tabletW}%` }}>
                  <span className="text-[9px] font-medium text-indigo-800 dark:text-indigo-200 truncate px-1">Tablet</span>
                </div>
                <div className="absolute top-0 h-full bg-violet-300 dark:bg-violet-700/60 flex items-center justify-center" style={{ left: `${mobileW + tabletW}%`, width: `${desktopW}%` }}>
                  <span className="text-[9px] font-medium text-violet-800 dark:text-violet-200 truncate px-1">Desktop</span>
                </div>
              </>
            );
          })()}
        </div>
        <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
          <span>0px</span>
          <span>{breakpoints.mobile?.max ?? 767}px</span>
          <span>{breakpoints.desktop?.min ?? 1200}px</span>
          <span>1440px+</span>
        </div>
      </div>

      <Button variant="ghost" size="sm" className="w-full text-xs text-gray-500 mt-1" onClick={resetBreakpoints}>
        <RotateCcw size={12} className="mr-1" />Reset to defaults
      </Button>
    </Section>
  );
};

export { DEFAULT_BREAKPOINTS };
export default BreakpointsSection;
