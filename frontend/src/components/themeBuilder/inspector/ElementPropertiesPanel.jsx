import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import {
  Type,
  Palette,
  Layout,
  X,
  Sliders,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Zap,
  MousePointer,
  Focus,
  Hand,
  ArrowLeft,
  Layers,
  Settings,
  Sparkles,
  Monitor,
  Wand2,
  Globe,
  Search as SearchIcon,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { useThemeEditor } from '../../../contexts/ThemeEditorContext';
import ResponsiveControls from '../ResponsiveControls';
import ConditionalLogic from '../ConditionalLogic';
import QueryLoopEditor from '../QueryLoopEditor';
import FormBuilder from '../FormBuilder';

/* ── Shared helpers ─────────────────────────────────────────────── */

const Field = ({ label, children }) => {
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      {React.Children.map(children, (child, i) =>
        i === 0 && React.isValidElement(child)
          ? React.cloneElement(child, { id: child.props.id || id, 'aria-label': child.props['aria-label'] || label })
          : child
      )}
    </div>
  );
};

const SelectField = ({ label, value, onChange, options }) => (
  <Field label={label}>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={label}
      className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
    >
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  </Field>
);

const ColorField = ({ label, value, onChange }) => (
  <Field label={label}>
    <div className="flex gap-2">
      <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
        aria-label={`${label} color picker`}
        className="w-9 h-9 p-0.5 rounded border border-gray-300 dark:border-gray-700 cursor-pointer bg-white dark:bg-gray-800" />
      <Input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#000000" aria-label={`${label} hex value`} className="flex-1 h-9" />
    </div>
  </Field>
);

const NumberField = ({ label, value, onChange, min = 0, max = 9999, step = 1, suffix = 'px' }) => (
  <Field label={`${label}${suffix ? ` (${suffix})` : ''}`}>
    <Input type="number" value={value ?? ''} onChange={e => onChange(Number(e.target.value))}
      aria-label={`${label}${suffix ? ' in ' + suffix : ''}`}
      min={min} max={max} step={step} className="h-8 text-sm" />
  </Field>
);

const SectionHead = ({ title }) => (
  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-1">{title}</h4>
);

