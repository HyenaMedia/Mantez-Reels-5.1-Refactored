import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Trash2, Copy, Plus, Scissors, Clipboard, ArrowRightFromLine,
  // Icon library for the icon element renderer
  Star, Heart, Home, Mail, Phone, User, Users, Settings, Search, Bell,
  Calendar, Camera, Check, Clock, Cloud, Code, Download, Edit2,
  Eye, File, Folder, Globe, Info, Link, List, Lock, MapPin, Menu,
  Music, Play, Send, Share2, ShoppingCart, Smartphone, Sun, Tag, Target,
  ThumbsUp, Type, Upload, Video, Wifi, Zap, AlertCircle, Award,
  BookOpen, Box, Database, DollarSign, Flag, Layers, Lightbulb,
  MessageCircle, Moon, Palette, PieChart, Shield, TrendingUp,
  X, Minus, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ExternalLink,
  Youtube, Image as ImageIcon, Cpu, Package, RotateCw,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';
import SectionLibrary from './SectionLibrary';

/* ── Icon lookup map for the <icon> element ─────────────────────── */
const ICON_MAP = {
  star: Star, heart: Heart, home: Home, mail: Mail, phone: Phone,
  user: User, users: Users, settings: Settings, search: Search, bell: Bell,
  calendar: Calendar, camera: Camera, check: Check, clock: Clock, cloud: Cloud,
  code: Code, download: Download, edit: Edit2, eye: Eye, file: File,
  folder: Folder, globe: Globe, info: Info, link: Link, list: List,
  lock: Lock, 'map-pin': MapPin, mappin: MapPin, menu: Menu, music: Music,
  play: Play, send: Send, share: Share2, 'shopping-cart': ShoppingCart,
  shoppingcart: ShoppingCart, smartphone: Smartphone, sun: Sun, tag: Tag,
  target: Target, 'thumbs-up': ThumbsUp, thumbsup: ThumbsUp, type: Type,
  upload: Upload, video: Video, wifi: Wifi, zap: Zap, alert: AlertCircle,
  award: Award, book: BookOpen, box: Box, database: Database,
  dollar: DollarSign, flag: Flag, layers: Layers, lightbulb: Lightbulb,
  message: MessageCircle, moon: Moon, palette: Palette, chart: PieChart,
  shield: Shield, trending: TrendingUp, youtube: Youtube, image: ImageIcon,
  cpu: Cpu, package: Package, refresh: RotateCw, x: X, minus: Minus, plus: Plus,
  'arrow-left': ArrowLeft, 'arrow-right': ArrowRight,
  'arrow-up': ArrowUp, 'arrow-down': ArrowDown,
  external: ExternalLink, 'external-link': ExternalLink,
};

/* ── Context Menu ──────────────────────────────────────────────────────── */
const ContextMenu = ({ x, y, items, onClose }) => {
  const ref = useRef(null);
  const [focusedIdx, setFocusedIdx] = useState(0);

  // Collect indices of actionable (non-separator, non-disabled) items
  const actionIndices = items.reduce((acc, item, i) => {
    if (item !== 'separator' && !item.disabled) acc.push(i);
    return acc;
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Auto-focus first actionable item on mount
  useEffect(() => {
    const firstBtn = ref.current?.querySelector('[role="menuitem"]:not([disabled])');
    firstBtn?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currentPos = actionIndices.indexOf(focusedIdx);
      let nextPos;
      if (e.key === 'ArrowDown') {
        nextPos = currentPos < actionIndices.length - 1 ? currentPos + 1 : 0;
      } else {
        nextPos = currentPos > 0 ? currentPos - 1 : actionIndices.length - 1;
      }
      const nextIdx = actionIndices[nextPos];
      setFocusedIdx(nextIdx);
      // Focus the corresponding button
      const btns = ref.current?.querySelectorAll('[role="menuitem"]:not([disabled])');
      btns?.[nextPos]?.focus();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const item = items[focusedIdx];
      if (item && item !== 'separator' && !item.disabled) {
        item.action();
        onClose();
      }
    }
  };

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Element actions"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      style={{ position: 'fixed', top: y, left: x, zIndex: 9999 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 min-w-[170px] outline-none"
    >
      {items.map((item, i) =>
        item === 'separator' ? (
          <div key={`sep-${i}`} role="separator" className="my-1 border-t border-gray-100 dark:border-gray-700" />
        ) : (
          <button
            key={item.label ?? i}
            role="menuitem"
            aria-disabled={item.disabled}
            onClick={() => { if (!item.disabled) { item.action(); onClose(); } }}
            onFocus={() => setFocusedIdx(i)}
            disabled={item.disabled}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors focus:outline-none focus:bg-violet-50 dark:focus:bg-violet-900/20 ${
              item.danger
                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            } ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {item.icon && <item.icon size={14} className={item.danger ? 'text-red-500' : 'text-gray-400'} />}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && <span className="text-[10px] text-gray-400">{item.shortcut}</span>}
          </button>
        )
      )}
    </div>
  );
};

/**
 * DroppableCanvas - Main canvas area with drop zones
 */
