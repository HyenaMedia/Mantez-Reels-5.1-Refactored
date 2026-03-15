import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import MediaUploader from './MediaUploader';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const PortfolioEditor = ({ item = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    category: item?.category || '',
    slug: item?.slug || '',
    thumbnail_id: item?.thumbnail_id || '',
    video_url: item?.video_url || '',
    description: item?.description || '',
    client: item?.client || '',
    year: item?.year || new Date().getFullYear().toString(),
    featured: item?.featured || false,
    published: item?.published !== undefined ? item.published : true,
  });
  const [thumbnailInfo, setThumbnailInfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Auto-generate slug from title
    if (name === 'title' && !item) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleThumbnailUpload = (uploadResult) => {
    setFormData({
      ...formData,
      thumbnail_id: uploadResult.file_id,
    });
    setThumbnailInfo(uploadResult);

    toast({
      title: 'Thumbnail uploaded!',
      description: 'Your image has been optimized in multiple formats.',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.thumbnail_id) {
      toast({
        title: 'Missing thumbnail',
        description: 'Please upload a thumbnail image.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const endpoint = item ? `/portfolio/${item.id}` : '/portfolio/create';
      const method = item ? 'put' : 'post';

      const response = await axios[method](`${API}${endpoint}`, formData);

      if (response.data.success) {
        toast({
          title: item ? 'Portfolio updated!' : 'Portfolio created!',
          description: 'Your portfolio item has been saved successfully.',
        });

        if (onSave) {
          onSave(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to save portfolio item:', error);
      toast({
        title: 'Save failed',
        description: error.response?.data?.detail || 'Failed to save portfolio item',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{item ? 'Edit' : 'New'} Portfolio Item</h2>
        {onCancel && (
          <Button onClick={onCancel} variant="ghost" size="icon">
            <X className="text-white" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thumbnail Upload */}
        <div>
          <Label className="text-white mb-2 block">Thumbnail Image *</Label>
          {formData.thumbnail_id && thumbnailInfo ? (
            <div className="mb-4">
              <img
                src={`${BACKEND_URL}${thumbnailInfo.optimized.sizes.medium.webp}`}
                alt="Thumbnail"
                className="w-full rounded-lg max-h-48 object-cover mb-2"
              />
              <Badge className="bg-green-600">
                Optimized - Saved {thumbnailInfo.optimized.sizes.medium.compression_ratio}
              </Badge>
            </div>
          ) : (
            <MediaUploader onUploadComplete={handleThumbnailUpload} type="image" />
          )}
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-white">
            Title *
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="My Trip to Skopelos"
          />
        </div>

        {/* Category & Slug */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category" className="text-white">
              Category *
            </Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="bg-white/[0.04] border-white/[0.08] text-white"
              placeholder="Travel"
            />
          </div>
          <div>
            <Label htmlFor="slug" className="text-white">
              Slug *
            </Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="bg-white/[0.04] border-white/[0.08] text-white"
              placeholder="my-trip-to-skopelos"
            />
          </div>
        </div>

        {/* Video URL */}
        <div>
          <Label htmlFor="video_url" className="text-white">
            Video URL
          </Label>
          <Input
            id="video_url"
            name="video_url"
            value={formData.video_url}
            onChange={handleChange}
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="https://www.youtube.com/embed/..."
          />
          <p className="text-gray-400 text-sm mt-1">YouTube, Vimeo, or local video file ID</p>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-white">
            Description *
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="bg-white/[0.04] border-white/[0.08] text-white"
            placeholder="A cinematic journey through..."
          />
        </div>

        {/* Client & Year */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client" className="text-white">
              Client *
            </Label>
            <Input
              id="client"
              name="client"
              value={formData.client}
              onChange={handleChange}
              required
              className="bg-white/[0.04] border-white/[0.08] text-white"
              placeholder="Personal Project"
            />
          </div>
          <div>
            <Label htmlFor="year" className="text-white">
              Year *
            </Label>
            <Input
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="bg-white/[0.04] border-white/[0.08] text-white"
              placeholder="2024"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="text-white">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="text-white">Published</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save className="mr-2" size={16} />
                {item ? 'Update' : 'Create'} Portfolio
              </>
            )}
          </Button>
          {onCancel && (
            <Button type="button" onClick={onCancel} variant="outline" className="border-gray-700">
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PortfolioEditor;
