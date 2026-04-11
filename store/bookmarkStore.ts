import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type BookmarkState = {
  bookmarkedIds: string[];
  toggle: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  hydrate: () => Promise<void>;
};

const KEY = '@simbahan_bookmarks';

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarkedIds: [],

  toggle: async (id) => {
    const current = get().bookmarkedIds;
    const updated = current.includes(id)
      ? current.filter((b) => b !== id)
      : [...current, id];
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    set({ bookmarkedIds: updated });
  },

  isBookmarked: (id) => get().bookmarkedIds.includes(id),

  hydrate: async () => {
    const raw = await AsyncStorage.getItem(KEY);
    set({ bookmarkedIds: raw ? JSON.parse(raw) : [] });
  },
}));
