import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Spacing, Radius } from '../../constants/Layout';
import { AppText } from '../ui';
import { useTheme } from '../../theme/ThemeContext';
import { getDataPublic } from '../../services/ApiHandler';
import Api from '../../services/Api';

type Family = {
  _id: string;
  familyName: string;
  headName: string;
  barangay: string;
  address: string;
  weddingDate?: string;
  isActive: string;
};

const LIGHT_BASE = '#E8E8E0'; const LIGHT_HL = '#F5F5EE';
const DARK_BASE  = '#22263A'; const DARK_HL  = '#2E3450';

function ShimmerBar({ width, height = 12, style, base, highlight }: {
  width: string | number; height?: number; style?: object; base: string; highlight: string;
}) {
  const tx = useSharedValue(-1);
  const { width: sw } = useWindowDimensions();
  useEffect(() => {
    tx.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, false);
  }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value * sw }] }));
  return (
    <View style={[{ width, height, borderRadius: Radius.sm, backgroundColor: base, overflow: 'hidden' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <LinearGradient colors={[base, highlight, highlight, base]} locations={[0, 0.3, 0.7, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

const FamilyCard = () => {
  const { theme, mode } = useTheme();
  const base      = mode === 'dark' ? DARK_BASE : LIGHT_BASE;
  const highlight = mode === 'dark' ? DARK_HL   : LIGHT_HL;

  const [family,  setFamily]  = useState<Family | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFamily = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDataPublic({
        appName: Api.appName, moduleName: 'family',
        query: {}, limit: 1, skip: 0, sortBy: 'createdAt', order: 'descending',
      });
      if (data?.success === true && data.data?.length > 0) {
        setFamily(data.data[0]);
      }
    } catch (e: any) {
      console.log('[FAMILY CARD] Error:', e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFamily(); }, [fetchFamily]);

  const handlePress = useCallback(() => router.push('/family' as never), []);

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.successPale, borderColor: theme.success + '40' }]}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: theme.success + '20' }]}>
            <Ionicons name="people-outline" size={18} color={theme.success} />
          </View>
          <ShimmerBar width={100} height={12} base={base} highlight={highlight} />
        </View>
        <ShimmerBar width="60%" height={16} base={base} highlight={highlight} style={{ marginTop: 4 }} />
        <View style={styles.bottomRow}>
          <View style={styles.avatarRow}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.avatar, { backgroundColor: base, marginLeft: i === 1 ? 0 : -10 }]} />
            ))}
          </View>
          <ShimmerBar width={70} height={11} base={base} highlight={highlight} />
        </View>
      </View>
    );
  }

  if (!family) return null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessible
      accessibilityLabel={`View ${family.familyName}`}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: theme.successPale, borderColor: theme.success + '40' }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: theme.success + '20' }]}>
          <Ionicons name="people-outline" size={18} color={theme.success} />
        </View>
        <AppText variant="label" color={theme.success} style={styles.sectionLabel}>
          AKING PAMILYA
        </AppText>
      </View>
      <AppText variant="headingSm" color={theme.primary} style={styles.familyName}>
        {family.familyName}
      </AppText>
      <View style={styles.bottomRow}>
        <View style={styles.avatarRow}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.avatar,
                { backgroundColor: theme.success, borderColor: theme.successPale, marginLeft: i === 1 ? 0 : -10 },
              ]}
            >
              <Ionicons name="person" size={12} color={theme.textInverse} />
            </View>
          ))}
        </View>
        <AppText variant="bodySm" color={theme.textMuted}>3 miyembro</AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card:         { borderRadius: Radius.md, marginHorizontal: Spacing.md, padding: Spacing.md, borderWidth: 1, gap: Spacing.xs },
  topRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  iconWrap:     { width: 28, height: 28, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { letterSpacing: 0.5 },
  familyName:   { marginTop: 2 },
  bottomRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  avatarRow:    { flexDirection: 'row', alignItems: 'center' },
  avatar:       { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});

export default React.memo(FamilyCard);
