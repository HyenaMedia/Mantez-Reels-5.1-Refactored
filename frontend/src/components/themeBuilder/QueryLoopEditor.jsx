import React, { useState, useEffect } from 'react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { RefreshCw, Filter } from 'lucide-react';
import axios from 'axios';

/**
 * QueryLoopEditor - Weeks 7-8 Implementation
 * Configure dynamic content display
 */
const QueryLoopEditor = ({ element, updateElement }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState([]);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  const query = element.query || {
    postType: 'blog',
    filters: { category: '', limit: 6 },
    sort: { field: 'publishedAt', order: 'desc' }
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadCategoriesInit = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BACKEND_URL}/api/content/categories`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { content_type: query.postType },
          signal: controller.signal,
        });
        setCategories(response.data.categories || []);
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to load categories:', error);
      }
    };
    const loadPreviewInit = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.post(`${BACKEND_URL}/api/content/query`, query, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        setPreview(response.data.items || []);
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to load preview:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategoriesInit();
    loadPreviewInit();
    return () => controller.abort();
  }, []);

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/content/categories`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { content_type: query.postType }
      });
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadPreview = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BACKEND_URL}/api/content/query`, query, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreview(response.data.items || []);
    } catch (error) {
      console.error('Failed to load preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (field, value) => {
    const newQuery = { ...query };
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newQuery[parent] = { ...newQuery[parent], [child]: value };
    } else {
      newQuery[field] = value;
    }
    updateElement(element.id, { query: newQuery });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Query Loop Settings</h4>
        <Button size="sm" variant="outline" onClick={loadPreview} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Post Type</Label>
          <select
            value={query.postType}
            onChange={(e) => handleQueryChange('postType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
          >
            <option value="blog">Blog Posts</option>
            <option value="portfolio">Portfolio</option>
            <option value="product">Products</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Category Filter</Label>
          <select
            value={query.filters.category || ''}
            onChange={(e) => handleQueryChange('filters.category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Items to Display</Label>
          <Input
            type="number"
            value={query.filters.limit || 6}
            onChange={(e) => handleQueryChange('filters.limit', parseInt(e.target.value))}
            min="1"
            max="50"
          />
        </div>

        <div className="space-y-2">
          <Label>Sort By</Label>
          <select
            value={query.sort.field}
            onChange={(e) => handleQueryChange('sort.field', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
          >
            <option value="publishedAt">Date Published</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Order</Label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={query.sort.order === 'desc' ? 'default' : 'outline'}
              onClick={() => handleQueryChange('sort.order', 'desc')}
              className="flex-1"
            >
              Newest First
            </Button>
            <Button
              size="sm"
              variant={query.sort.order === 'asc' ? 'default' : 'outline'}
              onClick={() => handleQueryChange('sort.order', 'asc')}
              className="flex-1"
            >
              Oldest First
            </Button>
          </div>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Preview: {preview.length} items found
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {preview.map((item, i) => (
              <div key={i} className="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded">
                {item.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryLoopEditor;
