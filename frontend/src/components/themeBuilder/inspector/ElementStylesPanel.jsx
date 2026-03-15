import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  X,
  ChevronUp,
  ChevronDown,
  MousePointer,
  Focus,
  Hand,
  Wand2,
} from 'lucide-react';

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

/* ── Style Tab ─────────────────────────────────────────────────── */

const StyleTab = ({ element, updateElement }) => {
  const styles = element.styles || {};
  const typography = styles.typography || {};
  const background = styles.background || {};
  const border = styles.border || {};
  const shadow = styles.shadow || {};

  const setStyle = (path, value) => {
    if (path.length === 1) {
      updateElement(element.id, { styles: { ...styles, [path[0]]: value } });
    } else {
      updateElement(element.id, {
        styles: { ...styles, [path[0]]: { ...styles[path[0]], [path[1]]: value } }
      });
    }
  };

  return (
    <>
      {/* Typography */}
      <SectionHead title="Typography" />
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="Font Size" value={typography.fontSize || 16} onChange={v => setStyle(['typography','fontSize'], v)} min={8} max={200} />
        <SelectField label="Weight" value={typography.fontWeight || 400} onChange={v => setStyle(['typography','fontWeight'], Number(v))}
          options={[300,400,500,600,700,800].map(w => ({ value: w, label: String(w) }))} />
      </div>
      <ColorField label="Text Color" value={typography.color || '#1f2937'} onChange={v => setStyle(['typography','color'], v)} />
      <SelectField label="Text Align" value={typography.textAlign || 'left'} onChange={v => setStyle(['typography','textAlign'], v)}
        options={['left','center','right','justify'].map(v => ({ value: v, label: v }))} />
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="Line Height" value={typography.lineHeight || 1.5} onChange={v => setStyle(['typography','lineHeight'], v)} min={1} max={3} step={0.1} suffix="" />
        <NumberField label="Letter Spacing" value={typography.letterSpacing || 0} onChange={v => setStyle(['typography','letterSpacing'], v)} min={-5} max={20} />
      </div>

      {/* Background */}
      <SectionHead title="Background" />
      <SelectField label="Type" value={background.type || 'none'} onChange={v => setStyle(['background','type'], v)}
        options={['none','solid','gradient','image'].map(v => ({ value: v, label: v }))} />
      {(background.type === 'solid' || background.type === undefined || background.type === 'none') && (
        <ColorField label="Color" value={background.color || ''} onChange={v => setStyle(['background','color'], v)} />
      )}
      {background.type === 'gradient' && (
        <>
          <ColorField label="Gradient Start" value={background.gradientStart || '#8b5cf6'} onChange={v => setStyle(['background','gradientStart'], v)} />
          <ColorField label="Gradient End" value={background.gradientEnd || '#3b82f6'} onChange={v => setStyle(['background','gradientEnd'], v)} />
          <SelectField label="Direction" value={background.gradientDir || '135deg'} onChange={v => setStyle(['background','gradientDir'], v)}
            options={['0deg','45deg','90deg','135deg','180deg'].map(v => ({ value: v, label: v }))} />
        </>
      )}
      {background.type === 'image' && (
        <>
          <Field label="Image URL">
            <Input value={background.imageUrl || ''} onChange={e => setStyle(['background','imageUrl'], e.target.value)} placeholder="https://example.com/bg.jpg" />
          </Field>
          <SelectField label="Size" value={background.size || 'cover'} onChange={v => setStyle(['background','size'], v)}
            options={['cover','contain','auto'].map(v => ({ value: v, label: v }))} />
          <SelectField label="Position" value={background.position || 'center'} onChange={v => setStyle(['background','position'], v)}
            options={['center','top','bottom','left','right'].map(v => ({ value: v, label: v }))} />
        </>
      )}

      {/* Border */}
      <SectionHead title="Border" />
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="Width" value={border.width || 0} onChange={v => setStyle(['border','width'], v)} min={0} max={20} />
        <SelectField label="Style" value={border.style || 'solid'} onChange={v => setStyle(['border','style'], v)}
          options={['solid','dashed','dotted','none'].map(v => ({ value: v, label: v }))} />
      </div>
      <ColorField label="Border Color" value={border.color || '#e5e7eb'} onChange={v => setStyle(['border','color'], v)} />
      <NumberField label="Border Radius" value={border.radius || 0} onChange={v => setStyle(['border','radius'], v)} min={0} max={200} />

      {/* Shadow */}
      <SectionHead title="Shadow" />
      <SelectField label="Shadow" value={shadow.preset || 'none'} onChange={v => setStyle(['shadow','preset'], v)}
        options={[
          { value: 'none', label: 'None' },
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'Extra Large' },
        ]} />
      {shadow.preset && shadow.preset !== 'none' && (
        <ColorField label="Shadow Color" value={shadow.color || 'rgba(0,0,0,0.1)'} onChange={v => setStyle(['shadow','color'], v)} />
      )}

      {/* Opacity */}
      <SectionHead title="Opacity" />
      <Field label={`Opacity: ${Math.round((styles.opacity ?? 1) * 100)}%`}>
        <input type="range" min="0" max="1" step="0.01" value={styles.opacity ?? 1}
          onChange={e => updateElement(element.id, { styles: { ...styles, opacity: Number(e.target.value) } })}
          className="w-full" />
      </Field>
    </>
  );
};

