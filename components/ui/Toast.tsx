import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useUiStore } from '../../store/uiStore';
import { Typography } from '../../constants/Typography';
import { Spacing, Radius, Shadows } from '../../constants/Layout';
import { Colors } from '../../constants/Colors';

const isWeb = Platform.OS === 'web';
const AUTO_HIDE_MS = 3500;
const SWIPE_THRESHOLD = 80;

type ToastType = 'success' | 'error' | 'info';

const ICON: Record<ToastType, React.ComponentProps<typeof Ionicons>['name']> = {
  success: 'checkmark-circle',
  error:   'alert-circle',
  info:    'information-circle',
};

const ICON_COLOR: Record<ToastType, string> = {
  success: Colors.sage,
  error:   Colors.crimson,
  info:    Colors.navy,
};

// Soft tinted backgrounds — white base with a hint of the type color
const BG_COLOR: Record<ToastType, string> = {
  success: '#FFFFFF',
  error:   '#FFFFFF',
  info:    '#FFFFFF',
};

// Left accent bar color
const ACCENT_COLOR: Record<ToastType, string> = {
  success: Colors.sage,
  error:   Colors.crimson,
  info:    Colors.navy,
};

// Icon container background — type color at ~12% opacity
const ICON_BG: Record<ToastType, string> = {
  success: Colors.sagePale,
  error:   Colors.crimsonPale,
  info:    Colors.goldPale,
};

// Human-readable label above the message
const LABEL: Record<ToastType, string> = {
  success: 'Success',
  error:   'Error',
  info:    'Info',
};

export default function Toast() {
  const toast     = useUiStore((s) => s.toastMessage);
  const hideToast  = useUiStore((s) => s.hideToast);

  // Animation values
  const opacity     = useSharedValue(0);
  const translateY  = useSharedValue(isWeb ? -20 : 40);
  const translateX  = useSharedValue(0);
  const scale       = useSharedValue(0.95);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    opacity.value    = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });
    translateY.value = withTiming(isWeb ? -12 : 24, { duration: 200 });
    scale.value      = withTiming(0.95, { duration: 200 });
    // Delay store clear until animation finishes
    setTimeout(hideToast, 210);
  }, [hideToast, opacity, translateY, scale]);

  // Animate in whenever toast changes
  useEffect(() => {
    if (!toast) return;

    translateX.value = 0;
    translateY.value = isWeb ? -20 : 40;
    scale.value      = 0.95;
    opacity.value    = 0;

    opacity.value    = withTiming(1, { duration: 280, easing: Easing.out(Easing.ease) });
    translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    scale.value      = withSpring(1, { damping: 18, stiffness: 200 });

    timerRef.current = setTimeout(dismiss, AUTO_HIDE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast]);

  // Swipe-to-dismiss via PanResponder (mobile only)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isWeb,
      onMoveShouldSetPanResponder: (_, g) => !isWeb && Math.abs(g.dx) > 8,
      onPanResponderMove: (_, g) => {
        translateX.value = g.dx;
        opacity.value    = Math.max(0, 1 - Math.abs(g.dx) / (SWIPE_THRESHOLD * 1.5));
      },
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > SWIPE_THRESHOLD) {
          const dir = g.dx > 0 ? 300 : -300;
          translateX.value = withTiming(dir, { duration: 200 });
          opacity.value    = withTiming(0, { duration: 200 }, () => runOnJS(hideToast)());
        } else {
          translateX.value = withSpring(0, { damping: 18, stiffness: 200 });
          opacity.value    = withTiming(1, { duration: 150 });
        }
      },
    }),
  ).current;

  const animStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  if (!toast) return null;

  const type = (toast.type ?? 'info') as ToastType;

  return (
    <Animated.View
      style={[styles.wrapper, isWeb ? styles.wrapperWeb : styles.wrapperMobile, animStyle]}
      {...(!isWeb ? panResponder.panHandlers : {})}
    >
      <TouchableOpacity
        onPress={dismiss}
        activeOpacity={0.92}
        accessible
        accessibilityRole="alert"
        accessibilityLabel={`${type}: ${toast.text}`}
        style={[
          styles.toast,
          {
            backgroundColor: BG_COLOR[type],
            borderLeftColor: ACCENT_COLOR[type],
          },
          Shadows.lg,
        ]}
      >
        {/* Left icon — solid tinted circle */}
        <View style={[styles.iconWrap, { backgroundColor: ICON_BG[type] }]}>
          <Ionicons name={ICON[type]} size={20} color={ICON_COLOR[type]} />
        </View>

        {/* Label + message */}
        <View style={styles.textWrap}>
          <Animated.Text style={[styles.label, { color: ICON_COLOR[type] }]}>
            {LABEL[type]}
          </Animated.Text>
          <Animated.Text
            style={[styles.message, { color: Colors.textPrimary }]}
            numberOfLines={3}
          >
            {toast.text}
          </Animated.Text>
        </View>

        {/* Dismiss X */}
        <Ionicons name="close" size={15} color={Colors.textMuted} style={styles.closeIcon} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    zIndex: 9999,
    pointerEvents: 'box-none' as any,
  },
  wrapperMobile: {
    bottom: 88,
    left: Spacing.md,
    right: Spacing.md,
    alignItems: 'center',
  },
  wrapperWeb: {
    top: Spacing.lg,
    right: Spacing.lg,
    width: 340,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    // borderLeftColor set inline per type
    paddingVertical: Spacing.md,
    paddingRight: Spacing.md,
    paddingLeft: Spacing.sm,
    gap: Spacing.sm,
    width: '100%',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...Typography.label,
    letterSpacing: 0.3,
  },
  message: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    flexWrap: 'wrap',
  },
  closeIcon: {
    flexShrink: 0,
    marginLeft: Spacing.xs,
    opacity: 0.5,
  },
});
