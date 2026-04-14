import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiLogin } from '../services/authService';
import { useUiStore } from '../store/uiStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const loginStore  = useAuthStore((s) => s.login);
  const showToast   = useUiStore((s) => s.showToast);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!email.trim() || !password.trim()) {
      showToast('Please enter your email and password.', 'error');
      return false;
    }
    if (!EMAIL_RE.test(email.trim())) {
      showToast('Please enter a valid email address.', 'error');
      return false;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return false;
    }

    console.log('[useLogin] Attempting login for:', email.trim());
    console.log('[useLogin] Password length:', password.length);

    setLoading(true);
    try {
      const response = await apiLogin(email.trim(), password);
      const user = response.data?.user;
      const userId = (user?.id ?? user?._id ?? '') as string;

      console.log('[useLogin] Login succeeded. userId:', userId || '(not in response — using demo user)');

      await loginStore(userId || undefined);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      console.log('[useLogin] Login failed:', msg);
      showToast(msg, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loginStore, showToast]);

  return { login, loading };
}
