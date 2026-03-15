/**
 * Batch Selection Hook
 * Provides batch selection functionality for lists
 */

import { useState, useCallback } from 'react';

export const useBatchSelection = (items, idKey = 'id') => {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleSelection = useCallback(
    (id) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    },
    []
  );

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((item) => item[idKey])));
  }, [items, idKey]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [selectedIds.size, items.length, selectAll, deselectAll]);

  const isSelected = useCallback(
    (id) => selectedIds.has(id),
    [selectedIds]
  );

  const isAllSelected = selectedIds.size === items.length && items.length > 0;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleAll,
    isSelected,
    isAllSelected,
    isSomeSelected,
  };
};

export default useBatchSelection;
