import React, { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

/**
 * Accessible confirmation dialog hook — replaces window.confirm().
 *
 * Usage:
 *   const { confirm, ConfirmDialog } = useConfirmDialog();
 *   const ok = await confirm('Delete this item?', 'This cannot be undone.');
 *   // Render <ConfirmDialog /> once in your component tree.
 */
export default function useConfirmDialog() {
  const [state, setState] = useState({ open: false, title: '', description: '', resolve: null });

  const confirm = useCallback((title, description = '') => {
    return new Promise((resolve) => {
      setState({ open: true, title, description, resolve });
    });
  }, []);

  const handleAction = useCallback(
    (result) => {
      if (state.resolve) state.resolve(result);
      setState((s) => ({ ...s, open: false }));
    },
    [state.resolve]
  );

  const ConfirmDialog = useCallback(
    () => (
      <AlertDialog open={state.open} onOpenChange={(open) => !open && handleAction(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state.title}</AlertDialogTitle>
            {state.description && (
              <AlertDialogDescription>{state.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleAction(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction(true)}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
    [state.open, state.title, state.description, handleAction]
  );

  return { confirm, ConfirmDialog };
}
