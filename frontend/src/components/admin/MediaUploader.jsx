import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Film, HardDrive, Cloud, Layers } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const STORAGE_OPTIONS = [
  { value: 'local', label: 'Local', icon: HardDrive, description: 'Server disk' },
  { value: 'r2', label: 'R2 only', icon: Cloud, description: 'Cloudflare R2' },
  { value: 'both', label: 'Both', icon: Layers, description: 'Local + R2' },
];

const MediaUploader = ({ onUploadComplete, onUploadSuccess, accept = 'image/*', type = 'image' }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [r2Enabled, setR2Enabled] = useState(false);
  const [defaultStorage, setDefaultStorage] = useState('local');
  const [selectedStorage, setSelectedStorage] = useState(null); // null = use global default
  const { toast } = useToast();

  // Load cloud storage settings to know if R2 is enabled
  useEffect(() => {
    const fetchStorageSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = token ? `${BACKEND_URL}/api/settings/admin` : `${BACKEND_URL}/api/settings/`;
        const res = await axios.get(endpoint, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
        const cloud = res.data?.cloudStorage;
        if (cloud?.enabled) {
          setR2Enabled(true);
          setDefaultStorage(cloud.defaultStorage || 'local');
        }
      } catch (e) { console.error('Failed to fetch storage settings:', e); }
    };
    fetchStorageSettings();
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      // Pass storage target as a form field if user overrode the global default
      const storageOverride = selectedStorage && selectedStorage !== defaultStorage ? selectedStorage : null;
      if (storageOverride) {
        formData.append('storage_target', storageOverride);
      }
      const endpoint = type === 'video' ? '/media/upload-video' : '/media/upload-image';

      const response = await axios.post(`${API}${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (pe) => setProgress(Math.round((pe.loaded * 100) / pe.total)),
      });

      if (response.data.success) {
        const storageLabel = response.data.storage_type === 'both' ? 'Local + R2' : response.data.storage_type === 'r2' ? 'Cloudflare R2' : 'Local disk';
        toast({ title: 'Upload successful!', description: `Stored in ${storageLabel}.` });
        if (onUploadComplete) onUploadComplete(response.data);
        if (onUploadSuccess) onUploadSuccess(response.data);
        setFile(null);
        setPreview(null);
        setProgress(0);
        setSelectedStorage(null);
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.response?.data?.detail || 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setSelectedStorage(null);
  };

  const effectiveStorage = selectedStorage || defaultStorage;

  return (
    <div className="w-full">
      {!preview ? (
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            data-testid="file-upload-input"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              {type === 'video' ? <Film className="w-12 h-12 text-gray-500" /> : <ImageIcon className="w-12 h-12 text-gray-500" />}
              <div>
                <p className="text-white font-semibold mb-2">Click to upload {type === 'video' ? 'video' : 'image'}</p>
                <p className="text-gray-400 text-sm">
                  {type === 'video' ? 'MP4, MOV, AVI (max 100MB)' : 'JPG, PNG, WEBP, GIF (max 10MB)'}
                </p>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="bg-gray-900/80 rounded-xl p-6">
          {/* Preview */}
          <div className="mb-4">
            {type === 'video' ? (
              <video src={preview} className="w-full rounded-lg max-h-64 object-cover" controls />
            ) : (
              <img src={preview} alt="Preview" className="w-full rounded-lg max-h-64 object-cover" />
            )}
          </div>

          {/* File info */}
          <div className="mb-4">
            <p className="text-white font-semibold">{file.name}</p>
            <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>

          {/* Storage target — only shown when R2 is enabled */}
          {r2Enabled && (
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-2 font-medium">Save to:</p>
              <div className="flex gap-2">
                {STORAGE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = effectiveStorage === opt.value;
                  return (
                    <button
                      key={opt.value}
                      data-testid={`upload-storage-${opt.value}`}
                      onClick={() => setSelectedStorage(opt.value === defaultStorage ? null : opt.value)}
                      className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                        isActive
                          ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                          : 'border-white/10 bg-white/[0.02] text-gray-500 hover:border-white/20'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="font-medium">{opt.label}</span>
                      <span className="opacity-60">{opt.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress bar */}
          {uploading && (
            <div className="mb-4">
              <div className="w-full bg-gray-900/80 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-gray-400 text-sm mt-2">Uploading and optimizing... {progress}%</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              data-testid="upload-submit-btn"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {uploading ? (
                <><Loader2 className="mr-2 animate-spin" size={16} />Uploading...</>
              ) : (
                <><Upload className="mr-2" size={16} />Upload</>
              )}
            </Button>
            <Button onClick={handleCancel} disabled={uploading} variant="outline" className="border-gray-700">
              <X size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
