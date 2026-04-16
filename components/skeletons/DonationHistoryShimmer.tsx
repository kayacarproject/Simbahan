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
    translateX.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, false);
  }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value * screenWidth }] }));
  return (
    <View style={[{ width, height, borderRadius: Radius.sm, backgroundColor: base, overflow: 'hidden' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <LinearGradient colors={[base, highlight, highlight, base]} locations={[0, 0.3, 0.7, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
};

const DonationHistoryShimmer = () => {
  const { theme, mode } = useTheme();
  const base      = mode === 'dark' ? DARK_BASE      : LIGHT_BASE;
  const highlight = mode === 'dark' ? DARK_HIGHLIGHT : LIGHT_HIGHLIGHT;
  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: base }]} />
      <View style={styles.left}>
        <ShimmerBar width="55%" height={14} base={base} highlight={highlight} />
        <ShimmerBar width="35%" height={11} style={{ marginTop: 6 }} base={base} highlight={highlight} />
        <ShimmerBar width="70%" height={11} style={{ marginTop: 4 }} base={base} highlight={highlight} />
      </View>
      <View style={styles.right}>
        <ShimmerBar width={64} height={16} base={base} highlight={highlight} />
        <ShimmerBar width={40} height={11} style={{ marginTop: 6 }} base={base} highlight={highlight} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  iconWrap: { width: 36, height: 36, borderRadius: 18, flexShrink: 0 },
  left:     { flex: 1, gap: 2 },
  right:    { alignItems: 'flex-end', gap: 2 },
});

export default React.memo(DonationHistoryShimmer);
