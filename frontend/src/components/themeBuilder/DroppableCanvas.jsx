import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';
import SectionLibrary from './SectionLibrary';
import { DroppableSection } from './canvas';
import { EmptyDropZone } from './canvas';

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

export default DroppableCanvas;
