import React from 'react';
import { ChevronRight, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useComponentRegistry } from '../../contexts/ComponentRegistryContext';
import { 
  DndContext, 
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Sortable Layer Item Component
 */
const SortableLayerItem = React.memo(({ component, isSelected, onSelect }) => {
  const { toggleComponentVisibility } = useComponentRegistry();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`layer-item-${component.id}`}
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
        isSelected
          ? 'bg-blue-500/20 border-2 border-blue-500'
          : isDragging
          ? 'bg-gray-800 border-2 border-dashed border-blue-400 opacity-50 scale-105'
          : 'hover:bg-gray-800 border-2 border-transparent'
      }`}
      onClick={() => onSelect(component.id)}
    >
      {/* Drag Handle */}
      <div
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} className="text-gray-500 hover:text-gray-300" />
      </div>

      {/* Component Name */}
      <div className="flex-1">
        <div className={`text-sm font-medium ${
          isSelected ? 'text-blue-400' : 'text-gray-200'
        }`}>
          {component.name}
        </div>
        {component.description && (
          <div className="text-xs text-gray-500 mt-0.5">
            {component.description}
          </div>
        )}
      </div>

      {/* Visibility Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleComponentVisibility(component.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
        title={component.visible ? 'Hide component' : 'Show component'}
      >
        {component.visible ? (
          <Eye size={16} className="text-gray-400" />
        ) : (
          <EyeOff size={16} className="text-gray-500" />
        )}
      </button>

      {/* Selected Indicator */}
      {isSelected && (
        <ChevronRight size={16} className="text-blue-400" />
      )}
    </div>
  );
});

/**
 * ComponentLayersPanel - Shows all page components in a list with drag & drop
 * Using @dnd-kit for smooth reordering
 */
const ComponentLayersPanel = ({ onSelectComponent }) => {
  const {
    pageComponents,
    selectedComponent,
    setSelectedComponent,
    reorderComponents
  } = useComponentRegistry();

  const [activeId, setActiveId] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const filteredComponents = pageComponents.filter(
        c => c.id !== 'navbar' && c.id !== 'scrollProgress'
      );
      
      const oldIndex = filteredComponents.findIndex(c => c.id === active.id);
      const newIndex = filteredComponents.findIndex(c => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(filteredComponents, oldIndex, newIndex);
        
        // Reconstruct with navbar and scrollProgress at start
        const navbarComponent = pageComponents.find(c => c.id === 'navbar');
        const scrollProgressComponent = pageComponents.find(c => c.id === 'scrollProgress');
        
        const finalComponents = [
          ...(navbarComponent ? [navbarComponent] : []),
          ...(scrollProgressComponent ? [scrollProgressComponent] : []),
          ...newOrder
        ];
        
        reorderComponents(finalComponents);
      }
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleComponentClick = (componentId) => {
    setSelectedComponent(componentId);
    if (onSelectComponent) {
      onSelectComponent(componentId);
    }
  };

  // Filter out navbar and scrollProgress from draggable sections
  // Navbar: Fixed at top, editable but not draggable
  // ScrollProgress: UI overlay, has its own settings panel
  const draggableComponents = pageComponents.filter(
    c => c.id !== 'navbar' && c.id !== 'scrollProgress'
  );

  const activeComponent = activeId 
    ? draggableComponents.find(c => c.id === activeId)
    : null;

  if (!pageComponents || pageComponents.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-400">No components found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-2">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">Layers</h2>
        <p className="text-sm text-gray-400 mt-1">
          {draggableComponents.length} sections · Drag to reorder
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext 
          items={draggableComponents.map(c => c.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {draggableComponents.map((component) => (
              <SortableLayerItem
                key={component.id}
                component={component}
                isSelected={selectedComponent === component.id}
                onSelect={handleComponentClick}
              />
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeId && activeComponent ? (
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-2xl border-2 border-blue-400">
              <span className="text-sm font-semibold flex items-center gap-2">
                <GripVertical size={14} />
                {activeComponent.name}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="pt-4 mt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          💡 Drag sections to reorder · Click to edit
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Navbar: Always at top · ScrollProgress: Settings → Site Features
        </p>
      </div>
    </div>
  );
};

export default ComponentLayersPanel;