/* ── State Variants Panel ───────────────────────────────────────── */

const STATE_DEFS = [
  { id: 'hover',  label: 'Hover',  icon: MousePointer, color: 'blue' },
  { id: 'active', label: 'Active / Pressed', icon: Hand, color: 'orange' },
  { id: 'focus',  label: 'Focus',  icon: Focus, color: 'green' },
];

const STATE_PROPS = [
  { key: 'backgroundColor', label: 'Background', type: 'color' },
  { key: 'color',           label: 'Text Color',  type: 'color' },
  { key: 'borderColor',     label: 'Border Color', type: 'color' },
  { key: 'opacity',         label: 'Opacity',     type: 'number', min: 0, max: 1, step: 0.01 },
  { key: 'transform',       label: 'Transform',   type: 'text',  placeholder: 'scale(1.05)' },
  { key: 'boxShadow',       label: 'Box Shadow',  type: 'text',  placeholder: '0 4px 12px rgba(0,0,0,0.2)' },
];

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/10',   border: 'border-blue-200 dark:border-blue-800',   text: 'text-blue-700 dark:text-blue-300',   dot: 'bg-blue-500' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
  green:  { bg: 'bg-green-50 dark:bg-green-900/10',  border: 'border-green-200 dark:border-green-800',  text: 'text-green-700 dark:text-green-300',  dot: 'bg-green-500' },
};

