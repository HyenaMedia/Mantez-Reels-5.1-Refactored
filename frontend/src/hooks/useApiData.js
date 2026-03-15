import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Hook for fetching API data with automatic AbortController management.
 *
 * @param {string|null} url - API endpoint (e.g. '/api/content/hero'). Pass null to skip.
 * @param {object} [options]
 * @param {Array}  [options.deps=[]]       - Extra dependencies that trigger a refetch.
 * @param {object} [options.params]        - Query params forwarded to axios.
 * @param {Function} [options.transform]   - Transform response.data before storing.
 * @param {*}      [options.initialData=null] - Value used while loading.
 * @param {boolean} [options.auth=false]   - Attach Authorization header.
 * @returns {{ data, loading, error, refetch }}
 */
export default function useApiData(url, options = {}) {
  const {
    deps = [],
    params,
    transform,
    initialData = null,
    auth = false,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    // Abort any in-flight request
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const headers = {};
      if (auth) {
        const token = localStorage.getItem('token');
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      const response = await api.get(url, {
        signal: controller.signal,
        params,
        headers,
      });
      const result = transform ? transform(response.data) : response.data;
      setData(result);
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') return;
      setError(err);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, auth, JSON.stringify(params), ...deps]);

  useEffect(() => {
    fetchData();
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
