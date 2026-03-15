import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { ArrowLeft, Monitor, Tablet, Smartphone, Save, RotateCcw, Keyboard, Undo2, Redo2, Search, Maximize2, Minimize2, X as XIcon, FileText, Download } from 'lucide-react';
import SectionErrorBoundary from '../components/SectionErrorBoundary';

// Extracted constants to avoid re-creating on every render
const DEVICE_PRESETS = [
  { id: 'desktop', icon: Monitor },
  { id: 'tablet',  icon: Tablet },
  { id: 'mobile',  icon: Smartphone },
];
import { useNavigate } from 'react-router-dom';
import { ThemeEditorProvider, useThemeEditor } from '../contexts/ThemeEditorContext';
import { DndProvider } from '../contexts/DndProvider';
import ElementLibrary from '../components/themeBuilder/ElementLibrary';
import DroppableCanvas from '../components/themeBuilder/DroppableCanvas';
import Inspector from '../components/themeBuilder/Inspector';
import GlobalSettings from '../components/themeBuilder/GlobalSettings';
import AIDesignAssistant from '../components/themeBuilder/AIDesignAssistant';
import LayersPanelComponent from '../components/themeBuilder/panels/LayersPanel';
import VersionHistory from '../components/themeBuilder/VersionHistory';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';

/* ── Layers panel wrapper (passes callbacks to new full-featured LayersPanel) ── */
const LayersPanel = ({ onSelectElement, onSelectSection }) => (
  <div className="p-3 h-full">
    <LayersPanelComponent />
  </div>
);

