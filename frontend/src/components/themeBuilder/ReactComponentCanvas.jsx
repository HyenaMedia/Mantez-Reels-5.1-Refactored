import React, { Suspense, useState } from 'react';
import { useComponentRegistry } from '../../contexts/ComponentRegistryContext';
import { GripVertical, Eye, EyeOff, Settings } from 'lucide-react';

/**
 * ReactComponentCanvas - Displays actual React components for editing
 * This replaces the JSON-based DroppableCanvas
 */
const ReactComponentCanvas = ({ device = 'desktop' }) => {
  const {
    pageComponents,
    selectedComponent,
    setSelectedComponent,
    componentContent,
    loading,
    toggleComponentVisibility
  } = useComponentRegistry();

  // Get device dimensions
  const getDeviceDimensions = () => {
    switch (device) {
      case 'mobile':
        return { width: '375px', maxWidth: '375px' };
      case 'tablet':
        return { width: '768px', maxWidth: '768px' };
      default:
        return { width: '100%', maxWidth: '100%' };
    }
  };

  const dimensions = getDeviceDimensions();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your website...</p>
        </div>
      </div>
    );
  }

  if (!pageComponents || pageComponents.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-gray-300 mb-2">No components found</p>
          <p className="text-sm text-gray-500">Check your configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 overflow-auto">
      {/* Device Frame */}
      <div className="flex items-start justify-center p-8 min-h-full">
        <div
          className="bg-white shadow-2xl overflow-hidden transition-all duration-300"
          style={{
            width: dimensions.width,
            maxWidth: dimensions.maxWidth,
            minHeight: '100vh'
          }}
        >
          {/* Render each component - EXCLUDE navbar and scrollProgress */}
          {pageComponents
            .filter(comp => comp.id !== 'navbar' && comp.id !== 'scrollProgress')
            .map((comp, index) => (
              <EditableComponent
                key={comp.id}
                component={comp}
                content={componentContent[comp.id]}
                isSelected={selectedComponent === comp.id}
                onSelect={() => setSelectedComponent(comp.id)}
                onToggleVisibility={() => toggleComponentVisibility(comp.id)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

/**
 * EditableComponent - Wraps each React component with editing controls
 */
const EditableComponent = ({
  component,
  content,
  isSelected,
  onSelect,
  onToggleVisibility
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const ComponentToRender = component.component;

  if (!component.visible) {
    return (
      <div
        className="relative border-2 border-dashed border-slate-300 bg-slate-100 p-8 text-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <EyeOff size={20} />
          <span>{component.name} (Hidden)</span>
        </div>
        
        {isHovered && (
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={onToggleVisibility}
              className="p-2 bg-white rounded-lg shadow-lg border border-slate-200 hover:bg-slate-50"
              title="Show component"
            >
              <Eye size={16} className="text-slate-600" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Component Controls Toolbar */}
      {(isHovered || isSelected) && (
        <div className="absolute top-2 right-2 z-50 flex items-center gap-1 bg-white rounded-lg shadow-xl border border-slate-200 p-1.5">
          <div className="px-2 py-1 text-xs font-medium text-slate-700 border-r border-slate-200">
            {component.name}
          </div>
          
          <button
            className="p-1.5 hover:bg-slate-100 rounded cursor-grab active:cursor-grabbing"
            title="Drag to reorder (coming soon)"
          >
            <GripVertical size={16} className="text-slate-600" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className="p-1.5 hover:bg-slate-100 rounded"
            title="Hide component"
          >
            <EyeOff size={16} className="text-slate-600" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`p-1.5 rounded ${
              isSelected ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'
            }`}
            title="Edit component"
          >
            <Settings size={16} />
          </button>
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 z-40" />
      )}

      {/* Render the actual React component with content override */}
      <div className={isSelected ? 'pointer-events-none' : ''}>
        <Suspense
          fallback={
            <div className="p-8 text-center text-slate-400">
              Loading {component.name}...
            </div>
          }
        >
          {/* Pass content to override component's internal fetch */}
          <ComponentToRender editorContent={content} isInEditor={true} />
        </Suspense>
      </div>
    </div>
  );
};

export default ReactComponentCanvas;
