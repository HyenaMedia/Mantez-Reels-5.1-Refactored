import React, { useState } from 'react';
import {
  FileText, Palette, Layout, Settings, Plus, Trash2,
  ChevronDown, ChevronRight, ChevronUp, GripVertical,
  Check, Sparkles
} from 'lucide-react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Button } from '../../ui/button';

/* ─────────────────────────────────────────
   Accordion helper
───────────────────────────────────────── */
const Accordion = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
    >
      {Icon && <Icon size={13} className="text-violet-500 shrink-0" />}
      <span className="flex-1 text-xs font-semibold text-gray-800 dark:text-gray-200">{title}</span>
      {isOpen ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
    </button>
    {isOpen && <div className="p-3 space-y-3 bg-white dark:bg-gray-900">{children}</div>}
  </div>
);

/* ─────────────────────────────────────────
   5 built-in presets
───────────────────────────────────────── */
const PRESETS = [
  {
    id: 'minimal-transparent',
    label: 'Minimal',
    subtitle: 'Transparent',
    preview: { bg: 'transparent', text: '#111827', accent: '#8b5cf6' },
    config: {
      backgroundType: 'transparent',
      backgroundColor: 'transparent',
      backdropBlur: 0,
      textColor: '#111827',
      textHoverColor: '#8b5cf6',
      ctaStyle: 'outline',
      shadow: 'none',
      borderBottom: false,
    },
  },
  {
    id: 'classic-solid',
    label: 'Classic',
    subtitle: 'Solid Dark',
    preview: { bg: '#111827', text: '#ffffff', accent: '#8b5cf6' },
    config: {
      backgroundType: 'solid',
      backgroundColor: 'rgba(17,24,39,1)',
      backdropBlur: 0,
      textColor: '#ffffff',
      textHoverColor: '#a855f7',
      ctaStyle: 'filled',
      shadow: 'md',
      borderBottom: false,
    },
  },
  {
    id: 'glass',
    label: 'Glass',
    subtitle: 'Blur effect',
    preview: { bg: 'rgba(17,24,39,0.6)', text: '#ffffff', accent: '#a855f7' },
    config: {
      backgroundType: 'glass',
      backgroundColor: 'rgba(17,24,39,0.6)',
      backdropBlur: 16,
      textColor: '#ffffff',
      textHoverColor: '#a855f7',
      ctaStyle: 'filled',
      shadow: 'sm',
      borderBottom: true,
    },
  },
  {
    id: 'centered-logo',
    label: 'Centered',
    subtitle: 'Logo center',
    preview: { bg: '#ffffff', text: '#111827', accent: '#8b5cf6' },
    config: {
      backgroundType: 'solid',
      backgroundColor: 'rgba(255,255,255,1)',
      backdropBlur: 0,
      textColor: '#111827',
      textHoverColor: '#8b5cf6',
      logoPosition: 'center',
      linksAlignment: 'right',
      ctaStyle: 'filled',
      shadow: 'sm',
      borderBottom: true,
    },
  },
  {
    id: 'sidebar-nav',
    label: 'Sidebar',
    subtitle: 'Fixed left',
    preview: { bg: '#1e1b4b', text: '#c4b5fd', accent: '#7c3aed' },
    config: {
      backgroundType: 'solid',
      backgroundColor: 'rgba(30,27,75,1)',
      backdropBlur: 0,
      textColor: '#c4b5fd',
      textHoverColor: '#ffffff',
      ctaStyle: 'outline',
      shadow: 'lg',
      borderBottom: false,
      position: 'fixed',
    },
  },
];

