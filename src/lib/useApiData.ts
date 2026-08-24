import { useCallback, useEffect, useState, type DependencyList } from 'react';
import { ApiError } from './api';

interface UseApiDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

// Standardizes the loading/error/data triad every dashboard tab already
// reimplements by hand (fetchTeamData, fetchFinanceData, etc.). Skip this and
// call the fetcher directly for tabs that need bespoke orchestration (e.g. a
// multi-endpoint Promise.all with per-endpoint loading states).
export function useApiData<T>(fetcher: () => Promise<T>, deps: DependencyList): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetcher());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
