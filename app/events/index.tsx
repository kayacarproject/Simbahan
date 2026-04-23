import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, FlatList, ScrollView, Pressable, StyleSheet,
  ListRenderItemInfo, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Img from '../../components/ui/Img';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import AppText from '../../components/ui/AppText';
import Badge from '../../components/ui/Badge';
import GradientView from '../../components/ui/GradientView';
import WebLayout from '../../components/ui/WebLayout';
import { useTheme } from '../../theme/ThemeContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { getDataPublic } from '../../services/ApiHandler';
import Api from '../../services/Api';

// ── Types ─────────────────────────────────────────────────────────────────────
type ApiEvent = {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  location?: string;
  category: string;
  organizer?: string;
  image?: string | null;
  rsvpEnabled?: string;
};

type ViewMode = 'list' | 'grid';

const PLACEHOLDER = 'https://placehold.co/600x300/1A2B5E/FFFFFF/png?text=Kaganapan';
const CATEGORIES  = ['Lahat', 'Fiesta', 'Recollection', 'Youth', 'Sacrament', 'Outreach'];

// ── Shimmer colors ────────────────────────────────────────────────────────────
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

// ── List shimmer card ─────────────────────────────────────────────────────────
function ListShimmer({ base, highlight, surface, border }: {
  base: string; highlight: string; surface: string; border: string;
}) {
  return (
    <View style={[cStyles.listCard, { backgroundColor: surface, borderColor: border }]}>
      <ShimmerBar width={120} height={90} base={base} highlight={highlight} style={{ borderRadius: 0 }} />
      <View style={cStyles.listBody}>
        <ShimmerBar width={64} height={18} base={base} highlight={highlight} style={{ borderRadius: Radius.full }} />
        <ShimmerBar width="80%" height={14} base={base} highlight={highlight} style={{ marginTop: 6 }} />
        <ShimmerBar width="55%" height={11} base={base} highlight={highlight} style={{ marginTop: 4 }} />
        <ShimmerBar width="65%" height={11} base={base} highlight={highlight} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

// ── Grid shimmer card ─────────────────────────────────────────────────────────
function GridShimmer({ base, highlight }: { base: string; highlight: string }) {
  return (
    <View style={[cStyles.gridCard, { backgroundColor: base, overflow: 'hidden' }]}>
      <ShimmerBar width="100%"  base={base} highlight={highlight} style={{ borderRadius: 0 }} />
      <View style={cStyles.gridContent}>
        <ShimmerBar width={56} height={18} base={highlight} highlight={base} style={{ borderRadius: Radius.full }} />
        <ShimmerBar width="85%" height={13} base={highlight} highlight={base} style={{ marginTop: 6 }} />
        <ShimmerBar width="55%" height={11} base={highlight} highlight={base} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

// ── List event card ───────────────────────────────────────────────────────────
const EventListCard = React.memo(({ item, theme, onPress }: {
  item: ApiEvent; theme: any; onPress: (id: string) => void;
}) => (
  <TouchableOpacity
    onPress={() => onPress(item._id)}
    activeOpacity={0.85}
    accessible
    accessibilityLabel={item.title}
    style={[cStyles.listCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
  >
    <View style={cStyles.listImgWrap}>
      <Img source={{ uri: item.image || PLACEHOLDER }} style={cStyles.listImg} contentFit="cover" transition={200} />
    </View>
    <View style={cStyles.listBody}>
      <Badge label={item.category} variant="gold" />
      <AppText variant="headingSm" color={theme.primary} numberOfLines={2} style={{ marginTop: 4 }}>
        {item.title}
      </AppText>
      <View style={cStyles.metaRow}>
        <Ionicons name="calendar-outline" size={12} color={theme.textMuted} />
        <AppText variant="caption" color={theme.textMuted}>{item.date}</AppText>
        {!!item.time && <AppText variant="caption" color={theme.textMuted}>  ·  {item.time}</AppText>}
      </View>
      {!!item.location && (
        <View style={cStyles.metaRow}>
          <Ionicons name="location-outline" size={12} color={theme.textMuted} />
          <AppText variant="caption" color={theme.textMuted} numberOfLines={1}>{item.location}</AppText>
        </View>
      )}
    </View>
    <Ionicons name="chevron-forward" size={16} color={theme.textMuted} style={{ alignSelf: 'center', marginRight: Spacing.sm }} />
  </TouchableOpacity>
));

// ── Grid event card ───────────────────────────────────────────────────────────
const EventGridCard = React.memo(({ item, onPress }: {
  item: ApiEvent; onPress: (id: string) => void;
}) => (
  <TouchableOpacity
    onPress={() => onPress(item._id)}
    activeOpacity={0.85}
    accessible
    accessibilityLabel={item.title}
    style={cStyles.gridCard}
  >
    <Img source={{ uri: item.image || PLACEHOLDER }} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={200} />
    <View style={cStyles.gridDim} />
    <View style={cStyles.gridContent}>
      <Badge label={item.category} variant="gold" />
      <AppText variant="headingSm" color={Colors.textInverse} numberOfLines={2} style={{ marginTop: 4, lineHeight: 18 }}>
        {item.title}
      </AppText>
      <AppText variant="caption" color={Colors.goldLight}>
        {item.date}{item.time ? `  ·  ${item.time}` : ''}
      </AppText>
    </View>
  </TouchableOpacity>
));

// ── Main screen ───────────────────────────────────────────────────────────────
export default function EventsScreen() {
  const { theme, mode } = useTheme();
  const { isWeb } = useBreakpoint();
  const base      = mode === 'dark' ? DARK_BASE : LIGHT_BASE;
  const highlight = mode === 'dark' ? DARK_HL   : LIGHT_HL;

  const [events,         setEvents]         = useState<ApiEvent[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [activeCategory, setActiveCategory] = useState('Lahat');
  const [viewMode,       setViewMode]       = useState<ViewMode>('list');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDataPublic({
        appName: Api.appName, moduleName: 'event',
        query: {}, limit: 10, skip: 0, sortBy: 'createdAt', order: 'descending',
      });
      if (data?.success === true) {
        console.log('[EVENTS] Response:', data.data);
        setEvents(data.data || []);
      } else {
        console.log('[EVENTS] No data:', data?.message);
      }
    } catch (e: any) {
      console.log('[EVENTS] Error:', e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filtered = useMemo(() =>
    activeCategory === 'Lahat'
      ? events
      : events.filter((e) => e.category === activeCategory),
    [events, activeCategory],
  );

  const handlePress = useCallback((id: string) => {
    router.push(`/events/${id}` as never);
  }, []);

  const numCols = viewMode === 'grid' ? 2 : 1;

  const renderItem = useCallback(({ item }: ListRenderItemInfo<ApiEvent>) =>
    viewMode === 'grid'
      ? <EventGridCard item={item} onPress={handlePress} />
      : <EventListCard item={item} theme={theme} onPress={handlePress} />,
    [viewMode, handlePress, theme],
  );

  const ListHeader = (
    <>
      {/* Header gradient */}
      <GradientView colors={[Colors.navyDark, Colors.navy]} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessible accessibilityLabel="Bumalik">
            <Ionicons name="arrow-back" size={20} color={Colors.textInverse} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <AppText variant="displaySm" color={Colors.textInverse} style={styles.headerTitle}>
              Mga Kaganapan
            </AppText>
            <AppText variant="bodySm" color={Colors.goldLight}>Upcoming events &amp; activities</AppText>
          </View>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleActive]}
              accessible accessibilityLabel="List view"
            >
              <Ionicons name="list" size={18} color={viewMode === 'list' ? Colors.navy : Colors.textInverse} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('grid')}
              style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleActive]}
              accessible accessibilityLabel="Grid view"
            >
              <Ionicons name="grid" size={16} color={viewMode === 'grid' ? Colors.navy : Colors.textInverse} />
            </TouchableOpacity>
          </View>
        </View>
      </GradientView>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterRow, { backgroundColor: theme.background }]}
      >
        {CATEGORIES.map((cat) => {
          const active = cat === activeCategory;
          return (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.pill, { backgroundColor: active ? theme.primary : theme.surface2 }]}
              accessible accessibilityLabel={cat}
            >
              <AppText variant="label" color={active ? Colors.textInverse : theme.textMuted}>{cat}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );

  const EmptyState = !loading ? (
    <View style={styles.emptyWrap}>
      <Ionicons name="calendar-outline" size={40} color={theme.textMuted} />
      <AppText variant="bodySm" color={theme.textMuted} style={styles.emptyText}>
        Walang kaganapan sa kategoryang ito.
      </AppText>
    </View>
  ) : null;

  const shimmerCount = viewMode === 'grid' ? 6 : 4;

  const content = (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>
      {loading ? (
        <>
          {ListHeader}
          <ScrollView
            contentContainerStyle={[
              styles.shimmerWrap,
              viewMode === 'grid' && styles.shimmerGrid,
              { backgroundColor: theme.background },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {Array.from({ length: shimmerCount }).map((_, i) =>
              viewMode === 'grid'
                ? <GridShimmer key={i} base={base} highlight={highlight} />
                : <ListShimmer key={i} base={base} highlight={highlight} surface={theme.surface} border={theme.border} />
            )}
          </ScrollView>
        </>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={EmptyState}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          contentContainerStyle={[
            styles.listContent,
            isWeb && styles.listContentWeb,
            { backgroundColor: theme.background },
          ]}
          numColumns={numCols}
          columnWrapperStyle={numCols > 1 ? styles.columnWrapper : undefined}
          key={`${viewMode}-${isWeb}`}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: theme.background }}
          removeClippedSubviews
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
        />
      )}
    </SafeAreaView>
  );

  return <WebLayout>{content}</WebLayout>;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:         { flex: 1 },
  headerGradient: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  headerRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  backBtn:        { padding: Spacing.xs },
  headerTitle:    { marginBottom: 2 },
  toggleRow:      { flexDirection: 'row', gap: Spacing.xs },
  toggleBtn:      { padding: Spacing.xs, borderRadius: Radius.sm, backgroundColor: 'rgba(255,255,255,0.15)' },
  toggleActive:   { backgroundColor: Colors.textInverse },
  filterRow:      { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm },
  pill:           { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full },
  listContent:    { padding: Spacing.md, paddingBottom: Spacing.xxl },
  listContentWeb: { paddingHorizontal: Spacing.xl },
  columnWrapper:  { gap: Spacing.md },
  shimmerWrap:    { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  shimmerGrid:    { flexDirection: 'row', flexWrap: 'wrap' },
  emptyWrap:      { alignItems: 'center', marginTop: Spacing.xxl, gap: Spacing.sm },
  emptyText:      { textAlign: 'center' },
});

const cStyles = StyleSheet.create({
  // List card
  listCard:    { flexDirection: 'row', borderWidth: 1, borderRadius: Radius.md, overflow: 'hidden' },
  listImgWrap: { width: 120, height: 90 },
  listImg:     { width: 120, height: 90 },
  listBody:    { flex: 1, padding: Spacing.sm, gap: 2, justifyContent: 'center' },
  metaRow:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  // Grid card
  gridCard:    { width: '48%', aspectRatio: 1, borderRadius: Radius.md, overflow: 'hidden', position: 'relative' },
  gridDim:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,20,50,0.55)' },
  gridContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.sm, gap: 2 },
});
