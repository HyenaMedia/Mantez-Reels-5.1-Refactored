import React, { useState } from 'react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Search, ChevronDown, ChevronRight, RotateCcw, LayoutGrid, Wand2, Clock, Save, Trash2, RotateCcw as Restore } from 'lucide-react';

/* ── Extracted section components ────────────────────────────────── */
import ColorPaletteSection from './globalSettings/ColorPaletteSection';
import TypographySection from './globalSettings/TypographySection';
import BreakpointsSection, { DEFAULT_BREAKPOINTS } from './globalSettings/BreakpointsSection';
import AccessibilitySection from './globalSettings/AccessibilitySection';

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

/* ── Style Presets ───────────────────────────────────────────────── */
const STYLE_PRESETS = [
  {
    id: 'minimal',
    name: 'Minimal',
    emoji: '\u25FB',
    desc: 'Clean & simple',
    colors: { primary: '#18181b', secondary: '#71717a', accent: '#3b82f6', success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' },
    typography: { headingFont: 'Inter', bodyFont: 'Inter', headingWeight: 700 },
    tokens: { radiusSM: 2, radiusMD: 4, radiusLG: 8, radiusXL: 12, radiusFull: 9999 },
  },
  {
    id: 'bold',
    name: 'Bold',
    emoji: '\u25A0',
    desc: 'Strong & impactful',
    colors: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#f59e0b', success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' },
    typography: { headingFont: 'Montserrat', bodyFont: 'Open Sans', headingWeight: 800 },
    tokens: { radiusSM: 4, radiusMD: 8, radiusLG: 16, radiusXL: 24, radiusFull: 9999 },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    emoji: '\u25C8',
    desc: 'Professional & trust',
    colors: { primary: '#1e40af', secondary: '#1d4ed8', accent: '#0ea5e9', success: '#16a34a', warning: '#d97706', error: '#dc2626', info: '#0369a1' },
    typography: { headingFont: 'Roboto', bodyFont: 'Roboto', headingWeight: 600 },
    tokens: { radiusSM: 2, radiusMD: 4, radiusLG: 6, radiusXL: 8, radiusFull: 9999 },
  },
  {
    id: 'creative',
    name: 'Creative',
    emoji: '\u25C6',
    desc: 'Expressive & vibrant',
    colors: { primary: '#ec4899', secondary: '#a855f7', accent: '#f59e0b', success: '#10b981', warning: '#f97316', error: '#ef4444', info: '#06b6d4' },
    typography: { headingFont: 'Playfair Display', bodyFont: 'Poppins', headingWeight: 700 },
    tokens: { radiusSM: 8, radiusMD: 16, radiusLG: 24, radiusXL: 32, radiusFull: 9999 },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    emoji: '\u25C9',
    desc: 'Sleek & dark',
    colors: { primary: '#a78bfa', secondary: '#818cf8', accent: '#34d399', success: '#34d399', warning: '#fbbf24', error: '#f87171', info: '#60a5fa' },
    typography: { headingFont: 'Space Grotesk', bodyFont: 'DM Sans', headingWeight: 700 },
    tokens: { radiusSM: 4, radiusMD: 8, radiusLG: 12, radiusXL: 20, radiusFull: 9999 },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    emoji: '\u25CC',
    desc: 'Magazine & elegant',
    colors: { primary: '#1c1917', secondary: '#44403c', accent: '#b45309', success: '#166534', warning: '#92400e', error: '#991b1b', info: '#1e40af' },
    typography: { headingFont: 'Merriweather', bodyFont: 'Source Sans Pro', headingWeight: 700 },
    tokens: { radiusSM: 0, radiusMD: 2, radiusLG: 4, radiusXL: 8, radiusFull: 9999 },
  },
];

/* ── Default design tokens ───────────────────────────────────────── */
const DEFAULT_TOKENS = {
  spacingSM: 8, spacingMD: 16, spacingLG: 24, spacingXL: 40, spacing2XL: 64,
  radiusSM: 4, radiusMD: 8, radiusLG: 12, radiusXL: 16, radiusFull: 9999,
  shadowSM: '0 1px 2px rgba(0,0,0,0.08)',
  shadowMD: '0 4px 6px rgba(0,0,0,0.10)',
  shadowLG: '0 10px 15px rgba(0,0,0,0.10)',
  shadowXL: '0 20px 25px rgba(0,0,0,0.12)',
};

const GlobalSettings = () => {
  const { pageState, updatePageState, getSnapshots, saveSnapshot, restoreSnapshot, deleteSnapshot } = useThemeEditor();
  const [snapshots, setSnapshots] = useState(() => getSnapshots());
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [activePreset, setActivePreset] = useState(null);
  const refreshSnapshots = () => setSnapshots(getSnapshots());
  const meta = pageState?.page?.meta || {};
  const globalStyles = meta?.settings?.globalStyles || {};
  const colors = globalStyles?.colors || {};
  const typography = globalStyles?.typography || {};
  const tokens = globalStyles?.tokens || DEFAULT_TOKENS;
  const seo = meta?.settings?.seo || {};

  const setToken = (key, value) => {
    updatePageState({
      page: {
        ...pageState.page,
        meta: {
          ...meta,
          settings: {
            ...meta.settings,
            globalStyles: {
              ...globalStyles,
              tokens: { ...tokens, [key]: value },
            },
          },
        },
      },
    });
  };

  const applyPreset = (preset) => {
    updatePageState({
      page: {
        ...pageState.page,
        meta: {
          ...meta,
          settings: {
            ...meta.settings,
            globalStyles: {
              ...globalStyles,
              colors: { ...colors, ...preset.colors },
              typography: { ...typography, ...preset.typography },
              tokens: { ...tokens, ...preset.tokens },
            },
          },
        },
      },
    });
    setActivePreset(preset.id);
  };

  const setColor = (key, value) => {
    updatePageState({
      page: {
        ...pageState.page,
        meta: {
          ...meta,
          settings: {
            ...meta.settings,
            globalStyles: {
              ...globalStyles,
              colors: { ...colors, [key]: value },
            },
          },
        },
      },
    });
  };

  const setNeutral = (shade, value) => {
    updatePageState({
      page: {
        ...pageState.page,
        meta: {
          ...meta,
          settings: {
            ...meta.settings,
            globalStyles: {
              ...globalStyles,
              colors: {
                ...colors,
                neutral: { ...(colors.neutral || {}), [shade]: value },
              },
            },
          },
        },
      },
    });
  };

  const setTypography = (key, value) => {
    updatePageState({
      page: {
        ...pageState.page,
        meta: {
          ...meta,
          settings: {
            ...meta.settings,
            globalStyles: {
              ...globalStyles,
              typography: { ...typography, [key]: value },
            },
          },
        },
      },
    });
  };

  const setSeo = (key, value) => {
    updatePageState({
      page: {
        ...pageState.page,
        meta: {
          ...meta,
          settings: {
            ...meta.settings,
            seo: { ...seo, [key]: value },
          },
        },
      },
    });
  };

  const setPageName = (value) => {
    updatePageState({
      page: {
        ...pageState.page,
        meta: { ...meta, name: value },
      },
    });
  };

  // Responsive breakpoints
  const breakpoints = meta?.settings?.breakpoints || DEFAULT_BREAKPOINTS;

  const setBreakpoint = (device, field, value) => {
    updatePageState({
      page: {
        ...pageState.page,
        meta: {
          ...meta,
          settings: {
            ...meta.settings,
            breakpoints: {
              ...breakpoints,
              [device]: { ...breakpoints[device], [field]: value === '' ? undefined : Number(value) },
            },
          },
        },
      },
    });
  };

  const resetBreakpoints = () => {
    updatePageState({
      page: {
        ...pageState.page,
        meta: {
          ...meta,
          settings: { ...meta.settings, breakpoints: DEFAULT_BREAKPOINTS },
        },
      },
    });
  };

  return (
    <div className="flex flex-col pb-8">
      {/* Page Name */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <Field label="Page Name">
          <Input
            value={meta.name || ''}
            onChange={e => setPageName(e.target.value)}
            placeholder="Home Page"
            className="h-8 text-sm"
          />
        </Field>
      </div>

      {/* Brand Kit + Brand Colors (extracted) */}
      <ColorPaletteSection
        meta={meta}
        pageState={pageState}
        globalStyles={globalStyles}
        colors={colors}
        updatePageState={updatePageState}
        setColor={setColor}
        setNeutral={setNeutral}
      />

      {/* Typography (extracted) */}
      <TypographySection typography={typography} setTypography={setTypography} />

      {/* Responsive Breakpoints (extracted) */}
      <BreakpointsSection breakpoints={breakpoints} setBreakpoint={setBreakpoint} resetBreakpoints={resetBreakpoints} />

      {/* Accessibility (extracted) */}
      <AccessibilitySection colors={colors} meta={meta} pageState={pageState} updatePageState={updatePageState} />

      {/* SEO */}
      <Section title="SEO" icon={Search} defaultOpen={false}>
        <Field label="Page Title">
          <Input
            value={seo.title || ''}
            onChange={e => setSeo('title', e.target.value)}
            placeholder="Welcome to Our Site"
            className="h-8 text-sm"
          />
        </Field>
        <Field label="Meta Description">
          <textarea
            value={seo.description || ''}
            onChange={e => setSeo('description', e.target.value)}
            placeholder="Describe this page for search engines..."
            className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm resize-none"
            rows={3}
          />
          <p className="text-[10px] text-gray-400 text-right">{(seo.description || '').length}/160</p>
        </Field>
        <Field label="Open Graph Title">
          <Input
            value={seo.ogTitle || ''}
            onChange={e => setSeo('ogTitle', e.target.value)}
            placeholder="Same as page title by default"
            className="h-8 text-sm"
          />
        </Field>
        <Field label="Canonical URL">
          <Input
            value={seo.canonical || ''}
            onChange={e => setSeo('canonical', e.target.value)}
            placeholder="https://example.com/page"
            className="h-8 text-sm"
          />
        </Field>

        {/* Preview card */}
        <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Google Preview</p>
          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium truncate">
            {seo.title || 'Page Title'}
          </p>
          <p className="text-green-700 dark:text-green-500 text-xs truncate">
            {seo.canonical || 'https://your-site.com'}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5 line-clamp-2">
            {seo.description || 'Meta description will appear here...'}
          </p>
        </div>
      </Section>

      {/* Style Presets */}
      <Section title="Style Presets" icon={Wand2} defaultOpen={false}>
        <p className="text-xs text-gray-500 dark:text-gray-400">Apply a one-click preset to set colors, fonts, and border radius.</p>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {STYLE_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`flex flex-col gap-1 p-3 rounded-lg border text-left transition-all ${
                activePreset === preset.id
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 bg-white dark:bg-gray-800/50'
              }`}
            >
              {/* Color swatches row */}
              <div className="flex gap-0.5 mb-1">
                {['primary','secondary','accent'].map(k => (
                  <div key={k} className="w-4 h-4 rounded-full border border-white dark:border-gray-900 shadow-sm"
                    style={{ backgroundColor: preset.colors[k] }} />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{preset.name}</span>
              <span className="text-[10px] text-gray-400">{preset.desc}</span>
              {activePreset === preset.id && (
                <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium mt-0.5">{'\u2713'} Applied</span>
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* Design Tokens */}
      <Section title="Design Tokens" icon={LayoutGrid} defaultOpen={false}>
        <p className="text-xs text-gray-500 dark:text-gray-400">Configure global spacing, border radius, and shadow scales.</p>

        {/* Spacing */}
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Spacing Scale</p>
          <div className="space-y-1.5">
            {[
              { key: 'spacingSM',  label: 'SM',  def: 8 },
              { key: 'spacingMD',  label: 'MD',  def: 16 },
              { key: 'spacingLG',  label: 'LG',  def: 24 },
              { key: 'spacingXL',  label: 'XL',  def: 40 },
              { key: 'spacing2XL', label: '2XL', def: 64 },
            ].map(({ key, label, def }) => {
              const v = tokens[key] ?? def;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-7">{label}</span>
                  <div className="flex-1 bg-violet-100 dark:bg-violet-900/30 rounded-sm h-4 flex items-center overflow-hidden">
                    <div className="h-full bg-violet-400 dark:bg-violet-600 rounded-sm transition-all" style={{ width: `${Math.min(v / 96 * 100, 100)}%` }} />
                  </div>
                  <input type="number" value={v} min={2} max={96} step={2}
                    onChange={e => setToken(key, Number(e.target.value))}
                    className="w-10 h-6 text-[11px] text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 font-mono" />
                  <span className="text-[10px] text-gray-400 w-5">px</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Border Radius */}
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Border Radius</p>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'radiusSM',  label: 'SM',   def: 4 },
              { key: 'radiusMD',  label: 'MD',   def: 8 },
              { key: 'radiusLG',  label: 'LG',   def: 12 },
              { key: 'radiusXL',  label: 'XL',   def: 16 },
              { key: 'radiusFull', label: 'Full', def: 9999 },
            ].map(({ key, label, def }) => {
              const v = tokens[key] ?? def;
              const displayR = Math.min(v, 24);
              return (
                <div key={key} className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 bg-violet-200 dark:bg-violet-800/50 border-2 border-violet-400 dark:border-violet-600"
                    style={{ borderRadius: `${displayR}px` }} />
                  <span className="text-[10px] text-gray-500">{label}</span>
                  <input type="number" value={v === 9999 ? 9999 : v} min={0} max={9999}
                    onChange={e => setToken(key, Number(e.target.value))}
                    className="w-12 h-5 text-[10px] text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 font-mono" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Shadow System */}
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Shadow Scale</p>
          <div className="space-y-2">
            {[
              { key: 'shadowSM', label: 'SM', def: DEFAULT_TOKENS.shadowSM },
              { key: 'shadowMD', label: 'MD', def: DEFAULT_TOKENS.shadowMD },
              { key: 'shadowLG', label: 'LG', def: DEFAULT_TOKENS.shadowLG },
              { key: 'shadowXL', label: 'XL', def: DEFAULT_TOKENS.shadowXL },
            ].map(({ key, label, def }) => {
              const v = tokens[key] ?? def;
              return (
                <div key={key} className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded shrink-0 mt-0.5"
                    style={{ boxShadow: v }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-gray-500">{label}</span>
                    <input value={v} onChange={e => setToken(key, e.target.value)}
                      className="w-full h-6 px-1.5 text-[10px] border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 font-mono" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Version History */}
      <Section title="Version History" icon={Clock} defaultOpen={false}>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Save named snapshots of your page. Restore any version anytime.
        </p>

        {/* Save snapshot */}
        <div className="flex gap-2">
          <input
            type="text"
            value={snapshotLabel}
            onChange={e => setSnapshotLabel(e.target.value)}
            placeholder="Snapshot name (optional)"
            className="flex-1 h-8 px-2.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-xs"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                saveSnapshot(snapshotLabel);
                setSnapshotLabel('');
                refreshSnapshots();
              }
            }}
          />
          <Button
            size="sm"
            className="h-8 px-3 text-xs bg-violet-600 hover:bg-violet-700 text-white gap-1.5 shrink-0"
            onClick={() => {
              saveSnapshot(snapshotLabel);
              setSnapshotLabel('');
              refreshSnapshots();
            }}
          >
            <Save size={11} />Save
          </Button>
        </div>

        {/* Snapshot list */}
        {snapshots.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No snapshots yet</p>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {snapshots.map(snap => (
              <div key={snap.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 group">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{snap.label}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(snap.timestamp).toLocaleString()} · {snap.sectionCount} section{snap.sectionCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { restoreSnapshot(snap.id); refreshSnapshots(); }}
                    title="Restore this version"
                    className="p-1 text-violet-500 hover:text-violet-700 transition-colors"
                  >
                    <Restore size={12} />
                  </button>
                  <button
                    onClick={() => { deleteSnapshot(snap.id); refreshSnapshots(); }}
                    title="Delete snapshot"
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {snapshots.length > 0 && (
          <p className="text-[10px] text-gray-400 text-center">
            {snapshots.length}/{20} snapshots · hover to restore or delete
          </p>
        )}
      </Section>
    </div>
  );
};

export default GlobalSettings;
