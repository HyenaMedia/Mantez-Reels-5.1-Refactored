import { useState, useCallback } from 'react';

/**
 * Hook for reading/writing a value to localStorage with JSON serialization.
 *
 * @param {string} key          - localStorage key.
 * @param {*}      initialValue - Default value when key is absent.
 * @returns {[value, setValue]}
 */
export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      try {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (err) {
        console.error(`Failed to save "${key}" to localStorage:`, err);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
