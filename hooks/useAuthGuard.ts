import { useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

/**
 * Drop this into any protected screen.
 * On every focus event it checks isAuthenticated — if false it
 * immediately replaces the stack with the login screen.
 */
export function useAuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated      = useAuthStore((s) => s.isHydrated);

  useFocusEffect(
    useCallback(() => {
      // Wait for hydration so we don't redirect during cold start
      if (!isHydrated) return;
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      }
    }, [isAuthenticated, isHydrated]),
  );
}
