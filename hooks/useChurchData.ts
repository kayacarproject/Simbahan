import { useEffect } from 'react';
import { useChurchDataStore } from '../store/churchDataStore';

export function useChurchData() {
  const church  = useChurchDataStore((s) => s.church);
  const loading = useChurchDataStore((s) => s.loading);
  const fetched = useChurchDataStore((s) => s.fetched);
  const fetchChurch = useChurchDataStore((s) => s.fetchChurch);

  useEffect(() => {
    if (!fetched) fetchChurch();
  }, [fetched, fetchChurch]);

  return { church, loading };
}
