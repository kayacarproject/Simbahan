import { useState, useEffect } from 'react';
import { USE_API } from '../constants/config';
import { apiFetch } from '../services/api';

type State<T> = { data: T | null; loading: boolean; error: string | null };

export function useData<T>(endpoint: string, staticData: T): State<T> {
  const [state, setState] = useState<State<T>>({
    data: USE_API ? null : staticData,
    loading: USE_API,
    error: null,
  });

  useEffect(() => {
    if (!USE_API) return;
    apiFetch<T>(endpoint)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => setState({ data: null, loading: false, error: e.message }));
  }, [endpoint]);

  return state;
}
