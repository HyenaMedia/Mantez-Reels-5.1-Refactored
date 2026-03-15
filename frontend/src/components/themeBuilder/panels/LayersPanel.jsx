import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown, ChevronRight, ChevronUp,
  Eye, EyeOff, Lock, Unlock,
  Plus, Trash2, Copy, Pencil, Check, X, Layers, Box, Navigation
} from 'lucide-react';
import { useThemeEditor } from '../../../contexts/ThemeEditorContext';
import SectionLibrary from '../SectionLibrary';

/* ── Element type icon map ────────────────────────────────────────────── */
const ELEMENT_ICONS = {
  heading: 'H', text: 'T', button: 'B', image: '⬜', divider: '—',
  video: '▶', icon: '★', form: '⊡', accordion: '≡', tabs: '⊟',
  carousel: '◫', counter: '#', list: '≡', blockquote: '"',
  'rich-text': 'RT', spacer: '⬝'
};

const elementIcon = (type) => ELEMENT_ICONS[type] || '◻';

/* ── Inline rename input ───────────────────────────────────────────────── */
const RenameInput = ({ value, onConfirm, onCancel }) => {
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  const confirm = () => onConfirm(draft.trim() || value);
  return (
    <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
      <input
        ref={ref}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') onCancel(); }}
        className="flex-1 text-xs bg-white dark:bg-gray-700 border border-violet-400 rounded px-1.5 py-0.5 text-gray-900 dark:text-white outline-none ring-1 ring-violet-400"
      />
      <button onClick={confirm} aria-label="Confirm rename" className="p-0.5 hover:text-green-600"><Check size={12} /></button>
      <button onClick={onCancel} aria-label="Cancel rename" className="p-0.5 hover:text-red-500"><X size={12} /></button>
    </div>
  );
};

/* ── Single section row ───────────────────────────────────────────────── */
const SectionRow = ({ section, isNavbar, isFirst, isLast, onMoveUp, onMoveDown }) => {
  const {
    selectedSection, setSelectedSection, selectedElement, setSelectedElement,
    toggleSectionVisibility, toggleSectionLock, duplicateSection, deleteSection, renameSection
  } = useThemeEditor();

  const [expanded, setExpanded] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isSelected = selectedSection === section.id;
  const hasElements = (section.elements?.length ?? 0) > 0;

  return (
    <div role="listitem" aria-label={section.name || 'Unnamed Section'}>
      {/* Row */}
      <div
        onClick={() => { setSelectedSection(section.id); setSelectedElement(null); }}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasElements ? expanded : undefined}
        className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'bg-violet-50 dark:bg-violet-900/25 border border-violet-200 dark:border-violet-700'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 border border-transparent'
        } ${section.hidden ? 'opacity-40' : ''}`}
      >
        {/* Move up/down buttons (replaces drag — avoids nested DndContext conflict) */}
        {!isNavbar && !section.locked && (
          <div className="flex flex-col gap-0" role="group" aria-label={`Reorder ${section.name || 'Section'}`} onClick={e => e.stopPropagation()}>
            <button
              onClick={e => { e.stopPropagation(); onMoveUp(); }}
              disabled={isFirst}
              aria-label={`Move ${section.name || 'Section'} up`}
              className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed leading-none"
              title="Move up"
            >
              <ChevronUp size={11} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onMoveDown(); }}
              disabled={isLast}
              aria-label={`Move ${section.name || 'Section'} down`}
              className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed leading-none"
              title="Move down"
            >
              <ChevronDown size={11} />
            </button>
          </div>
        )}
        {isNavbar && (
          <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-500 dark:text-blue-400 px-1 rounded leading-none shrink-0" title="Navbar is pinned as first section">PIN</span>
        )}

        {/* Expand toggle (if has elements) */}
        <button
          onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-4"
          title={hasElements ? 'Toggle elements' : 'No elements'}
        >
          {hasElements
            ? (expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />)
            : <span className="w-4 inline-block" />}
        </button>

        {/* Section name or rename input */}
        {renaming ? (
          <RenameInput
            value={section.name || 'Section'}
            onConfirm={name => { renameSection(section.id, name); setRenaming(false); }}
            onCancel={() => setRenaming(false)}
          />
        ) : (
          <span
            className={`flex-1 text-xs font-medium truncate ${
              isSelected
                ? 'text-violet-700 dark:text-violet-300'
                : 'text-gray-700 dark:text-gray-200'
            }`}
            onDoubleClick={e => { e.stopPropagation(); if (!isNavbar) setRenaming(true); }}
            title={section.name}
          >
            {isNavbar && <span className="mr-1 text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-1 rounded">NAV</span>}
            {section.name || 'Unnamed Section'}
          </span>
        )}

        {/* Element count badge */}
        {!renaming && hasElements && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums mr-1">
            {section.elements.length}
          </span>
        )}

        {/* Action buttons (shown on hover) */}
        {!renaming && !isNavbar && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={e => { e.stopPropagation(); setRenaming(true); }}
              className="p-0.5 hover:text-violet-600 dark:hover:text-violet-400 text-gray-400"
              title="Rename"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); duplicateSection(section.id); }}
              className="p-0.5 hover:text-blue-600 dark:hover:text-blue-400 text-gray-400"
              title="Duplicate"
            >
              <Copy size={11} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); toggleSectionVisibility(section.id); }}
              className="p-0.5 hover:text-yellow-600 dark:hover:text-yellow-400 text-gray-400"
              title={section.hidden ? 'Show section' : 'Hide section'}
            >
              {section.hidden ? <Eye size={11} /> : <EyeOff size={11} />}
            </button>
            <button
              onClick={e => { e.stopPropagation(); toggleSectionLock(section.id); }}
              className="p-0.5 hover:text-orange-600 dark:hover:text-orange-400 text-gray-400"
              title={section.locked ? 'Unlock section' : 'Lock section'}
            >
              {section.locked ? <Lock size={11} /> : <Unlock size={11} />}
            </button>
            {showDeleteConfirm ? (
              <>
                <button
                  onClick={e => { e.stopPropagation(); deleteSection(section.id); setShowDeleteConfirm(false); }}
                  className="p-0.5 text-red-600 hover:text-red-700"
                  title="Confirm delete"
                >
                  <Check size={11} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                  className="p-0.5 text-gray-400 hover:text-gray-600"
                  title="Cancel"
                >
                  <X size={11} />
                </button>
              </>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); setShowDeleteConfirm(true); setTimeout(() => setShowDeleteConfirm(false), 3000); }}
                className="p-0.5 hover:text-red-600 dark:hover:text-red-400 text-gray-400"
                title="Delete section"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expanded elements list */}
      {expanded && hasElements && (
        <div className="ml-7 mt-0.5 mb-1 space-y-0.5" role="list" aria-label={`Elements in ${section.name || 'Section'}`}>
          {section.elements.map(el => {
            const isElSelected = selectedElement === el.id;
            return (
              <div
                key={el.id}
                role="listitem"
                aria-label={`${el.type} element: ${el.props?.text || el.props?.alt || el.type}`}
                onClick={e => { e.stopPropagation(); setSelectedElement(el.id); setSelectedSection(null); }}
                className={`flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                  isElSelected
                    ? 'bg-blue-50 dark:bg-blue-900/25 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <span className="font-mono text-[10px] w-5 text-center select-none opacity-60">
                  {elementIcon(el.type)}
                </span>
                <span className="truncate">{el.props?.text || el.props?.alt || el.type}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Main LayersPanel ──────────────────────────────────────────────────── */
