import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Import all editable components
import Navbar from '../components/Navbar';
import ScrollProgress from '../components/ScrollProgress';
import Hero from '../components/Hero';
import Portfolio from '../components/Portfolio';
import Services from '../components/Services';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Blog from '../components/Blog';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const ComponentRegistryContext = createContext();

// Component Registry - Maps component names to actual React components
export const COMPONENT_REGISTRY = {
  navbar: {
    name: 'Navbar',
    component: Navbar,
    contentEndpoint: '/api/content/navbar',
    order: 0,
    editable: true,
    description: 'Navigation bar with site branding and menu'
  },
  scrollProgress: {
    name: 'Scroll Progress',
    component: ScrollProgress,
    contentEndpoint: '/api/content/scroll-progress',
    order: 0.5,
    editable: true,
    description: 'Scroll progress indicator bar'
  },
  hero: {
    name: 'Hero',
    component: Hero,
    contentEndpoint: '/api/content/hero',
    order: 1,
    editable: true,
    description: 'Main hero section with tagline and CTA'
  },
  portfolio: {
    name: 'Portfolio',
    component: Portfolio,
    contentEndpoint: '/api/content/portfolio',
    order: 2,
    editable: true,
    description: 'Portfolio/projects showcase'
  },
  services: {
    name: 'Services',
    component: Services,
    contentEndpoint: '/api/content/services',
    order: 3,
    editable: true,
    description: 'Services offered section'
  },
  about: {
    name: 'About',
    component: About,
    contentEndpoint: '/api/content/about',
    order: 4,
    editable: true,
    description: 'About me/company section'
  },
  testimonials: {
    name: 'Testimonials',
    component: Testimonials,
    contentEndpoint: '/api/content/testimonials',
    order: 5,
    editable: true,
    description: 'Client testimonials'
  },
  faq: {
    name: 'FAQ',
    component: FAQ,
    contentEndpoint: '/api/content/faq',
    order: 6,
    editable: true,
    description: 'Frequently asked questions'
  },
  blog: {
    name: 'Blog',
    component: Blog,
    contentEndpoint: '/api/content/blog',
    order: 7,
    editable: true,
    description: 'Blog posts section'
  },
  contact: {
    name: 'Contact',
    component: Contact,
    contentEndpoint: '/api/content/contact',
    order: 8,
    editable: true,
    description: 'Contact form and information'
  },
  footer: {
    name: 'Footer',
    component: Footer,
    contentEndpoint: '/api/content/footer',
    order: 9,
    editable: true,
    description: 'Footer with links and copyright'
  }
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const ComponentRegistryProvider = ({ children }) => {
  const [pageComponents, setPageComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [componentContent, setComponentContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load page structure (which components are active and their order)
  useEffect(() => {
    const controller = new AbortController();
    loadPageStructure(controller.signal);
    return () => controller.abort();
  }, []);

  const loadPageStructure = async (signal) => {
    try {
      setLoading(true);

      // Try to load saved page structure from backend
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          if (signal) config.signal = signal;
          const response = await axios.get(
            `${BACKEND_URL}/api/pages/home`,
            config
          );

          const savedSections = response.data?.page?.sections || [];

          if (savedSections.length > 0) {
            // Map saved sections to components
            const orderedComponents = savedSections
              .map(section => {
                const registryEntry = COMPONENT_REGISTRY[section.id];
                if (registryEntry) {
                  return {
                    id: section.id,
                    ...registryEntry,
                    visible: section.visible !== false,
                    order: section.order || registryEntry.order
                  };
                }
                return null;
              })
              .filter(Boolean);

            // Add any components from registry that aren't in saved sections
            Object.keys(COMPONENT_REGISTRY).forEach(key => {
              if (!orderedComponents.find(c => c.id === key)) {
                orderedComponents.push({
                  id: key,
                  ...COMPONENT_REGISTRY[key],
                  visible: true
                });
              }
            });

            setPageComponents(orderedComponents);
            await loadAllComponentContent(orderedComponents, signal);
            return;
          }
        } catch (error) {
          if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
          console.debug('No saved page structure, using default');
        }
      }

      // Fall back to default structure
      const defaultStructure = Object.keys(COMPONENT_REGISTRY)
        .map(key => ({
          id: key,
          ...COMPONENT_REGISTRY[key],
          visible: true
        }))
        .sort((a, b) => a.order - b.order);

      setPageComponents(defaultStructure);
      await loadAllComponentContent(defaultStructure, signal);

    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
      console.error('Error loading page structure:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllComponentContent = async (components, signal) => {
    const contentPromises = components.map(async (comp) => {
      if (comp.contentEndpoint) {
        try {
          const config = signal ? { signal } : {};
          const response = await axios.get(`${BACKEND_URL}${comp.contentEndpoint}`, config);
          return { [comp.id]: response.data.content || {} };
        } catch (error) {
          if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') throw error;
          console.error(`Failed to load content for component ${comp.id}:`, error);
          return { [comp.id]: {} };
        }
      }
      return { [comp.id]: {} };
    });

    const results = await Promise.all(contentPromises);
    const contentMap = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    setComponentContent(contentMap);
  };

  const loadComponentContent = async (componentId) => {
    const component = pageComponents.find(c => c.id === componentId);
    if (!component || !component.contentEndpoint) return;

    try {
      const response = await axios.get(`${BACKEND_URL}${component.contentEndpoint}`);
      setComponentContent(prev => ({
        ...prev,
        [componentId]: response.data.content || {}
      }));
      return response.data.content;
    } catch (error) {
      console.error(`Failed to load content for component ${componentId}:`, error);
      return null;
    }
  };

  const saveComponentContent = async (componentId, content) => {
    const component = pageComponents.find(c => c.id === componentId);
    if (!component || !component.contentEndpoint) {
      return { success: false };
    }

    try {
      setSaving(true);
      
      // Immediately update local state for live preview
      setComponentContent(prev => ({
        ...prev,
        [componentId]: content
      }));
      
      const response = await axios.put(
        `${BACKEND_URL}${component.contentEndpoint}`,
        { content },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Failed to save content for component ${componentId}:`, error);
      // Revert on error
      await loadComponentContent(componentId);
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  // Update content immediately without saving (for live preview)
  const updateComponentContentLocal = (componentId, content) => {
    setComponentContent(prev => ({
      ...prev,
      [componentId]: content
    }));
  };

  const reorderComponents = (newOrder) => {
    setPageComponents(newOrder);
  };

  const saveComponentOrder = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }
      
      // Get all components except navbar and scrollProgress
      const sectionsToSave = pageComponents
        .filter(c => c.id !== 'navbar' && c.id !== 'scrollProgress')
        .map((c, index) => ({
          id: c.id,
          type: 'component',
          name: c.name,
          visible: c.visible !== false,
          order: index
        }));
      
      // Save full page structure
      await axios.put(
        `${BACKEND_URL}/api/pages/home`,
        {
          page: {
            id: 'home',
            name: 'Home Page',
            sections: sectionsToSave
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error saving component order:', error);
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  const toggleComponentVisibility = (componentId) => {
    setPageComponents(prev =>
      prev.map(comp =>
        comp.id === componentId
          ? { ...comp, visible: !comp.visible }
          : comp
      )
    );
  };

  const value = {
    pageComponents,
    selectedComponent,
    setSelectedComponent,
    componentContent,
    loading,
    saving,
    loadComponentContent,
    saveComponentContent,
    updateComponentContentLocal,
    reorderComponents,
    saveComponentOrder,
    toggleComponentVisibility,
    refreshContent: loadPageStructure
  };

  return (
    <ComponentRegistryContext.Provider value={value}>
      {children}
    </ComponentRegistryContext.Provider>
  );
};

export const useComponentRegistry = () => {
  const context = useContext(ComponentRegistryContext);
  if (!context) {
    throw new Error('useComponentRegistry must be used within ComponentRegistryProvider');
  }
  return context;
};

export default ComponentRegistryContext;
