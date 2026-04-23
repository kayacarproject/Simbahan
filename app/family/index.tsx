import React, { useCallback, useEffect, useState } from 'react';
import {
  View, FlatList, StyleSheet, Platform,
  ListRenderItemInfo, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import GradientView from '../../components/ui/GradientView';
import AppText from '../../components/ui/AppText';
import BackBar from '../../components/ui/BackBar';
import WebLayout from '../../components/ui/WebLayout';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { useTheme } from '../../theme/ThemeContext';
import { useUiStore } from '../../store/uiStore';
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

const isWeb = Platform.OS === 'web';
const LIGHT_BASE = '#E8E8E0'; const LIGHT_HL = '#F5F5EE';
const DARK_BASE  = '#22263A'; const DARK_HL  = '#2E3450';

// ── ShimmerBar ────────────────────────────────────────────────────────────────
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

// ── Family shimmer card ───────────────────────────────────────────────────────
function FamilyShimmer({ base, highlight, surface, border }: {
  base: string; highlight: string; surface: string; border: string;
}) {
  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, { backgroundColor: base }]} />
        <View style={{ flex: 1, gap: 6 }}>
          <ShimmerBar width="60%" height={16} base={base} highlight={highlight} />
          <ShimmerBar width="40%" height={12} base={base} highlight={highlight} />
        </View>
      </View>
      <View style={styles.infoGrid}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.infoRow}>
            <ShimmerBar width={16} height={16} base={base} highlight={highlight} style={{ borderRadius: 8 }} />
            <ShimmerBar width="70%" height={12} base={base} highlight={highlight} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Family card ───────────────────────────────────────────────────────────────
const FamilyItem = React.memo(({ item, theme }: { item: Family; theme: any }) => (
  <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
    {/* Card header */}
    <View style={styles.cardTop}>
      <View style={[styles.iconCircle, { backgroundColor: theme.success + '20' }]}>
        <Ionicons name="people" size={22} color={theme.success} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="headingSm" color={theme.primary} numberOfLines={1}>
          {item.familyName}
        </AppText>
        <AppText variant="caption" color={theme.textMuted}>
          {item.isActive === 'Yes' ? 'Aktibo' : 'Hindi aktibo'}
        </AppText>
      </View>
      {item.isActive === 'Yes' && (
        <View style={[styles.activeBadge, { backgroundColor: theme.success + '18' }]}>
          <AppText variant="caption" color={theme.success}>Aktibo</AppText>
        </View>
      )}
    </View>

    {/* Info rows */}
    <View style={styles.infoGrid}>
      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={14} color={theme.accent} />
        <AppText variant="bodySm" color={theme.textMuted} style={styles.infoLabel}>Ulo</AppText>
        <AppText variant="bodySm" color={theme.text} style={{ flex: 1 }} numberOfLines={1}>
          {item.headName}
        </AppText>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={14} color={theme.accent} />
        <AppText variant="bodySm" color={theme.textMuted} style={styles.infoLabel}>Barangay</AppText>
        <AppText variant="bodySm" color={theme.text} style={{ flex: 1 }} numberOfLines={1}>
          {item.barangay}
        </AppText>
      </View>
      {!!item.address && (
        <View style={styles.infoRow}>
          <Ionicons name="home-outline" size={14} color={theme.accent} />
          <AppText variant="bodySm" color={theme.textMuted} style={styles.infoLabel}>Address</AppText>
          <AppText variant="bodySm" color={theme.text} style={{ flex: 1 }} numberOfLines={2}>
            {item.address}
          </AppText>
        </View>
      )}
      {!!item.weddingDate && (
        <View style={styles.infoRow}>
          <Ionicons name="heart-outline" size={14} color={theme.accent} />
          <AppText variant="bodySm" color={theme.textMuted} style={styles.infoLabel}>Kasal</AppText>
          <AppText variant="bodySm" color={theme.text} style={{ flex: 1 }}>
            {item.weddingDate}
          </AppText>
        </View>
      )}
    </View>
  </View>
));

// ── Main screen ───────────────────────────────────────────────────────────────
export default function FamilyScreen() {
  const { theme, mode } = useTheme();
  const showToast = useUiStore((s) => s.showToast);
  const base      = mode === 'dark' ? DARK_BASE : LIGHT_BASE;
  const highlight = mode === 'dark' ? DARK_HL   : LIGHT_HL;

  const [families, setFamilies] = useState<Family[]>([]);
  const [loading,  setLoading]  = useState(false);

  const fetchFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDataPublic({
        appName: Api.appName, moduleName: 'family',
        query: {}, limit: 10, skip: 0, sortBy: 'createdAt', order: 'descending',
      });
      if (data?.success === true) {
        console.log('[FAMILY] Response:', data.data);
        setFamilies(data.data || []);
      } else {
        console.log('[FAMILY] No data:', data?.message);
      }
    } catch (e: any) {
      const msg = e?.message === 'Session expired'
        ? 'Session expired. Please log in again.'
        : 'Hindi ma-load ang mga pamilya.';
      console.log('[FAMILY] Error:', e?.message);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchFamilies(); }, [fetchFamilies]);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<Family>) => (
    <FamilyItem item={item} theme={theme} />
  ), [theme]);

  const ListHeader = (
    <>
      <BackBar />
      <GradientView colors={[Colors.sage, '#3D8A65']} style={styles.header}>
        <AppText variant="displaySm" color={Colors.textInverse}>Aking Pamilya</AppText>
        <AppText variant="bodySm" color="rgba(255,255,255,0.8)">
          Mga pamilya ng parokya
        </AppText>
      </GradientView>
    </>
  );

  const EmptyState = !loading ? (
    <View style={styles.emptyWrap}>
      <Ionicons name="people-outline" size={40} color={theme.textMuted} />
      <AppText variant="bodySm" color={theme.textMuted} style={styles.emptyText}>
        Walang pamilya na nahanap.
      </AppText>
    </View>
  ) : null;

  const content = (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>
      {loading ? (
        <>
          {ListHeader}
          <View style={[styles.shimmerWrap, { backgroundColor: theme.background }]}>
            {Array.from({ length: 5 }).map((_, i) => (
              <FamilyShimmer key={i} base={base} highlight={highlight} surface={theme.surface} border={theme.border} />
            ))}
          </View>
        </>
      ) : (
        <FlatList
          data={families}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={EmptyState}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          contentContainerStyle={[styles.listContent, { backgroundColor: theme.background }]}
          style={{ backgroundColor: theme.background }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={5}
          maxToRenderPerBatch={5}
        />
      )}
    </SafeAreaView>
  );

  if (isWeb) return <WebLayout>{content}</WebLayout>;
  return content;
}

const styles = StyleSheet.create({
  screen:      { flex: 1 },
  header:      { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl, gap: 4 },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  shimmerWrap: { padding: Spacing.md, gap: Spacing.sm },
  card:        { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  cardTop:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconCircle:  { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  activeBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  infoGrid:    { gap: Spacing.xs },
  infoRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs, paddingVertical: 2 },
  infoLabel:   { width: 64, flexShrink: 0 },
  emptyWrap:   { alignItems: 'center', marginTop: Spacing.xxl, gap: Spacing.sm },
  emptyText:   { textAlign: 'center' },
});
