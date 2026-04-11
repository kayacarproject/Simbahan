import { useMemo } from 'react';
import announcements from '../data/announcements.json';

export function useAnnouncements(category?: string) {
  return useMemo(
    () =>
      category && category !== 'All'
        ? announcements.filter((a) => a.category === category)
        : announcements,
    [category]
  );
}

export function useAnnouncementById(id: string) {
  return useMemo(() => announcements.find((a) => a.id === id), [id]);
}
