import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ThemeEditorContext = createContext();

// Default page structure with JSON-driven architecture
const defaultPageState = {
  page: {
    meta: {
      id: 'home',
      name: 'Home Page',
      settings: {
        seo: {
          title: 'Welcome to Our Site',
          description: 'Beautiful website built with our visual builder'
        },
        globalStyles: {
          colors: {
            primary: '#8b5cf6',
            secondary: '#7c3aed',
            accent: '#a855f7',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
            // Shades
            neutral: {
              50: '#f9fafb',
              100: '#f3f4f6',
              200: '#e5e7eb',
              300: '#d1d5db',
              400: '#9ca3af',
              500: '#6b7280',
              600: '#4b5563',
              700: '#374151',
              800: '#1f2937',
              900: '#111827',
              950: '#030712'
            }
          },
          typography: {
            headingFont: 'Inter',
            bodyFont: 'Inter',
            scale: {
              xs: 12,
              sm: 14,
              base: 16,
              lg: 18,
              xl: 20,
              '2xl': 24,
              '3xl': 30,
              '4xl': 36,
              '5xl': 48,
              '6xl': 60
            }
          },
          spacing: {
            scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
          }
        }
      }
    },
    sections: [
      {
        id: 'section-hero-1',
        type: 'section',
        name: 'Hero Section',
        styles: {
          background: {
            type: 'gradient',
            gradient: {
              colors: ['#9333ea', '#ec4899'],
              angle: 135,
              opacity: 40,
              blur: 70
            }
          },
          padding: { top: 120, right: 24, bottom: 120, left: 24 },
          minHeight: '100vh'
        },
        elements: [
          {
            id: 'element-heading-hero-1',
            type: 'heading',
            props: {
              text: 'Welcome to Our Site',
              tag: 'h1'
            },
            styles: {
              typography: {
                fontSize: 48,
                fontWeight: 700,
                color: '#ffffff',
                textAlign: 'center'
              },
              spacing: {
                marginBottom: 16
              }
            }
          },
          {
            id: 'element-text-hero-1',
            type: 'text',
            props: {
              text: 'Build beautiful websites with our revolutionary visual builder'
            },
            styles: {
              typography: {
                fontSize: 18,
                color: '#e5e7eb',
                textAlign: 'center'
              },
              spacing: {
                marginBottom: 32
              }
            }
          },
          {
            id: 'element-button-hero-1',
            type: 'button',
            props: {
              text: 'Get Started',
              link: '#about',
              variant: 'primary'
            },
            styles: {
              background: '#a855f7',
              color: '#ffffff',
              padding: { top: 12, right: 24, bottom: 12, left: 24 },
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600
            }
          }
        ]
      }
    ],
    components: {
      // Reusable components will be added in Phase 1, Week 6
    }
  }
};

export const useThemeEditor = () => {
  const context = useContext(ThemeEditorContext);
  if (!context) {
    throw new Error('useThemeEditor must be used within ThemeEditorProvider');
  }
  return context;
};

const LOCAL_PAGE_KEY = 'vb-page-state';
const loadLocalPageState = () => {
  try { const r = localStorage.getItem(LOCAL_PAGE_KEY); if (r) return JSON.parse(r); } catch { /* ignore */ }
  return null;
};

