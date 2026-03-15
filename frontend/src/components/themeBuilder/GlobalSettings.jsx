import React, { useState } from 'react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Palette, Type, Search, ChevronDown, ChevronRight, RotateCcw, Smartphone, Tablet, Monitor, LayoutGrid, Upload, ImageIcon, Wand2, X, Accessibility, Clock, Save, Trash2, RotateCcw as Restore } from 'lucide-react';

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
/* ── WCAG Contrast utilities ─────────────────────────────────────── */
const hexToRgb = (hex) => {
  if (!hex || typeof hex !== 'string') return [0, 0, 0];
  const clean = hex.replace('#', '').trim();
  // Accept 3-digit or 6-digit hex only
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(clean)) return [0, 0, 0];
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const n = parseInt(full, 16);
  if (isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const luminance = (r, g, b) => {
  const s = [r, g, b].map(c => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
};

const contrastRatio = (hex1, hex2) => {
  try {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    const L1 = luminance(r1, g1, b1);
    const L2 = luminance(r2, g2, b2);
    const lighter = Math.max(L1, L2);
    const darker  = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch { return 1; }
};

const wcagLevel = (ratio, size = 'normal') => {
  if (size === 'large') return ratio >= 4.5 ? 'AAA' : ratio >= 3 ? 'AA' : 'fail';
  return ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail';
};

/* ── Default breakpoints ─────────────────────────────────────────── */
const DEFAULT_BREAKPOINTS = {
  mobile:  { label: 'Mobile',  max: 767,  icon: 'smartphone' },
  tablet:  { label: 'Tablet',  min: 768,  max: 1199, icon: 'tablet' },
  desktop: { label: 'Desktop', min: 1200, icon: 'monitor' },
};

const BREAKPOINT_ICONS = { smartphone: Smartphone, tablet: Tablet, monitor: Monitor };

/* ── Color extraction from image ─────────────────────────────────── */
const extractColorsFromImage = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 80;
      const scale = Math.min(MAX / img.width, MAX / img.height, 1);
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colorMap = {};
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i]   / 32) * 32;
        const g = Math.round(data[i+1] / 32) * 32;
        const b = Math.round(data[i+2] / 32) * 32;
        const a = data[i+3];
        if (a < 128) continue; // skip transparent
        const key = `${r},${g},${b}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }
      const sorted = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([key]) => {
          const [r, g, b] = key.split(',').map(Number);
          return '#' + [r, g, b].map(c => Math.min(255, c).toString(16).padStart(2, '0')).join('');
        });
      resolve(sorted);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve([]); };
    img.src = url;
  });
};

/* ── Style Presets ───────────────────────────────────────────────── */
const STYLE_PRESETS = [
  {
    id: 'minimal',
    name: 'Minimal',
    emoji: '◻',
    desc: 'Clean & simple',
    colors: { primary: '#18181b', secondary: '#71717a', accent: '#3b82f6', success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' },
    typography: { headingFont: 'Inter', bodyFont: 'Inter', headingWeight: 700 },
    tokens: { radiusSM: 2, radiusMD: 4, radiusLG: 8, radiusXL: 12, radiusFull: 9999 },
  },
  {
    id: 'bold',
    name: 'Bold',
    emoji: '■',
    desc: 'Strong & impactful',
    colors: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#f59e0b', success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' },
    typography: { headingFont: 'Montserrat', bodyFont: 'Open Sans', headingWeight: 800 },
    tokens: { radiusSM: 4, radiusMD: 8, radiusLG: 16, radiusXL: 24, radiusFull: 9999 },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    emoji: '◈',
    desc: 'Professional & trust',
    colors: { primary: '#1e40af', secondary: '#1d4ed8', accent: '#0ea5e9', success: '#16a34a', warning: '#d97706', error: '#dc2626', info: '#0369a1' },
    typography: { headingFont: 'Roboto', bodyFont: 'Roboto', headingWeight: 600 },
    tokens: { radiusSM: 2, radiusMD: 4, radiusLG: 6, radiusXL: 8, radiusFull: 9999 },
  },
  {
    id: 'creative',
    name: 'Creative',
    emoji: '◆',
    desc: 'Expressive & vibrant',
    colors: { primary: '#ec4899', secondary: '#a855f7', accent: '#f59e0b', success: '#10b981', warning: '#f97316', error: '#ef4444', info: '#06b6d4' },
    typography: { headingFont: 'Playfair Display', bodyFont: 'Poppins', headingWeight: 700 },
    tokens: { radiusSM: 8, radiusMD: 16, radiusLG: 24, radiusXL: 32, radiusFull: 9999 },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    emoji: '◉',
    desc: 'Sleek & dark',
    colors: { primary: '#a78bfa', secondary: '#818cf8', accent: '#34d399', success: '#34d399', warning: '#fbbf24', error: '#f87171', info: '#60a5fa' },
    typography: { headingFont: 'Space Grotesk', bodyFont: 'DM Sans', headingWeight: 700 },
    tokens: { radiusSM: 4, radiusMD: 8, radiusLG: 12, radiusXL: 20, radiusFull: 9999 },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    emoji: '◌',
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

  // Brand Kit
  const [logoPreview, setLogoPreview] = useState(meta?.settings?.brandKit?.logoUrl || null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const logoInputRef = React.useRef(null);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revoke the previous object URL to prevent memory leaks
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    // Store the data URL for persistence
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      updatePageState({
        page: {
          ...pageState.page,
          meta: {
            ...meta,
            settings: {
              ...meta.settings,
              brandKit: { ...(meta?.settings?.brandKit || {}), logoUrl: dataUrl },
            },
          },
        },
      });
    };
    reader.readAsDataURL(file);
    // Extract colors
    setExtracting(true);
    const cols = await extractColorsFromImage(file);
    setExtractedColors(cols);
    setExtracting(false);
  };

  const applyExtractedColor = (hex, slot) => {
    setColor(slot, hex);
  };

  const removeLogo = () => {
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    setExtractedColors([]);
    updatePageState({
      page: {
        ...pageState.page,
        meta: {
          ...meta,
          settings: {
            ...meta.settings,
            brandKit: { ...(meta?.settings?.brandKit || {}), logoUrl: null },
          },
        },
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

      {/* Brand Kit */}
      <Section title="Brand Kit" icon={ImageIcon} defaultOpen={false}>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Upload your logo to extract brand colors automatically.
        </p>

        {/* Logo upload */}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />

        {logoPreview ? (
          <div className="relative">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center min-h-[80px]">
              <img src={logoPreview} alt="Logo" className="max-h-16 max-w-full object-contain" />
            </div>
            <button
              onClick={removeLogo}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X size={10} />
            </button>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 text-xs gap-1.5"
              onClick={() => logoInputRef.current?.click()}
            >
              <Upload size={11} />Replace logo
            </Button>
          </div>
        ) : (
          <button
            onClick={() => logoInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center gap-2 text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-colors group"
          >
            <Upload size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">Click to upload logo</span>
            <span className="text-[10px]">PNG, SVG, JPG up to 2MB</span>
          </button>
        )}

        {/* Extracted colors */}
        {extracting && (
          <div className="flex items-center gap-2 text-xs text-violet-600 dark:text-violet-400">
            <Wand2 size={12} className="animate-pulse" />
            Extracting colors from logo…
          </div>
        )}

        {extractedColors.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <Wand2 size={11} className="text-violet-500" />
              Extracted Colors — click to apply
            </p>
            <div className="flex flex-wrap gap-2">
              {extractedColors.map((hex, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="flex gap-0.5">
                    {['primary','secondary','accent'].map(slot => (
                      <button
                        key={slot}
                        onClick={() => applyExtractedColor(hex, slot)}
                        title={`Set as ${slot}: ${hex}`}
                        className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform hover:ring-2 ring-violet-500"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono">{hex}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400">Click a swatch to set it as Primary, Secondary, or Accent</p>
          </div>
        )}
      </Section>

      {/* Brand Colors */}
      <Section title="Brand Colors" icon={Palette}>
        <div className="grid grid-cols-1 gap-3">
          <ColorSwatch label="Primary" value={colors.primary} onChange={v => setColor('primary', v)} />
          <ColorSwatch label="Secondary" value={colors.secondary} onChange={v => setColor('secondary', v)} />
          <ColorSwatch label="Accent" value={colors.accent} onChange={v => setColor('accent', v)} />
        </div>
        <div className="grid grid-cols-1 gap-3 pt-1">
          <ColorSwatch label="Success" value={colors.success} onChange={v => setColor('success', v)} />
          <ColorSwatch label="Warning" value={colors.warning} onChange={v => setColor('warning', v)} />
          <ColorSwatch label="Error" value={colors.error} onChange={v => setColor('error', v)} />
          <ColorSwatch label="Info" value={colors.info} onChange={v => setColor('info', v)} />
        </div>

        {/* Neutral Shades */}
        <div className="mt-3">
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 font-medium">Neutral Shades</p>
          <div className="grid grid-cols-5 gap-1">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
              <div key={shade} className="flex flex-col items-center gap-1">
                <input
                  type="color"
                  value={colors.neutral?.[shade] || '#000000'}
                  onChange={e => setNeutral(shade, e.target.value)}
                  className="w-full h-7 p-0 rounded border border-gray-300 dark:border-gray-700 cursor-pointer"
                  title={`Neutral ${shade}`}
                />
                <span className="text-[10px] text-gray-400">{shade}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-gray-500 mt-1"
          onClick={() => {
            const presets = {
              primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a855f7',
              success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6',
            };
            updatePageState({
              page: {
                ...pageState.page,
                meta: {
                  ...meta,
                  settings: {
                    ...meta.settings,
                    globalStyles: {
                      ...globalStyles,
                      colors: { ...colors, ...presets },
                    },
                  },
                },
              },
            });
          }}
        >
          <RotateCcw size={12} className="mr-1" />
          Reset to defaults
        </Button>
      </Section>

      {/* Typography */}
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

      {/* Responsive Breakpoints */}
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
                    {device === 'mobile'  && `≤ ${bp.max ?? defaults.max}px`}
                    {device === 'tablet'  && `${bp.min ?? defaults.min}–${bp.max ?? defaults.max}px`}
                    {device === 'desktop' && `≥ ${bp.min ?? defaults.min}px`}
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

      {/* Accessibility */}
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
                        {level === 'fail' ? '✗ Fail' : `✓ ${level}`}
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
                <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium mt-0.5">✓ Applied</span>
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