/* ── Recent items helpers ────────────────────────────────────────── */
const RECENTS_KEY = 'vb-recent-items';
const getRecents = () => { try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'); } catch { return []; } };
const pushRecent = (item) => {
  const next = [item, ...getRecents().filter(r => r.id !== item.id)].slice(0, 6);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
};

/* ── Quick Switcher ─ Cmd+K command palette ─────────────────────── */
const QuickSwitcher = ({ onClose, onSelectElement, onSelectSection, onAddSection, onDuplicateSelected, onDeleteSelected, selectedElementId }) => {
  const { pageState } = useThemeEditor();
  const [query, setQuery] = React.useState('');
  const [focusedIdx, setFocusedIdx] = React.useState(0);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);

  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const isCmd = query.startsWith('>');
  const rawQ = isCmd ? query.slice(1).trim() : query.trim();

  const sections = pageState?.page?.sections || [];

  /* Build all navigable items */
  const allItems = React.useMemo(() => {
    const list = [];
    sections.forEach((s, si) => {
      list.push({ kind: 'section', id: s.id, label: s.name || `Section ${si + 1}`, sub: `${s.elements?.length || 0} elements` });
      (s.elements || []).forEach(el => {
        const preview = el.props?.text || el.props?.title || el.props?.label || el.props?.src || '';
        list.push({ kind: 'element', id: el.id, label: el.type, sub: preview.slice(0, 50), sectionName: s.name || `Section ${si + 1}` });
      });
    });
    return list;
  }, [sections]);

  /* Command actions */
  const commands = React.useMemo(() => {
    const cmds = [
      { kind: 'command', id: 'add-section',  label: 'Add new section',       sub: 'Insert a blank section at the bottom', icon: '+', action: onAddSection },
    ];
    if (selectedElementId) {
      cmds.push(
        { kind: 'command', id: 'duplicate',  label: 'Duplicate element',      sub: 'Clone the selected element', icon: '⧉', action: onDuplicateSelected },
        { kind: 'command', id: 'delete-el',  label: 'Delete element',         sub: 'Remove the selected element', icon: '✕', action: onDeleteSelected },
      );
    }
    return cmds;
  }, [selectedElementId, onAddSection, onDuplicateSelected, onDeleteSelected]);

  /* Recents (shown when query is empty and no ">" prefix) */
  const recents = React.useMemo(() => {
    if (rawQ) return [];
    return getRecents().map(r => ({ ...r, kind: r.kind === 'section' ? 'section-recent' : 'element-recent' }));
  }, [rawQ]);

  /* Filter */
  const filtered = React.useMemo(() => {
    if (isCmd) {
      return rawQ
        ? commands.filter(c => c.label.toLowerCase().includes(rawQ.toLowerCase()) || c.sub.toLowerCase().includes(rawQ.toLowerCase()))
        : commands;
    }
    if (!rawQ) {
      // Show recents then all items (deduped)
      const recentIds = new Set(recents.map(r => r.id));
      const rest = allItems.filter(i => !recentIds.has(i.id));
      return [...recents, ...rest];
    }
    return allItems.filter(item =>
      item.label.toLowerCase().includes(rawQ.toLowerCase()) ||
      (item.sub || '').toLowerCase().includes(rawQ.toLowerCase()) ||
      (item.sectionName || '').toLowerCase().includes(rawQ.toLowerCase())
    );
  }, [isCmd, rawQ, commands, recents, allItems]);

  /* Clamp focused index whenever filtered list changes */
  React.useEffect(() => { setFocusedIdx(0); }, [query]);

  /* Keyboard navigation */
  const handleKeyDown = React.useCallback((e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[focusedIdx];
      if (item) selectItem(item);
    }
  }, [filtered, focusedIdx, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Scroll focused item into view */
  React.useEffect(() => {
    const el = listRef.current?.children[focusedIdx];
    el?.scrollIntoView({ block: 'nearest' });
  }, [focusedIdx]);

  const selectItem = (item) => {
    if (item.kind === 'command') { item.action?.(); onClose(); return; }
    const isSection = item.kind === 'section' || item.kind === 'section-recent';
    pushRecent({ kind: isSection ? 'section' : 'element', id: item.id, label: item.label, sub: item.sub });
    if (isSection) onSelectSection(item.id);
    else onSelectElement(item.id);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-20 bg-black/60" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search elements & sections… (type > for commands)"
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none" />
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-500">Esc</kbd>
        </div>

        {/* Hint strip */}
        {!rawQ && !isCmd && recents.length > 0 && (
          <div className="px-4 py-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
            Recent & All
          </div>
        )}
        {isCmd && (
          <div className="px-4 py-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
            <span className="text-violet-500 font-mono">&gt;</span> Commands
          </div>
        )}

        {/* Results list */}
        <div className="max-h-[360px] overflow-y-auto py-1" ref={listRef}>
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-sm text-gray-400 text-center">
              {rawQ ? `No results for "${rawQ}"` : 'No elements yet — add sections to the canvas'}
            </p>
          )}
          {filtered.map((item, idx) => {
            const isSection = item.kind === 'section' || item.kind === 'section-recent';
            const isCmd = item.kind === 'command';
            const isRecent = item.kind === 'section-recent' || item.kind === 'element-recent';
            return (
              <button
                key={`${item.kind}-${item.id}`}
                onClick={() => selectItem(item)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  idx === focusedIdx
                    ? 'bg-violet-50 dark:bg-violet-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {isCmd ? (
                  <span className="text-base w-5 text-center shrink-0 text-violet-500">{item.icon}</span>
                ) : (
                  <span className={`text-xs px-1.5 py-0.5 rounded font-mono shrink-0 ${
                    isSection
                      ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {isSection ? '§' : item.label}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900 dark:text-white font-medium truncate">
                      {isSection ? item.label : (item.kind === 'command' ? item.label : (item.sub || item.label))}
                    </span>
                    {isRecent && (
                      <span className="text-[10px] text-gray-400 shrink-0">recent</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 truncate block">
                    {isSection ? item.sub : (item.kind === 'command' ? item.sub : item.sectionName ? `in ${item.sectionName}` : '')}
                  </span>
                </div>
                {idx === focusedIdx && (
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-800 rounded text-gray-400 shrink-0">↵</kbd>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-[10px] text-gray-400">
          <span><kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono">↵</kbd> select</span>
          <span><kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono">Esc</kbd> close</span>
          <span className="ml-auto"><kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono">&gt;</kbd> commands</span>
        </div>
      </div>
    </div>
  );
};

/* ── Page Meta Editor modal ──────────────────────────────────── */
const PageMetaModal = ({ meta, onSave, onClose }) => {
  const [form, setForm] = React.useState({
    name:        meta?.name        || '',
    title:       meta?.settings?.seo?.title       || '',
    description: meta?.settings?.seo?.description || '',
    keywords:    meta?.settings?.seo?.keywords    || '',
    ogImage:     meta?.settings?.seo?.ogImage     || '',
    lang:        meta?.settings?.lang             || 'en',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText size={16} className="text-violet-500" />
            Page Settings
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XIcon size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Page Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full h-9 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-violet-400 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">SEO Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Page title for search engines"
              className="w-full h-9 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-violet-400 text-gray-900 dark:text-white placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Meta Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={2} placeholder="Brief page description (150–160 chars)"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-violet-400 text-gray-900 dark:text-white placeholder-gray-400 resize-none" />
            <p className="text-[10px] text-right mt-0.5 text-gray-400">{form.description.length}/160</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Keywords (comma-separated)</label>
            <input value={form.keywords} onChange={e => set('keywords', e.target.value)}
              placeholder="react, website, builder"
              className="w-full h-9 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-violet-400 text-gray-900 dark:text-white placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">OG Image URL</label>
            <input value={form.ogImage} onChange={e => set('ogImage', e.target.value)}
              placeholder="https://… (social share image)"
              className="w-full h-9 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-violet-400 text-gray-900 dark:text-white placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Language</label>
            <select value={form.lang} onChange={e => set('lang', e.target.value)}
              className="w-full h-9 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-violet-400 text-gray-900 dark:text-white">
              {['en','es','fr','de','pt','ja','zh','ar'].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 h-9 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 h-9 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Floating (detachable) Inspector ─────────────────────────── */
const FloatingInspector = ({ onDock, onBack, backLabel }) => {
  const posRef  = useRef({ x: window.innerWidth - 380, y: 80 });
  const [pos, setPos] = useState({ x: window.innerWidth - 380, y: 80 });
  const [size, setSize] = useState({ w: 340, h: 600 });
  const dragging = useRef(false);
  const resizing = useRef(false);
  const startData = useRef(null);

  /* Drag header */
  const onHeaderMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return; // Don't start drag on buttons
    dragging.current = true;
    startData.current = { mx: e.clientX, my: e.clientY, px: posRef.current.x, py: posRef.current.y };
    e.preventDefault();
  }, []);

  // Store size in a ref too, so onMove never reads stale size during drag
  const sizeRef = useRef({ w: 340, h: 600 });

  /* Resize handle (bottom-right corner) — reads from ref, no stale closure */
  const onResizeMouseDown = useCallback((e) => {
    resizing.current = true;
    startData.current = { mx: e.clientX, my: e.clientY, w: sizeRef.current.w, h: sizeRef.current.h };
    e.preventDefault();
    e.stopPropagation();
  }, []); // no deps — reads via ref

  // Register global listeners once (empty dep array = only on mount/unmount)
  useEffect(() => {
    const onMove = (e) => {
      if (dragging.current && startData.current) {
        const dx = e.clientX - startData.current.mx;
        const dy = e.clientY - startData.current.my;
        const nx = Math.max(0, Math.min(window.innerWidth - sizeRef.current.w, startData.current.px + dx));
        const ny = Math.max(0, Math.min(window.innerHeight - 60, startData.current.py + dy));
        posRef.current = { x: nx, y: ny };
        setPos({ x: nx, y: ny });
      }
      if (resizing.current && startData.current) {
        const nw = Math.max(280, Math.min(520, startData.current.w + (e.clientX - startData.current.mx)));
        const nh = Math.max(300, Math.min(window.innerHeight - 100, startData.current.h + (e.clientY - startData.current.my)));
        sizeRef.current = { w: nw, h: nh };
        setSize({ w: nw, h: nh });
      }
    };
    const onUp = () => { dragging.current = false; resizing.current = false; startData.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []); // ✅ empty — listeners registered ONCE, read state via refs

  return (
    <div
      style={{ position: 'fixed', left: pos.x, top: pos.y, width: size.w, height: size.h, zIndex: 500 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden select-none"
    >
      {/* Drag handle / title bar */}
      <div
        onMouseDown={onHeaderMouseDown}
        className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 cursor-move shrink-0"
      >
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Inspector</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onDock}
            title="Dock inspector"
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Minimize2 size={13} />
          </button>
          <button
            onClick={onDock}
            title="Close"
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600"
          >
            <XIcon size={13} />
          </button>
        </div>
      </div>

      {/* Inspector content */}
      <div className="flex-1 overflow-y-auto">
        <Inspector onBack={onBack} backLabel={backLabel} />
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={onResizeMouseDown}
        style={{ position: 'absolute', right: 0, bottom: 0, width: 14, height: 14, cursor: 'se-resize' }}
        className="flex items-end justify-end pr-1 pb-1"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M7 1L1 7M7 4L4 7M7 7L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gray-400" />
        </svg>
      </div>
    </div>
  );
};

/* ── Main content ────────────────────────────────────────────────── */
/* ── Resizable panel hook ─────────────────────────────────────── */
const MIN_PANEL_W = 240;
const MAX_PANEL_W = 480;

const useResizablePanel = (storageKey = 'vb-right-panel-width', defaultWidth = 320) => {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? Math.max(MIN_PANEL_W, Math.min(MAX_PANEL_W, Number(saved))) : defaultWidth;
  });
  // Use a ref so startResize closure never captures stale width
  const widthRef = useRef(width);
  useEffect(() => { widthRef.current = width; }, [width]);

  const startResize = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = widthRef.current; // read from ref, always fresh

    const onMove = (mv) => {
      const next = Math.max(MIN_PANEL_W, Math.min(MAX_PANEL_W, startWidth + (startX - mv.clientX)));
      setWidth(next);
    };
    const onUp = (mv) => {
      const final = Math.max(MIN_PANEL_W, Math.min(MAX_PANEL_W, startWidth + (startX - mv.clientX)));
      localStorage.setItem(storageKey, String(final));
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [storageKey]); // removed `width` dep — stale read prevented by widthRef

  return { width, startResize };
};

const VisualBuilderContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [device, setDevice] = useState('desktop');
  const [rightPanel, setRightPanel] = useState('inspector');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);
  const [prevPanel, setPrevPanel] = useState(null); // for back-button navigation
  const [isInspectorFloating, setIsInspectorFloating] = useState(false);
  const [showPageMeta, setShowPageMeta] = useState(false);
  const { width: panelWidth, startResize } = useResizablePanel();
  const {
    savePage, isDirty, loading,
    undo, redo, canUndo, canRedo,
    deleteElement, duplicateElement,
    selectedElement, setSelectedElement,
    selectedSection, setSelectedSection,
    setCurrentBreakpoint, pageState, addSection,
    saveSnapshot, updatePageState, exportPage,
  } = useThemeEditor();

  const handleSavePageMeta = (form) => {
    const currentMeta = pageState?.page?.meta || {};
    const updated = {
      ...pageState?.page,
      meta: {
        ...currentMeta,
        name: form.name,
        settings: {
          ...(currentMeta.settings || {}),
          lang: form.lang,
          seo: { title: form.title, description: form.description, keywords: form.keywords, ogImage: form.ogImage },
        },
      },
    };
    updatePageState({ page: updated });
    toast({ title: 'Page settings saved', description: `"${form.name}" updated` });
  };

  // Keep context breakpoint in sync with device switcher
  const handleSetDevice = (d) => {
    setDevice(d);
    setCurrentBreakpoint(d === 'mobile' ? 'mobile' : d === 'tablet' ? 'tablet' : 'desktop');
  };

  // Navigation helpers — track previous panel so Inspector can show a back button
  const switchToPanel = (id) => {
    if (id === 'inspector' && rightPanel !== 'inspector') setPrevPanel(rightPanel);
    else if (id !== 'inspector') setPrevPanel(null);
    setRightPanel(id);
  };

  const handleBack = () => {
    const target = prevPanel || 'layers';
    setPrevPanel(null);
    setRightPanel(target);
    setSelectedElement(null);
    setSelectedSection(null);
  };

  // Helper: find the sectionId that contains a given elementId
  const findSectionId = useCallback((elementId) => {
    if (!elementId || !pageState?.page?.sections) return null;
    const section = pageState.page.sections.find(s =>
      s.elements?.some(e => e.id === elementId)
    );
    return section?.id ?? null;
  }, [pageState]);

  // Quick Switcher command actions
  const handleAddSection = () => {
    addSection({ name: 'New Section', elements: [], styles: {} });
    toast({ title: 'Section added', description: 'A new blank section was added.' });
  };
  const handleDuplicateSelected = () => {
    if (!selectedElement) return;
    const sectionId = findSectionId(selectedElement);
    if (!sectionId) return;
    duplicateElement(selectedElement, sectionId);
    toast({ title: 'Duplicated', description: 'Element duplicated.' });
  };
  const handleDeleteSelected = () => {
    if (selectedElement) { deleteElement(selectedElement); setSelectedElement(null); toast({ title: 'Deleted', description: 'Element removed.' }); }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      const tag = document.activeElement?.tagName;
      const isEditing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || document.activeElement?.isContentEditable;

      // Cmd/Ctrl+S → Save page
      if (mod && !e.shiftKey && e.key === 's') {
        e.preventDefault();
        if (isDirty && !loading) savePage().then(r => {
          if (r?.success) toast({ title: 'Saved!', description: 'Page saved successfully.' });
          else toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
        });
        return;
      }
      // Cmd/Ctrl+Shift+S → Quick snapshot
      if (mod && e.shiftKey && e.key === 's') {
        e.preventDefault();
        const snap = saveSnapshot(`Quick save ${new Date().toLocaleTimeString()}`);
        toast({ title: '📸 Snapshot saved', description: snap.label });
        return;
      }
      // Cmd/Ctrl+Z → Undo
      if (mod && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }
      // Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y → Redo
      if ((mod && e.shiftKey && e.key === 'z') || (mod && e.key === 'y')) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }
      // Cmd/Ctrl+K → Quick switcher
      if (mod && e.key === 'k') {
        e.preventDefault();
        setShowQuickSwitcher(s => !s);
        return;
      }
      // Cmd/Ctrl+/ → Shortcuts help
      if (mod && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(s => !s);
        return;
      }
      // Cmd/Ctrl+D → Duplicate selected element
      if (mod && e.key === 'd' && selectedElement) {
        e.preventDefault();
        const sId = findSectionId(selectedElement);
        if (sId) {
          duplicateElement(selectedElement, sId);
          toast({ title: 'Duplicated', description: 'Element duplicated.' });
        }
        return;
      }
      if (isEditing) return;
      // Delete/Backspace → Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        e.preventDefault();
        deleteElement(selectedElement);
        setSelectedElement(null);
        return;
      }
      // Escape → Deselect or go back
      if (e.key === 'Escape') {
        e.preventDefault();
        if (selectedElement) { setSelectedElement(null); return; }
        if (selectedSection) { setSelectedSection(null); return; }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isDirty, loading, canUndo, canRedo, selectedElement, selectedSection, savePage, undo, redo, deleteElement, duplicateElement, setSelectedElement, setSelectedSection, toast]);

  const handleSave = async () => {
    const result = await savePage();
    if (result?.success) {
      toast({ title: 'Saved!', description: 'Page saved successfully.' });
    } else {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    }
  };

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-950 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="gap-1.5">
            <ArrowLeft size={15} />
            Admin
          </Button>
          <span className="text-sm font-semibold text-gray-800 dark:text-white">Visual Builder</span>
          {isDirty && <span className="text-xs text-amber-500 font-medium">● Unsaved</span>}
        </div>

        {/* Device switcher */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          {DEVICE_PRESETS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleSetDevice(id)}
              className={`p-1.5 rounded-md transition-colors ${
                device === id
                  ? 'bg-white dark:bg-gray-700 shadow text-violet-600'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={id.charAt(0).toUpperCase() + id.slice(1)}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} className="h-8 w-8 p-0" title="Undo (Ctrl+Z)">
            <Undo2 size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo} className="h-8 w-8 p-0" title="Redo (Ctrl+Shift+Z)">
            <Redo2 size={14} />
          </Button>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
          <Button variant="ghost" size="sm" onClick={() => setShowQuickSwitcher(true)} className="h-8 w-8 p-0" title="Quick switcher (Ctrl+K)">
            <Search size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowShortcuts(true)} className="h-8 w-8 p-0" title="Keyboard shortcuts (Ctrl+/)">
            <Keyboard size={14} />
          </Button>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
          <Button variant="ghost" size="sm" onClick={() => setShowPageMeta(true)} className="gap-1.5 text-xs" title="Page settings (SEO, title, language)">
            <FileText size={14} />
            Page
          </Button>
          {exportPage && (
            <Button variant="ghost" size="sm" onClick={() => exportPage('json')} className="gap-1.5 text-xs" title="Export page as JSON">
              <Download size={14} />
              Export
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/theme-builder')} className="gap-1.5 text-xs">
            <RotateCcw size={14} />
            Classic
          </Button>
          <Button
            size="sm"
            disabled={loading || !isDirty}
            onClick={handleSave}
            className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Save size={14} />
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-80 max-w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ['Ctrl+S', 'Save page'],
                ['Ctrl+Shift+S', 'Quick snapshot (version)'],
                ['Ctrl+Z', 'Undo'],
                ['Ctrl+Shift+Z', 'Redo'],
                ['Ctrl+K', 'Quick switcher'],
                ['Ctrl+D', 'Duplicate selected element'],
                ['Delete / ⌫', 'Delete selected element'],
                ['Esc', 'Deselect / go back'],
                ['Ctrl+/', 'Show this help'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{desc}</span>
                  <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-700 dark:text-gray-300">{key}</kbd>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">On Mac, use ⌘ instead of Ctrl</p>
          </div>
        </div>
      )}

      {/* Quick Switcher Modal */}
      {showQuickSwitcher && (
        <QuickSwitcher
          onClose={() => setShowQuickSwitcher(false)}
          selectedElementId={selectedElement}
          onSelectElement={(id) => {
            setSelectedElement(id);
            setSelectedSection(null);
            switchToPanel('inspector');
            setShowQuickSwitcher(false);
          }}
          onSelectSection={(id) => {
            setSelectedSection(id);
            setSelectedElement(null);
            switchToPanel('inspector');
            setShowQuickSwitcher(false);
          }}
          onAddSection={handleAddSection}
          onDuplicateSelected={handleDuplicateSelected}
          onDeleteSelected={handleDeleteSelected}
        />
      )}

      {/* Page Meta Modal */}
      {showPageMeta && (
        <PageMetaModal
          meta={pageState?.page?.meta}
          onSave={handleSavePageMeta}
          onClose={() => setShowPageMeta(false)}
        />
      )}

      {/* Floating Inspector */}
      {isInspectorFloating && (
        <FloatingInspector
          onDock={() => setIsInspectorFloating(false)}
          onBack={prevPanel ? handleBack : null}
          backLabel={prevPanel}
        />
      )}

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Element Library */}
        <ElementLibrary />

        {/* Center: Canvas */}
        <main className="flex-1 overflow-auto">
          <SectionErrorBoundary name="Canvas">
            <DroppableCanvas device={device} />
          </SectionErrorBoundary>
        </main>

        {/* Right: Inspector / Layers */}
        <aside
          style={{ width: panelWidth }}
          className="bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden relative shrink-0"
        >
          {/* Drag-to-resize handle */}
          <div
            onMouseDown={startResize}
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-violet-400 transition-colors group z-10"
            title="Drag to resize panel"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r bg-gray-300 dark:bg-gray-600 group-hover:bg-violet-400 transition-colors" />
          </div>
          {/* Panel tabs */}
          <div className="flex items-stretch border-b border-gray-200 dark:border-gray-800 shrink-0">
            {[
              { id: 'inspector', label: 'Inspector' },
              { id: 'layers',    label: 'Layers' },
              { id: 'settings',  label: 'Settings' },
              { id: 'history',   label: 'History' },
              { id: 'ai',        label: '✦ AI' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => switchToPanel(id)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  rightPanel === id
                    ? 'text-violet-600 border-b-2 border-violet-500 bg-violet-50 dark:bg-violet-900/10'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
            {/* Pop-out button: only on Inspector tab */}
            {rightPanel === 'inspector' && (
              <button
                onClick={() => setIsInspectorFloating(f => !f)}
                title={isInspectorFloating ? 'Dock inspector' : 'Pop out inspector'}
                className="px-2 text-gray-400 hover:text-violet-600 transition-colors border-l border-gray-200 dark:border-gray-700"
              >
                {isInspectorFloating ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            <SectionErrorBoundary name="Panel">
            <div key={rightPanel} className="h-full panel-slide-in">
              {rightPanel === 'inspector' && !isInspectorFloating && (
                <Inspector
                  onBack={prevPanel ? handleBack : null}
                  backLabel={prevPanel}
                />
              )}
              {rightPanel === 'inspector' && isInspectorFloating && (
                <div className="h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <Maximize2 size={28} className="text-gray-300 dark:text-gray-700" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Inspector is floating.<br />
                    Drag it anywhere on screen.
                  </p>
                  <button
                    onClick={() => setIsInspectorFloating(false)}
                    className="mt-1 text-xs text-violet-600 hover:underline"
                  >
                    Dock back
                  </button>
                </div>
              )}
              {rightPanel === 'layers' && (
                <LayersPanel
                  onSelectElement={() => switchToPanel('inspector')}
                  onSelectSection={() => switchToPanel('inspector')}
                />
              )}
              {rightPanel === 'settings' && <GlobalSettings />}
              {rightPanel === 'history' && <VersionHistory pageId={pageState?.page?.meta?.id || 'home'} />}
              {rightPanel === 'ai' && <AIDesignAssistant />}
            </div>
            </SectionErrorBoundary>
          </div>
        </aside>
      </div>

      {/* Status bar */}
      <footer className="h-6 flex items-center justify-between px-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shrink-0 text-xs text-gray-400 dark:text-gray-600">
        <div className="flex items-center gap-4">
          <span>{pageState?.page?.sections?.length ?? 0} sections</span>
          <span>{pageState?.page?.sections?.reduce((acc, s) => acc + (s.elements?.length || 0), 0) ?? 0} elements</span>
        </div>
        <div className="flex items-center gap-3">
          <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500 font-mono text-[10px]">⌘K</kbd>
          <span>Search</span>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500 font-mono text-[10px]">⌘S</kbd>
          <span>Save</span>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500 font-mono text-[10px]">⌘/</kbd>
          <span>Shortcuts</span>
        </div>
      </footer>
    </div>
  );
};


const VisualBuilder = () => (
  <ThemeEditorProvider>
    <DndProvider>
      <VisualBuilderContent />
    </DndProvider>
  </ThemeEditorProvider>
);

export default VisualBuilder;