const StateVariantsPanel = ({ element, updateElement }) => {
  const [activeState, setActiveState] = useState(null);
  const variants = element.variants || {};

  const setVariantProp = (stateId, propKey, value) => {
    updateElement(element.id, {
      variants: {
        ...variants,
        [stateId]: { ...(variants[stateId] || {}), [propKey]: value },
      },
    });
  };

  const clearVariantProp = (stateId, propKey) => {
    const { [propKey]: _removed, ...rest } = variants[stateId] || {};
    updateElement(element.id, {
      variants: { ...variants, [stateId]: rest },
    });
  };

  const clearState = (stateId) => {
    const { [stateId]: _removed, ...rest } = variants;
    updateElement(element.id, { variants: rest });
  };

  return (
    <div className="space-y-2">
      <SectionHead title="State Variants" />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Override styles for interactive states.
      </p>

      {STATE_DEFS.map(({ id, label, icon: Icon, color }) => {
        const stateData = variants[id] || {};
        const hasOverrides = Object.keys(stateData).length > 0;
        const isOpen = activeState === id;
        const c = COLOR_MAP[color];

        return (
          <div key={id} className={`rounded-lg border overflow-hidden ${hasOverrides ? c.border : 'border-gray-200 dark:border-gray-700'}`}>
            {/* Header */}
            <button
              onClick={() => setActiveState(isOpen ? null : id)}
              className={`w-full flex items-center justify-between px-3 py-2 transition-colors ${
                hasOverrides ? `${c.bg}` : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={12} className={hasOverrides ? c.text : 'text-gray-400'} />
                <span className={`text-xs font-medium ${hasOverrides ? c.text : 'text-gray-600 dark:text-gray-400'}`}>
                  {label}
                </span>
                {hasOverrides && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}>
                    {Object.keys(stateData).length} prop{Object.keys(stateData).length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {hasOverrides && (
                  <button
                    onClick={e => { e.stopPropagation(); clearState(id); }}
                    className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Clear all overrides"
                  >
                    <X size={10} />
                  </button>
                )}
                {isOpen ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />}
              </div>
            </button>

            {/* Props editor */}
            {isOpen && (
              <div className="px-3 pb-3 pt-2 space-y-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                {STATE_PROPS.map(({ key, label: pLabel, type, min, max, step, placeholder }) => {
                  const val = stateData[key];
                  const hasVal = val !== undefined && val !== '';
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <div className="flex-1 space-y-0.5">
                        <Label className="text-[10px] text-gray-500 uppercase tracking-wider">{pLabel}</Label>
                        {type === 'color' ? (
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={val || '#000000'}
                              onChange={e => setVariantProp(id, key, e.target.value)}
                              className="w-7 h-7 p-0.5 rounded border border-gray-300 dark:border-gray-700 cursor-pointer bg-white dark:bg-gray-800 shrink-0"
                            />
                            <Input
                              value={val || ''}
                              onChange={e => e.target.value ? setVariantProp(id, key, e.target.value) : clearVariantProp(id, key)}
                              placeholder="inherit"
                              className="h-7 text-xs font-mono flex-1"
                            />
                          </div>
                        ) : (
                          <Input
                            type={type}
                            value={val ?? ''}
                            onChange={e => e.target.value ? setVariantProp(id, key, type === 'number' ? Number(e.target.value) : e.target.value) : clearVariantProp(id, key)}
                            placeholder={placeholder || 'inherit'}
                            min={min} max={max} step={step}
                            className="h-7 text-xs"
                          />
                        )}
                      </div>
                      {hasVal && (
                        <button
                          onClick={() => clearVariantProp(id, key)}
                          className="mt-4 p-0.5 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                          title="Remove override"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ── Layout Tab ────────────────────────────────────────────────── */

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

const LayoutTab = ({ element, updateElement }) => {
  const styles = element.styles || {};
  const spacing = styles.spacing || {};
  const padding = styles.padding || {};
  const sizing = styles.sizing || {};

  const setSpacing = (side, val) => updateElement(element.id, { styles: { ...styles, spacing: { ...spacing, [side]: val } } });
  const setPadding = (side, val) => updateElement(element.id, { styles: { ...styles, padding: { ...padding, [side]: val } } });
  const setSizing = (k, v) => updateElement(element.id, { styles: { ...styles, sizing: { ...sizing, [k]: v } } });

  return (
    <>
      {/* Sizing */}
      <SectionHead title="Sizing" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Width">
          <Input value={sizing.width || ''} onChange={e => setSizing('width', e.target.value)} placeholder="100%, 400px, auto" className="h-8 text-sm" />
        </Field>
        <Field label="Max Width">
          <Input value={sizing.maxWidth || ''} onChange={e => setSizing('maxWidth', e.target.value)} placeholder="100%, 800px" className="h-8 text-sm" />
        </Field>
        <Field label="Height">
          <Input value={sizing.height || ''} onChange={e => setSizing('height', e.target.value)} placeholder="auto, 200px" className="h-8 text-sm" />
        </Field>
        <Field label="Min Height">
          <Input value={sizing.minHeight || ''} onChange={e => setSizing('minHeight', e.target.value)} placeholder="0, 100px" className="h-8 text-sm" />
        </Field>
      </div>

      {/* Margin */}
      <SectionHead title="Margin" />
      <FourSides label="" values={spacing} onChange={setSpacing} max={400} />

      {/* Padding */}
      <SectionHead title="Padding" />
      <FourSides label="" values={padding} onChange={setPadding} max={400} />

      {/* Display */}
      <SectionHead title="Display" />
      <SelectField label="Display" value={styles.display || 'block'} onChange={v => updateElement(element.id, { styles: { ...styles, display: v } })}
        options={['block','flex','inline-flex','grid','inline-block','inline','none'].map(v => ({ value: v, label: v }))} />
      {(styles.display === 'flex' || styles.display === 'inline-flex') && (
        <>
          <SelectField label="Direction" value={styles.flexDirection || 'row'} onChange={v => updateElement(element.id, { styles: { ...styles, flexDirection: v } })}
            options={['row','column','row-reverse','column-reverse'].map(v => ({ value: v, label: v }))} />
          <SelectField label="Justify" value={styles.justifyContent || 'flex-start'} onChange={v => updateElement(element.id, { styles: { ...styles, justifyContent: v } })}
            options={['flex-start','center','flex-end','space-between','space-around'].map(v => ({ value: v, label: v }))} />
          <SelectField label="Align Items" value={styles.alignItems || 'stretch'} onChange={v => updateElement(element.id, { styles: { ...styles, alignItems: v } })}
            options={['flex-start','center','flex-end','stretch','baseline'].map(v => ({ value: v, label: v }))} />
          <NumberField label="Gap" value={styles.gap || 0} onChange={v => updateElement(element.id, { styles: { ...styles, gap: v } })} />
        </>
      )}

      {/* Position */}
      <SectionHead title="Position" />
      <SelectField label="Position" value={styles.position || 'static'} onChange={v => updateElement(element.id, { styles: { ...styles, position: v } })}
        options={['static','relative','absolute','fixed','sticky'].map(v => ({ value: v, label: v }))} />
      {styles.position && styles.position !== 'static' && (
        <div className="grid grid-cols-2 gap-2">
          {['top','right','bottom','left'].map(side => (
            <Field key={side} label={side}>
              <Input value={styles[side] || ''} onChange={e => updateElement(element.id, { styles: { ...styles, [side]: e.target.value } })}
                placeholder="auto" className="h-8 text-sm" />
            </Field>
          ))}
        </div>
      )}
    </>
  );
};

/* ── Effects Tab ─────────────────────────────────────────────────── */

const EffectsTab = ({ element, updateElement }) => {
  const styles = element.styles || {};
  const effects = styles.effects || {};
  const transform = styles.transform || {};

  const setFX = (key, val) => updateElement(element.id, { styles: { ...styles, effects: { ...effects, [key]: val } } });
  const setTR = (key, val) => updateElement(element.id, { styles: { ...styles, transform: { ...transform, [key]: val } } });

  return (
    <div className="space-y-3">
      {/* CSS Filters */}
      <SectionHead title="CSS Filters" />
      <Field label={`Blur: ${effects.blur ?? 0}px`}>
        <input type="range" min={0} max={40} step={0.5} value={effects.blur ?? 0}
          onChange={e => setFX('blur', Number(e.target.value))} className="w-full" />
      </Field>
      <Field label={`Brightness: ${Math.round((effects.brightness ?? 1) * 100)}%`}>
        <input type="range" min={0} max={2} step={0.05} value={effects.brightness ?? 1}
          onChange={e => setFX('brightness', Number(e.target.value))} className="w-full" />
      </Field>
      <Field label={`Contrast: ${Math.round((effects.contrast ?? 1) * 100)}%`}>
        <input type="range" min={0} max={2} step={0.05} value={effects.contrast ?? 1}
          onChange={e => setFX('contrast', Number(e.target.value))} className="w-full" />
      </Field>
      <Field label={`Saturate: ${Math.round((effects.saturate ?? 1) * 100)}%`}>
        <input type="range" min={0} max={3} step={0.05} value={effects.saturate ?? 1}
          onChange={e => setFX('saturate', Number(e.target.value))} className="w-full" />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={`Grayscale: ${Math.round((effects.grayscale ?? 0) * 100)}%`}>
          <input type="range" min={0} max={1} step={0.05} value={effects.grayscale ?? 0}
            onChange={e => setFX('grayscale', Number(e.target.value))} className="w-full" />
        </Field>
        <Field label={`Sepia: ${Math.round((effects.sepia ?? 0) * 100)}%`}>
          <input type="range" min={0} max={1} step={0.05} value={effects.sepia ?? 0}
            onChange={e => setFX('sepia', Number(e.target.value))} className="w-full" />
        </Field>
      </div>
      <Field label={`Hue Rotate: ${effects.hueRotate ?? 0}deg`}>
        <input type="range" min={0} max={360} step={5} value={effects.hueRotate ?? 0}
          onChange={e => setFX('hueRotate', Number(e.target.value))} className="w-full" />
      </Field>

      {/* Glass Morphism */}
      <SectionHead title="Glass Morphism" />
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={!!effects.glass}
          onChange={e => setFX('glass', e.target.checked)} className="rounded" />
        <span className="text-gray-700 dark:text-gray-300">Enable glass effect</span>
      </label>
      {effects.glass && (
        <>
          <Field label={`Backdrop Blur: ${effects.backdropBlur ?? 8}px`}>
            <input type="range" min={0} max={40} step={1} value={effects.backdropBlur ?? 8}
              onChange={e => setFX('backdropBlur', Number(e.target.value))} className="w-full" />
          </Field>
          <ColorField label="Glass Tint" value={effects.glassTint || 'rgba(255,255,255,0.15)'}
            onChange={v => setFX('glassTint', v)} />
          <NumberField label="Glass Border Opacity (%)" value={Math.round((effects.glassBorderOpacity ?? 0.2) * 100)}
            onChange={v => setFX('glassBorderOpacity', v / 100)} min={0} max={100} />
        </>
      )}

      {/* Mix Blend Mode */}
      <SectionHead title="Blend Mode" />
      <SelectField label="Mix Blend Mode" value={effects.mixBlendMode || 'normal'}
        onChange={v => setFX('mixBlendMode', v)}
        options={['normal','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','hard-light','soft-light','difference','exclusion','hue','saturation','color','luminosity'].map(v => ({ value: v, label: v }))} />

      {/* Transform */}
      <SectionHead title="Transform" />
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="Scale X (%)" value={Math.round((transform.scaleX ?? 1) * 100)} min={0} max={300}
          onChange={v => setTR('scaleX', v / 100)} />
        <NumberField label="Scale Y (%)" value={Math.round((transform.scaleY ?? 1) * 100)} min={0} max={300}
          onChange={v => setTR('scaleY', v / 100)} />
        <NumberField label="Rotate (deg)" value={transform.rotate ?? 0} min={-360} max={360}
          onChange={v => setTR('rotate', v)} />
        <NumberField label="Skew X (deg)" value={transform.skewX ?? 0} min={-45} max={45}
          onChange={v => setTR('skewX', v)} />
        <NumberField label="Translate X (px)" value={transform.translateX ?? 0} min={-500} max={500}
          onChange={v => setTR('translateX', v)} />
        <NumberField label="Translate Y (px)" value={transform.translateY ?? 0} min={-500} max={500}
          onChange={v => setTR('translateY', v)} />
      </div>
      {(transform.rotate || transform.scaleX || transform.skewX || transform.translateX || transform.translateY) && (
        <button onClick={() => updateElement(element.id, { styles: { ...styles, transform: {} } })}
          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1">
          <X size={11} /> Reset transform
        </button>
      )}

      {/* Effect preview pill */}
      {(effects.blur || effects.glass || effects.mixBlendMode !== 'normal') && (
        <div className="flex items-center gap-2 p-2 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-200 dark:border-violet-800 mt-2">
          <Wand2 size={12} className="text-violet-500 shrink-0" />
          <span className="text-xs text-violet-700 dark:text-violet-300">
            {[
              effects.blur && `blur(${effects.blur}px)`,
              effects.glass && 'glass',
              effects.mixBlendMode && effects.mixBlendMode !== 'normal' && effects.mixBlendMode,
            ].filter(Boolean).join(' · ')}
          </span>
        </div>
      )}
    </div>
  );
};

export { StyleTab, StateVariantsPanel, LayoutTab, EffectsTab };
