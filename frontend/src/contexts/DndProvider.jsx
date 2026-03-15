import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useThemeEditor } from './ThemeEditorContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * DndProvider - Full drag-and-drop functionality
 * Phase 1 (Weeks 2-3) - IMPLEMENTED
 */
export const DndProvider = ({ children }) => {
  const [activeId, setActiveId] = useState(null);
  const [activeData, setActiveData] = useState(null);
  const { pageState, updatePageState, addElement, addSection } = useThemeEditor();

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setActiveData(event.active.data.current);
  };

  const handleDragOver = (_event) => {
    // Visual feedback handled by DroppableCanvas
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveData(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    // CASE 1: Dragging from library to canvas
    if (activeData?.type === 'library-element') {
      // Find which section to add to
      let targetSectionId = null;
      
      if (overData?.type === 'section-drop') {
        // Dropped directly on section drop zone
        targetSectionId = overData.sectionId;
      } else if (overData?.type === 'element') {
        // Dropped on an existing element - add to same section
        targetSectionId = overData.sectionId;
      } else if (overData?.type === 'section') {
        // Dropped on section itself
        targetSectionId = overData.section.id;
      }
      
      if (targetSectionId) {
        const newElement = {
          id: `element-${activeData.elementType}-${Date.now()}`,
          type: activeData.elementType,
          props: activeData.defaultProps,
          styles: activeData.defaultStyles
        };

        addElement(targetSectionId, newElement);
      } else if (overData?.type === 'empty-drop') {
        // Create new section with this element
        const newElement = {
          id: `element-${activeData.elementType}-${Date.now()}`,
          type: activeData.elementType,
          props: activeData.defaultProps,
          styles: activeData.defaultStyles
        };

        const newSection = {
          id: `section-${Date.now()}`,
          type: 'section',
          name: 'New Section',
          styles: {
            padding: { top: 80, right: 24, bottom: 80, left: 24 },
            background: { type: 'solid', color: '#ffffff' }
          },
          elements: [newElement]
        };

        addSection(newSection);
      }
    }

    // CASE 2: Reordering sections
    else if (activeData?.type === 'section' && overData?.type === 'section') {
      const sections = pageState?.page?.sections;
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);

      if (oldIndex !== newIndex) {
        const newSections = arrayMove(sections, oldIndex, newIndex);
        const newState = {
          page: {
            ...pageState.page,
            sections: newSections
          }
        };
        updatePageState(newState);

        // Persist new order to backend
        const token = localStorage.getItem('token');
        const pageId = pageState?.page?.meta?.id;
        if (pageId) {
          axios.put(
            `${BACKEND_URL}/api/pages/${pageId}/sections/order`,
            { section_ids: newSections.map(s => s.id) },
            { headers: { Authorization: `Bearer ${token}` } }
          ).catch((err) => console.error('Failed to persist section order:', err));
        }
      }
    }

    // CASE 3: Reordering/moving elements
    else if (activeData?.type === 'element' && overData?.type === 'element') {
      if (activeData.sectionId === overData.sectionId) {
        // Same section — reorder
        const section = pageState?.page?.sections.find(s => s.id === activeData.sectionId);
        if (section) {
          const oldIndex = section.elements.findIndex(e => e.id === active.id);
          const newIndex = section.elements.findIndex(e => e.id === over.id);

          if (oldIndex !== newIndex) {
            const newElements = arrayMove(section.elements, oldIndex, newIndex);
            const newSections = pageState?.page?.sections.map(s =>
              s.id === activeData.sectionId ? { ...s, elements: newElements } : s
            );
            updatePageState({
              page: { ...pageState.page, sections: newSections }
            });
          }
        }
      } else {
        // Different sections — move element across sections
        const element = pageState?.page?.sections
          .find(s => s.id === activeData.sectionId)
          ?.elements.find(e => e.id === active.id);

        if (element) {
          const targetInsertIndex = pageState?.page?.sections
            .find(s => s.id === overData.sectionId)
            ?.elements.findIndex(e => e.id === over.id) ?? -1;

          const newSections = pageState?.page?.sections.map(s => {
            if (s.id === activeData.sectionId) {
              return { ...s, elements: s.elements.filter(e => e.id !== active.id) };
            }
            if (s.id === overData.sectionId) {
              const updated = [...s.elements];
              const insertAt = targetInsertIndex >= 0 ? targetInsertIndex : updated.length;
              updated.splice(insertAt, 0, element);
              return { ...s, elements: updated };
            }
            return s;
          });
          updatePageState({
            page: { ...pageState.page, sections: newSections }
          });
        }
      }
    }

    // CASE 3b: Element dropped onto a section drop-zone (not onto another element)
    else if (activeData?.type === 'element' && overData?.type === 'section-drop') {
      const targetSectionId = overData.sectionId;
      if (targetSectionId && targetSectionId !== activeData.sectionId) {
        const element = pageState?.page?.sections
          .find(s => s.id === activeData.sectionId)
          ?.elements.find(e => e.id === active.id);

        if (element) {
          const newSections = pageState?.page?.sections.map(s => {
            if (s.id === activeData.sectionId) {
              return { ...s, elements: s.elements.filter(e => e.id !== active.id) };
            }
            if (s.id === targetSectionId) {
              return { ...s, elements: [...s.elements, element] };
            }
            return s;
          });
          updatePageState({
            page: { ...pageState.page, sections: newSections }
          });
        }
      }
    }
    
    setActiveId(null);
    setActiveData(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveData(null);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay>
        {activeId && activeData ? (
          <div className="bg-violet-500 text-white px-4 py-2 rounded-lg shadow-xl border-2 border-violet-400">
            <span className="text-sm font-semibold">
              {activeData.type === 'library-element' && `Adding ${activeData.elementType}`}
              {activeData.type === 'section' && `Moving section`}
              {activeData.type === 'element' && `Moving ${activeData.element.type}`}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
