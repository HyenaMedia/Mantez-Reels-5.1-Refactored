// Week 6: Component System
// Reusable components that update site-wide

export const componentHelpers = {
  // Create component from element
  createComponent: (element, name) => {
    const componentId = `component-${Date.now()}`;
    return {
      id: componentId,
      name,
      definition: {
        type: element.type,
        props: element.props,
        styles: element.styles
      },
      instances: []
    };
  },

  // Add instance of component
  addComponentInstance: (pageState, componentId, sectionId) => {
    const component = pageState.page.components[componentId];
    if (!component) return pageState;

    const instanceId = `element-${componentId}-instance-${Date.now()}`;
    const newElement = {
      id: instanceId,
      componentId,
      ...component.definition,
      overrides: {} // Allow instance-specific overrides
    };

    // Add instance ID to component tracking
    const updatedComponent = {
      ...component,
      instances: [...component.instances, instanceId]
    };

    // Add element to section
    const newSections = pageState.page.sections.map(section =>
      section.id === sectionId
        ? { ...section, elements: [...section.elements, newElement] }
        : section
    );

    return {
      ...pageState,
      page: {
        ...pageState.page,
        sections: newSections,
        components: {
          ...pageState.page.components,
          [componentId]: updatedComponent
        }
      }
    };
  },

  // Update component (affects all instances)
  updateComponent: (pageState, componentId, updates) => {
    const component = pageState.page.components[componentId];
    if (!component) return pageState;

    const updatedComponent = {
      ...component,
      definition: {
        ...component.definition,
        ...updates
      }
    };

    // Update all instances
    const newSections = pageState.page.sections.map(section => ({
      ...section,
      elements: section.elements.map(element =>
        element.componentId === componentId
          ? {
              ...element,
              ...updatedComponent.definition,
              // Preserve instance-specific overrides
              props: { ...updatedComponent.definition.props, ...element.overrides }
            }
          : element
      )
    }));

    return {
      ...pageState,
      page: {
        ...pageState.page,
        sections: newSections,
        components: {
          ...pageState.page.components,
          [componentId]: updatedComponent
        }
      }
    };
  },

  // Detach instance from component
  detachInstance: (pageState, elementId) => {
    let updatedPageState = { ...pageState };
    let componentId = null;

    // Find element and its component
    pageState.page.sections.forEach(section => {
      const element = section.elements.find(e => e.id === elementId);
      if (element && element.componentId) {
        componentId = element.componentId;
      }
    });

    if (!componentId) return pageState;

    // Remove componentId from element
    const newSections = pageState.page.sections.map(section => ({
      ...section,
      elements: section.elements.map(element =>
        element.id === elementId
          ? { ...element, componentId: undefined, overrides: undefined }
          : element
      )
    }));

    // Remove instance from component tracking
    const component = pageState.page.components[componentId];
    const updatedComponent = {
      ...component,
      instances: component.instances.filter(id => id !== elementId)
    };

    return {
      ...pageState,
      page: {
        ...pageState.page,
        sections: newSections,
        components: {
          ...pageState.page.components,
          [componentId]: updatedComponent
        }
      }
    };
  }
};
