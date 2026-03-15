import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { X, ArrowLeft, Layers, Settings, Sparkles } from 'lucide-react';
import NavbarSettings from '../sections/NavbarSettings';

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

const SectionHead = ({ title }) => (
  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-1">{title}</h4>
);

const FourSides = ({ label, values = {}, onChange, max = 200 }) => {
  const sides = [['top','T'],['right','R'],['bottom','B'],['left','L']];
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="grid grid-cols-4 gap-1">
        {sides.map(([side, abbr]) => (
          <div key={side} className="space-y-0.5">
            <span className="text-xs text-gray-400 block text-center">{abbr}</span>
            <Input type="number" value={values[side] ?? 0} onChange={e => onChange(side, Number(e.target.value))}
              min={0} max={max} className="h-7 text-xs text-center px-1" />
          </div>
        ))}
      </div>
    </div>
  );
};

/* Panel label -> icon map for breadcrumb display */
const PANEL_ICONS = {
  layers:   <Layers size={11} />,
  settings: <Settings size={11} />,
  ai:       <Sparkles size={11} />,
};

/* ── Section Inspector ─────────────────────────────────────────── */

const SectionPropertiesPanel = ({ section, updateSection, setSelectedSection, onBack = null, backLabel = null }) => {
  const isNavbar = section.type === 'navbar' ||
    section.name?.toLowerCase().includes('nav');
  const styles = section.styles || {};
  const bg = styles.background || {};
  const padding = styles.padding || {};

  const setStyle = (key, value) => updateSection(section.id, { styles: { ...styles, [key]: value } });
  const setBg = (key, value) => setStyle('background', { ...bg, [key]: value });
  const setPad = (side, value) => setStyle('padding', { ...padding, [side]: Number(value) });

  /* Shared header */
  const Header = () => (
    <>
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 border-b border-gray-200 dark:border-gray-800 transition-colors w-full text-left"
        >
          <ArrowLeft size={11} />
          {PANEL_ICONS[backLabel]}
          <span className="capitalize">{backLabel || 'Back'}</span>
        </button>
      )}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {isNavbar ? 'Navbar' : 'Section'}
          </h3>
          <p className="text-xs text-gray-400 truncate max-w-[180px]">{section.name || section.id}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setSelectedSection(null)} className="h-7 w-7 p-0" title="Deselect (Esc)">
          <X size={14} />
        </Button>
      </div>
    </>
  );

  /* Navbar -> dedicated settings panel */
  if (isNavbar) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-3">
          <NavbarSettings section={section} updateSection={updateSection} />
        </div>
      </div>
    );
  }

  /* Generic section inspector */
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header />

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Name */}
        <Field label="Section Name">
          <Input value={section.name || ''} onChange={e => updateSection(section.id, { name: e.target.value })} placeholder="My Section" />
        </Field>

        {/* Background */}
        <SectionHead title="Background" />
        <SelectField label="Type" value={bg.type || 'solid'} onChange={v => setBg('type', v)}
          options={['none','solid','gradient','image'].map(v => ({ value: v, label: v }))} />
        {(bg.type === 'solid' || !bg.type || bg.type === 'none') && (
          <ColorField label="Color" value={bg.color || '#ffffff'} onChange={v => setBg('color', v)} />
        )}
        {bg.type === 'gradient' && (
          <>
            <ColorField label="Start Color" value={bg.gradientStart || '#8b5cf6'} onChange={v => setBg('gradientStart', v)} />
            <ColorField label="End Color" value={bg.gradientEnd || '#3b82f6'} onChange={v => setBg('gradientEnd', v)} />
            <SelectField label="Direction" value={bg.gradientDir || '135deg'} onChange={v => setBg('gradientDir', v)}
              options={['0deg','45deg','90deg','135deg','180deg'].map(v => ({ value: v, label: v }))} />
          </>
        )}
        {bg.type === 'image' && (
          <>
            <Field label="Image URL">
              <Input value={bg.imageUrl || ''} onChange={e => setBg('imageUrl', e.target.value)} placeholder="https://example.com/bg.jpg" />
            </Field>
            <SelectField label="Size" value={bg.size || 'cover'} onChange={v => setBg('size', v)}
              options={['cover','contain','auto'].map(v => ({ value: v, label: v }))} />
            <SelectField label="Position" value={bg.position || 'center'} onChange={v => setBg('position', v)}
              options={['center','top','bottom','left','right'].map(v => ({ value: v, label: v }))} />
            <Field label="Overlay Color (optional)">
              <ColorField label="" value={bg.overlay || ''} onChange={v => setBg('overlay', v)} />
            </Field>
          </>
        )}

        {/* Padding */}
        <SectionHead title="Padding" />
        <FourSides label="" values={padding} onChange={setPad} max={400} />

        {/* Layout */}
        <SectionHead title="Layout" />
        <Field label="Max Width (container)">
          <Input value={styles.maxWidth || ''} onChange={e => setStyle('maxWidth', e.target.value)} placeholder="1280px, 100%, none" className="h-8 text-sm" />
        </Field>
        <Field label="Min Height">
          <Input value={styles.minHeight || ''} onChange={e => setStyle('minHeight', e.target.value)} placeholder="auto, 100vh, 400px" className="h-8 text-sm" />
        </Field>
        <SelectField label="Content Alignment" value={styles.textAlign || 'left'} onChange={v => setStyle('textAlign', v)}
          options={['left','center','right'].map(v => ({ value: v, label: v }))} />
      </div>
    </div>
  );
};

export default SectionPropertiesPanel;