/* ─────────────────────────────────────────
   Tiny field helpers
───────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div>
    <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block font-medium">{label}</label>
    {children}
  </div>
);

const ColorRow = ({ label, value, onChange }) => (
  <Field label={label}>
    <div className="flex gap-2 items-center">
      <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
        className="w-9 h-9 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer shrink-0 p-0.5" />
      <Input value={value || ''} onChange={e => onChange(e.target.value)} className="flex-1 font-mono text-xs h-9" />
    </div>
  </Field>
);

const ToggleGroup = ({ value, options, onChange }) => (
  <div className="flex gap-1 flex-wrap">
    {options.map(o => (
      <button key={o.value} onClick={() => onChange(o.value)}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          value === o.value
            ? 'bg-violet-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}>
        {o.label}
      </button>
    ))}
  </div>
);

const SliderRow = ({ label, value, min, max, step, onChange, unit = 'px' }) => (
  <Field label={label}>
    <div className="flex items-center gap-2">
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-600" />
      <span className="text-xs font-mono text-violet-600 w-12 text-right shrink-0">{value}{unit}</span>
    </div>
  </Field>
);

const ToggleRow = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-none">{label}</p>
      {desc && <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <Switch checked={!!checked} onCheckedChange={onChange} />
  </div>
);

/* ─────────────────────────────────────────
   Menu item management
───────────────────────────────────────── */
const newItem = () => ({
  id: `item-${Date.now()}`,
  label: 'New Link',
  url: '#',
  target: '_self',
  children: [],
});

