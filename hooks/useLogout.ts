import { useCallback } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

/**
 * Returns a logout() function that:
 * 1. Clears Zustand auth state + AsyncStorage + SecureStore (via authStore.logout)
 * 2. Replaces the entire navigation stack with the login screen
 *    so the back button cannot return to protected screens.
 */
export function useLogout() {
  const logoutStore = useAuthStore((s) => s.logout);

  const logout = useCallback(async () => {
    await logoutStore();
    // replace() resets the stack — no history entry remains for Home
    router.replace('/(auth)/login');
  }, [logoutStore]);

  return { logout };
}
