import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

/**
 * Hook for executing async operations with loading state and toast feedback.
 *
 * @param {Function} asyncFn       - Async function to execute. Receives any args passed to execute().
 * @param {object}   [options]
 * @param {string}   [options.successMsg] - Toast message on success.
 * @param {string}   [options.errorMsg]   - Fallback toast message on error.
 * @param {Function} [options.onSuccess]  - Callback after success (receives result).
 * @param {Function} [options.onError]    - Callback after error (receives error).
 * @returns {{ execute, loading }}
 */
export default function useAsyncAction(asyncFn, options = {}) {
  const { successMsg, errorMsg = 'Operation failed', onSuccess, onError } = options;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      try {
        const result = await asyncFn(...args);
        if (successMsg) {
          toast({ title: successMsg });
        }
        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        const detail = err.response?.data?.detail || err.message || errorMsg;
        toast({ title: detail, variant: 'destructive' });
        if (onError) onError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asyncFn, successMsg, errorMsg]
  );

  return { execute, loading };
}
