import React, { useState } from 'react';
import { Palette, Wand2, Sparkles, RefreshCw } from 'lucide-react';

const TemplateLibrary = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Templates', count: 24 },
    { id: 'business', label: 'Business', count: 8 },
    { id: 'portfolio', label: 'Portfolio', count: 6 },
    { id: 'ecommerce', label: 'E-commerce', count: 5 },
    { id: 'blog', label: 'Blog', count: 5 },
  ];

  const templates = [
    {
      id: 'modern-saas',
      name: 'Modern SaaS',
      category: 'business',
      thumbnail: '/templates/modern-saas.png',
      description: 'Clean, modern design for SaaS products',
      features: ['Hero', 'Features', 'Pricing', 'CTA'],
      aiGenerated: false
    },
    {
      id: 'creative-portfolio',
      name: 'Creative Portfolio',
      category: 'portfolio',
      thumbnail: '/templates/creative-portfolio.png',
      description: 'Showcase your work beautifully',
      features: ['Gallery', 'About', 'Contact'],
      aiGenerated: false
    },
    {
      id: 'ecommerce-store',
      name: 'E-commerce Store',
      category: 'ecommerce',
      thumbnail: '/templates/ecommerce.png',
      description: 'Full-featured online store',
      features: ['Products', 'Cart', 'Checkout'],
      aiGenerated: false
    },
    {
      id: 'minimal-blog',
      name: 'Minimal Blog',
      category: 'blog',
      thumbnail: '/templates/minimal-blog.png',
      description: 'Focus on your content',
      features: ['Posts', 'Categories', 'Search'],
      aiGenerated: false
    },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const generateAITemplate = () => {
    alert('AI Template Generation coming soon! This will use GPT-4 to create custom templates based on your prompt.');
  };

  return (
    <div className="template-library p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette size={24} className="text-purple-600" />
            Template Library
          </h2>
          <p className="text-gray-600 mt-1">Start with a professional template</p>
        </div>
        
        <button
          onClick={generateAITemplate}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
        >
          <Wand2 size={18} />
          Generate with AI
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
            <span className="ml-2 text-xs opacity-75">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer group"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              {/* Placeholder for template thumbnail */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <Sparkles size={48} />
              </div>
              {template.aiGenerated && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">
                  AI Generated
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {template.features.map(feature => (
                  <span
                    key={feature}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              
              <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition">
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <RefreshCw size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600">No templates found in this category</p>
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary;