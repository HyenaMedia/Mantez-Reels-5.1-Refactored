import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';
import { AlertTriangle, Trash2, Info, CheckCircle } from 'lucide-react';

/**
 * Confirmation Dialog Component
 * Provides consistent confirmation dialogs across the app
 */

export const ConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default', // 'default', 'destructive', 'warning', 'success'
  icon,
}) => {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'destructive':
        return <Trash2 className="text-red-500" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={24} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={24} />;
      default:
        return <Info className="text-blue-500" size={24} />;
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-600 hover:bg-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-500';
      default:
        return 'bg-blue-600 hover:bg-blue-500';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-black border-white/10">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 hover:bg-white/5">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={getButtonClass()}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Pre-configured dialogs
export const DeleteConfirmDialog = ({ open, onOpenChange, onConfirm, itemName }) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    onConfirm={onConfirm}
    title="Delete Item"
    description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
    confirmText="Delete"
    variant="destructive"
  />
);

export const BatchDeleteConfirmDialog = ({ open, onOpenChange, onConfirm, count }) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    onConfirm={onConfirm}
    title="Delete Multiple Items"
    description={`Are you sure you want to delete ${count} items? This action cannot be undone.`}
    confirmText={`Delete ${count} Items`}
    variant="destructive"
  />
);

export const PublishConfirmDialog = ({ open, onOpenChange, onConfirm, itemName }) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    onConfirm={onConfirm}
    title="Publish Item"
    description={`Are you sure you want to publish "${itemName}"? It will be visible to all visitors.`}
    confirmText="Publish"
    variant="success"
  />
);

export const UnpublishConfirmDialog = ({ open, onOpenChange, onConfirm, itemName }) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    onConfirm={onConfirm}
    title="Unpublish Item"
    description={`Are you sure you want to unpublish "${itemName}"? It will no longer be visible to visitors.`}
    confirmText="Unpublish"
    variant="warning"
  />
);

export default ConfirmDialog;
