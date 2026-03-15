import React, { useMemo } from 'react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';

/**
 * LivePreview - Dynamic JSON-driven rendering
 * 
 * This component renders the page structure from JSON state
 * instead of hardcoded components like Navbar, Hero, etc.
 */
const LivePreview = ({ device = 'desktop' }) => {
  const { pageState, selectedElement, setSelectedElement } = useThemeEditor();

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
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No page content</p>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-950">
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-auto"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
        {/* Render all sections dynamically */}
        {pageState.page.sections.map(section => (
          <Section
            key={section.id}
            section={section}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Section Component - Renders a section with its elements
 */
const Section = ({ section, selectedElement, onSelectElement }) => {
  const sectionStyles = useMemo(() => {
    const styles = {};
    
    // Background
    if (section.styles?.background) {
      const bg = section.styles.background;
      if (bg.type === 'gradient' && bg.gradient) {
        const { colors, angle } = bg.gradient;
        styles.background = `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`;
      } else if (bg.type === 'solid' && bg.color) {
        styles.backgroundColor = bg.color;
      }
    }
    
    // Padding
    if (section.styles?.padding) {
      const p = section.styles.padding;
      styles.padding = `${p.top || 0}px ${p.right || 0}px ${p.bottom || 0}px ${p.left || 0}px`;
    }
    
    // Min height
    if (section.styles?.minHeight) {
      styles.minHeight = section.styles.minHeight;
    }
    
    return styles;
  }, [section.styles]);

  return (
    <section
      id={section.id}
      style={sectionStyles}
      className="relative"
    >
      <div className="container mx-auto flex flex-col items-center justify-center h-full">
        {/* Render all elements in this section */}
        {section.elements?.map(element => (
          <DynamicElement
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            onSelect={() => onSelectElement(element.id)}
          />
        ))}
      </div>
    </section>
  );
};

/**
 * DynamicElement - Renders different element types based on element.type
 */
const DynamicElement = ({ element, isSelected, onSelect }) => {
  const elementStyles = useMemo(() => {
    const styles = {};
    
    // Typography
    if (element.styles?.typography) {
      const typo = element.styles.typography;
      if (typo.fontSize) styles.fontSize = `${typo.fontSize}px`;
      if (typo.fontWeight) styles.fontWeight = typo.fontWeight;
      if (typo.color) styles.color = typo.color;
      if (typo.textAlign) styles.textAlign = typo.textAlign;
    }
    
    // Spacing
    if (element.styles?.spacing) {
      const space = element.styles.spacing;
      if (space.marginBottom) styles.marginBottom = `${space.marginBottom}px`;
      if (space.marginTop) styles.marginTop = `${space.marginTop}px`;
    }
    
    // Button-specific styles
    if (element.type === 'button' && element.styles) {
      if (element.styles.background) styles.backgroundColor = element.styles.background;
      if (element.styles.padding) {
        const p = element.styles.padding;
        styles.padding = `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
      }
      if (element.styles.borderRadius) styles.borderRadius = `${element.styles.borderRadius}px`;
    }
    
    return styles;
  }, [element.styles, element.type]);

  const className = `
    ${isSelected ? 'ring-2 ring-blue-500' : ''}
    ${element.type === 'button' ? 'inline-block cursor-pointer hover:opacity-90 transition-opacity' : ''}
  `;

  // Render based on element type
  switch (element.type) {
    case 'heading': {
      const HeadingTag = element.props.tag || 'h2';
      return (
        <HeadingTag
          style={elementStyles}
          className={className}
          tabIndex={0}
          onClick={onSelect}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect();
            }
          }}
        >
          {element.props.text}
        </HeadingTag>
      );
    }

    case 'text':
      return (
        <p
          style={elementStyles}
          className={className}
          tabIndex={0}
          onClick={onSelect}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect();
            }
          }}
        >
          {element.props.text}
        </p>
      );

    case 'button':
      return (
        <a
          href={element.props.link || '#'}
          style={elementStyles}
          className={className}
          role="button"
          onClick={(e) => {
            e.preventDefault();
            onSelect();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect();
            }
          }}
        >
          {element.props.text}
        </a>
      );

    case 'image':
      return (
        <img
          src={element.props.src}
          alt={element.props.alt || ''}
          style={elementStyles}
          className={className}
          tabIndex={0}
          role="button"
          onClick={onSelect}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect();
            }
          }}
        />
      );

    default:
      return (
        <div
          style={elementStyles}
          className={className}
          tabIndex={0}
          role="button"
          onClick={onSelect}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect();
            }
          }}
        >
          Unknown element type: {element.type}
        </div>
      );
  }
};

export default LivePreview;
