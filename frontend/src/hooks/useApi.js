import { useCallback, useState } from 'react';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const run = useCallback(async (fn, successMessage) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await fn();
      if (successMessage) setSuccess(successMessage);
      return result;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  return { loading, error, success, run, clearMessages, setError, setSuccess };
}
