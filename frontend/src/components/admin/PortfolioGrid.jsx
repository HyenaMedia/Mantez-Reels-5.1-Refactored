import React, { useState } from 'react';
import { Plus, ImageIcon, CheckSquare, Square, X, Trash2, Edit } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CardSkeleton } from '../ui/skeleton';
import { DeleteConfirmDialog, BatchDeleteConfirmDialog } from '../ui/confirm-dialog';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const PortfolioGrid = ({ items, loading, onEdit, onRefresh }) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/portfolio/${id}`);
      toast({ title: 'Deleted!', description: 'Portfolio item has been deleted.' });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      onRefresh();
    } catch (error) {
      toast({ title: 'Delete failed', description: error.response?.data?.detail || 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleBatchDelete = async () => {
    try {
      await axios.post(`${API}/portfolio/bulk-delete`, { ids: Array.from(selectedItems) });
      toast({ title: 'Deleted!', description: `${selectedItems.size} portfolio items have been deleted.` });
      setSelectedItems(new Set());
      setSelectMode(false);
      setBatchDeleteDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast({ title: 'Batch delete failed', description: error.response?.data?.detail || 'Failed to delete items', variant: 'destructive' });
    }
  };

  const toggleItemSelection = (id) => {
    const next = new Set(selectedItems);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedItems(next);
  };

  const toggleSelectAll = () => {
    setSelectedItems(
      selectedItems.size === items.length ? new Set() : new Set(items.map(i => i.id))
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Portfolio Items</h2>
          {items.length > 0 && (
            <Button
              onClick={() => { setSelectMode(!selectMode); if (selectMode) setSelectedItems(new Set()); }}
              size="sm"
              variant="outline"
              className={`border-white/20 ${selectMode ? 'bg-purple-500/20 border-purple-500' : ''}`}
            >
              {selectMode ? <X size={14} className="mr-1" /> : <CheckSquare size={14} className="mr-1" />}
              {selectMode ? 'Cancel' : 'Select'}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {selectMode && selectedItems.size > 0 && (
            <Button onClick={() => setBatchDeleteDialogOpen(true)} className="bg-red-600 hover:bg-red-500" data-testid="batch-delete-btn">
              <Trash2 className="mr-2" size={16} />
              Delete ({selectedItems.size})
            </Button>
          )}
          <Button
            onClick={() => onEdit(null)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300 hover:scale-105"
            data-testid="new-portfolio-btn"
          >
            <Plus className="mr-2" size={16} />
            New Portfolio Item
          </Button>
        </div>
      </div>

      {selectMode && items.length > 0 && (
        <div className="mb-4 flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/10">
          <button onClick={toggleSelectAll} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
            {selectedItems.size === items.length
              ? <CheckSquare size={18} className="text-purple-400" />
              : <Square size={18} />}
            <span className="text-sm">{selectedItems.size === items.length ? 'Deselect All' : 'Select All'}</span>
          </button>
          <span className="text-gray-500 text-sm">{selectedItems.size} of {items.length} selected</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-400 py-12 glass rounded-3xl border border-white/10">
          <ImageIcon className="mx-auto mb-4 text-gray-600" size={48} />
          <p>No portfolio items yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className={`glass rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-xl group relative
                ${selectedItems.has(item.id) ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/10 hover:border-purple-500/40 hover:shadow-purple-500/20'}
                ${!selectMode ? 'hover:scale-105' : ''}`}
              data-testid={`portfolio-item-${item.id}`}
            >
              {selectMode && (
                <button
                  onClick={() => toggleItemSelection(item.id)}
                  className="absolute top-3 left-3 z-10 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-black/70"
                >
                  {selectedItems.has(item.id)
                    ? <CheckSquare size={18} className="text-purple-400" />
                    : <Square size={18} className="text-gray-400" />}
                </button>
              )}
              {item.thumbnail_urls && (
                <div className="relative overflow-hidden">
                  <img
                    src={`${BACKEND_URL}${item.thumbnail_urls.medium.webp}`}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-bold">{item.title}</h3>
                  <div className="flex gap-1">
                    {item.featured && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 shadow-lg shadow-yellow-500/30">Featured</Badge>
                    )}
                    {item.published
                      ? <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 border-0 shadow-lg shadow-green-500/30">Published</Badge>
                      : <Badge variant="secondary" className="glass border-white/20">Draft</Badge>}
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-2">{item.category}</p>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onEdit(item)}
                    size="sm" variant="outline"
                    className="border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
                    data-testid={`edit-portfolio-${item.id}`}
                  >
                    <Edit size={14} className="mr-1" />Edit
                  </Button>
                  <Button
                    onClick={() => { setDeleteTarget(item); setDeleteDialogOpen(true); }}
                    size="sm" variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 transition-all"
                    data-testid={`delete-portfolio-${item.id}`}
                  >
                    <Trash2 size={14} className="mr-1" />Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        itemName={deleteTarget?.title || 'this item'}
      />
      <BatchDeleteConfirmDialog
        open={batchDeleteDialogOpen}
        onOpenChange={setBatchDeleteDialogOpen}
        onConfirm={handleBatchDelete}
        count={selectedItems.size}
      />
    </div>
  );
};

export default PortfolioGrid;
