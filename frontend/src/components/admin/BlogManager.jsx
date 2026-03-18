import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, Trash2, Save, Loader2, Calendar, Tag } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const BlogManager = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/content/blog`);
      setPosts(res.data.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const savePosts = async (updatedPosts) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BACKEND_URL}/api/content/blog`, updatedPosts, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: 'Blog posts saved' });
      setEditingIndex(null);
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addPost = () => {
    const newPost = {
      title: '',
      excerpt: '',
      thumbnail: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
    };
    setPosts([newPost, ...posts]);
    setEditingIndex(0);
  };

  const updatePost = (index, field, value) => {
    const updated = [...posts];
    updated[index] = { ...updated[index], [field]: value };
    setPosts(updated);
  };

  const deletePost = (index) => {
    if (!window.confirm('Delete this post?')) return;
    const updated = posts.filter((_, i) => i !== index);
    setPosts(updated);
    savePosts(updated);
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
        <p className="text-sm text-gray-400">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          {editingIndex !== null && (
            <Button onClick={() => savePosts(posts)} disabled={saving} className="gap-2 bg-green-600 hover:bg-green-700" size="sm">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All'}
            </Button>
          )}
          <Button onClick={addPost} className="gap-2 bg-purple-600 hover:bg-purple-700" size="sm">
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </div>
      </div>

      {/* Posts list */}
      <div className="space-y-3">
        {posts.map((post, i) => (
          <Card key={i} className="bg-white/[0.03] border-white/[0.06] overflow-hidden">
            {editingIndex === i ? (
              /* ── Edit mode ── */
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Title</Label>
                    <Input value={post.title} onChange={(e) => updatePost(i, 'title', e.target.value)}
                      className="bg-white/[0.04] border-white/[0.08] text-white mt-1" placeholder="Post title..." />
                  </div>
                  <div>
                    <Label className="text-gray-300">Category</Label>
                    <Input value={post.category} onChange={(e) => updatePost(i, 'category', e.target.value)}
                      className="bg-white/[0.04] border-white/[0.08] text-white mt-1" placeholder="Tutorial, Tips..." />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Excerpt</Label>
                  <Input value={post.excerpt} onChange={(e) => updatePost(i, 'excerpt', e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white mt-1" placeholder="Short description..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Thumbnail URL</Label>
                    <Input value={post.thumbnail} onChange={(e) => updatePost(i, 'thumbnail', e.target.value)}
                      className="bg-white/[0.04] border-white/[0.08] text-white mt-1" placeholder="https://..." />
                  </div>
                  <div>
                    <Label className="text-gray-300">Date</Label>
                    <Input type="date" value={post.date} onChange={(e) => updatePost(i, 'date', e.target.value)}
                      className="bg-white/[0.04] border-white/[0.08] text-white mt-1" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => savePosts(posts)} disabled={saving} size="sm" className="bg-green-600 hover:bg-green-700 gap-1">
                    <Save className="w-3.5 h-3.5" /> Save
                  </Button>
                  <Button onClick={() => setEditingIndex(null)} variant="ghost" size="sm" className="text-gray-400">Cancel</Button>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {post.thumbnail ? (
                    <img src={post.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{post.title || 'Untitled Post'}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      {post.category && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Tag className="w-3 h-3" /> {post.category}
                        </span>
                      )}
                      {post.date && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" /> {post.date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => setEditingIndex(i)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400" onClick={() => deletePost(i)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No blog posts yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first post to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManager;
