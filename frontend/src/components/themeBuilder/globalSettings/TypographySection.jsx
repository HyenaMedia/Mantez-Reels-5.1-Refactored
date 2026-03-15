import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Type, ChevronDown, ChevronRight } from 'lucide-react';

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

const ColorSwatch = ({ label, value, onChange }) => (
  <div className="flex items-center gap-2">
    <input
      type="color"
      value={value || '#000000'}
      onChange={e => onChange(e.target.value)}
      className="w-8 h-8 p-0.5 rounded border border-gray-300 dark:border-gray-700 cursor-pointer bg-white dark:bg-gray-800 shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{label}</p>
      <Input
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="#000000"
        className="h-7 text-xs mt-0.5 font-mono"
      />
    </div>
  </div>
);

/* ── Font options ────────────────────────────────────────────────── */
const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Raleway', 'Nunito', 'Playfair Display', 'Merriweather', 'Source Sans Pro',
  'Ubuntu', 'PT Sans', 'Noto Sans', 'Outfit', 'DM Sans', 'Figtree',
  'Plus Jakarta Sans', 'Sora', 'Space Grotesk', 'Geist', 'Geist Mono',
];

/* ── Main component ──────────────────────────────────────────────── */

const TypographySection = ({ typography, setTypography }) => {
  return (
    <Section title="Typography" icon={Type}>
      <Field label="Heading Font">
        <select
          value={typography.headingFont || 'Inter'}
          onChange={e => setTypography('headingFont', e.target.value)}
          className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
          style={{ fontFamily: typography.headingFont }}
        >
          {GOOGLE_FONTS.map(f => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>
      </Field>
      <Field label="Body Font">
        <select
          value={typography.bodyFont || 'Inter'}
          onChange={e => setTypography('bodyFont', e.target.value)}
          className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
          style={{ fontFamily: typography.bodyFont }}
        >
          {GOOGLE_FONTS.map(f => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>
      </Field>

      {/* H1-H6 Size Scale */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 font-medium">Heading Sizes (px)</p>
        <div className="space-y-1.5">
          {['h1','h2','h3','h4','h5','h6'].map((h, i) => {
            const defaults = [60, 48, 36, 28, 22, 18];
            const val = typography[`${h}Size`] ?? defaults[i];
            return (
              <div key={h} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 w-5 text-right uppercase">{h}</span>
                <input type="range" min={10} max={120} value={val}
                  onChange={e => setTypography(`${h}Size`, Number(e.target.value))} className="flex-1" />
                <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{val}px</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Heading Weight">
          <select value={typography.headingWeight || 700}
            onChange={e => setTypography('headingWeight', Number(e.target.value))}
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-xs">
            {[300,400,500,600,700,800,900].map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </Field>
        <Field label="Body Line Height">
          <select value={typography.bodyLineHeight || 1.6}
            onChange={e => setTypography('bodyLineHeight', Number(e.target.value))}
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-xs">
            {[1.2,1.4,1.5,1.6,1.8,2.0].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ColorSwatch label="Heading Color" value={typography.headingColor || '#111827'} onChange={v => setTypography('headingColor', v)} />
        <ColorSwatch label="Body Color" value={typography.bodyColor || '#374151'} onChange={v => setTypography('bodyColor', v)} />
      </div>
      <ColorSwatch label="Link Color" value={typography.linkColor || '#8b5cf6'} onChange={v => setTypography('linkColor', v)} />

      {/* Font preview */}
      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Preview</p>
        {['h1','h2','h3'].map((h, i) => (
          <p key={h} className="text-gray-800 dark:text-gray-200 leading-tight"
            style={{ fontFamily: typography.headingFont, fontSize: `${typography[`${h}Size`] ?? [60,48,36][i]}px`, fontWeight: typography.headingWeight || 700, color: typography.headingColor }}>
            {h.toUpperCase()} Headline
          </p>
        ))}
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2"
          style={{ fontFamily: typography.bodyFont, lineHeight: typography.bodyLineHeight, color: typography.bodyColor }}>
          Body text looks like this. The quick brown fox jumps over the lazy dog.
        </p>
      </div>
    </Section>
  );
};

export default TypographySection;
