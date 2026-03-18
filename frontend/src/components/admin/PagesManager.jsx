import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, Edit, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PagesManager = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/pages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPages(res.data.pages || []);
    } catch {
      // If API fails, show default pages
      setPages([
        { id: 'home', name: 'Home Page', updated_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId) => {
    if (pageId === 'home') {
      toast({ title: 'Cannot delete', description: 'The home page cannot be deleted.', variant: 'destructive' });
      return;
    }
    if (!window.confirm(`Delete page "${pageId}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/pages/${pageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: 'Page deleted' });
      fetchPages();
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{pages.length} page{pages.length !== 1 ? 's' : ''}</p>
        <Button
          onClick={() => window.location.href = '/admin/theme-builder'}
          className="gap-2 bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          <Plus className="w-4 h-4" /> New Page
        </Button>
      </div>

      {/* Pages list */}
      <div className="space-y-3">
        {pages.map((page) => (
          <Card key={page.id} className="bg-white/[0.03] border-white/[0.06] p-4 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{page.name || page.id}</h3>
                  <p className="text-xs text-gray-500">
                    /{page.id === 'home' ? '' : page.id}
                    {page.updated_at && (
                      <span className="ml-2">
                        Updated {new Date(page.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => window.open(page.id === 'home' ? '/' : `/${page.id}`, '_blank')}
                  title="View page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => window.location.href = '/admin/theme-builder'}
                  title="Edit page"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                {page.id !== 'home' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-400"
                    onClick={() => handleDelete(page.id)}
                    title="Delete page"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {pages.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No pages yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first page with the Theme Builder</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagesManager;
