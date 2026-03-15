import React from 'react';
import { useDroppable } from '@dnd-kit/core';

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

export default EmptyDropZone;
