import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Package, Star } from 'lucide-react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';

/**
 * ComponentLibrary - Week 6 Implementation
 * Shows saved reusable components
 */
const ComponentLibrary = () => {
  const { pageState } = useThemeEditor();
  const components = pageState?.page?.components || {};
  const componentList = Object.entries(components);

  if (componentList.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No saved components yet</p>
        <p className="text-xs mt-1">Right-click any element → Save as Component</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Package size={16} className="text-violet-600" />
        <h3 className="text-sm font-semibold">My Components</h3>
        <span className="text-xs text-gray-500">({componentList.length})</span>
      </div>

      {componentList.map(([id, component]) => (
        <DraggableComponent key={id} componentId={id} component={component} />
      ))}
    </div>
  );
};

const DraggableComponent = ({ componentId, component }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `component-${componentId}`,
    data: {
      type: 'component',
      componentId,
      definition: component.definition
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        p-3 rounded-lg border-2 border-violet-200 dark:border-violet-800
        bg-violet-50 dark:bg-violet-900/20
        hover:border-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30
        cursor-grab active:cursor-grabbing
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-violet-600 text-white">
          <Star size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {component.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {component.instances.length} instance(s)
          </p>
          <p className="text-xs text-violet-600 dark:text-violet-400">
            {component.definition.type}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComponentLibrary;
