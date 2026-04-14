import { useMemo } from 'react';
import { useData } from './useData';
import staticData from '../data/announcements.json';

type Announcement = (typeof staticData)[number];

export function useAnnouncements(category?: string) {
  const { data, loading, error } = useData<Announcement[]>('/announcements', staticData);

  const filtered = useMemo(() => {
    if (!data) return [];
    return category && category !== 'All'
      ? data.filter((a) => a.category === category)
      : data;
  }, [data, category]);

  return { data: filtered, loading, error };
}

export function useAnnouncementById(id: string) {
  const { data, loading, error } = useData<Announcement[]>('/announcements', staticData);

  const item = useMemo(() => data?.find((a) => a.id === id) ?? null, [data, id]);

  return { data: item, loading, error };
}
