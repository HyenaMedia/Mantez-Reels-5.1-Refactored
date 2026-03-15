import React, { useState, useEffect } from 'react';
import { useComponentRegistry } from '../../contexts/ComponentRegistryContext';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { GOOGLE_FONTS, loadGoogleFont } from '../../utils/googleFonts';

/**
 * ReactComponentInspector - Edit actual component content
 * Connects to backend /api/content/* endpoints
 */
const ReactComponentInspector = () => {
  const {
    selectedComponent,
    componentContent,
    pageComponents,
    saveComponentContent,
    updateComponentContentLocal,
    loadComponentContent,
    saving
  } = useComponentRegistry();
  
  const { toast } = useToast();
  const [editedContent, setEditedContent] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [, setInitialContent] = useState({});

  const component = pageComponents.find(c => c.id === selectedComponent);

  // Load content when component changes
  useEffect(() => {
    if (selectedComponent && componentContent[selectedComponent]) {
      const content = componentContent[selectedComponent];
      setEditedContent(content);
      setInitialContent(content);
      setHasChanges(false);
    }
  }, [selectedComponent]); // Only reset when selected component changes, not on every content update

  if (!selectedComponent || !component) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center" data-testid="inspector-empty-state">
        <div className="p-4 bg-gray-800 rounded-full mb-4">
          <AlertCircle className="text-gray-500" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No Component Selected
        </h3>
        <p className="text-sm text-gray-400">
          Click on any component in the canvas to edit its content
        </p>
      </div>
    );
  }

  const handleFieldChange = (field, value) => {
    const newContent = {
      ...editedContent,
      [field]: value
    };
    setEditedContent(newContent);
    setHasChanges(true);
    
    // Update live preview immediately
    updateComponentContentLocal(selectedComponent, newContent);
  };

  const handleSave = async () => {
    const result = await saveComponentContent(selectedComponent, editedContent);
    
    if (result.success) {
      toast({
        title: 'Content Saved',
        description: `${component.name} has been updated successfully`,
        variant: 'default'
      });
      setHasChanges(false);
      setInitialContent(editedContent); // Update initial content after successful save
    } else {
      toast({
        title: 'Save Failed',
        description: result.error || 'Failed to save changes',
        variant: 'destructive'
      });
    }
  };

  const handleRefresh = async () => {
    await loadComponentContent(selectedComponent);
    const freshContent = componentContent[selectedComponent];
    setEditedContent(freshContent);
    setInitialContent(freshContent);
    setHasChanges(false);
    toast({
      title: 'Content Refreshed',
      description: 'Loaded latest content from server'
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-900" data-testid="inspector-panel">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white">{component.name}</h2>
          {hasChanges && (
            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded">
              Unsaved
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">{component.description}</p>
      </div>

      {/* Content Fields */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <ContentFields
          componentId={selectedComponent}
          content={editedContent}
          onChange={handleFieldChange}
        />
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-700 bg-gray-900/80 space-y-3">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="w-full"
          data-testid="save-changes-btn"
        >
          {saving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
        
        <button
          onClick={handleRefresh}
          disabled={saving}
          className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
        >
          <RefreshCw className="inline mr-2 h-4 w-4" />
          Refresh from Server
        </button>
      </div>
    </div>
  );
};

/**
 * ContentFields - Renders editable fields based on component type
 */
const ContentFields = ({ componentId, content, onChange }) => {
  const [activeTab, setActiveTab] = useState('content'); // content, style, layout
  
  // Define field schemas for each component
  const fieldSchemas = {
    navbar: {
      content: [
        { key: 'site_name', label: 'Site Name', type: 'text', placeholder: 'Mantez Reels' },
        { key: 'logo_url', label: 'Logo URL', type: 'text', placeholder: 'https://...' },
        { key: 'show_theme_toggle', label: 'Show Theme Toggle', type: 'checkbox' },
        { key: 'show_language_switcher', label: 'Show Language Switcher', type: 'checkbox' }
      ]
    },
    scrollProgress: {
      content: [
        { key: 'enabled', label: 'Enabled', type: 'checkbox' },
        { key: 'gradient_start_color', label: 'Gradient Start Color', type: 'color' },
        { key: 'gradient_end_color', label: 'Gradient End Color', type: 'color' },
        { key: 'height', label: 'Height (px)', type: 'text', placeholder: '1' }
      ]
    },
    hero: {
      content: [
        { key: 'brand_name', label: 'Brand Name', type: 'text', placeholder: 'Mantez Reels' },
        { key: 'tagline_line1', label: 'Tagline Line 1', type: 'text', placeholder: "hello, I'm Manos..." },
        { key: 'tagline_line2', label: 'Tagline Line 2', type: 'text', placeholder: 'and designer...' },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'I bring ideas to life...' },
        { key: 'availability_badge', label: 'Availability Badge', type: 'text', placeholder: 'Available for Inquiries' },
        { key: 'cta_button_text', label: 'CTA Button Text', type: 'text', placeholder: 'Send me a message' }
      ],
      style: [
        { key: 'brand_name_font_family', label: 'Brand Name Font', type: 'font', category: 'sans-serif' },
        { key: 'brand_name_font_size', label: 'Brand Name Size', type: 'select', options: ['text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl'] },
        { key: 'brand_name_font_weight', label: 'Brand Name Weight', type: 'select', options: ['font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold'] },
        { key: 'tagline_font_family', label: 'Tagline Font', type: 'font', category: 'sans-serif' },
        { key: 'tagline_font_size', label: 'Tagline Size', type: 'select', options: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'] },
        { key: 'description_font_family', label: 'Description Font', type: 'font', category: 'sans-serif' },
        { key: 'description_font_size', label: 'Description Size', type: 'select', options: ['text-xs', 'text-sm', 'text-base', 'text-lg'] },
        { key: 'text_color', label: 'Text Color', type: 'color' },
        { key: 'background_color', label: 'Background Color', type: 'color' }
      ]
    },
    portfolio: {
      content: [
        { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Portfolio' },
        { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Latest Projects' },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Cinematic stories...' }
      ]
    },
    services: {
      content: [
        { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Services' },
        { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'What I Offer' },
        { key: 'description', label: 'Description', type: 'textarea' }
      ]
    },
    about: {
      content: [
        { key: 'title', label: 'Section Title', type: 'text', placeholder: 'About' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' },
        { key: 'description', label: 'About Text', type: 'textarea', rows: 6 }
      ]
    },
    testimonials: {
      content: [
        { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Testimonials' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' }
      ]
    },
    faq: {
      content: [
        { key: 'title', label: 'Section Title', type: 'text', placeholder: 'FAQ' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' }
      ]
    },
    blog: {
      content: [
        { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Blog' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' }
      ]
    },
    contact: {
      content: [
        { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Contact' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' }
      ]
    }
  };

  const schema = fieldSchemas[componentId];

  if (!schema) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No editable fields defined for this component</p>
        <p className="text-sm mt-2">Content structure needs to be configured</p>
      </div>
    );
  }

  const contentFields = schema.content || schema;
  const styleFields = schema.style || [];

  return (
    <>
      {/* Tabs for Content/Style */}
      {styleFields.length > 0 && (
        <div className="flex gap-2 mb-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'content'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'style'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Style
          </button>
        </div>
      )}

      {/* Render fields based on active tab */}
      {activeTab === 'content' && contentFields.map(field => (
        <FieldRenderer key={field.key} field={field} content={content} onChange={onChange} />
      ))}
      
      {activeTab === 'style' && styleFields.map(field => (
        <FieldRenderer key={field.key} field={field} content={content} onChange={onChange} />
      ))}
    </>
  );
};

const FieldRenderer = ({ field, content, onChange }) => {
  // Load Google Font if field type is font and a value is selected
  useEffect(() => {
    if (field.type === 'font' && content[field.key]) {
      loadGoogleFont(content[field.key]);
    }
  }, [field, content]);

  const inputClass = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500";

  return (
    <div className="space-y-2 mb-4">
      <label className="block text-sm font-medium text-gray-300">
        {field.label}
      </label>
      
      {field.type === 'checkbox' ? (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={content[field.key] || false}
            onChange={(e) => onChange(field.key, e.target.checked)}
            className="w-4 h-4 accent-blue-500 bg-gray-800 border-gray-600 rounded"
          />
          <span className="text-sm text-gray-400">{field.hint || 'Enable this feature'}</span>
        </div>
      ) : field.type === 'font' ? (
        <select
          value={content[field.key] || 'Inter'}
          onChange={(e) => {
            onChange(field.key, e.target.value);
            loadGoogleFont(e.target.value);
          }}
          className={inputClass}
          style={{ fontFamily: content[field.key] ? `'${content[field.key]}'` : 'Inter' }}
        >
          <optgroup label="Sans-Serif">
            {GOOGLE_FONTS.filter(f => f.category === 'sans-serif').map(font => (
              <option key={font.name} value={font.name} style={{ fontFamily: `'${font.name}'` }}>
                {font.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Serif">
            {GOOGLE_FONTS.filter(f => f.category === 'serif').map(font => (
              <option key={font.name} value={font.name} style={{ fontFamily: `'${font.name}'` }}>
                {font.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Display">
            {GOOGLE_FONTS.filter(f => f.category === 'display').map(font => (
              <option key={font.name} value={font.name} style={{ fontFamily: `'${font.name}'` }}>
                {font.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Monospace">
            {GOOGLE_FONTS.filter(f => f.category === 'monospace').map(font => (
              <option key={font.name} value={font.name} style={{ fontFamily: `'${font.name}'` }}>
                {font.name}
              </option>
            ))}
          </optgroup>
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          value={content[field.key] || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={field.rows || 3}
          className={`${inputClass} resize-none`}
        />
      ) : field.type === 'select' ? (
        <select
          value={content[field.key] || field.options[0]}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={inputClass}
        >
          {field.options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : field.type === 'color' ? (
        <div className="flex gap-2">
          <input
            type="color"
            value={content[field.key] || '#000000'}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-12 h-10 border border-gray-700 rounded-lg cursor-pointer bg-gray-800"
          />
          <input
            type="text"
            value={content[field.key] || '#000000'}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder="#000000"
            className={`flex-1 font-mono ${inputClass}`}
          />
        </div>
      ) : (
        <input
          type={field.type}
          value={content[field.key] || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className={inputClass}
        />
      )}
      
      {field.hint && (
        <p className="text-xs text-gray-500">{field.hint}</p>
      )}
    </div>
  );
};

export default ReactComponentInspector;