/** Simple array editor – each item is a string */
const StringArrayEditor = ({ items = [], onChange, placeholder = 'Item text', addLabel = 'Add item' }) => {
  const add = () => onChange([...items, '']);
  const remove = i => onChange(items.filter((_, idx) => idx !== i));
  const change = (i, v) => onChange(items.map((item, idx) => idx === i ? v : item));
  const move = (i, dir) => {
    const arr = [...items];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  };

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input value={item} onChange={e => change(i, e.target.value)} placeholder={placeholder} className="h-7 text-xs flex-1" />
          <button onClick={() => move(i, -1)} className="p-1 text-gray-400 hover:text-gray-600"><ChevronUp size={12} /></button>
          <button onClick={() => move(i, 1)} className="p-1 text-gray-400 hover:text-gray-600"><ChevronDown size={12} /></button>
          <button onClick={() => remove(i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full h-7 text-xs gap-1">
        <Plus size={11} />{addLabel}
      </Button>
    </div>
  );
};

/** Array editor for objects with title + content */
const PairArrayEditor = ({ items = [], onChange, titlePlaceholder = 'Title', contentPlaceholder = 'Content', addLabel = 'Add item' }) => {
  const add = () => onChange([...items, { title: '', content: '' }]);
  const remove = i => onChange(items.filter((_, idx) => idx !== i));
  const change = (i, field, v) => onChange(items.map((item, idx) => idx === i ? { ...item, [field]: v } : item));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-md p-2 space-y-1.5">
          <div className="flex items-center gap-1">
            <Input value={item.title || ''} onChange={e => change(i, 'title', e.target.value)}
              placeholder={titlePlaceholder} className="h-7 text-xs flex-1" />
            <button onClick={() => remove(i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
          </div>
          <textarea value={item.content || ''} onChange={e => change(i, 'content', e.target.value)}
            placeholder={contentPlaceholder} rows={2}
            className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-800 resize-none" />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full h-7 text-xs gap-1">
        <Plus size={11} />{addLabel}
      </Button>
    </div>
  );
};

/* ── Content Tab ───────────────────────────────────────────────── */

const ContentTab = ({ element, updateElement }) => {
  const prop = (name, value) => updateElement(element.id, { props: { ...element.props, [name]: value } });
  const p = element.props || {};

  if (element.type === 'queryloop') return <QueryLoopEditor element={element} updateElement={updateElement} />;
  if (element.type === 'form') return <FormBuilder element={element} updateElement={updateElement} />;

  switch (element.type) {

    /* ── Text elements ── */
    case 'heading':
      return (
        <>
          <Field label="Text">
            <Input value={p.text || ''} onChange={e => prop('text', e.target.value)} placeholder="Heading text" />
          </Field>
          <SelectField label="Tag" value={p.tag || 'h2'} onChange={v => prop('tag', v)}
            options={['h1','h2','h3','h4','h5','h6'].map(v => ({ value: v, label: v.toUpperCase() }))} />
        </>
      );

    case 'text':
      return (
        <Field label="Text">
          <textarea value={p.text || ''} onChange={e => prop('text', e.target.value)}
            placeholder="Enter text content" rows={5}
            className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm resize-y" />
        </Field>
      );

    case 'richtext':
      return (
        <>
          <Field label="HTML Content">
            <textarea value={p.html || ''} onChange={e => prop('html', e.target.value)}
              placeholder="<p>Your <strong>formatted</strong> content...</p>" rows={7}
              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-xs font-mono resize-y" />
          </Field>
          <p className="text-xs text-gray-400 leading-relaxed">
            Supports HTML: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&lt;p&gt;</code>,{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&lt;strong&gt;</code>,{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&lt;em&gt;</code>,{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&lt;ul&gt;</code>,{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&lt;a&gt;</code>, etc.
          </p>
        </>
      );

    case 'link':
      return (
        <>
          <Field label="Link Text">
            <Input value={p.text || ''} onChange={e => prop('text', e.target.value)} placeholder="Click here" />
          </Field>
          <Field label="URL">
            <Input value={p.href || ''} onChange={e => prop('href', e.target.value)} placeholder="https://example.com" />
          </Field>
          <SelectField label="Open in" value={p.target || '_self'} onChange={v => prop('target', v)}
            options={[{ value: '_self', label: 'Same tab' }, { value: '_blank', label: 'New tab' }]} />
        </>
      );

    case 'blockquote':
      return (
        <>
          <Field label="Quote">
            <textarea value={p.text || ''} onChange={e => prop('text', e.target.value)}
              placeholder="Quote text" rows={3}
              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm resize-y" />
          </Field>
          <Field label="Author / Citation">
            <Input value={p.author || ''} onChange={e => prop('author', e.target.value)} placeholder="— Author Name" />
          </Field>
        </>
      );

    case 'code':
      return (
        <>
          <Field label="Code">
            <textarea value={p.code || ''} onChange={e => prop('code', e.target.value)}
              placeholder="// your code here" rows={6}
              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-900 text-green-400 text-xs font-mono resize-y" />
          </Field>
          <SelectField label="Language" value={p.language || 'javascript'} onChange={v => prop('language', v)}
            options={['javascript','typescript','python','html','css','json','bash','sql','php','ruby'].map(v => ({ value: v, label: v }))} />
        </>
      );

    case 'list':
      return (
        <>
          <SelectField label="List type" value={p.listType || 'unordered'} onChange={v => prop('listType', v)}
            options={[{ value: 'unordered', label: 'Bulleted (ul)' }, { value: 'ordered', label: 'Numbered (ol)' }]} />
          <SectionHead title="Items" />
          <StringArrayEditor items={p.items || []} onChange={v => prop('items', v)} addLabel="Add item" />
        </>
      );

    /* ── Media elements ── */
    case 'image':
      return (
        <>
          <Field label="Image URL">
            <Input value={p.src || ''} onChange={e => prop('src', e.target.value)} placeholder="https://example.com/image.jpg" />
          </Field>
          <Field label="Alt Text">
            <Input value={p.alt || ''} onChange={e => prop('alt', e.target.value)} placeholder="Image description" />
          </Field>
          <Field label="Link URL (optional)">
            <Input value={p.href || ''} onChange={e => prop('href', e.target.value)} placeholder="https://example.com" />
          </Field>
        </>
      );

    case 'video':
      return (
        <>
          <Field label="Video URL">
            <Input value={p.src || ''} onChange={e => prop('src', e.target.value)} placeholder="https://example.com/video.mp4" />
          </Field>
          {[['autoplay','Autoplay'],['controls','Show Controls'],['loop','Loop'],['muted','Muted']].map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={!!p[k]} onChange={e => prop(k, e.target.checked)} className="rounded" />
              {label}
            </label>
          ))}
        </>
      );

    case 'youtube':
    case 'youtubeembed':
      return (
        <>
          <Field label="YouTube Video ID or URL">
            <Input value={p.videoId || ''} onChange={e => {
              const raw = e.target.value;
              // Extract ID from full URL if pasted
              const match = raw.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
              prop('videoId', match ? match[1] : raw);
            }} placeholder="dQw4w9WgXcQ" />
          </Field>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!p.autoplay} onChange={e => prop('autoplay', e.target.checked)} className="rounded" />
            Autoplay
          </label>
        </>
      );

    case 'bgimage':
      return (
        <>
          <Field label="Image URL">
            <Input value={p.src || ''} onChange={e => prop('src', e.target.value)} placeholder="https://example.com/bg.jpg" />
          </Field>
          <Field label={`Overlay Opacity: ${Math.round((p.overlay ?? 0) * 100)}%`}>
            <input type="range" min="0" max="1" step="0.05" value={p.overlay ?? 0}
              onChange={e => prop('overlay', Number(e.target.value))} className="w-full" />
          </Field>
          <SelectField label="Background Size" value={p.backgroundSize || 'cover'} onChange={v => prop('backgroundSize', v)}
            options={['cover','contain','auto'].map(v => ({ value: v, label: v }))} />
          <SelectField label="Background Position" value={p.backgroundPosition || 'center'} onChange={v => prop('backgroundPosition', v)}
            options={['center','top','bottom','left','right'].map(v => ({ value: v, label: v }))} />
        </>
      );

    case 'bgvideo':
      return (
        <>
          <Field label="Video URL (.mp4 recommended)">
            <Input value={p.src || ''} onChange={e => prop('src', e.target.value)} placeholder="https://example.com/bg.mp4" />
          </Field>
          <Field label={`Overlay Opacity: ${Math.round((p.overlay ?? 0) * 100)}%`}>
            <input type="range" min="0" max="1" step="0.05" value={p.overlay ?? 0}
              onChange={e => prop('overlay', Number(e.target.value))} className="w-full" />
          </Field>
          {[['muted','Muted (required for autoplay)'],['loop','Loop'],].map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={p[k] !== false} onChange={e => prop(k, e.target.checked)} className="rounded" />
              {label}
            </label>
          ))}
        </>
      );

    case 'audio':
      return (
        <>
          <Field label="Audio URL">
            <Input value={p.src || ''} onChange={e => prop('src', e.target.value)} placeholder="https://example.com/audio.mp3" />
          </Field>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!p.controls} onChange={e => prop('controls', e.target.checked)} className="rounded" />
            Show Controls
          </label>
        </>
      );

    /* ── Basic UI ── */
    case 'button':
      return (
        <>
          <Field label="Button Text">
            <Input value={p.text || ''} onChange={e => prop('text', e.target.value)} placeholder="Click me" />
          </Field>
          <Field label="Link URL">
            <Input value={p.link || ''} onChange={e => prop('link', e.target.value)} placeholder="https://example.com" />
          </Field>
          <SelectField label="Open in" value={p.target || '_self'} onChange={v => prop('target', v)}
            options={[{ value: '_self', label: 'Same tab' }, { value: '_blank', label: 'New tab' }]} />
          <SelectField label="Variant" value={p.variant || 'primary'} onChange={v => prop('variant', v)}
            options={['primary','secondary','outline','ghost','link'].map(v => ({ value: v, label: v }))} />
          <SelectField label="Size" value={p.size || 'md'} onChange={v => prop('size', v)}
            options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
        </>
      );

    case 'icon':
      return (
        <>
          <Field label="Icon Name">
            <Input value={p.name || p.icon || ''} onChange={e => prop('name', e.target.value)} placeholder="star, heart, home, mail…" />
          </Field>
          <p className="text-xs text-gray-400 leading-relaxed">
            Available: star, heart, home, mail, phone, user, users, settings, search, bell, calendar, camera, check, clock, code, download, eye, file, folder, globe, info, link, list, lock, menu, music, play, send, share, smartphone, sun, tag, target, upload, video, wifi, zap, award, book, database, dollar, flag, layers, lightbulb, message, moon, palette, shield, trending, x, minus, plus
          </p>
          <NumberField label="Size" value={p.size || 24} onChange={v => prop('size', v)} min={12} max={200} />
          <ColorField label="Color" value={p.color || '#8b5cf6'} onChange={v => prop('color', v)} />
          <NumberField label="Stroke Width" value={p.strokeWidth || 2} onChange={v => prop('strokeWidth', v)} min={1} max={4} step={0.5} suffix="" />
        </>
      );

    case 'container':
      return (
        <>
          <Field label="Max Width">
            <Input value={p.maxWidth || '1200px'} onChange={e => prop('maxWidth', e.target.value)} placeholder="1200px, 100%, 960px" className="h-8 text-sm" />
          </Field>
          <NumberField label="Horizontal Padding" value={p.paddingX || 24} onChange={v => prop('paddingX', v)} min={0} max={200} />
        </>
      );

    case 'columns':
    case 'row':
      return (
        <>
          <NumberField label="Number of Columns" value={p.columns || p.cols || 2} onChange={v => prop('columns', v)} min={1} max={12} suffix="" />
          <NumberField label="Gap (px)" value={p.gap || 16} onChange={v => prop('gap', v)} min={0} max={100} />
        </>
      );

    case 'grid':
      return (
        <>
          <NumberField label="Columns" value={p.cols || p.columns || 3} onChange={v => prop('cols', v)} min={1} max={12} suffix="" />
          <NumberField label="Rows" value={p.rows || 2} onChange={v => prop('rows', v)} min={1} max={20} suffix="" />
          <NumberField label="Gap (px)" value={p.gap || 16} onChange={v => prop('gap', v)} min={0} max={100} />
        </>
      );

    case 'divider':
      return (
        <>
          <SelectField label="Style" value={p.style || 'solid'} onChange={v => prop('style', v)}
            options={['solid','dashed','dotted'].map(v => ({ value: v, label: v }))} />
          <NumberField label="Thickness" value={p.thickness || 1} onChange={v => prop('thickness', v)} min={1} max={20} />
          <ColorField label="Color" value={p.color || '#e5e7eb'} onChange={v => prop('color', v)} />
        </>
      );

    case 'spacer':
      return (
        <NumberField label="Height" value={p.height || 40} onChange={v => prop('height', v)} min={4} max={400} />
      );

    case 'badge':
      return (
        <>
          <Field label="Text">
            <Input value={p.text || ''} onChange={e => prop('text', e.target.value)} placeholder="New" />
          </Field>
          <SelectField label="Variant" value={p.variant || 'default'} onChange={v => prop('variant', v)}
            options={['default','primary','success','warning','danger','outline'].map(v => ({ value: v, label: v }))} />
        </>
      );

    case 'alert':
      return (
        <>
          <Field label="Title">
            <Input value={p.title || ''} onChange={e => prop('title', e.target.value)} placeholder="Alert title" />
          </Field>
          <Field label="Message">
            <textarea value={p.message || ''} onChange={e => prop('message', e.target.value)}
              placeholder="Alert message" rows={3}
              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm resize-y" />
          </Field>
          <SelectField label="Type" value={p.type || 'info'} onChange={v => prop('type', v)}
            options={['info','success','warning','error'].map(v => ({ value: v, label: v }))} />
        </>
      );

    /* ── Complex interactive ── */
    case 'accordion':
      return (
        <>
          <SectionHead title="Accordion Items" />
          <PairArrayEditor items={p.items || []} onChange={v => prop('items', v)}
            titlePlaceholder="Question / Title" contentPlaceholder="Answer / Content" addLabel="Add accordion item" />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!p.allowMultiple} onChange={e => prop('allowMultiple', e.target.checked)} className="rounded" />
            Allow multiple open
          </label>
        </>
      );

    case 'tabs':
      return (
        <>
          <SectionHead title="Tab Items" />
          <PairArrayEditor items={p.tabs || []} onChange={v => prop('tabs', v)}
            titlePlaceholder="Tab Label" contentPlaceholder="Tab Content" addLabel="Add tab" />
        </>
      );

    case 'modal':
      return (
        <>
          <Field label="Trigger Button Text">
            <Input value={p.triggerText || ''} onChange={e => prop('triggerText', e.target.value)} placeholder="Open Modal" />
          </Field>
          <Field label="Modal Title">
            <Input value={p.title || ''} onChange={e => prop('title', e.target.value)} placeholder="Modal title" />
          </Field>
          <Field label="Modal Content">
            <textarea value={p.content || ''} onChange={e => prop('content', e.target.value)}
              placeholder="Modal content text" rows={4}
              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm resize-y" />
          </Field>
        </>
      );

    /* ── Data / Stats ── */
    case 'counter':
      return (
        <>
          <NumberField label="Value" value={p.value ?? p.end ?? 0} onChange={v => prop('value', v)} min={0} max={9999999} />
          <Field label="Label">
            <Input value={p.label || ''} onChange={e => prop('label', e.target.value)} placeholder="Customers, Projects…" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Prefix">
              <Input value={p.prefix || ''} onChange={e => prop('prefix', e.target.value)} placeholder="$" className="h-8 text-sm" />
            </Field>
            <Field label="Suffix">
              <Input value={p.suffix || ''} onChange={e => prop('suffix', e.target.value)} placeholder="+" className="h-8 text-sm" />
            </Field>
          </div>
        </>
      );

    case 'progressbar':
      return (
        <>
          <Field label="Label">
            <Input value={p.label || ''} onChange={e => prop('label', e.target.value)} placeholder="Progress label" />
          </Field>
          <NumberField label="Value" value={p.value || 0} onChange={v => prop('value', v)} min={0} max={100} suffix="%" />
          <ColorField label="Bar Color" value={p.color || '#8b5cf6'} onChange={v => prop('color', v)} />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!p.showPercent} onChange={e => prop('showPercent', e.target.checked)} className="rounded" />
            Show percentage
          </label>
        </>
      );

    case 'statcard':
      return (
        <>
          <Field label="Value">
            <Input value={p.value || ''} onChange={e => prop('value', e.target.value)} placeholder="$12,400" />
          </Field>
          <Field label="Label">
            <Input value={p.label || ''} onChange={e => prop('label', e.target.value)} placeholder="Total Revenue" />
          </Field>
          <Field label="Change (e.g. +12%)">
            <Input value={p.change || ''} onChange={e => prop('change', e.target.value)} placeholder="+12%" />
          </Field>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!p.positive} onChange={e => prop('positive', e.target.checked)} className="rounded" />
            Positive change (green)
          </label>
          <Field label="Icon (emoji)">
            <Input value={p.icon || ''} onChange={e => prop('icon', e.target.value)} placeholder="" />
          </Field>
        </>
      );

    case 'table':
      return (
        <>
          <Field label="Headers (comma-separated)">
            <Input value={(p.headers || []).join(', ')} onChange={e => prop('headers', e.target.value.split(',').map(s => s.trim()))}
              placeholder="Name, Email, Role" />
          </Field>
          <SectionHead title="Data Rows (one row per line, comma-separated)" />
          <Field label="">
            <textarea
              value={(p.rows || []).map(r => r.join(', ')).join('\n')}
              onChange={e => prop('rows', e.target.value.split('\n').map(line => line.split(',').map(s => s.trim())))}
              placeholder={"John, john@example.com, Admin\nJane, jane@example.com, User"}
              rows={5}
              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-xs font-mono resize-y" />
          </Field>
        </>
      );

    /* ── Card / Content blocks ── */
    case 'card':
      return (
        <>
          <Field label="Title">
            <Input value={p.title || ''} onChange={e => prop('title', e.target.value)} placeholder="Card Title" />
          </Field>
          <Field label="Text">
            <textarea value={p.text || ''} onChange={e => prop('text', e.target.value)}
              placeholder="Card description" rows={3}
              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm resize-y" />
          </Field>
          <Field label="Image URL">
            <Input value={p.image || ''} onChange={e => prop('image', e.target.value)} placeholder="https://example.com/image.jpg" />
          </Field>
          <Field label="Button Text">
            <Input value={p.buttonText || ''} onChange={e => prop('buttonText', e.target.value)} placeholder="Learn More" />
          </Field>
          <Field label="Button URL">
            <Input value={p.buttonUrl || ''} onChange={e => prop('buttonUrl', e.target.value)} placeholder="https://example.com" />
          </Field>
        </>
      );

    case 'pricing': {
      const plans = p.plans || [];
      const updPlan = (i, field, val) => prop('plans', plans.map((pl, idx) => idx === i ? { ...pl, [field]: val } : pl));
      const addPlan = () => prop('plans', [...plans, { name: 'New Plan', price: '$0', features: [], cta: 'Get Started' }]);
      const removePlan = i => prop('plans', plans.filter((_, idx) => idx !== i));
      return (
        <>
          <SectionHead title="Plans" />
          {plans.map((plan, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Plan {i + 1}</span>
                <button onClick={() => removePlan(i)} className="p-0.5 text-red-400 hover:text-red-600"><Trash2 size={11} /></button>
              </div>
              <Input value={plan.name || ''} onChange={e => updPlan(i, 'name', e.target.value)} placeholder="Plan name" className="h-7 text-xs" />
              <div className="grid grid-cols-2 gap-1">
                <Input value={plan.price || ''} onChange={e => updPlan(i, 'price', e.target.value)} placeholder="$29" className="h-7 text-xs" />
                <Input value={plan.period || '/mo'} onChange={e => updPlan(i, 'period', e.target.value)} placeholder="/mo" className="h-7 text-xs" />
              </div>
              <StringArrayEditor items={plan.features || []} onChange={v => updPlan(i, 'features', v)} placeholder="Feature" addLabel="+ Feature" />
              <Input value={plan.cta || ''} onChange={e => updPlan(i, 'cta', e.target.value)} placeholder="CTA button text" className="h-7 text-xs" />
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={!!plan.highlighted} onChange={e => updPlan(i, 'highlighted', e.target.checked)} className="rounded" />
                Highlighted / Featured
              </label>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addPlan} className="w-full h-7 text-xs gap-1">
            <Plus size={11} />Add Plan
          </Button>
        </>
      );
    }

    case 'timeline': {
      const items = p.items || [];
      const updItem = (i, field, val) => prop('items', items.map((it, idx) => idx === i ? { ...it, [field]: val } : it));
      const addItem = () => prop('items', [...items, { date: '', title: '', description: '' }]);
      const removeItem = i => prop('items', items.filter((_, idx) => idx !== i));
      return (
        <>
          <SectionHead title="Timeline Events" />
          {items.map((item, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Event {i + 1}</span>
                <button onClick={() => removeItem(i)} className="p-0.5 text-red-400 hover:text-red-600"><Trash2 size={11} /></button>
              </div>
              <Input value={item.date || ''} onChange={e => updItem(i, 'date', e.target.value)} placeholder="Date / Period (e.g. 2024)" className="h-7 text-xs" />
              <Input value={item.title || ''} onChange={e => updItem(i, 'title', e.target.value)} placeholder="Event title" className="h-7 text-xs" />
              <Input value={item.description || ''} onChange={e => updItem(i, 'description', e.target.value)} placeholder="Description (optional)" className="h-7 text-xs" />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addItem} className="w-full h-7 text-xs gap-1">
            <Plus size={11} />Add Event
          </Button>
        </>
      );
    }

    case 'carousel':
      return (
        <>
          <SectionHead title="Slides" />
          <StringArrayEditor items={p.slides || []} onChange={v => prop('slides', v)}
            placeholder="Image URL" addLabel="Add slide" />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!p.autoplay} onChange={e => prop('autoplay', e.target.checked)} className="rounded" />
            Autoplay
          </label>
        </>
      );

    case 'imagegallery':
      return (
        <>
          <NumberField label="Columns" value={p.columns || 3} onChange={v => prop('columns', v)} min={1} max={6} suffix="" />
          <SectionHead title="Images" />
          <StringArrayEditor items={p.images || []} onChange={v => prop('images', v)}
            placeholder="https://example.com/photo.jpg" addLabel="Add image" />
        </>
      );

    /* ── Navigation ── */
    case 'breadcrumbs': {
      const crumbs = p.items || [];
      const changeCrumb = (i, field, val) => prop('items', crumbs.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
      return (
        <>
          <SectionHead title="Breadcrumb Links" />
          {crumbs.map((c, i) => (
            <div key={i} className="flex items-center gap-1">
              <Input value={c.label || ''} onChange={e => changeCrumb(i, 'label', e.target.value)} placeholder="Label" className="h-7 text-xs flex-1" />
              <Input value={c.href || ''} onChange={e => changeCrumb(i, 'href', e.target.value)} placeholder="URL" className="h-7 text-xs flex-1" />
              <button onClick={() => prop('items', crumbs.filter((_, idx) => idx !== i))} className="p-1 text-red-400"><Trash2 size={12} /></button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => prop('items', [...crumbs, { label: '', href: '' }])} className="w-full h-7 text-xs gap-1">
            <Plus size={11} />Add crumb
          </Button>
        </>
      );
    }

    case 'pagination':
      return (
        <>
          <NumberField label="Total Pages" value={p.total || p.totalPages || 5} onChange={v => prop('total', v)} min={1} max={999} suffix="" />
          <NumberField label="Current Page" value={p.current || p.currentPage || 1} onChange={v => prop('current', v)} min={1} max={p.total || 5} suffix="" />
        </>
      );

    case 'searchbar':
      return (
        <>
          <Field label="Placeholder">
            <Input value={p.placeholder || ''} onChange={e => prop('placeholder', e.target.value)} placeholder="Search..." />
          </Field>
          <Field label="Button Text">
            <Input value={p.buttonText || ''} onChange={e => prop('buttonText', e.target.value)} placeholder="Search" />
          </Field>
        </>
      );

    /* ── Embeds / Maps ── */
    case 'googlemaps':
      return (
        <>
          <Field label="Address or Location">
            <Input value={p.address || p.location || ''} onChange={e => prop('address', e.target.value)} placeholder="New York, NY" />
          </Field>
          <NumberField label="Zoom Level" value={p.zoom || 14} onChange={v => prop('zoom', v)} min={1} max={20} suffix="" />
          <NumberField label="Height" value={p.height || 300} onChange={v => prop('height', v)} min={100} max={800} />
        </>
      );

    case 'embed':
      return (
        <>
          <Field label="Embed Code or URL">
            <textarea value={p.code || p.embedCode || p.url || ''} onChange={e => prop('code', e.target.value)}
              placeholder="<iframe ...> or https://..." rows={4}
              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-xs font-mono resize-y" />
          </Field>
          <NumberField label="Height" value={p.height || 400} onChange={v => prop('height', v)} min={100} max={1200} />
        </>
      );

    /* ── Social ── */
    case 'socialshare': {
      const platforms = ['facebook', 'twitter', 'linkedin', 'pinterest', 'email'];
      return (
        <>
          <Field label="Share URL (leave blank for current page)">
            <Input value={p.url || ''} onChange={e => prop('url', e.target.value)} placeholder="https://yoursite.com/page" />
          </Field>
          <SectionHead title="Platforms" />
          {platforms.map(platform => (
            <label key={platform} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
              <input type="checkbox"
                checked={p.platforms ? p.platforms.includes(platform) : true}
                onChange={e => {
                  const current = p.platforms || platforms;
                  prop('platforms', e.target.checked ? [...current, platform] : current.filter(x => x !== platform));
                }}
                className="rounded" />
              {platform}
            </label>
          ))}
        </>
      );
    }

    /* ── Utility ── */
    case 'countdown':
      return (
        <>
          <Field label="Target Date">
            <Input type="datetime-local" value={p.targetDate || ''} onChange={e => prop('targetDate', e.target.value)} />
          </Field>
          <Field label="Label">
            <Input value={p.label || ''} onChange={e => prop('label', e.target.value)} placeholder="Event starts in:" />
          </Field>
        </>
      );

    case 'cookiebanner':
      return (
        <>
          <Field label="Title">
            <Input value={p.title || ''} onChange={e => prop('title', e.target.value)} placeholder="Cookie Consent" />
          </Field>
          <Field label="Message">
            <textarea value={p.message || ''} onChange={e => prop('message', e.target.value)}
              placeholder="We use cookies to improve your experience..." rows={3}
              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm resize-y" />
          </Field>
          <Field label="Accept Button">
            <Input value={p.acceptText || ''} onChange={e => prop('acceptText', e.target.value)} placeholder="Accept All" />
          </Field>
          <Field label="Decline Button">
            <Input value={p.declineText || ''} onChange={e => prop('declineText', e.target.value)} placeholder="Decline" />
          </Field>
        </>
      );

    case 'backtotop':
      return (
        <Field label="Label">
          <Input value={p.label || ''} onChange={e => prop('label', e.target.value)} placeholder="Back to top" />
        </Field>
      );

    /* ── Chart ── */
    case 'chart': {
      const rawLabels = (p.labels || ['Jan','Feb','Mar']).join(', ');
      const rawData   = (p.data   || [10, 20, 15]).join(', ');
      return (
        <>
          <SelectField label="Chart Type" value={p.type || 'bar'} onChange={v => prop('type', v)}
            options={['bar','line','pie'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))} />
          <Field label="Labels (comma-separated)">
            <Input value={rawLabels} onChange={e => prop('labels', e.target.value.split(',').map(s => s.trim()))} placeholder="Jan, Feb, Mar" />
          </Field>
          <Field label="Data Values (comma-separated)">
            <Input value={rawData} onChange={e => prop('data', e.target.value.split(',').map(s => Number(s.trim()) || 0))} placeholder="10, 20, 15" />
          </Field>
          <ColorField label="Bar Color" value={p.color || '#8b5cf6'} onChange={v => prop('color', v)} />
        </>
      );
    }

    /* ── Submit Button ── */
    case 'submitbtn':
      return (
        <>
          <Field label="Button Text">
            <Input value={p.text || ''} onChange={e => prop('text', e.target.value)} placeholder="Submit" />
          </Field>
          <SelectField label="Variant" value={p.variant || 'primary'} onChange={v => prop('variant', v)}
            options={['primary','secondary','outline'].map(v => ({ value: v, label: v }))} />
        </>
      );

    /* ── Social Follow ── */
    case 'socialfollow':
      return (
        <>
          <Field label="Handle / Username">
            <Input value={p.handle || ''} onChange={e => prop('handle', e.target.value)} placeholder="@youraccount" />
          </Field>
          <SelectField label="Platform" value={p.platform || 'instagram'} onChange={v => prop('platform', v)}
            options={['instagram','twitter','youtube','tiktok','linkedin','facebook'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))} />
          <Field label="Button Text (optional)">
            <Input value={p.buttonText || ''} onChange={e => prop('buttonText', e.target.value)} placeholder="Follow" />
          </Field>
        </>
      );

    /* ── Twitter / X Embed ── */
    case 'twitterembed':
      return (
        <>
          <Field label="Tweet URL">
            <Input value={p.tweetUrl || ''} onChange={e => prop('tweetUrl', e.target.value)} placeholder="https://twitter.com/user/status/123…" />
          </Field>
          <p className="text-xs text-gray-400">Paste the full URL of the tweet you want to embed.</p>
        </>
      );

    /* ── Instagram Embed ── */
    case 'instagramembed':
      return (
        <>
          <Field label="Post URL">
            <Input value={p.postUrl || ''} onChange={e => prop('postUrl', e.target.value)} placeholder="https://www.instagram.com/p/ABC…" />
          </Field>
          <p className="text-xs text-gray-400">Paste the full URL of the Instagram post.</p>
        </>
      );

    default:
      return (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Editing <span className="font-mono text-violet-600">{element.type}</span> element.
          </p>
          {Object.entries(p).map(([key, val]) => (
            typeof val === 'string' || typeof val === 'number' ? (
              <Field key={key} label={key}>
                <Input value={String(val)} onChange={e => prop(key, e.target.value)} />
              </Field>
            ) : null
          ))}
          {Object.keys(p).length === 0 && (
            <p className="text-xs text-gray-400">No editable properties</p>
          )}
        </div>
      );
  }
};

/* ── Settings Tab ─────────────────────────────────────────────── */

const SettingsTab = ({ element, updateElement }) => {
  const styles = element.styles || {};
  const props = element.props || {};

  const setStyle = (key, value) => updateElement(element.id, { styles: { ...styles, [key]: value } });
  const setProp  = (key, value) => updateElement(element.id, { props:  { ...props,  [key]: value } });

  return (
    <div className="space-y-3">
      {/* Identity */}
      <SectionHead title="Identity" />
      <Field label="Element ID (HTML id attribute)">
        <Input value={props.id || ''} onChange={e => setProp('id', e.target.value)}
          placeholder="my-element-id" className="font-mono text-xs" />
      </Field>
      <Field label="CSS Classes">
        <Input value={props.className || ''} onChange={e => setProp('className', e.target.value)}
          placeholder="class-a class-b" className="font-mono text-xs" />
      </Field>
      <Field label="Anchor / Name (internal links)">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 shrink-0">#</span>
          <Input value={props.anchor || ''} onChange={e => setProp('anchor', e.target.value)}
            placeholder="section-features" className="font-mono text-xs" />
        </div>
      </Field>

      {/* Accessibility */}
      <SectionHead title="Accessibility" />
      <Field label="ARIA Label">
        <Input value={props['aria-label'] || ''} onChange={e => setProp('aria-label', e.target.value)}
          placeholder="Describe this element for screen readers" />
      </Field>
      <SelectField label="ARIA Role" value={props.role || ''} onChange={v => setProp('role', v)}
        options={[
          { value: '', label: '— none —' },
          { value: 'banner', label: 'banner' },
          { value: 'navigation', label: 'navigation' },
          { value: 'main', label: 'main' },
          { value: 'region', label: 'region' },
          { value: 'button', label: 'button' },
          { value: 'img', label: 'img' },
          { value: 'presentation', label: 'presentation' },
        ]}
      />

      {/* Behaviour */}
      <SectionHead title="Behaviour" />
      <div className="grid grid-cols-2 gap-2">
        <SelectField label="Cursor" value={styles.cursor || 'auto'} onChange={v => setStyle('cursor', v)}
          options={['auto','default','pointer','text','move','grab','not-allowed','crosshair','zoom-in'].map(v => ({ value: v, label: v }))} />
        <SelectField label="Overflow" value={styles.overflow || 'visible'} onChange={v => setStyle('overflow', v)}
          options={['visible','hidden','scroll','auto'].map(v => ({ value: v, label: v }))} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Z-Index">
          <Input type="number" value={styles.zIndex ?? ''} onChange={e => setStyle('zIndex', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="auto" className="h-8 text-sm" />
        </Field>
        <SelectField label="Pointer Events" value={styles.pointerEvents || 'auto'}
          onChange={v => setStyle('pointerEvents', v)}
          options={['auto','none'].map(v => ({ value: v, label: v }))} />
      </div>

      {/* Custom CSS */}
      <SectionHead title="Custom CSS" />
      <Field label="Inline CSS">
        <textarea value={styles.customCss || ''} onChange={e => setStyle('customCss', e.target.value)}
          placeholder="color: red; font-size: 14px;" rows={4}
          className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-xs font-mono resize-y" />
      </Field>

      {/* Data attributes */}
      <SectionHead title="Data Attributes" />
      <Field label="data-testid">
        <Input value={props['data-testid'] || ''} onChange={e => setProp('data-testid', e.target.value)}
          placeholder="my-component" className="font-mono text-xs" />
      </Field>
    </div>
  );
};

/* ── Motion Tab ────────────────────────────────────────────────── */

const ENTRANCE_ANIMATIONS = [
  { value: 'none',       label: 'None' },
  { value: 'fade',       label: 'Fade In' },
  { value: 'slideUp',    label: 'Slide Up' },
  { value: 'slideDown',  label: 'Slide Down' },
  { value: 'slideLeft',  label: 'Slide Left' },
  { value: 'slideRight', label: 'Slide Right' },
  { value: 'zoom',       label: 'Zoom In' },
  { value: 'bounce',     label: 'Bounce' },
  { value: 'flip',       label: 'Flip' },
  { value: 'rotate',     label: 'Rotate In' },
];

const HOVER_EFFECTS = [
  { value: 'none',    label: 'None' },
  { value: 'lift',    label: 'Lift (translateY)' },
  { value: 'scale',   label: 'Scale Up' },
  { value: 'glow',    label: 'Glow' },
  { value: 'pulse',   label: 'Pulse' },
  { value: 'shake',   label: 'Shake' },
  { value: 'rotate',  label: 'Rotate' },
];

const EASINGS = [
  { value: 'ease',        label: 'Ease' },
  { value: 'ease-in',     label: 'Ease In' },
  { value: 'ease-out',    label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In-Out' },
  { value: 'linear',      label: 'Linear' },
  { value: 'spring',      label: 'Spring' },
];

const MotionTab = ({ element, updateElement }) => {
  const motion = element.motion || {};

  const set = (key, value) => updateElement(element.id, {
    motion: { ...motion, [key]: value }
  });

  const entrance = motion.entrance || 'none';
  const hasEntrance = entrance !== 'none';

  return (
    <div className="space-y-3">
      <SectionHead title="Entrance Animation" />
      <SelectField label="Animation" value={entrance} onChange={v => set('entrance', v)} options={ENTRANCE_ANIMATIONS} />

      {hasEntrance && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Duration (ms)">
              <Input type="number" value={motion.duration ?? 400} onChange={e => set('duration', Number(e.target.value))}
                min={50} max={3000} step={50} className="h-8 text-sm" />
            </Field>
            <Field label="Delay (ms)">
              <Input type="number" value={motion.delay ?? 0} onChange={e => set('delay', Number(e.target.value))}
                min={0} max={2000} step={50} className="h-8 text-sm" />
            </Field>
          </div>
          <SelectField label="Easing" value={motion.easing || 'ease-out'} onChange={v => set('easing', v)} options={EASINGS} />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!motion.scrollTrigger}
              onChange={e => set('scrollTrigger', e.target.checked)} className="rounded" />
            <span className="text-gray-700 dark:text-gray-300">Trigger on scroll</span>
          </label>
          {motion.scrollTrigger && (
            <Field label="Trigger offset (px)">
              <Input type="number" value={motion.scrollOffset ?? 100} onChange={e => set('scrollOffset', Number(e.target.value))}
                min={0} max={500} className="h-8 text-sm" placeholder="100" />
            </Field>
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!motion.repeat}
              onChange={e => set('repeat', e.target.checked)} className="rounded" />
            <span className="text-gray-700 dark:text-gray-300">Repeat animation</span>
          </label>

          {/* Preview badge */}
          <div className="flex items-center gap-2 p-2 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-200 dark:border-violet-800">
            <Zap size={12} className="text-violet-500 shrink-0" />
            <span className="text-xs text-violet-700 dark:text-violet-300">
              {entrance} · {motion.duration ?? 400}ms · {motion.delay ? `+${motion.delay}ms delay` : 'no delay'}
            </span>
          </div>
        </>
      )}

      <SectionHead title="Hover Effect" />
      <SelectField label="Effect" value={motion.hover || 'none'} onChange={v => set('hover', v)} options={HOVER_EFFECTS} />
      {motion.hover && motion.hover !== 'none' && (
        <Field label="Hover Duration (ms)">
          <Input type="number" value={motion.hoverDuration ?? 200} onChange={e => set('hoverDuration', Number(e.target.value))}
            min={50} max={1000} step={50} className="h-8 text-sm" />
        </Field>
      )}

      <SectionHead title="Scroll Parallax" />
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={!!motion.parallax}
          onChange={e => set('parallax', e.target.checked)} className="rounded" />
        <span className="text-gray-700 dark:text-gray-300">Enable parallax</span>
      </label>
      {motion.parallax && (
        <Field label="Speed (0.1 = slow, 1 = full scroll)">
          <Input type="number" value={motion.parallaxSpeed ?? 0.3} onChange={e => set('parallaxSpeed', Number(e.target.value))}
            min={0.05} max={2} step={0.05} className="h-8 text-sm" />
        </Field>
      )}
    </div>
  );
};

/* ── Responsive Tab ──────────────────────────────────────────────── */

const ResponsiveTab = ({ element, updateElement }) => {
  const { currentBreakpoint, setCurrentBreakpoint } = useThemeEditor();
  const bp = currentBreakpoint || 'desktop';

  return (
    <div className="space-y-3">
      {/* Quick visibility toggles for all breakpoints */}
      <SectionHead title="Visibility per Device" />
      {[
        { id: 'mobile',  label: 'Mobile',  Icon: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={7} y={1} width={10} height={22} rx={2}/></svg> },
        { id: 'tablet',  label: 'Tablet',  Icon: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={2} y={3} width={20} height={18} rx={2}/></svg> },
        { id: 'desktop', label: 'Desktop', Icon: () => <Monitor size={14} /> },
      ].map(({ id, label, Icon }) => {
        const resp = element.responsive?.[id] || {};
        const hidden = !!resp.hidden;
        return (
          <div key={id} className={`flex items-center justify-between p-2 rounded-lg border ${
            id === bp
              ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800'
              : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center gap-2">
              <span className={id === bp ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500'}><Icon /></span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
              {id === bp && <span className="text-[10px] text-violet-500 bg-violet-100 dark:bg-violet-900/40 px-1 rounded">active</span>}
            </div>
            <button
              onClick={() => {
                const newResp = { ...element.responsive, [id]: { ...resp, hidden: !hidden } };
                updateElement(element.id, { responsive: newResp });
              }}
              className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                hidden
                  ? 'text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={hidden ? `Show on ${label}` : `Hide on ${label}`}
            >
              {hidden ? 'Hidden' : 'Visible'}
            </button>
          </div>
        );
      })}

      {/* Per-breakpoint style overrides */}
      <SectionHead title={`Overrides for: ${bp}`} />
      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
        Changes below apply only on <strong className="text-gray-700 dark:text-gray-300">{bp}</strong>. Switch device in the toolbar to edit other breakpoints.
      </p>
      <ResponsiveControls element={element} updateElement={updateElement} />
    </div>
  );
};

/* ── Exported panel that wraps all content/settings/motion/responsive tabs ── */

const ElementPropertiesPanel = ({ element, updateElement }) => (
  <>
    <ContentTab element={element} updateElement={updateElement} />
  </>
);

export { ContentTab, SettingsTab, MotionTab, ResponsiveTab };
export default ElementPropertiesPanel;
