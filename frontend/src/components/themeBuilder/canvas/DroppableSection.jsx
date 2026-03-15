import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy } from 'lucide-react';
import { useThemeEditor } from '../../../contexts/ThemeEditorContext';
import SortableElement from './SortableElement';

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

export default DroppableSection;
