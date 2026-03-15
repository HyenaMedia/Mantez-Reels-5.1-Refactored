import React, { useState } from 'react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';
import { Smartphone, Tablet, Monitor, Eye, EyeOff, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const BREAKPOINTS = [
  { id: 'mobile',  label: 'Mobile',  icon: Smartphone, hint: '< 768px' },
  { id: 'tablet',  label: 'Tablet',  icon: Tablet,     hint: '768–1199px' },
  { id: 'desktop', label: 'Desktop', icon: Monitor,    hint: '≥ 1200px' },
];

const SmallField = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="space-y-1">
    <Label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</Label>
    <Input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-7 text-xs"
    />
  </div>
);

const SmallSelect = ({ label, value, onChange, options }) => (
  <div className="space-y-1">
    <Label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</Label>
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      className="w-full h-7 px-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-xs"
    >
      <option value="">— inherit —</option>
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  </div>
);

/**
 * ResponsiveControls — per-breakpoint overrides panel.
 * Shown in the Style tab of the Inspector.
 * Lets users set visibility + key style overrides per device.
 */
const ResponsiveControls = ({ element, updateElement }) => {
  const { currentBreakpoint, setCurrentBreakpoint } = useThemeEditor();
  const [expanded, setExpanded] = useState(true);

  const bp = currentBreakpoint || 'desktop';
  const overrides = element.responsive?.[bp] || {};
  const hasOverrides = Object.keys(overrides).length > 0;

  const set = (key, value) => {
    const newResp = {
      ...element.responsive,
      [bp]: { ...overrides, [key]: value },
    };
    updateElement(element.id, { responsive: newResp });
  };

  const unset = (key) => {
    const { [key]: _removed, ...rest } = overrides;
    const newResp = { ...element.responsive, [bp]: rest };
    updateElement(element.id, { responsive: newResp });
  };

  const clearAll = () => {
    const { [bp]: _removed, ...rest } = (element.responsive || {});
    updateElement(element.id, { responsive: rest });
  };

  const isHidden = !!overrides.hidden;

  return (
    <div className="rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden">
      {/* Header row with device tabs */}
      <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {BREAKPOINTS.map(({ id, label, icon: Icon, hint }) => {
            const bpOverrides = element.responsive?.[id] || {};
            const hasBpOverrides = Object.keys(bpOverrides).length > 0;
            const isActive = bp === id;
            return (
              <button
                key={id}
                onClick={() => setCurrentBreakpoint(id)}
                title={`${label} (${hint})`}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors relative ${
                  isActive
                    ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-blue-600/60 dark:text-blue-400/60 hover:text-blue-700 dark:hover:text-blue-300'
                }`}
              >
                <Icon size={11} />
                <span className="hidden sm:inline">{label}</span>
                {hasBpOverrides && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          {hasOverrides && (
            <button
              onClick={clearAll}
              title={`Clear all ${bp} overrides`}
              className="p-1 text-blue-500 hover:text-red-500 transition-colors"
            >
              <RotateCcw size={10} />
            </button>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-3 space-y-3 bg-white dark:bg-gray-900">
          {/* Visibility */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Visibility on {bp}
            </span>
            <button
              onClick={() => isHidden ? unset('hidden') : set('hidden', true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                isHidden
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                  : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              }`}
            >
              {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
              {isHidden ? 'Hidden' : 'Visible'}
            </button>
          </div>

          {/* Font size override */}
          <div className="grid grid-cols-2 gap-2">
            <SmallField
              label="Font Size"
              value={overrides.fontSize}
              onChange={v => v ? set('fontSize', v) : unset('fontSize')}
              placeholder="inherit"
            />
            <SmallSelect
              label="Text Align"
              value={overrides.textAlign}
              onChange={v => v ? set('textAlign', v) : unset('textAlign')}
              options={['left','center','right','justify'].map(v => ({ value: v, label: v }))}
            />
          </div>

          {/* Padding override */}
          <div>
            <Label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Padding Override</Label>
            <div className="grid grid-cols-4 gap-1">
              {[['top','T'],['right','R'],['bottom','B'],['left','L']].map(([side, abbr]) => (
                <div key={side} className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 block text-center">{abbr}</span>
                  <Input
                    type="number"
                    value={overrides[`padding${side.charAt(0).toUpperCase()+side.slice(1)}`] ?? ''}
                    onChange={e => {
                      const k = `padding${side.charAt(0).toUpperCase()+side.slice(1)}`;
                      e.target.value ? set(k, Number(e.target.value)) : unset(k);
                    }}
                    placeholder="—"
                    min={0} max={400}
                    className="h-7 text-xs text-center px-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Width override */}
          <SmallField
            label="Width Override"
            value={overrides.width}
            onChange={v => v ? set('width', v) : unset('width')}
            placeholder="inherit (100%, 400px…)"
          />

          {hasOverrides && (
            <p className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 rounded px-2 py-1">
              {Object.keys(overrides).length} override{Object.keys(overrides).length > 1 ? 's' : ''} active on {bp}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResponsiveControls;
