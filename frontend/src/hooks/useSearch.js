/**
 * Search Utility Hook
 * Provides search functionality for any list/array
 */

import { useState, useMemo } from 'react';

export const useSearch = (items, searchKeys) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();

    return items.filter((item) => {
      return searchKeys.some((key) => {
        const value = key.split('.').reduce((obj, k) => obj?.[k], item);
        return value?.toString().toLowerCase().includes(query);
      });
    });
  }, [items, searchQuery, searchKeys]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    resultCount: filteredItems.length,
    totalCount: items.length,
  };
};

export default useSearch;
