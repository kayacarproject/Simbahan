import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Typography } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Layout';
import { useUiStore } from '../../store/uiStore';
import { useTheme } from '../../theme/ThemeContext';

export default function Toast() {
  const toast = useUiStore((s) => s.toastMessage);
  const hideToast = useUiStore((s) => s.hideToast);
  const { theme } = useTheme();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hideToast, 2500);
    return () => clearTimeout(t);
  }, [toast, hideToast]);

  if (!toast) return null;

  const bg: Record<string, string> = {
    success: theme.success,
    error: theme.danger,
    info: theme.primary,
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.toast, { backgroundColor: bg[toast.type] ?? theme.primary }]}
    >
      <Animated.Text style={[styles.text, { color: theme.textInverse }]}>
        {toast.text}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 80,
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    zIndex: 999,
  },
  text: {
    ...Typography.bodyMd,
    textAlign: 'center',
  },
});