export const ThemeEditorProvider = ({ children }) => {
  // Init from localStorage so state survives page reloads
  const initialState = loadLocalPageState() || defaultPageState;
  const [pageState, setPageState] = useState(initialState);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop');
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [history, setHistory] = useState([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  // Ref to avoid stale closure in savePage
  const pageStateRef = useRef(pageState);
  useEffect(() => { pageStateRef.current = pageState; }, [pageState]);

  // Auto-save to localStorage on every state change
  useEffect(() => {
    try { localStorage.setItem(LOCAL_PAGE_KEY, JSON.stringify(pageState)); } catch { /* quota */ }
  }, [pageState]);

  // Load page from backend (only replaces local if backend has richer data)
  useEffect(() => {
    const controller = new AbortController();
    loadPage('home', controller.signal);
    return () => controller.abort();
  }, []);

  const loadPage = async (pageId = 'home', signal) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (signal) config.signal = signal;
      const response = await axios.get(`${BACKEND_URL}/api/pages/${pageId}`, config);
      if (response.data) {
        // Only use backend data when localStorage has no sections.
        // localStorage is the working copy; backend is the saved copy.
        // User explicitly saves to backend with Cmd+S / Save button.
        const localSections = loadLocalPageState()?.page?.sections ?? [];
        if (localSections.length === 0) {
          setPageState(response.data);
          setHistory([response.data]);
          setHistoryIndex(0);
        }
        // else: localStorage has work-in-progress — keep it
      }
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
      console.error('Failed to fetch page state from backend:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const currentState = pageStateRef.current;
      const pageId = currentState.page.meta.id;
      await axios.put(`${BACKEND_URL}/api/pages/${pageId}`, currentState, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDirty(false);
      return { success: true };
    } catch (error) {
      console.error('Failed to save page:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updatePageState = (updates) => {
    const newState = { ...pageState, ...updates };
    setPageState(newState);
    setIsDirty(true);
    
    // Add to history for undo/redo (capped at 50 entries)
    const MAX_HISTORY = 50;
    let newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > MAX_HISTORY) {
      newHistory = newHistory.slice(-MAX_HISTORY);
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const updateSection = (sectionId, updates) => {
    const newSections = pageState.page.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    
    updatePageState({
      page: {
        ...pageState.page,
        sections: newSections
      }
    });
  };

  /**
   * Update properties of an existing element across all sections.
   * @param {string} elementId - The element's unique id
   * @param {Record<string, unknown>} updates - Partial props to merge into the element
   */
  const updateElement = (elementId, updates) => {
    const newSections = pageState.page.sections.map(section => ({
      ...section,
      elements: section.elements.map(element =>
        element.id === elementId ? { ...element, ...updates } : element
      )
    }));
    
    updatePageState({
      page: {
        ...pageState.page,
        sections: newSections
      }
    });
  };

  /**
   * Add a new section to the page.
   * @param {object} section - The section descriptor object
   * @param {number|null} [atIndex] - Insert position; null appends to end
   */
  const addSection = (section, atIndex = null) => {
    const current = pageState.page.sections;
    let newSections;
    // Navbar sections are always inserted at position 0 (pinned first)
    const isNavbarSection = section.type === 'navbar' || section.name?.toLowerCase().includes('nav');
    if (isNavbarSection) {
      newSections = [section, ...current];
    } else if (atIndex !== null && atIndex >= 0 && atIndex <= current.length) {
      newSections = [...current.slice(0, atIndex), section, ...current.slice(atIndex)];
    } else {
      newSections = [...current, section];
    }
    updatePageState({
      page: { ...pageState.page, sections: newSections }
    });
  };

  /**
   * Remove a section by id.
   * @param {string} sectionId
   */
  const deleteSection = (sectionId) => {
    const newSections = pageState.page.sections.filter(s => s.id !== sectionId);
    updatePageState({
      page: {
        ...pageState.page,
        sections: newSections
      }
    });
  };

  const reorderSections = (fromIndex, toIndex) => {
    const sections = [...pageState.page.sections];
    // Navbar sections (type='navbar') are always pinned as the first section
    const isNavbar = (s) => s.type === 'navbar' || s.name?.toLowerCase().includes('nav');
    if (isNavbar(sections[fromIndex]) || isNavbar(sections[toIndex])) return;
    const [moved] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, moved);
    updatePageState({ page: { ...pageState.page, sections } });
  };

  const duplicateSection = (sectionId) => {
    const idx = pageState.page.sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    const original = pageState.page.sections[idx];
    const cloned = {
      ...JSON.parse(JSON.stringify(original)),
      id: `section-${Date.now()}`,
      name: `${original.name || 'Section'} Copy`,
      elements: original.elements.map(el => ({
        ...JSON.parse(JSON.stringify(el)),
        id: `${el.id}-copy-${Date.now()}`
      }))
    };
    const sections = [...pageState.page.sections];
    sections.splice(idx + 1, 0, cloned);
    updatePageState({ page: { ...pageState.page, sections } });
  };

  const toggleSectionVisibility = (sectionId) => {
    const newSections = pageState.page.sections.map(s =>
      s.id === sectionId ? { ...s, hidden: !s.hidden } : s
    );
    updatePageState({ page: { ...pageState.page, sections: newSections } });
  };

  const toggleSectionLock = (sectionId) => {
    const newSections = pageState.page.sections.map(s =>
      s.id === sectionId ? { ...s, locked: !s.locked } : s
    );
    updatePageState({ page: { ...pageState.page, sections: newSections } });
  };

  /**
   * Duplicate an element, inserting the clone directly after the original.
   * @param {string} elementId - Element to clone
   * @param {string} [sectionId] - Containing section id; auto-resolved when omitted
   */
  const duplicateElement = (elementId, sectionId) => {
    // Auto-resolve sectionId when not provided (mirrors deleteElement behaviour)
    const resolvedSectionId = sectionId ?? pageState.page.sections.find(
      s => s.elements?.some(e => e.id === elementId)
    )?.id;
    const newSections = pageState.page.sections.map(section => {
      if (section.id !== resolvedSectionId) return section;
      const idx = section.elements.findIndex(e => e.id === elementId);
      if (idx === -1) return section;
      const cloned = {
        ...JSON.parse(JSON.stringify(section.elements[idx])),
        id: `${elementId}-copy-${Date.now()}`
      };
      const elements = [...section.elements];
      elements.splice(idx + 1, 0, cloned);
      return { ...section, elements };
    });
    updatePageState({ page: { ...pageState.page, sections: newSections } });
  };

  const moveElementToSection = (elementId, fromSectionId, toSectionId) => {
    let movedElement = null;
    const withRemoved = pageState.page.sections.map(section => {
      if (section.id !== fromSectionId) return section;
      const el = section.elements.find(e => e.id === elementId);
      if (el) movedElement = el;
      return { ...section, elements: section.elements.filter(e => e.id !== elementId) };
    });
    if (!movedElement) return;
    const newSections = withRemoved.map(section => {
      if (section.id !== toSectionId) return section;
      return { ...section, elements: [...section.elements, movedElement] };
    });
    updatePageState({ page: { ...pageState.page, sections: newSections } });
  };

  const renameSection = (sectionId, name) => {
    updateSection(sectionId, { name });
  };

  /**
   * Add an element to a section's element list.
   * @param {string} sectionId - Target section id
   * @param {object} element - Element descriptor (must include `type` and `id`)
   */
  const addElement = (sectionId, element) => {
    const newSections = pageState.page.sections.map(section =>
      section.id === sectionId
        ? { ...section, elements: [...section.elements, element] }
        : section
    );
    
    updatePageState({
      page: {
        ...pageState.page,
        sections: newSections
      }
    });
  };

  /**
   * Delete an element by id from whichever section contains it.
   * @param {string} elementId
   */
  const deleteElement = (elementId) => {
    const newSections = pageState.page.sections.map(section => ({
      ...section,
      elements: section.elements.filter(e => e.id !== elementId)
    }));
    
    updatePageState({
      page: {
        ...pageState.page,
        sections: newSections
      }
    });
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPageState(history[historyIndex - 1]);
      setIsDirty(true);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPageState(history[historyIndex + 1]);
      setIsDirty(true);
    }
  };

  const exportPage = () => {
    const dataStr = JSON.stringify(pageState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `page-${pageState.page.meta.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  /* ── Snapshot versioning (localStorage) ────────────────────── */
  const SNAPSHOT_KEY = 'vb-snapshots';
  const MAX_SNAPSHOTS = 20;

  const getSnapshots = () => {
    try { return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || '[]'); }
    catch { return []; }
  };

  const saveSnapshot = (label = '') => {
    const snapshots = getSnapshots();
    const snap = {
      id: Date.now().toString(),
      label: label || `Snapshot ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
      sectionCount: pageState.page?.sections?.length ?? 0,
      state: JSON.parse(JSON.stringify(pageState)),
    };
    const updated = [snap, ...snapshots].slice(0, MAX_SNAPSHOTS);
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(updated));
    return snap;
  };

  const restoreSnapshot = (snapId) => {
    const snapshots = getSnapshots();
    const snap = snapshots.find(s => s.id === snapId);
    if (!snap) return false;
    setPageState(snap.state);
    setIsDirty(true);
    return true;
  };

  const deleteSnapshot = (snapId) => {
    const updated = getSnapshots().filter(s => s.id !== snapId);
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(updated));
  };

  const value = {
    // State
    pageState,
    selectedElement,
    selectedSection,
    currentBreakpoint,
    loading,
    isDirty,
    
    // Selection
    setSelectedElement,
    setSelectedSection,
    setCurrentBreakpoint,
    
    // Page operations
    loadPage,
    savePage,
    updatePageState,
    exportPage,
    
    // Section operations
    updateSection,
    addSection,
    deleteSection,
    reorderSections,
    duplicateSection,
    toggleSectionVisibility,
    toggleSectionLock,
    renameSection,

    // Element operations (extended)
    duplicateElement,
    moveElementToSection,
    
    // Element operations
    updateElement,
    addElement,
    deleteElement,
    
    // History
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    
    // Snapshots / Version history
    getSnapshots,
    saveSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    // Direct state setters for server-side restore
    setPageState: (state) => { setPageState(state); setIsDirty(true); },

    // Legacy compatibility (for old components that still use themeConfig)
    themeConfig: pageState,
    updateThemeConfig: updatePageState,
    saveThemeConfig: savePage
  };

  return (
    <ThemeEditorContext.Provider value={value}>
      {children}
    </ThemeEditorContext.Provider>
  );
};