const DroppableCanvas = ({ device = 'desktop' }) => {
  const { pageState, selectedElement, setSelectedElement, addSection } = useThemeEditor();
  const [showLibrary, setShowLibrary] = useState(false);

  const handleAddSection = () => setShowLibrary(true);

  // Get device dimensions
  const getDeviceDimensions = () => {
    switch (device) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const dimensions = getDeviceDimensions();

  if (!pageState?.page?.sections) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Plus size={28} className="text-violet-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Start building</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Drag elements from the left panel onto the canvas, or add a pre-built section to get started quickly.
          </p>
          <button
            onClick={handleAddSection}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
          >
            <Plus size={16} />
            Add First Section
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = pageState.page.sections.length === 0;

  const sectionIds = pageState.page.sections.map(s => s.id);

  return (
    <div className="h-full flex items-start justify-center p-8 bg-gray-100 dark:bg-gray-950 overflow-auto">
      {isEmpty ? (
        /* Empty sections onboarding */
        <div className="w-full max-w-2xl flex flex-col items-center justify-center min-h-full py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Plus size={34} className="text-violet-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Your canvas is empty</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-xs">
            Add your first section to start building. Choose a pre-built template or create a blank section.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddSection}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
            >
              <Plus size={16} />
              Browse Section Templates
            </button>
            <button
              onClick={() => addSection({ name: 'Section', elements: [], styles: {} })}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              + Blank Section
            </button>
          </div>
        </div>
      ) : (
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-auto"
        style={{
          width: dimensions.width,
          minHeight: dimensions.height,
          maxWidth: '100%'
        }}
      >
        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
          {pageState.page.sections.map((section, index) => (
            <DroppableSection
              key={section.id}
              section={section}
              sectionIndex={index}
              isFirst={index === 0}
              isLast={index === pageState.page.sections.length - 1}
            />
          ))}
        </SortableContext>

        {/* Empty drop zone at bottom */}
        <EmptyDropZone position="bottom" />

        {/* Add Section button */}
        <div className="p-4 flex justify-center">
          <button
            onClick={handleAddSection}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:text-violet-600 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors"
          >
            <Plus size={16} />
            Add Section
          </button>
        </div>
      </div>
      )}

      {showLibrary && (
        <SectionLibrary
          insertAtIndex={null}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
};

/**
 * DroppableSection - Individual section with sortable elements
 */
const DroppableSection = ({ section, sectionIndex, isFirst, isLast }) => {
  const {
    updateSection, deleteSection, addSection,
    selectedElement, setSelectedElement, setSelectedSection,
    pageState,
  } = useThemeEditor();
  const [isHovered, setIsHovered] = React.useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: section.id,
    data: { type: 'section', section }
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `section-drop-${section.id}`,
    data: { type: 'section-drop', sectionId: section.id }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  // Generate section styles
  const sectionStyles = React.useMemo(() => {
    const styles = {};
    
    const s = section.styles || {};
    const bg = s.background || {};

    if (bg.type === 'gradient') {
      if (bg.gradientStart && bg.gradientEnd) {
        styles.background = `linear-gradient(${bg.gradientDir || '135deg'}, ${bg.gradientStart}, ${bg.gradientEnd})`;
      } else if (bg.gradient) {
        const { colors, angle } = bg.gradient;
        styles.background = `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`;
      }
    } else if (bg.type === 'solid' && bg.color) {
      styles.backgroundColor = bg.color;
    } else if (bg.type === 'image' && bg.imageUrl) {
      styles.backgroundImage = `url(${bg.imageUrl})`;
      styles.backgroundSize = bg.size || 'cover';
      styles.backgroundPosition = bg.position || 'center';
    } else if (bg.color) {
      // legacy: direct color
      styles.backgroundColor = bg.color;
    }

    if (s.padding) {
      const p = s.padding;
      styles.padding = `${p.top || 0}px ${p.right || 0}px ${p.bottom || 0}px ${p.left || 0}px`;
    }
    if (s.minHeight) styles.minHeight = s.minHeight;
    if (s.maxWidth) styles.maxWidth = s.maxWidth;
    if (s.textAlign) styles.textAlign = s.textAlign;

    return styles;
  }, [section.styles]);

  const elementIds = section.elements?.map(e => e.id) || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section label (top-left on hover) */}
      {isHovered && (
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-violet-600 text-white text-xs font-medium rounded pointer-events-none">
          {section.name || 'Section'}
        </div>
      )}

      {/* Section Controls (visible on hover) */}
      {isHovered && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            {...listeners}
            {...attributes}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => {
              const idx = pageState.page.sections.findIndex(s => s.id === section.id);
              const duped = {
                ...section,
                id: `section-${Date.now()}`,
                name: `${section.name || 'Section'} copy`,
                elements: section.elements.map(el => ({ ...el, id: `${el.id}-${Date.now()}` })),
              };
              addSection(duped, idx + 1);
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Duplicate section"
          >
            <Copy size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => deleteSection(section.id)}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            title="Delete section"
          >
            <Trash2 size={16} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      )}

      {/* Section Content */}
      <section
        ref={setDropRef}
        style={sectionStyles}
        onClick={() => {
          setSelectedSection(section.id);
          setSelectedElement(null);
        }}
        className={`
          relative cursor-pointer
          ${isOver ? 'ring-2 ring-blue-500 ring-inset' : ''}
        `}
      >
        <div className="container mx-auto">
          {/* Drop zone indicator when hovering */}
          {isOver && elementIds.length === 0 && (
            <div className="py-16 text-center text-blue-500 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              Drop element here
            </div>
          )}

          {/* Elements */}
          {elementIds.length > 0 && (
            <SortableContext items={elementIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {section.elements.map(element => (
                    <motion.div
                      key={element.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <SortableElement
                        element={element}
                        sectionId={section.id}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          )}

          {/* Empty section placeholder */}
          {elementIds.length === 0 && !isOver && (
            <div className="py-16 text-center text-gray-400 dark:text-gray-600">
              <p className="text-sm">Empty section</p>
              <p className="text-xs mt-1">Drag elements here</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ── Framer Motion animation variant maps ──────────────────────────────── */
const ENTRANCE_VARIANTS = {
  none:       { initial: false,                                     animate: {} },
  fade:       { initial: { opacity: 0 },                            animate: { opacity: 1 } },
  slideUp:    { initial: { opacity: 0, y: 40 },                     animate: { opacity: 1, y: 0 } },
  slideDown:  { initial: { opacity: 0, y: -40 },                    animate: { opacity: 1, y: 0 } },
  slideLeft:  { initial: { opacity: 0, x: 40 },                     animate: { opacity: 1, x: 0 } },
  slideRight: { initial: { opacity: 0, x: -40 },                    animate: { opacity: 1, x: 0 } },
  zoom:       { initial: { opacity: 0, scale: 0.8 },                animate: { opacity: 1, scale: 1 } },
  bounce:     { initial: { opacity: 0, y: 40 },                     animate: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.5 } } },
  flip:       { initial: { opacity: 0, rotateX: 90 },               animate: { opacity: 1, rotateX: 0 } },
  rotate:     { initial: { opacity: 0, rotate: -20 },               animate: { opacity: 1, rotate: 0 } },
};

const HOVER_VARIANTS = {
  none:   {},
  lift:   { y: -4 },
  scale:  { scale: 1.05 },
  glow:   { boxShadow: '0 0 20px rgba(139,92,246,0.5)' },
  rotate: { rotate: 5 },
  pulse:  { scale: 1.04 },
  shake:  { x: [0, -6, 6, -6, 6, 0] },
};

/**
 * MotionWrapper – applies entrance + hover animations from element.motion config.
 * Reads the same shape that Inspector's MotionTab writes:
 *   { entrance, duration(ms), delay(ms), easing, scrollTrigger, hover, hoverDuration(ms) }
 */
const MotionWrapper = ({ element, children }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });

  const mot = element.motion || {};
  const entranceKey = mot.entrance    || 'none';
  const hoverKey    = mot.hover       || 'none';
  // Inspector stores ms; Framer Motion uses seconds
  const durationSec = (mot.duration  ?? 400) / 1000;
  const delaySec    = (mot.delay     ?? 0)   / 1000;
  const hoverSec    = (mot.hoverDuration ?? 200) / 1000;
  const ease        = mot.easing      || 'easeOut';

  const variant   = ENTRANCE_VARIANTS[entranceKey] || ENTRANCE_VARIANTS.none;
  const hoverAnim = HOVER_VARIANTS[hoverKey]       || {};

  // Scroll-triggered: only animate once element enters viewport
  const shouldAnimate = mot.scrollTrigger ? inView : true;
  const hasEntrance   = entranceKey !== 'none';
  const hasHover      = hoverKey    !== 'none';

  const transition = {
    duration: durationSec,
    delay:    delaySec,
    ease:     ease === 'spring' ? undefined : ease,
    type:     ease === 'spring' ? 'spring'  : 'tween',
    ...(ease === 'spring' ? { bounce: 0.4 } : {}),
    // preserve any variant-level overrides (e.g. bounce entrance)
    ...(variant.animate?.transition || {}),
  };

  const hoverTransition = { duration: hoverSec, ease: 'easeOut' };

  if (!hasEntrance && !hasHover) {
    // No motion config → skip motion.div overhead entirely
    return <>{children}</>;
  }

  return (
    <motion.div
      ref={ref}
      layout
      initial={hasEntrance ? variant.initial : false}
      animate={hasEntrance && shouldAnimate ? { ...variant.animate, transition } : undefined}
      whileHover={hasHover ? { ...hoverAnim, transition: hoverTransition } : undefined}
    >
      {children}
    </motion.div>
  );
};

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
  const clipboard = React.useRef(null);

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
    const hasClipboard = !!window.__vbClipboard;
    setCtxMenu({ x: e.clientX, y: e.clientY });
  };

  const contextItems = [
    { label: 'Select', icon: null, action: () => { setSelectedElement(element.id); setSelectedSection(null); } },
    'separator',
    { label: 'Duplicate', icon: Copy, shortcut: '⌘D', action: () => duplicateElement(element.id, sectionId) },
    { label: 'Copy', icon: Scissors, shortcut: '⌘C', action: () => { window.__vbClipboard = JSON.parse(JSON.stringify(element)); } },
    {
      label: 'Paste below', icon: Clipboard, shortcut: '⌘V',
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
      { label: 'Move to…', icon: ArrowRightFromLine, action: () => {
        const target = otherSections[0];
        if (target) moveElementToSection(element.id, sectionId, target.id);
      }}
    ] : []),
    'separator',
    { label: 'Delete', icon: Trash2, danger: true, shortcut: '⌫', action: () => deleteElement(element.id) }
  ];

  return (
    <>
    {ctxMenu && (
      <ContextMenu
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
            <span className="mx-1 opacity-50">›</span>
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

/* ── Sub-components for interactive elements that need local state ── */

const AccordionElement = ({ items = [], styles }) => {
  const [open, setOpen] = React.useState(null);
  return (
    <div style={styles} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>{item.title}</span>
            <span className={`transition-transform ${open === i ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {open === i && (
            <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const TabsElement = ({ tabs = [], styles }) => {
  const [active, setActive] = React.useState(0);
  return (
    <div style={styles}>
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              active === i
                ? 'border-violet-500 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 text-sm text-gray-700 dark:text-gray-300">
        {tabs[active]?.content || ''}
      </div>
    </div>
  );
};

const CarouselElement = ({ slides = [], styles }) => {
  const [idx, setIdx] = React.useState(0);
  return (
    <div style={styles} className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 min-h-32">
      <div className="flex items-center justify-center h-32 text-gray-600 dark:text-gray-400 text-sm">
        {slides[idx]?.content || `Slide ${idx + 1}`}
      </div>
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-3 pb-3">
          <button onClick={() => setIdx((idx - 1 + slides.length) % slides.length)} className="text-xs px-2 py-1 bg-white dark:bg-gray-700 rounded shadow">‹</button>
          <span className="text-xs text-gray-500">{idx + 1} / {slides.length}</span>
          <button onClick={() => setIdx((idx + 1) % slides.length)} className="text-xs px-2 py-1 bg-white dark:bg-gray-700 rounded shadow">›</button>
        </div>
      )}
    </div>
  );
};

const CountdownElement = ({ targetDate, label = 'Launching in', styles }) => {
  const calc = () => {
    const diff = Math.max(0, new Date(targetDate) - Date.now());
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = React.useState(calc);
  React.useEffect(() => {
    if (!targetDate) return;
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]); // eslint-disable-line
  const pad = n => String(n).padStart(2, '0');
  return (
    <div style={styles} className="text-center">
      {label && <p className="text-sm text-gray-500 mb-2">{label}</p>}
      {targetDate ? (
        <div className="flex justify-center gap-4">
          {[['Days', time.d], ['Hours', time.h], ['Min', time.m], ['Sec', time.s]].map(([unit, val]) => (
            <div key={unit} className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 min-w-[56px]">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{pad(val)}</span>
              <span className="text-xs text-gray-500">{unit}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">Set a target date in the Inspector</p>
      )}
    </div>
  );
};

/* ── Canvas placeholder wrapper ── */
const CanvasPlaceholder = ({ icon, label, description, className = '' }) => (
  <div className={`flex flex-col items-center justify-center gap-2 p-6 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center ${className}`}>
    {icon && <span className="text-2xl">{icon}</span>}
    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
    {description && <span className="text-xs text-gray-400 dark:text-gray-500">{description}</span>}
  </div>
);

/**
 * DynamicElement - Renders element based on type
 */
const DynamicElement = ({ element, styles }) => {
  const p = element.props || {};

  switch (element.type) {

    /* ── BASIC / TEXT ── */

    case 'heading': {
      const Tag = p.tag || 'h2';
      return <Tag style={styles}>{p.text || 'Heading'}</Tag>;
    }

    case 'text':
      return <p style={styles}>{p.text || 'Paragraph text'}</p>;

    case 'link':
      return (
        <a
          href={p.href || '#'}
          style={styles}
          className="underline cursor-pointer hover:opacity-80"
          onClick={e => e.preventDefault()}
        >
          {p.text || 'Link'}
        </a>
      );

    case 'list': {
      const isOrdered = p.listType === 'ordered' || p.ordered === true;
      const Tag = isOrdered ? 'ol' : 'ul';
      const items = p.items || ['Item 1', 'Item 2', 'Item 3'];
      return (
        <Tag style={styles} className={isOrdered ? 'list-decimal pl-5' : 'list-disc pl-5'}>
          {items.map((item, i) => <li key={i} className="mb-1">{item}</li>)}
        </Tag>
      );
    }

    case 'blockquote':
      return (
        <blockquote
          style={{ borderLeft: '4px solid #8b5cf6', paddingLeft: '1rem', fontStyle: 'italic', ...styles }}
          className="text-gray-700 dark:text-gray-300"
        >
          <p>{p.text || 'Your quote here'}</p>
          {p.author && <cite className="block mt-2 text-sm text-gray-500 not-italic">— {p.author}</cite>}
        </blockquote>
      );

    case 'richtext': {
      // Support both p.html (canonical) and p.text (legacy plain-text fallback)
      const html = p.html || (p.text ? `<p>${p.text.replace(/\n/g, '</p><p>')}</p>` : '<p>Start editing rich text…</p>');
      return (
        <div
          style={styles}
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
        />
      );
    }

    case 'code':
      return (
        <pre
          style={{ fontFamily: 'monospace', background: '#1f2937', color: '#f3f4f6', borderRadius: 8, padding: 16, overflowX: 'auto', ...styles }}
        >
          <code>{p.code || '// your code here'}</code>
        </pre>
      );

    /* ── BASIC ── */

    case 'button': {
      const variant = p.variant || 'primary';
      const VARIANT_STYLES = {
        primary:   { backgroundColor: '#8b5cf6', color: '#fff', border: '2px solid #8b5cf6', borderRadius: 8, padding: '10px 24px', fontWeight: 600 },
        secondary: { backgroundColor: '#6b7280', color: '#fff', border: '2px solid #6b7280', borderRadius: 8, padding: '10px 24px', fontWeight: 600 },
        outline:   { backgroundColor: 'transparent', color: '#8b5cf6', border: '2px solid #8b5cf6', borderRadius: 8, padding: '10px 24px', fontWeight: 600 },
        ghost:     { backgroundColor: 'transparent', color: '#8b5cf6', border: '2px solid transparent', borderRadius: 8, padding: '10px 24px', fontWeight: 600 },
        link:      { backgroundColor: 'transparent', color: '#8b5cf6', border: 'none', padding: '0', textDecoration: 'underline', fontWeight: 600 },
      };
      const variantBase = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
      return (
        <a
          href={p.link || '#'}
          style={{ display: 'inline-block', textAlign: 'center', cursor: 'pointer', transition: 'opacity .2s', textDecoration: 'none', ...variantBase, ...styles }}
          onClick={e => e.preventDefault()}
        >
          {p.text || 'Button'}
        </a>
      );
    }

    case 'image':
      return (
        <img
          src={p.src || 'https://via.placeholder.com/600x400'}
          alt={p.alt || ''}
          style={styles}
          className="max-w-full h-auto"
        />
      );

    case 'divider':
      return <hr style={{ margin: '1.5rem 0', borderColor: '#e5e7eb', ...styles }} />;

    case 'spacer':
      return <div style={{ height: p.height || 48, ...styles }} />;

    /* ── MEDIA ── */

    case 'video':
      return p.src ? (
        <video
          src={p.src}
          controls={p.controls !== false}
          autoPlay={p.autoplay}
          muted={p.autoplay}
          loop={p.loop}
          style={styles}
          className="w-full rounded-lg"
        />
      ) : (
        <CanvasPlaceholder icon="🎬" label="Video" description="Set a video URL in the Inspector" />
      );

    case 'youtube':
    case 'youtubeembed': {
      const vid = p.videoId || '';
      return vid ? (
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, ...styles }}>
          <iframe
            src={`https://www.youtube.com/embed/${vid}${p.autoplay ? '?autoplay=1&mute=1' : ''}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, borderRadius: 8 }}
          />
        </div>
      ) : (
        <CanvasPlaceholder icon="▶️" label="YouTube Embed" description="Set a Video ID in the Inspector" />
      );
    }

    case 'icon': {
      const iconKey = (p.name || p.icon || 'star').toLowerCase().replace(/\s+/g, '-');
      const IconComp = ICON_MAP[iconKey] || ICON_MAP[iconKey.replace(/-/g, '')] || Star;
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...styles }}>
          <IconComp size={p.size || 24} color={p.color || '#8b5cf6'} strokeWidth={p.strokeWidth || 2} />
        </div>
      );
    }

    case 'bgimage':
      return (
        <div
          style={{
            minHeight: 120,
            backgroundImage: p.src ? `url(${p.src})` : 'linear-gradient(135deg, #667eea, #764ba2)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 8,
            position: 'relative',
            ...styles,
          }}
        >
          {p.overlay > 0 && (
            <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${p.overlay || 0.3})`, borderRadius: 8 }} />
          )}
          {!p.src && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm opacity-80">Background Image</span>
            </div>
          )}
        </div>
      );

    case 'bgvideo':
      return p.src ? (
        <div style={{ position: 'relative', minHeight: 160, borderRadius: 8, overflow: 'hidden', ...styles }}>
          <video
            src={p.src}
            autoPlay
            muted={p.muted !== false}
            loop={p.loop !== false}
            playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {(p.overlay > 0) && (
            <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${p.overlay || 0.4})`, borderRadius: 8 }} />
          )}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
            🎥 Background Video
          </div>
        </div>
      ) : (
        <CanvasPlaceholder icon="🎥" label="Background Video" description="Set a video URL in the Inspector" />
      );

    case 'audio':
      return p.src ? (
        <audio src={p.src} controls className="w-full" style={styles} />
      ) : (
        <CanvasPlaceholder icon="🎵" label="Audio Player" description="Set an audio URL in the Inspector" />
      );

    /* ── LAYOUT ── */

    case 'container':
      return (
        <div
          style={{ maxWidth: p.maxWidth || '1200px', margin: '0 auto', padding: `0 ${p.paddingX || 24}px`, minHeight: 60, ...styles }}
          className="relative border-2 border-dashed border-violet-200 dark:border-violet-800 rounded-md"
        >
          <span className="absolute top-1 left-2 text-[10px] font-mono text-violet-400 dark:text-violet-500 select-none">
            container {p.maxWidth || '1200px'}
          </span>
          <div className="pt-5 pb-2 text-xs text-violet-300 dark:text-violet-600 text-center italic">
            Drop child elements here
          </div>
        </div>
      );

    case 'columns':
    case 'row': {
      const cols = element.type === 'row' ? (p.columns || p.cols || 2) : (p.columns || 2);
      const gapSize = p.gap || 16;
      return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: gapSize, ...styles }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-md p-3 min-h-[60px] flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] font-mono text-blue-400 dark:text-blue-500">col {i + 1}</span>
              <span className="text-[9px] text-blue-300 dark:text-blue-600 italic">Drop elements</span>
            </div>
          ))}
        </div>
      );
    }

    case 'grid': {
      const cols = p.cols || p.columns || 3;
      const rows = p.rows || 2;
      const gapSize = p.gap || 16;
      const total = cols * rows;
      return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: gapSize, ...styles }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="border-2 border-dashed border-green-200 dark:border-green-800 rounded-md p-3 min-h-[50px] flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] font-mono text-green-400 dark:text-green-500">cell {i + 1}</span>
            </div>
          ))}
        </div>
      );
    }

    /* ── INTERACTIVE ── */

    case 'buttongroup': {
      const buttons = p.buttons || [{ text: 'Primary', variant: 'primary' }, { text: 'Secondary', variant: 'outline' }];
      return (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', ...styles }}>
          {buttons.map((btn, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 ${
                btn.variant === 'outline'
                  ? 'border border-violet-500 text-violet-600 bg-transparent'
                  : 'bg-violet-500 text-white'
              }`}
            >
              {btn.text}
            </button>
          ))}
        </div>
      );
    }

    case 'accordion':
      return <AccordionElement items={p.items} styles={styles} />;

    case 'tabs':
      return <TabsElement tabs={p.tabs} styles={styles} />;

    case 'modal':
      return (
        <div style={styles}>
          <button className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm font-medium">
            {p.triggerText || 'Open Modal'}
          </button>
          <span className="ml-3 text-xs text-gray-400 italic">Modal: "{p.title || 'Modal Title'}"</span>
        </div>
      );

    case 'dropdown':
      return (
        <div style={styles}>
          {p.label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label>}
          <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full max-w-xs">
            {(p.options || ['Option 1', 'Option 2']).map((opt, i) => <option key={i}>{opt}</option>)}
          </select>
        </div>
      );

    case 'tooltip':
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...styles }}>
          <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-sm border border-gray-200 dark:border-gray-700">Hover me</span>
          <span className="text-xs text-gray-400">→ "{p.text || 'Tooltip text'}"</span>
        </div>
      );

    case 'toggle': {
      return (
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', ...styles }}>
          <div className={`relative w-11 h-6 rounded-full transition-colors ${p.checked ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${p.checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          {p.label && <span className="text-sm text-gray-700 dark:text-gray-300">{p.label}</span>}
        </label>
      );
    }

    /* ── FORMS ── */

    case 'form':
      return (
        <div style={{ border: '2px dashed #8b5cf6', borderRadius: 8, padding: 16, ...styles }}>
          <p className="text-xs text-violet-500 font-medium mb-2">Form Container</p>
          <button className="mt-2 px-4 py-2 bg-violet-500 text-white rounded-lg text-sm">{p.submitText || 'Submit'}</button>
        </div>
      );

    case 'input':
    case 'phone':
      return (
        <div style={styles} className="w-full">
          {p.label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label>}
          <input
            type={element.type === 'phone' ? 'tel' : (p.type || 'text')}
            placeholder={p.placeholder || 'Enter value...'}
            disabled
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      );

    case 'textarea':
      return (
        <div style={styles} className="w-full">
          {p.label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label>}
          <textarea
            placeholder={p.placeholder || 'Your message...'}
            rows={p.rows || 4}
            disabled
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
        </div>
      );

    case 'select':
      return (
        <div style={styles} className="w-full">
          {p.label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label>}
          <select disabled className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {(p.options || ['Option 1', 'Option 2']).map((opt, i) => <option key={i}>{opt}</option>)}
          </select>
        </div>
      );

    case 'checkbox':
      return (
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...styles }}>
          <input type="checkbox" defaultChecked={p.checked} disabled className="w-4 h-4 accent-violet-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{p.label || 'Checkbox'}</span>
        </label>
      );

    case 'radio':
      return (
        <div style={styles}>
          {p.label && <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{p.label}</p>}
          <div className="flex flex-col gap-2">
            {(p.options || ['Option 1', 'Option 2']).map((opt, i) => (
              <label key={i} className="inline-flex items-center gap-2 cursor-pointer">
                <input type="radio" name={element.id} disabled className="w-4 h-4 accent-violet-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case 'fileupload':
      return (
        <div style={styles} className="w-full">
          {p.label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label>}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-400">📎 Click or drag to upload</p>
            <p className="text-xs text-gray-400 mt-1">{p.accept || 'Any file'}</p>
          </div>
        </div>
      );

    case 'datepicker':
      return (
        <div style={styles} className="w-full">
          {p.label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label>}
          <input
            type={p.type || 'date'}
            disabled
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      );

    case 'rangeslider':
      return (
        <div style={styles} className="w-full">
          {p.label && (
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{p.label}</label>
              <span className="text-sm text-gray-500">{p.value ?? 50}</span>
            </div>
          )}
          <input
            type="range"
            min={p.min ?? 0}
            max={p.max ?? 100}
            defaultValue={p.value ?? 50}
            disabled
            className="w-full accent-violet-500"
          />
        </div>
      );

    case 'submitbtn':
      return (
        <button style={styles} className="px-6 py-2.5 bg-violet-500 text-white rounded-lg text-sm font-medium hover:opacity-90">
          {p.text || 'Submit'}
        </button>
      );

    /* ── DATA ── */

    case 'counter':
      return (
        <div style={{ textAlign: 'center', ...styles }}>
          <div className="text-5xl font-bold text-gray-900 dark:text-white">
            {p.prefix || ''}{(p.value ?? p.end ?? 1000).toLocaleString()}{p.suffix ?? '+'}
          </div>
          {p.label && <p className="mt-1 text-sm text-gray-500">{p.label}</p>}
        </div>
      );

    case 'progressbar':
      return (
        <div style={styles} className="w-full">
          {p.label && (
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{p.label}</span>
              <span className="text-sm text-gray-500">{p.value ?? 80}%</span>
            </div>
          )}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all"
              style={{ width: `${p.value ?? 80}%`, backgroundColor: p.color || '#8b5cf6' }}
            />
          </div>
        </div>
      );

    case 'table': {
      const headers = p.headers || ['Name', 'Value'];
      const rows = p.rows || [['Item 1', '100'], ['Item 2', '200']];
      return (
        <div style={styles} className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="even:bg-gray-50/50 dark:even:bg-gray-800/30">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'statcard':
      return (
        <div style={{ padding: 24, borderRadius: 12, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', ...styles }} className="dark:bg-gray-800 dark:shadow-none">
          <p className="text-sm text-gray-500 dark:text-gray-400">{p.label || 'Revenue'}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{p.value || '$12,400'}</p>
          {p.change && (
            <p className={`text-sm mt-1 ${p.positive ? 'text-green-500' : 'text-red-500'}`}>
              {p.positive ? '↑' : '↓'} {p.change}
            </p>
          )}
        </div>
      );

    case 'timeline': {
      const items = p.items || [{ date: '2024', title: 'Event 1', description: 'Description' }];
      return (
        <div style={styles} className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
          {items.map((item, i) => (
            <div key={i} className="relative pl-10 pb-6">
              <div className="absolute left-2.5 w-3 h-3 bg-violet-500 rounded-full border-2 border-white dark:border-gray-900" />
              <span className="text-xs text-gray-400">{item.date}</span>
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.title}</h4>
              {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
            </div>
          ))}
        </div>
      );
    }

    case 'pricing': {
      const plans = p.plans || [{ name: 'Basic', price: '$9', features: ['Feature 1', 'Feature 2'] }];
      return (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', ...styles }}>
          {plans.map((plan, i) => (
            <div key={i} className="flex-1 min-w-[180px] border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-center">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">{plan.name}</h3>
              <div className="text-3xl font-bold text-violet-600 my-3">{plan.price}<span className="text-sm text-gray-400">/mo</span></div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                {(plan.features || []).map((f, j) => <li key={j}>✓ {f}</li>)}
              </ul>
              <button className="w-full py-2 bg-violet-500 text-white rounded-lg text-sm">Choose Plan</button>
            </div>
          ))}
        </div>
      );
    }

    case 'badge': {
      const variantClasses = {
        success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        error:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      };
      return (
        <span
          style={styles}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variantClasses[p.variant] || variantClasses.default}`}
        >
          {p.text || 'Badge'}
        </span>
      );
    }

    case 'alert': {
      const alertClasses = {
        info:    { bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-200 dark:border-blue-800',    text: 'text-blue-800 dark:text-blue-300',    icon: 'ℹ️' },
        success: { bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800',  text: 'text-green-800 dark:text-green-300',  icon: '✅' },
        warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20',border: 'border-yellow-200 dark:border-yellow-800',text: 'text-yellow-800 dark:text-yellow-300',icon: '⚠️' },
        error:   { bg: 'bg-red-50 dark:bg-red-900/20',      border: 'border-red-200 dark:border-red-800',      text: 'text-red-800 dark:text-red-300',      icon: '❌' },
      };
      const a = alertClasses[p.type || 'info'];
      return (
        <div style={{ borderRadius: 8, padding: 16, ...styles }} className={`flex items-start gap-3 border ${a.bg} ${a.border}`}>
          <span>{a.icon}</span>
          <p className={`text-sm ${a.text}`}>{p.message || 'Alert message'}</p>
        </div>
      );
    }

    case 'chart': {
      const data = p.data || [10, 20, 15, 25, 18];
      const labels = p.labels || data.map((_, i) => `${i + 1}`);
      const max = Math.max(...data);
      return (
        <div style={styles} className="w-full">
          <div className="flex items-end gap-1.5 h-24">
            {data.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-violet-400 dark:bg-violet-500 rounded-t transition-all"
                  style={{ height: `${(val / max) * 100}%` }}
                />
                <span className="text-xs text-gray-400">{labels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    /* ── SOCIAL ── */

    case 'socialshare': {
      const platforms = p.platforms || ['twitter', 'facebook', 'linkedin'];
      const icons = { twitter: '🐦', facebook: '📘', linkedin: '💼', instagram: '📸', youtube: '▶️' };
      return (
        <div style={{ display: 'flex', gap: 8, ...styles }}>
          {platforms.map(pl => (
            <button key={pl} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:opacity-80">
              {icons[pl] || '🔗'} {pl.charAt(0).toUpperCase() + pl.slice(1)}
            </button>
          ))}
        </div>
      );
    }

    case 'socialfollow':
      return (
        <div style={styles} className="inline-flex items-center gap-2">
          <button className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm font-medium">
            Follow {p.handle || '@youraccount'}
          </button>
        </div>
      );

    case 'twitterembed':
      return (
        <CanvasPlaceholder icon="🐦" label="Twitter / X Embed" description={p.tweetUrl || 'Set a tweet URL in the Inspector'} />
      );

    case 'instagramembed':
      return (
        <CanvasPlaceholder icon="📸" label="Instagram Embed" description={p.postUrl || 'Set a post URL in the Inspector'} />
      );

    case 'googlemaps': {
      const mapAddr = p.address || p.location || 'New York, NY';
      return (
        <div style={{ height: p.height || 300, borderRadius: 8, overflow: 'hidden', ...styles }}>
          <iframe
            title="Google Maps"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapAddr)}&z=${p.zoom || 14}&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
          />
        </div>
      );
    }

    case 'embed': {
      // Support both p.code (canonical) and legacy p.embedCode / p.url
      const embedContent = p.code || p.embedCode || p.url || '';
      return (
        <div style={styles} className="w-full">
          {embedContent ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs font-mono text-gray-500 overflow-x-auto whitespace-pre-wrap break-all border border-gray-200 dark:border-gray-700">
              {embedContent}
            </div>
          ) : (
            <CanvasPlaceholder icon="🔗" label="Embed" description="Paste iframe or script code in the Inspector" />
          )}
        </div>
      );
    }

    /* ── NAVIGATION ── */

    case 'breadcrumbs': {
      const items = p.items || ['Home', 'Blog', 'Article'];
      return (
        <nav style={styles} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          {items.map((item, i) => {
            // Support both string items (library default) and {label, href} objects (inspector)
            const label = typeof item === 'string' ? item : (item.label || 'Link');
            const isLast = i === items.length - 1;
            return (
              <React.Fragment key={i}>
                {i > 0 && <span className="mx-1">/</span>}
                <a href="#" onClick={e => e.preventDefault()} className={isLast ? 'text-gray-900 dark:text-white font-medium' : 'hover:text-gray-700'}>
                  {label}
                </a>
              </React.Fragment>
            );
          })}
        </nav>
      );
    }

    case 'pagination': {
      const total = Math.min(p.total || p.totalPages || 10, 10);
      const current = p.current || p.currentPage || 1;
      const pages = Array.from({ length: Math.min(total, 7) }, (_, i) => i + 1);
      return (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', ...styles }}>
          <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-500">‹</button>
          {pages.map(pg => (
            <button key={pg} className={`px-3 py-1.5 border rounded text-sm ${pg === current ? 'bg-violet-500 text-white border-violet-500' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>{pg}</button>
          ))}
          {total > 7 && <span className="text-gray-400 text-sm">…{total}</span>}
          <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-500">›</button>
        </div>
      );
    }

    case 'searchbar':
      return (
        <div style={{ display: 'flex', gap: 0, ...styles }} className="w-full max-w-sm">
          <input
            type="text"
            placeholder={p.placeholder || 'Search...'}
            disabled
            className="flex-1 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button className="px-4 py-2 bg-violet-500 text-white rounded-r-lg text-sm">🔍</button>
        </div>
      );

    case 'carousel':
      return <CarouselElement slides={p.slides} styles={styles} />;

    case 'imagegallery': {
      const cols = p.columns || 3;
      const count = Math.max(cols, (p.images || []).length || cols);
      return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, ...styles }}>
          {Array.from({ length: count }).map((_, i) => (
            p.images?.[i]
              ? <img key={i} src={p.images[i]} alt="" className="w-full h-24 object-cover rounded" />
              : <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded h-24 flex items-center justify-center text-gray-400 text-xs">Photo {i + 1}</div>
          ))}
        </div>
      );
    }

    case 'countdown':
      return <CountdownElement targetDate={p.targetDate} label={p.label} styles={styles} />;

    case 'cookiebanner':
      return (
        <div style={{ background: '#1f2937', color: '#fff', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, ...styles }}>
          <p className="text-sm">{p.message || 'We use cookies to enhance your experience.'}</p>
          <div className="flex gap-2 shrink-0">
            <button className="px-3 py-1 text-xs border border-gray-500 rounded text-gray-300">Decline</button>
            <button className="px-3 py-1 text-xs bg-violet-500 rounded text-white">Accept</button>
          </div>
        </div>
      );

    case 'backtotop':
      return (
        <div style={styles} className="flex justify-center">
          <button
            className="w-10 h-10 bg-violet-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-violet-600 transition-colors"
            title="Back to Top"
          >
            ↑
          </button>
        </div>
      );

    /* ── CONTENT ── */

    case 'card':
      return (
        <div style={{ padding: 24, borderRadius: 12, background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', ...styles }} className="dark:bg-gray-800">
          {p.image && <img src={p.image} alt="" className="w-full h-40 object-cover rounded-lg mb-3" />}
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{p.title || 'Card Title'}</h3>
          {p.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{p.description}</p>}
        </div>
      );

    case 'queryloop':
      return (
        <CanvasPlaceholder icon="🔄" label="Query Loop" description="Dynamically renders posts/content from your database" />
      );

    case 'section':
      return (
        <CanvasPlaceholder icon="📋" label="Section" description="Drag this to the canvas to add a new section" />
      );

    default:
      return (
        <div style={styles} className="p-4 bg-gray-100 dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-600">
          <span className="text-xs text-gray-500 font-mono">{element.type}</span>
        </div>
      );
  }
};

/**
 * EmptyDropZone - Drop zone for adding sections at bottom
 */
const EmptyDropZone = ({ position }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `empty-drop-${position}`,
    data: { type: 'empty-drop', position }
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-24 border-2 border-dashed rounded-lg m-4
        flex items-center justify-center
        transition-all duration-200
        ${
          isOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
        }
      `}
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {isOver ? 'Drop here to add section' : 'Drag sections here'}
      </p>
    </div>
  );
};

export default DroppableCanvas;
