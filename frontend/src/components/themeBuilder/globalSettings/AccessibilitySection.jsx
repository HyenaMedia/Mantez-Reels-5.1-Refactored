import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Accessibility, ChevronDown, ChevronRight } from 'lucide-react';
import { contrastRatio, wcagLevel } from '../../../utils/colorUtils';

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

/* ── Main component ──────────────────────────────────────────────── */

const AccessibilitySection = ({ colors, meta, pageState, updatePageState }) => {
  return (
    <Section title="Accessibility" icon={Accessibility} defaultOpen={false}>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        WCAG contrast checker for your brand color palette.
      </p>

      {/* Contrast pairs */}
      {(() => {
        const pairs = [
          { label: 'Primary on White',       fg: colors.primary  || '#8b5cf6', bg: '#ffffff' },
          { label: 'Primary on Black',       fg: colors.primary  || '#8b5cf6', bg: '#000000' },
          { label: 'Secondary on White',     fg: colors.secondary || '#7c3aed', bg: '#ffffff' },
          { label: 'Accent on Primary',      fg: colors.accent   || '#a855f7', bg: colors.primary || '#8b5cf6' },
          { label: 'White on Primary',       fg: '#ffffff',                    bg: colors.primary || '#8b5cf6' },
          { label: 'Black on Primary',       fg: '#000000',                    bg: colors.primary || '#8b5cf6' },
        ];
        return (
          <div className="space-y-2 mt-1">
            {pairs.map(({ label, fg, bg }) => {
              const ratio = contrastRatio(fg, bg);
              const level = wcagLevel(ratio);
              const levelLarge = wcagLevel(ratio, 'large');
              const pass = level !== 'fail';
              return (
                <div key={label} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  {/* Color preview */}
                  <div
                    className="w-10 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: bg, color: fg }}
                  >
                    Aa
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{label}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{ratio.toFixed(2)}:1</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      level === 'AAA' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      level === 'AA'  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {level === 'fail' ? '\u2717 Fail' : `\u2713 ${level}`}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium opacity-60 ${
                      levelLarge !== 'fail' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                              'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`} title="Large text">
                      Lg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* WCAG legend */}
      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-[10px] text-gray-500 dark:text-gray-400 space-y-0.5">
        <p><span className="font-semibold text-blue-600 dark:text-blue-400">AA</span> — 4.5:1 (normal text), 3:1 (large text)</p>
        <p><span className="font-semibold text-green-600 dark:text-green-400">AAA</span> — 7:1 (normal text), 4.5:1 (large text)</p>
      </div>

      {/* Motion preferences */}
      <div className="mt-3 space-y-2">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Motion Preferences</p>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!meta?.settings?.accessibility?.respectReducedMotion}
            onChange={e => updatePageState({
              page: { ...pageState.page, meta: {
                ...meta, settings: { ...meta.settings, accessibility: {
                  ...(meta?.settings?.accessibility || {}), respectReducedMotion: e.target.checked
                }}
              }}
            })}
            className="mt-0.5 rounded"
          />
          <div>
            <p className="text-xs text-gray-700 dark:text-gray-300">Respect prefers-reduced-motion</p>
            <p className="text-[10px] text-gray-400">Disable animations for users who prefer reduced motion</p>
          </div>
        </label>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!meta?.settings?.accessibility?.forceFocusVisible}
            onChange={e => updatePageState({
              page: { ...pageState.page, meta: {
                ...meta, settings: { ...meta.settings, accessibility: {
                  ...(meta?.settings?.accessibility || {}), forceFocusVisible: e.target.checked
                }}
              }}
            })}
            className="mt-0.5 rounded"
          />
          <div>
            <p className="text-xs text-gray-700 dark:text-gray-300">Force focus indicators</p>
            <p className="text-[10px] text-gray-400">Always show focus rings for keyboard navigation</p>
          </div>
        </label>
      </div>

      {/* Minimum font size */}
      <div className="mt-2">
        <Field label="Minimum font size (px)">
          <Input
            type="number"
            value={meta?.settings?.accessibility?.minFontSize ?? 14}
            onChange={e => updatePageState({
              page: { ...pageState.page, meta: {
                ...meta, settings: { ...meta.settings, accessibility: {
                  ...(meta?.settings?.accessibility || {}), minFontSize: Number(e.target.value)
                }}
              }}
            })}
            min={10} max={24}
            className="h-8 text-sm"
          />
        </Field>
      </div>
    </Section>
  );
};

export default AccessibilitySection;
