import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Film, Search, Trash2, HardDrive, Cloud, Layers, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import MediaUploader from './MediaUploader';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const StorageBadge = ({ type }) => {
  const configs = {
    local: { label: 'Local', icon: HardDrive, color: 'text-gray-400 bg-gray-500/20 border-gray-500/30' },
    r2: { label: 'R2', icon: Cloud, color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
    both: { label: 'Both', icon: Layers, color: 'text-green-400 bg-green-500/20 border-green-500/30' },
  };
  const cfg = configs[type] || configs.local;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-medium ${cfg.color}`}>
      <Icon size={10} />{cfg.label}
    </span>
  );
};

const MediaLibrary = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaFilter, setMediaFilter] = useState('all');
  const [migratingId, setMigratingId] = useState(null);
  const [storageMenuOpen, setStorageMenuOpen] = useState(null);
  const { toast } = useToast();

  const filteredMedia = mediaItems.filter(media => {
    const matchesSearch = !mediaSearch || (media.filename || '').toLowerCase().includes(mediaSearch.toLowerCase());
    const matchesFilter = mediaFilter === 'all' || media.file_type === mediaFilter;
    return matchesSearch && matchesFilter;
  });

  const loadMedia = async (signal) => {
    setLoading(true);
    try {
      const config = signal ? { signal } : {};
      const response = await axios.get(`${API}/media/list`, config);
      setMediaItems(response.data.media || []);
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
      toast({ title: 'Error loading media', description: error.response?.data?.detail || 'Failed to load', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadMedia(controller.signal);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!storageMenuOpen) return;
    const handler = () => setStorageMenuOpen(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [storageMenuOpen]);

  const handleMigrateStorage = async (fileId, target) => {
    setMigratingId(fileId);
    setStorageMenuOpen(null);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/media/${fileId}/storage`, { target }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: 'Storage updated', description: `File moved to ${target === 'both' ? 'Local + R2' : target === 'r2' ? 'Cloudflare R2' : 'Local disk'}.` });
      loadMedia();
    } catch (error) {
      toast({ title: 'Migration failed', description: error.response?.data?.detail || 'Could not migrate storage', variant: 'destructive' });
    } finally {
      setMigratingId(null);
    }
  };

  const handleDeleteMedia = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this media file?')) return;
    try {
      await axios.delete(`${API}/media/${fileId}`);
      toast({ title: 'Deleted!', description: 'Media file has been deleted.' });
      loadMedia();
    } catch (error) {
      toast({ title: 'Delete failed', description: error.response?.data?.detail || 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div>
      <MediaUploader onUploadSuccess={loadMedia} />

      <div className="mt-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search media files..."
            aria-label="Search media files"
            value={mediaSearch}
            onChange={(e) => setMediaSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            data-testid="media-search-input"
          />
        </div>
        <select
          value={mediaFilter}
          onChange={(e) => setMediaFilter(e.target.value)}
          aria-label="Filter media by type"
          className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 [&>option]:bg-gray-900 [&>option]:text-white"
          data-testid="media-filter-select"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
        <span className="text-gray-500 text-sm whitespace-nowrap">
          {filteredMedia.length} file{filteredMedia.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center text-gray-400 py-12 mt-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02]">
          <ImageIcon className="mx-auto mb-4 text-gray-600" size={48} />
          <p>{mediaSearch || mediaFilter !== 'all' ? 'No matching files found' : 'No media files yet. Upload your first one!'}</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" role="grid" aria-label="Media library files">
          {filteredMedia.map((media) => {
            const storageType = media.storage_type || 'local';
            const isMigrating = migratingId === media.id;
            const isMenuOpen = storageMenuOpen === media.id;
            const storageOptions = [
              { target: 'local', label: 'Local only', icon: HardDrive },
              { target: 'r2', label: 'Cloudflare R2', icon: Cloud },
              { target: 'both', label: 'Both (Local + R2)', icon: Layers },
            ].filter(o => o.target !== storageType);

            return (
              <div
                key={media.id}
                data-testid={`media-card-${media.id}`}
                role="gridcell"
                tabIndex={0}
                aria-label={`${media.filename}, ${media.file_type}, ${(media.file_size / 1024).toFixed(1)} KB`}
                onKeyDown={(e) => {
                  if (e.key === 'Delete') {
                    e.preventDefault();
                    handleDeleteMedia(media.id);
                  }
                }}
                className="rounded-3xl overflow-hidden border border-white/10 hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 group bg-gradient-to-br from-white/[0.08] to-white/[0.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                {media.file_type === 'video' ? (
                  <div className="relative aspect-video bg-gradient-to-br from-white/[0.04] to-white/[0.01] flex items-center justify-center">
                    <Film className="text-gray-600 group-hover:text-purple-400 transition-colors" size={32} />
                  </div>
                ) : (
                  <div className="relative overflow-hidden">
                    <img
                      src={media.urls?.thumbnail?.webp
                        ? (media.urls.thumbnail.webp.startsWith('http') ? media.urls.thumbnail.webp : `${BACKEND_URL}${media.urls.thumbnail.webp}`)
                        : ''}
                      alt={media.filename}
                      className="w-full aspect-video object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <p className="text-white text-sm truncate font-medium">{media.filename}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-xs">{(media.file_size / 1024).toFixed(1)} KB</p>
                    <StorageBadge type={storageType} />
                  </div>

                  <div className="relative">
                    <button
                      data-testid={`storage-menu-btn-${media.id}`}
                      onClick={(e) => { e.stopPropagation(); setStorageMenuOpen(isMenuOpen ? null : media.id); }}
                      disabled={isMigrating}
                      aria-label={`Manage storage for ${media.filename}`}
                      aria-expanded={isMenuOpen}
                      aria-haspopup="menu"
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-400 text-xs hover:border-blue-500/40 hover:text-blue-400 transition-all disabled:opacity-50"
                    >
                      {isMigrating
                        ? <><Loader2 size={12} className="animate-spin mr-1" />Migrating...</>
                        : <><Cloud size={12} className="mr-1" />Manage Storage<ChevronDown size={12} className="ml-auto" /></>}
                    </button>
                    {isMenuOpen && (
                      <div
                        role="menu"
                        aria-label="Storage options"
                        className="absolute bottom-full mb-1 left-0 right-0 z-50 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {storageOptions.map((opt) => {
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.target}
                              role="menuitem"
                              data-testid={`migrate-to-${opt.target}-${media.id}`}
                              onClick={() => handleMigrateStorage(media.id, opt.target)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                            >
                              <Icon size={12} />Move to {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleDeleteMedia(media.id)}
                    size="sm" variant="ghost"
                    data-testid={`delete-media-btn-${media.id}`}
                    className="w-full text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                  >
                    <Trash2 size={14} className="mr-1" />Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
