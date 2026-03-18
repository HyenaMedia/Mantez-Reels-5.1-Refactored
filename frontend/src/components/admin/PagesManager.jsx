import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, Edit, Trash2, ExternalLink, Loader2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PagesManager = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/pages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPages(res.data.pages || []);
    } catch {
      setPages([{ id: 'home', name: 'Home Page', updated_at: new Date().toISOString() }]);
    } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!newPageName.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    const slug = newPageSlug.trim() || newPageName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BACKEND_URL}/api/pages/${slug}`, {
        page: {
          meta: { name: newPageName.trim() },
          sections: [],
        }
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: 'Page created', description: `/${slug}` });
      setShowCreate(false);
      setNewPageName('');
      setNewPageSlug('');
      fetchPages();
    } catch {
      toast({ title: 'Failed to create page', variant: 'destructive' });
    } finally { setCreating(false); }
  };

  const handleDelete = async (pageId) => {
    if (pageId === 'home') {
      toast({ title: 'Cannot delete', description: 'The home page cannot be deleted.', variant: 'destructive' });
      return;
    }
    if (!window.confirm(`Delete page "${pageId}"? This cannot be undone.`)) return;
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

  // Auto-generate slug from name
  const handleNameChange = (name) => {
    setNewPageName(name);
    if (!newPageSlug || newPageSlug === newPageName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) {
      setNewPageSlug(name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
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
        <Button onClick={() => setShowCreate(true)} className="gap-2 bg-purple-600 hover:bg-purple-700" size="sm">
          <Plus className="w-4 h-4" /> New Page
        </Button>
      </div>

      {/* Create page form */}
      {showCreate && (
        <Card className="bg-white/[0.04] border-purple-500/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Create New Page</h3>
            <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-gray-400 text-xs">Page Name</Label>
              <Input
                value={newPageName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white mt-1"
                placeholder="About Us, Services, Contact..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div>
              <Label className="text-gray-400 text-xs">URL Slug</Label>
              <div className="flex items-center mt-1">
                <span className="text-gray-500 text-sm mr-1">/</span>
                <Input
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="bg-white/[0.04] border-white/[0.08] text-white"
                  placeholder="about-us"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating} size="sm" className="bg-purple-600 hover:bg-purple-700 gap-1">
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {creating ? 'Creating...' : 'Create Page'}
            </Button>
            <Button onClick={() => setShowCreate(false)} variant="ghost" size="sm" className="text-gray-400">Cancel</Button>
          </div>
        </Card>
      )}

      {/* Pages list */}
      <div className="space-y-2">
        {pages.map((page) => (
          <Card key={page.id} className="bg-white/[0.03] border-white/[0.06] p-4 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${page.id === 'home' ? 'bg-green-600/20' : 'bg-purple-600/20'}`}>
                  <FileText className={`w-5 h-5 ${page.id === 'home' ? 'text-green-400' : 'text-purple-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-white">{page.name || page.id}</h3>
                    {page.id === 'home' && (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded font-semibold">Home</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    /{page.id === 'home' ? '' : page.id}
                    {page.updated_at && (
                      <span className="ml-2">· Updated {new Date(page.updated_at).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white"
                  onClick={() => window.open(page.id === 'home' ? '/' : `/${page.id}`, '_blank')} title="View page">
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white"
                  onClick={() => window.location.href = '/admin/theme-builder'} title="Edit in builder">
                  <Edit className="w-4 h-4" />
                </Button>
                {page.id !== 'home' && (
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400"
                    onClick={() => handleDelete(page.id)} title="Delete page">
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
            <p className="text-sm text-gray-500 mt-1">Create your first page to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagesManager;
