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

const LIGHT_BASE      = '#E8E8E0';
const LIGHT_HIGHLIGHT = '#F5F5EE';
const DARK_BASE       = '#22263A';
const DARK_HIGHLIGHT  = '#2E3450';

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

const AnnouncementShimmer = () => {
  const { theme, mode } = useTheme();
  const base      = mode === 'dark' ? DARK_BASE      : LIGHT_BASE;
  const highlight = mode === 'dark' ? DARK_HIGHLIGHT : LIGHT_HIGHLIGHT;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.topRow}>
        <ShimmerBar width={64} height={20} base={base} highlight={highlight} />
        <ShimmerBar width={48} height={12} base={base} highlight={highlight} />
      </View>
      <ShimmerBar width="100%" height={140} style={styles.image} base={base} highlight={highlight} />
      <ShimmerBar width="80%" height={14} style={styles.gap}   base={base} highlight={highlight} />
      <ShimmerBar width="55%" height={14} style={styles.gapSm} base={base} highlight={highlight} />
      <ShimmerBar width="100%" height={11} style={styles.gap}  base={base} highlight={highlight} />
      <ShimmerBar width="90%" height={11} style={styles.gapSm} base={base} highlight={highlight} />
      <ShimmerBar width="70%" height={11} style={styles.gapSm} base={base} highlight={highlight} />
      <View style={styles.bottomRow}>
        <ShimmerBar width={80} height={11} base={base} highlight={highlight} />
        <ShimmerBar width={60} height={11} base={base} highlight={highlight} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    borderWidth: 1,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  image:  { borderRadius: Radius.sm, marginBottom: Spacing.sm },
  gap:    { marginTop: Spacing.sm },
  gapSm:  { marginTop: 6 },
  bottomRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
});

export default React.memo(AnnouncementShimmer);
