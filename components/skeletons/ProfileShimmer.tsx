import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Radius } from '../../constants/Layout';
import { useTheme } from '../../theme/ThemeContext';

// ── Per-mode shimmer colors ───────────────────────────────────────────────────
const LIGHT_BASE      = '#E8E8E0';
const LIGHT_HIGHLIGHT = '#F5F5EE';
const DARK_BASE       = '#22263A';
const DARK_HIGHLIGHT  = '#2E3450';

// ── ShimmerBar ────────────────────────────────────────────────────────────────
const ShimmerBar = ({
  width, height = 12, style, base, highlight,
}: {
  width: string | number;
  height?: number;
  style?: object;
  base: string;
  highlight: string;
}) => {
  const translateX = useSharedValue(-1);
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * screenWidth }],
  }));

  return (
    <View style={[{ width, height, borderRadius: Radius.sm, backgroundColor: base, overflow: 'hidden' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <LinearGradient
          colors={[base, highlight, highlight, base]}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

// ── ProfileHeroShimmer ────────────────────────────────────────────────────────
export const ProfileHeroShimmer = () => {
  const { theme, mode } = useTheme();
  const base      = mode === 'dark' ? DARK_BASE      : LIGHT_BASE;
  const highlight = mode === 'dark' ? DARK_HIGHLIGHT : LIGHT_HIGHLIGHT;

  return (
    <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: -(Spacing.xl) }]}>
      <View style={[styles.avatarCircle, { backgroundColor: base }]} />
      <ShimmerBar width="50%" height={20} style={{ marginTop: Spacing.sm }} base={base} highlight={highlight} />
      <ShimmerBar width="35%" height={12} style={{ marginTop: 6 }}          base={base} highlight={highlight} />
    </View>
  );
};

// ── ProfileCardShimmer ────────────────────────────────────────────────────────
export const ProfileCardShimmer = ({ rows = 3 }: { rows?: number }) => {
  const { theme, mode } = useTheme();
  const base      = mode === 'dark' ? DARK_BASE      : LIGHT_BASE;
  const highlight = mode === 'dark' ? DARK_HIGHLIGHT : LIGHT_HIGHLIGHT;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <ShimmerBar width="40%" height={14} style={{ marginBottom: Spacing.xs }} base={base} highlight={highlight} />
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.infoRow}>
          <ShimmerBar width={16} height={16} style={{ borderRadius: 8 }} base={base} highlight={highlight} />
          <ShimmerBar width={80} height={11}                              base={base} highlight={highlight} />
          <ShimmerBar width="45%" height={13}                             base={base} highlight={highlight} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.md,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    margin: Spacing.md,
    marginBottom: 0,
    gap: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
});
