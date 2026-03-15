import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Trash2, Copy, Scissors, Clipboard, ArrowRightFromLine,
} from 'lucide-react';
import { useThemeEditor } from '../../../contexts/ThemeEditorContext';
import CanvasContextMenu from './CanvasContextMenu';
import MotionWrapper from './MotionWrapper';
import DynamicElement from './DynamicElement';

/**
 * SortableElement - Individual element within a section
 */
const SortableElement = ({ element, sectionId }) => {
  const {
    updateElement, deleteElement, addElement, duplicateElement,
    moveElementToSection, selectedElement, setSelectedElement, setSelectedSection, pageState
  } = useThemeEditor();
  const [isHovered, setIsHovered] = React.useState(false);
  const [ctxMenu, setCtxMenu] = React.useState(null); // { x, y }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: element.id,
    data: { type: 'element', element, sectionId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const isSelected = selectedElement === element.id;

  // Generate element styles from all style categories
  const elementStyles = React.useMemo(() => {
    const s = element.styles || {};
    const css = {};

    // Typography
    if (s.typography) {
      const t = s.typography;
      if (t.fontSize) css.fontSize = `${t.fontSize}px`;
      if (t.fontWeight) css.fontWeight = t.fontWeight;
      if (t.color) css.color = t.color;
      if (t.textAlign) css.textAlign = t.textAlign;
      if (t.lineHeight) css.lineHeight = t.lineHeight;
      if (t.letterSpacing) css.letterSpacing = `${t.letterSpacing}px`;
    }

    // Spacing (margin)
    if (s.spacing) {
      const sp = s.spacing;
      if (sp.top != null) css.marginTop = `${sp.top}px`;
      if (sp.right != null) css.marginRight = `${sp.right}px`;
      if (sp.bottom != null) css.marginBottom = `${sp.bottom}px`;
      if (sp.left != null) css.marginLeft = `${sp.left}px`;
      // Legacy keys
      if (sp.marginTop != null) css.marginTop = `${sp.marginTop}px`;
      if (sp.marginBottom != null) css.marginBottom = `${sp.marginBottom}px`;
    }

    // Padding
    if (s.padding) {
      const p = s.padding;
      if (p.top != null || p.right != null || p.bottom != null || p.left != null) {
        css.padding = `${p.top || 0}px ${p.right || 0}px ${p.bottom || 0}px ${p.left || 0}px`;
      }
    }

    // Sizing
    if (s.sizing) {
      const sz = s.sizing;
      if (sz.width) css.width = sz.width;
      if (sz.maxWidth) css.maxWidth = sz.maxWidth;
      if (sz.height) css.height = sz.height;
      if (sz.minHeight) css.minHeight = sz.minHeight;
    }

    // Background
    if (s.background) {
      const bg = s.background;
      if (bg.type === 'solid' && bg.color) {
        css.backgroundColor = bg.color;
      } else if (bg.type === 'gradient' && bg.gradientStart && bg.gradientEnd) {
        css.background = `linear-gradient(${bg.gradientDir || '135deg'}, ${bg.gradientStart}, ${bg.gradientEnd})`;
      } else if (bg.type === 'image' && bg.imageUrl) {
        css.backgroundImage = `url(${bg.imageUrl})`;
        css.backgroundSize = bg.size || 'cover';
        css.backgroundPosition = bg.position || 'center';
      } else if (bg.color) {
        css.backgroundColor = bg.color;
      }
    }

    // Border
    if (s.border) {
      const b = s.border;
      if (b.width) css.border = `${b.width}px ${b.style || 'solid'} ${b.color || '#e5e7eb'}`;
      if (b.radius) css.borderRadius = `${b.radius}px`;
    }

    // Shadow
    if (s.shadow?.preset && s.shadow.preset !== 'none') {
      const shadows = { sm: '0 1px 2px', md: '0 4px 6px', lg: '0 10px 15px', xl: '0 20px 25px' };
      const sc = s.shadow.color || 'rgba(0,0,0,0.1)';
      css.boxShadow = `${shadows[s.shadow.preset] || '0 4px 6px'} ${sc}`;
    }

    // Opacity
    if (s.opacity != null && s.opacity !== 1) css.opacity = s.opacity;

    // Display / Flex
    if (s.display) css.display = s.display;
    if (s.flexDirection) css.flexDirection = s.flexDirection;
    if (s.justifyContent) css.justifyContent = s.justifyContent;
    if (s.alignItems) css.alignItems = s.alignItems;
    if (s.gap) css.gap = `${s.gap}px`;

    // Position
    if (s.position && s.position !== 'static') {
      css.position = s.position;
      ['top','right','bottom','left'].forEach(side => {
        if (s[side]) css[side] = s[side];
      });
    }

    // CSS Filters + Effects
    if (s.effects) {
      const fx = s.effects;
      const filterParts = [];
      if (fx.blur)       filterParts.push(`blur(${fx.blur}px)`);
      if (fx.brightness != null && fx.brightness !== 1) filterParts.push(`brightness(${fx.brightness})`);
      if (fx.contrast   != null && fx.contrast   !== 1) filterParts.push(`contrast(${fx.contrast})`);
      if (fx.saturate   != null && fx.saturate   !== 1) filterParts.push(`saturate(${fx.saturate})`);
      if (fx.grayscale)  filterParts.push(`grayscale(${fx.grayscale})`);
      if (fx.sepia)      filterParts.push(`sepia(${fx.sepia})`);
      if (fx.hueRotate)  filterParts.push(`hue-rotate(${fx.hueRotate}deg)`);
      if (filterParts.length) css.filter = filterParts.join(' ');
      if (fx.mixBlendMode && fx.mixBlendMode !== 'normal') css.mixBlendMode = fx.mixBlendMode;
      // Glass morphism
      if (fx.glass) {
        css.backdropFilter = `blur(${fx.backdropBlur ?? 8}px)`;
        css.WebkitBackdropFilter = `blur(${fx.backdropBlur ?? 8}px)`;
        css.backgroundColor = fx.glassTint || 'rgba(255,255,255,0.15)';
        css.border = `1px solid rgba(255,255,255,${fx.glassBorderOpacity ?? 0.2})`;
      }
    }

    // Transform
    if (s.transform) {
      const tr = s.transform;
      const parts = [];
      if (tr.scaleX != null && tr.scaleX !== 1) parts.push(`scaleX(${tr.scaleX})`);
      if (tr.scaleY != null && tr.scaleY !== 1) parts.push(`scaleY(${tr.scaleY})`);
      if (tr.rotate)     parts.push(`rotate(${tr.rotate}deg)`);
      if (tr.skewX)      parts.push(`skewX(${tr.skewX}deg)`);
      if (tr.translateX) parts.push(`translateX(${tr.translateX}px)`);
      if (tr.translateY) parts.push(`translateY(${tr.translateY}px)`);
      if (parts.length) css.transform = (css.transform ? css.transform + ' ' : '') + parts.join(' ');
    }

    // Legacy / flat styles (backwards-compat with ElementLibrary defaultStyles format)
    if (typeof s.background === 'string') css.backgroundColor = s.background;
    if (typeof s.color === 'string' && !css.color) css.color = s.color;
    if (typeof s.fontSize === 'number' && !css.fontSize) css.fontSize = `${s.fontSize}px`;
    if (typeof s.fontWeight === 'number' && !css.fontWeight) css.fontWeight = s.fontWeight;
    if (typeof s.borderRadius === 'number' && !css.borderRadius) css.borderRadius = `${s.borderRadius}px`;
    if (typeof s.height === 'number' && !css.height) css.height = `${s.height}px`;
    if (typeof s.maxWidth === 'string' && !css.maxWidth) css.maxWidth = s.maxWidth;
    if (typeof s.padding === 'number' && !css.padding) css.padding = `${s.padding}px`;
    if (typeof s.margin === 'object' && s.margin && !Array.isArray(s.margin)) {
      if (s.margin.top != null && !css.marginTop) css.marginTop = typeof s.margin.top === 'number' ? `${s.margin.top}px` : s.margin.top;
      if (s.margin.bottom != null && !css.marginBottom) css.marginBottom = typeof s.margin.bottom === 'number' ? `${s.margin.bottom}px` : s.margin.bottom;
      if (s.margin.left != null && !css.marginLeft) css.marginLeft = typeof s.margin.left === 'number' ? `${s.margin.left}px` : s.margin.left;
      if (s.margin.right != null && !css.marginRight) css.marginRight = typeof s.margin.right === 'number' ? `${s.margin.right}px` : s.margin.right;
    }

    return css;
  }, [element.styles, element.type]);

  const otherSections = (pageState?.page?.sections ?? []).filter(s => s.id !== sectionId);

  const buildContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  };

  const contextItems = [
    { label: 'Select', icon: null, action: () => { setSelectedElement(element.id); setSelectedSection(null); } },
    'separator',
    { label: 'Duplicate', icon: Copy, shortcut: '\u2318D', action: () => duplicateElement(element.id, sectionId) },
    { label: 'Copy', icon: Scissors, shortcut: '\u2318C', action: () => { window.__vbClipboard = JSON.parse(JSON.stringify(element)); } },
    {
      label: 'Paste below', icon: Clipboard, shortcut: '\u2318V',
      disabled: !window.__vbClipboard,
      action: () => {
        const cb = window.__vbClipboard;
        // Validate that clipboard data has minimum required fields before pasting
        if (cb && cb.type && cb.id) {
          const pasted = {
            ...JSON.parse(JSON.stringify(cb)),
            id: `${cb.id}-paste-${Date.now()}`,
          };
          addElement(sectionId, pasted);
        }
      }
    },
    'separator',
    ...(otherSections.length > 0 ? [
      { label: 'Move to\u2026', icon: ArrowRightFromLine, action: () => {
        const target = otherSections[0];
        if (target) moveElementToSection(element.id, sectionId, target.id);
      }}
    ] : []),
    'separator',
    { label: 'Delete', icon: Trash2, danger: true, shortcut: '\u232B', action: () => deleteElement(element.id) }
  ];

  return (
    <>
    {ctxMenu && (
      <CanvasContextMenu
        x={ctxMenu.x} y={ctxMenu.y}
        items={contextItems}
        onClose={() => setCtxMenu(null)}
      />
    )}
    <div
      ref={setNodeRef}
      style={style}
      tabIndex={0}
      role="button"
      aria-label={`${element.type} element${element.props?.text ? ': ' + element.props.text : ''}. Press Enter to select, Delete to remove.`}
      aria-selected={isSelected}
      className={`
        relative group
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${isDragging ? 'z-50' : ''}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement(element.id);
        setSelectedSection(null);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          setSelectedElement(element.id);
          setSelectedSection(null);
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          e.stopPropagation();
          deleteElement(element.id);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setSelectedElement(null);
        }
      }}
      onContextMenu={buildContextMenu}
    >
      {/* Element Breadcrumb + Controls (visible on hover / selected) */}
      {(isHovered || isSelected) && (
        <div className="absolute -top-8 left-0 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-10">
          {/* Breadcrumb: section > element */}
          <span className="pl-1 text-[10px] text-gray-400 dark:text-gray-500 font-mono select-none">
            {(pageState?.page?.sections?.find(s => s.id === sectionId)?.name ?? 'Section')}
            <span className="mx-1 opacity-50">{"\u203A"}</span>
            {element.type}
          </span>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
          <button
            {...listeners}
            {...attributes}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateElement(element.id, sectionId);
            }}
            className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
            title="Duplicate"
          >
            <Copy size={14} className="text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteElement(element.id);
            }}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            title="Delete"
          >
            <Trash2 size={14} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      )}

      {/* Element Content */}
      <div className="py-1">
        <MotionWrapper element={element}>
          <DynamicElement element={element} styles={elementStyles} />
        </MotionWrapper>
      </div>
    </div>
    </>
  );
};

export default SortableElement;