const LayersPanel = () => {
  const { pageState, reorderSections } = useThemeEditor();
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryInsertIndex, setLibraryInsertIndex] = useState(null);

  const sections = pageState?.page?.sections ?? [];

  const openLibraryAt = (idx) => {
    setLibraryInsertIndex(idx);
    setShowLibrary(true);
  };

  const moveUp = (idx) => { if (idx > 0) reorderSections(idx, idx - 1); };
  const moveDown = (idx) => { if (idx < sections.length - 1) reorderSections(idx, idx + 1); };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-violet-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Layers</span>
          <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
            {sections.length}
          </span>
        </div>
        <button
          onClick={() => openLibraryAt(null)}
          className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium px-2 py-1 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
        >
          <Plus size={13} />
          Add Section
        </button>
      </div>

      {/* Legend */}
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2 leading-snug">
        ↑↓ to reorder · Double-click to rename · Hover for actions
      </p>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-1" role="list" aria-label="Page sections">
        {sections.length === 0 ? (
          <div className="text-center py-12">
            <Box size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500">No sections yet</p>
            <button
              onClick={() => openLibraryAt(null)}
              className="mt-3 text-xs text-violet-600 dark:text-violet-400 hover:underline"
            >
              Add your first section
            </button>
          </div>
        ) : (
          sections.map((section, idx) => (
            <React.Fragment key={section.id}>
              <SectionRow
                section={section}
                isFirst={idx === 0}
                isLast={idx === sections.length - 1}
                isNavbar={section.type === 'navbar' || (idx === 0 && section.name?.toLowerCase().includes('nav'))}
                onMoveUp={() => moveUp(idx)}
                onMoveDown={() => moveDown(idx)}
              />
              {/* Insert-between button */}
              <div className="group flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity py-0.5">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <button
                  onClick={() => openLibraryAt(idx + 1)}
                  className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 px-1.5 py-0.5 rounded hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                >
                  <Plus size={10} /> Insert
                </button>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            </React.Fragment>
          ))
        )}
      </div>

      {/* Footer tip */}
      <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
          {sections.length} section{sections.length !== 1 ? 's' : ''} · Click to select & edit
        </p>
      </div>

      {/* Section Library Modal */}
      {showLibrary && (
        <SectionLibrary
          insertAtIndex={libraryInsertIndex}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
};

export default LayersPanel;
