import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Palette, Upload, ImageIcon, Wand2, X, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';

/* ── Shared helpers (same as GlobalSettings) ─────────────────────── */

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

/* ── Main component ──────────────────────────────────────────────── */

const ColorPaletteSection = ({ meta, pageState, globalStyles, colors, updatePageState, setColor, setNeutral }) => {
  const [logoPreview, setLogoPreview] = useState(meta?.settings?.brandKit?.logoUrl || null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const logoInputRef = React.useRef(null);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
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

  return (
    <>
      {/* Brand Kit */}
      <Section title="Brand Kit" icon={ImageIcon} defaultOpen={false}>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Upload your logo to extract brand colors automatically.
        </p>

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

        {extracting && (
          <div className="flex items-center gap-2 text-xs text-violet-600 dark:text-violet-400">
            <Wand2 size={12} className="animate-pulse" />
            Extracting colors from logo...
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
    </>
  );
};

export default ColorPaletteSection;