const MenuItem = ({ item, index, total, onUpdate, onDelete, onMoveUp, onMoveDown }) => {
  const [expanded, setExpanded] = useState(false);
  const [addingChild, setAddingChild] = useState(false);

  const addChild = () => {
    const child = { id: `child-${Date.now()}`, label: 'Sub Link', url: '#' };
    onUpdate({ ...item, children: [...(item.children || []), child] });
    setAddingChild(false);
    setExpanded(true);
  };

  const updateChild = (childId, patch) => {
    onUpdate({ ...item, children: item.children.map(c => c.id === childId ? { ...c, ...patch } : c) });
  };

  const deleteChild = (childId) => {
    onUpdate({ ...item, children: item.children.filter(c => c.id !== childId) });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Row */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 dark:bg-gray-800/60">
        <GripVertical size={12} className="text-gray-300 dark:text-gray-600 shrink-0" />

        {/* Expand for children */}
        <button onClick={() => setExpanded(x => !x)} className="text-gray-400 w-4 shrink-0">
          {(item.children?.length > 0 || expanded)
            ? (expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)
            : <span className="w-4 block" />}
        </button>

        <span className="flex-1 text-xs font-medium text-gray-700 dark:text-gray-200 truncate">{item.label}</span>

        {/* Reorder */}
        <div className="flex flex-col" onClick={e => e.stopPropagation()}>
          <button onClick={onMoveUp} disabled={index === 0}
            className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none">
            <ChevronUp size={10} />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1}
            className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none">
            <ChevronDown size={10} />
          </button>
        </div>

        <button onClick={() => setExpanded(x => !x)}
          className="text-xs text-violet-500 hover:text-violet-700 px-1 shrink-0">
          Edit
        </button>
        <button onClick={onDelete} className="text-gray-300 hover:text-red-500 shrink-0">
          <Trash2 size={11} />
        </button>
      </div>

      {/* Edit fields */}
      {expanded && (
        <div className="p-2.5 space-y-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Label">
              <Input value={item.label} onChange={e => onUpdate({ ...item, label: e.target.value })}
                className="h-7 text-xs" />
            </Field>
            <Field label="URL">
              <Input value={item.url} onChange={e => onUpdate({ ...item, url: e.target.value })}
                placeholder="#section" className="h-7 text-xs" />
            </Field>
          </div>
          <Field label="Open in">
            <ToggleGroup value={item.target || '_self'}
              options={[{ value: '_self', label: 'Same tab' }, { value: '_blank', label: 'New tab' }]}
              onChange={v => onUpdate({ ...item, target: v })} />
          </Field>

          {/* Children */}
          {item.children?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Dropdown items</p>
              {item.children.map((child, ci) => (
                <div key={child.id} className="flex items-center gap-1.5 pl-3 border-l-2 border-violet-200 dark:border-violet-800">
                  <span className="text-[10px] text-gray-400 w-3">↳</span>
                  <Input value={child.label} onChange={e => updateChild(child.id, { label: e.target.value })}
                    placeholder="Label" className="h-6 text-[11px] flex-1" />
                  <Input value={child.url} onChange={e => updateChild(child.id, { url: e.target.value })}
                    placeholder="URL" className="h-6 text-[11px] flex-1" />
                  <button onClick={() => deleteChild(child.id)} className="text-gray-300 hover:text-red-500 shrink-0">
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={addChild}
            className="flex items-center gap-1 text-[11px] text-violet-500 hover:text-violet-700">
            <Plus size={11} /> Add dropdown item
          </button>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   Main NavbarSettings
───────────────────────────────────────── */
const NavbarSettings = ({ section, updateSection }) => {
  const [open, setOpen] = useState('content');
  const toggle = (id) => setOpen(o => o === id ? null : id);

  const upd = (patch) => updateSection('navbar', patch);

  /* Apply a full preset */
  const applyPreset = (preset) => {
    upd({ ...preset.config, _preset: preset.id });
  };

  /* Menu items helpers */
  const items = section.menuItems || [
    { id: 'item-1', label: 'Projects', url: '#projects', target: '_self', children: [] },
    { id: 'item-2', label: 'Services', url: '#services', target: '_self', children: [] },
    { id: 'item-3', label: 'About',    url: '#about',    target: '_self', children: [] },
    { id: 'item-4', label: 'Blog',     url: '#blog',     target: '_self', children: [] },
  ];

  const setItems = (next) => upd({ menuItems: next });
  const addItem = () => setItems([...items, newItem()]);
  const deleteItem = (id) => setItems(items.filter(i => i.id !== id));
  const updateItem = (id, patch) => setItems(items.map(i => i.id === id ? (typeof patch === 'object' && !Array.isArray(patch) ? { ...i, ...patch } : patch) : i));
  const moveItem = (idx, dir) => {
    const next = [...items];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setItems(next);
  };

  return (
    <div className="space-y-2">

      {/* ── Presets ──────────────────────────────────── */}
      <div className="px-1 pb-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1">
          <Sparkles size={10} /> Quick Presets
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              title={`${preset.label} — ${preset.subtitle}`}
              className={`relative flex flex-col items-center gap-1 p-1.5 rounded-lg border-2 transition-all hover:border-violet-400 ${
                section._preset === preset.id
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Mini navbar preview */}
              <div className="w-full h-5 rounded flex items-center px-1 gap-0.5 overflow-hidden"
                style={{ background: preset.preview.bg === 'transparent' ? 'repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 0/6px 6px' : preset.preview.bg }}>
                <div className="w-2 h-1.5 rounded-sm shrink-0" style={{ background: preset.preview.accent }} />
                <div className="flex-1 flex gap-0.5 justify-end">
                  {[0,1,2].map(i => (
                    <div key={i} className="h-1 rounded-sm" style={{ width: 6 + i * 2, background: preset.preview.text + '60' }} />
                  ))}
                  <div className="w-3 h-1.5 rounded-sm" style={{ background: preset.preview.accent }} />
                </div>
              </div>
              <span className="text-[9px] font-medium text-gray-600 dark:text-gray-300 leading-none">{preset.label}</span>
              {section._preset === preset.id && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-violet-500 rounded-full flex items-center justify-center">
                  <Check size={8} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────── */}
      <Accordion title="Content" icon={FileText} isOpen={open === 'content'} onToggle={() => toggle('content')}>

        {/* Brand */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Brand</p>
          <Field label="Site Name">
            <Input value={section.siteName || 'My Site'} onChange={e => upd({ siteName: e.target.value })}
              placeholder="Site name" className="h-8 text-sm" />
          </Field>
          <Field label="Logo URL (optional)">
            <Input value={section.logoUrl || ''} onChange={e => upd({ logoUrl: e.target.value })}
              placeholder="https://…/logo.png" className="h-8 text-sm" />
          </Field>
          <SliderRow label="Logo Width" value={section.logoWidth || 120} min={60} max={240} step={10}
            onChange={v => upd({ logoWidth: v })} />
        </div>

        {/* Navigation items */}
        <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Navigation Links</p>
            <button onClick={addItem}
              className="flex items-center gap-1 text-[11px] text-violet-500 hover:text-violet-700 font-medium">
              <Plus size={11} /> Add link
            </button>
          </div>

          <div className="space-y-1.5">
            {items.map((item, idx) => (
              <MenuItem
                key={item.id}
                item={item}
                index={idx}
                total={items.length}
                onUpdate={(updated) => updateItem(item.id, updated)}
                onDelete={() => deleteItem(item.id)}
                onMoveUp={() => moveItem(idx, -1)}
                onMoveDown={() => moveItem(idx, 1)}
              />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">CTA Button</p>
            <ToggleRow label="" checked={section.showCta !== false} onChange={v => upd({ showCta: v })} />
          </div>
          {section.showCta !== false && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Text">
                  <Input value={section.ctaText || 'Contact'} onChange={e => upd({ ctaText: e.target.value })} className="h-8 text-sm" />
                </Field>
                <Field label="URL">
                  <Input value={section.ctaUrl || '#contact'} onChange={e => upd({ ctaUrl: e.target.value })} className="h-8 text-sm" />
                </Field>
              </div>
              <Field label="Style">
                <ToggleGroup value={section.ctaStyle || 'filled'}
                  options={[
                    { value: 'filled',  label: 'Filled' },
                    { value: 'outline', label: 'Outline' },
                    { value: 'text',    label: 'Text' },
                  ]}
                  onChange={v => upd({ ctaStyle: v })} />
              </Field>
            </>
          )}
        </div>
      </Accordion>

      {/* ── Style ──────────────────────────────────── */}
      <Accordion title="Style" icon={Palette} isOpen={open === 'style'} onToggle={() => toggle('style')}>
        <Field label="Background Type">
          <ToggleGroup value={section.backgroundType || 'glass'}
            options={[
              { value: 'transparent', label: 'Clear' },
              { value: 'glass',       label: 'Glass' },
              { value: 'solid',       label: 'Solid' },
            ]}
            onChange={v => upd({ backgroundType: v })} />
        </Field>

        {section.backgroundType !== 'transparent' && (
          <ColorRow label="Background Color"
            value={section.backgroundColor?.match(/#[0-9a-fA-F]{6}/) ? section.backgroundColor.match(/#[0-9a-fA-F]{6}/)[0] : '#111827'}
            onChange={(hex) => {
              const opacity = section.backgroundType === 'glass' ? '0.7' : '1';
              const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
              upd({ backgroundColor: `rgba(${r},${g},${b},${opacity})` });
            }} />
        )}

        {section.backgroundType === 'glass' && (
          <SliderRow label="Backdrop Blur" value={section.backdropBlur || 12} min={0} max={32} step={2}
            onChange={v => upd({ backdropBlur: v })} />
        )}

        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Colors</p>
          {[
            { key: 'textColor',        label: 'Link Color',       def: '#ffffff' },
            { key: 'textHoverColor',   label: 'Link Hover',       def: '#a855f7' },
            { key: 'ctaBackground',    label: 'CTA Background',   def: '#8b5cf6' },
            { key: 'ctaTextColor',     label: 'CTA Text',         def: '#ffffff' },
          ].map(c => (
            <ColorRow key={c.key} label={c.label} value={section[c.key] || c.def}
              onChange={v => upd({ [c.key]: v })} />
          ))}
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Effects</p>
          <Field label="Shadow">
            <ToggleGroup value={section.shadow || 'sm'}
              options={['none','sm','md','lg'].map(v => ({ value: v, label: v }))}
              onChange={v => upd({ shadow: v })} />
          </Field>
          <ToggleRow label="Border Bottom" desc="Subtle separator line" checked={section.borderBottom}
            onChange={v => upd({ borderBottom: v })} />
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Typography</p>
          <SliderRow label="Font Size" value={section.fontSize || 15} min={12} max={20} step={1}
            onChange={v => upd({ fontSize: v })} />
          <Field label="Font Weight">
            <ToggleGroup value={section.fontWeight || 500}
              options={[400,500,600,700].map(v => ({ value: v, label: String(v) }))}
              onChange={v => upd({ fontWeight: v })} />
          </Field>
        </div>
      </Accordion>

      {/* ── Layout ──────────────────────────────────── */}
      <Accordion title="Layout" icon={Layout} isOpen={open === 'layout'} onToggle={() => toggle('layout')}>
        <Field label="Logo Position">
          <ToggleGroup value={section.logoPosition || 'left'}
            options={['left','center','right'].map(v => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))}
            onChange={v => upd({ logoPosition: v })} />
        </Field>
        <Field label="Links Alignment">
          <ToggleGroup value={section.linksAlignment || 'right'}
            options={['left','center','right'].map(v => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))}
            onChange={v => upd({ linksAlignment: v })} />
        </Field>
        <SliderRow label="Vertical Padding" value={section.verticalPadding || 16} min={8} max={40} step={2}
          onChange={v => upd({ verticalPadding: v })} />
        <SliderRow label="Horizontal Padding" value={section.horizontalPadding || 32} min={8} max={80} step={4}
          onChange={v => upd({ horizontalPadding: v })} />
      </Accordion>

      {/* ── Advanced ──────────────────────────────────── */}
      <Accordion title="Advanced" icon={Settings} isOpen={open === 'advanced'} onToggle={() => toggle('advanced')}>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Position</p>
          <Field label="Scroll Behaviour">
            <ToggleGroup value={section.position || 'sticky'}
              options={[
                { value: 'sticky', label: 'Sticky' },
                { value: 'fixed',  label: 'Fixed' },
                { value: 'static', label: 'Static' },
              ]}
              onChange={v => upd({ position: v })} />
          </Field>
          <ToggleRow label="Hide on Scroll Down" desc="Auto-hides when scrolling down"
            checked={section.hideOnScrollDown} onChange={v => upd({ hideOnScrollDown: v })} />
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Mobile</p>
          <SliderRow label="Mobile Breakpoint" value={section.mobileBreakpoint || 768} min={480} max={1024} step={16}
            unit="px" onChange={v => upd({ mobileBreakpoint: v })} />
          <Field label="Hamburger Style">
            <ToggleGroup value={section.hamburgerStyle || 'bars'}
              options={[
                { value: 'bars',  label: '☰ Bars' },
                { value: 'dots',  label: '⋮ Dots' },
                { value: 'cross', label: '✕ Cross' },
              ]}
              onChange={v => upd({ hamburgerStyle: v })} />
          </Field>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Animation</p>
          <Field label="Entrance Animation">
            <ToggleGroup value={section.animationOnLoad || 'fade'}
              options={['none','fade','slide'].map(v => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))}
              onChange={v => upd({ animationOnLoad: v })} />
          </Field>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Z-Index</p>
          <SliderRow label="Layer Order" value={section.zIndex || 50} min={0} max={100} step={10} unit=""
            onChange={v => upd({ zIndex: v })} />
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Custom CSS</p>
          <textarea value={section.customCSS || ''} onChange={e => upd({ customCSS: e.target.value })}
            placeholder="/* navbar-specific styles */"
            className="w-full h-20 px-2.5 py-2 text-xs font-mono bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-lg border border-gray-700 focus:border-violet-500 focus:outline-none resize-none" />
        </div>
      </Accordion>
    </div>
  );
};

export default NavbarSettings;
