import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, Trash2, Save, Loader2, Calendar, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const BlogManager = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/content/blog`);
      setPosts(res.data.posts || []);
    } catch { setPosts([]); }
    finally { setLoading(false); }
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
    } catch { toast({ title: 'Failed to save', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const addPost = () => {
    const newPost = {
      title: '', excerpt: '', body: '', thumbnail: '',
      date: new Date().toISOString().split('T')[0], category: '',
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

  /* ── Full editor view for a single post ── */
  if (editingIndex !== null) {
    const post = posts[editingIndex];
    if (!post) { setEditingIndex(null); return null; }

    return (
      <div className="space-y-6">
        {/* Editor header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setEditingIndex(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to posts
          </button>
          <div className="flex gap-2">
            <Button onClick={() => setEditingIndex(null)} variant="ghost" size="sm" className="text-gray-400">Discard</Button>
            <Button onClick={() => savePosts(posts)} disabled={saving} size="sm" className="bg-purple-600 hover:bg-purple-700 gap-1">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Post'}
            </Button>
          </div>
        </div>

        {/* Title — large input */}
        <Input
          value={post.title}
          onChange={(e) => updatePost(editingIndex, 'title', e.target.value)}
          className="bg-transparent border-none text-2xl font-bold text-white placeholder-gray-600 px-0 focus-visible:ring-0"
          placeholder="Post title..."
        />

        {/* Meta fields row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-gray-400 text-xs">Category</Label>
            <Input value={post.category || ''} onChange={(e) => updatePost(editingIndex, 'category', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white mt-1" placeholder="Tutorial, Tips..." />
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Date</Label>
            <Input type="date" value={post.date || ''} onChange={(e) => updatePost(editingIndex, 'date', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white mt-1" />
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Thumbnail URL</Label>
            <Input value={post.thumbnail || ''} onChange={(e) => updatePost(editingIndex, 'thumbnail', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white mt-1" placeholder="https://..." />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <Label className="text-gray-400 text-xs">Excerpt <span className="text-gray-600">(shown in post listings)</span></Label>
          <Textarea
            value={post.excerpt || ''}
            onChange={(e) => updatePost(editingIndex, 'excerpt', e.target.value)}
            className="bg-white/[0.04] border-white/[0.08] text-white mt-1 min-h-[80px]"
            placeholder="A short summary of the post..."
          />
        </div>

        {/* Body — the actual post content */}
        <div>
          <Label className="text-gray-400 text-xs">Body <span className="text-gray-600">(full post content — supports Markdown)</span></Label>
          <Textarea
            value={post.body || ''}
            onChange={(e) => updatePost(editingIndex, 'body', e.target.value)}
            className="bg-white/[0.04] border-white/[0.08] text-white mt-1 min-h-[300px] font-mono text-sm leading-relaxed"
            placeholder="Write your post content here...&#10;&#10;You can use **Markdown** for formatting:&#10;- **bold** text&#10;- *italic* text&#10;- ## headings&#10;- [links](url)&#10;- bullet lists"
          />
        </div>

        {/* Thumbnail preview */}
        {post.thumbnail && (
          <div>
            <Label className="text-gray-400 text-xs">Preview</Label>
            <img src={post.thumbnail} alt="Thumbnail" className="mt-1 w-48 h-32 object-cover rounded-lg border border-white/[0.06]" />
          </div>
        )}
      </div>
    );
  }

  /* ── Posts list view ── */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        <Button onClick={addPost} className="gap-2 bg-purple-600 hover:bg-purple-700" size="sm">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      <div className="space-y-2">
        {posts.map((post, i) => (
          <Card key={i} className="bg-white/[0.03] border-white/[0.06] p-4 hover:bg-white/[0.05] transition-colors cursor-pointer"
            onClick={() => setEditingIndex(i)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {post.thumbnail ? (
                  <img src={post.thumbnail} alt="" className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{post.title || 'Untitled Post'}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    {post.category && (
                      <span className="flex items-center gap-1 text-xs text-gray-500"><Tag className="w-3 h-3" /> {post.category}</span>
                    )}
                    {post.date && (
                      <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar className="w-3 h-3" /> {post.date}</span>
                    )}
                    {post.body && (
                      <span className="text-xs text-gray-600">{post.body.length} chars</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => setEditingIndex(i)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400" onClick={() => deletePost(i)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
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
