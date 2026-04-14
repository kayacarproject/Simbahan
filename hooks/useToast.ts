import { useCallback } from 'react';
import { useUiStore } from '../store/uiStore';

type ToastType = 'success' | 'error' | 'info';

interface ShowToastOptions {
  type: ToastType;
  message: string;
}

/**
 * useToast — call showToast({ type, message }) from any screen or hook.
 * Backed by uiStore so the single Toast renderer in _layout.tsx picks it up.
 */
export function useToast() {
  const showToastStore = useUiStore((s) => s.showToast);
  const hideToast      = useUiStore((s) => s.hideToast);

  const showToast = useCallback(
    ({ type, message }: ShowToastOptions) => showToastStore(message, type),
    [showToastStore],
  );

  return { showToast, hideToast };
}
