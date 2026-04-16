import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Radius } from '../../constants/Layout';
import { useTheme } from '../../theme/ThemeContext';

const LIGHT_BASE = '#E8E8E0'; const LIGHT_HIGHLIGHT = '#F5F5EE';
const DARK_BASE  = '#22263A'; const DARK_HIGHLIGHT  = '#2E3450';

const ShimmerBar = ({ width, height = 12, style, base, highlight }: {
  width: string | number; height?: number; style?: object; base: string; highlight: string;
}) => {
  const translateX = useSharedValue(-1);
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1, false,
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

const NovenaCardShimmer = () => {
  const { theme, mode } = useTheme();
  const base      = mode === 'dark' ? DARK_BASE      : LIGHT_BASE;
  const highlight = mode === 'dark' ? DARK_HIGHLIGHT : LIGHT_HIGHLIGHT;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.imgWrap, { backgroundColor: base }]} />
      <View style={styles.info}>
        <ShimmerBar width="70%" height={14} base={base} highlight={highlight} />
        <ShimmerBar width="40%" height={11} style={{ marginTop: 6 }} base={base} highlight={highlight} />
        <ShimmerBar width={52}  height={20} style={{ marginTop: 6, borderRadius: Radius.full }} base={base} highlight={highlight} />
      </View>
      <ShimmerBar width={18} height={18} style={{ borderRadius: 9, marginRight: Spacing.sm }} base={base} highlight={highlight} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  imgWrap: { width: 72, height: 80 },
  info:    { flex: 1, paddingVertical: Spacing.sm, gap: 4 },
});

export default React.memo(NovenaCardShimmer);
