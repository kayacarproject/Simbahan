import React, { useCallback, useEffect, useState } from 'react';
import {
  View, TouchableOpacity, FlatList, StyleSheet,
  ListRenderItemInfo, useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Img from '../ui/Img';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { AppText, Badge, SectionHeader } from '../ui';
import { useTheme } from '../../theme/ThemeContext';
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

const PLACEHOLDER = 'https://placehold.co/440x300/1A2B5E/FFFFFF/png?text=Kaganapan';
const CARD_W = 220;
const CARD_H = 150;

// ── Shimmer colors ────────────────────────────────────────────────────────────
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

function EventShimmerCard({ base, highlight }: { base: string; highlight: string }) {
  return (
    <View style={[styles.card, { backgroundColor: base, overflow: 'hidden' }]}>
      <ShimmerBar width={CARD_W} height={CARD_H} base={base} highlight={highlight} style={{ borderRadius: 0 }} />
      <View style={styles.shimmerContent}>
        <ShimmerBar width={60} height={18} base={highlight} highlight={base} style={{ borderRadius: Radius.full }} />
        <ShimmerBar width="85%" height={14} base={highlight} highlight={base} style={{ marginTop: 6 }} />
        <ShimmerBar width="55%" height={11} base={highlight} highlight={base} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

// ── Event card ────────────────────────────────────────────────────────────────
const EventCard = React.memo(({ item }: { item: ApiEvent }) => {
  const handlePress = useCallback(() => router.push('/events' as never), []);
  const imageUri = item.image || PLACEHOLDER;

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessible
      accessibilityLabel={item.title}
      activeOpacity={0.85}
      style={styles.card}
    >
      <Img source={{ uri: imageUri }} style={styles.image} contentFit="cover" transition={200} />
      <View style={styles.overlay} />
      <View style={styles.cardContent}>
        <Badge label={item.category} variant="gold" />
        <AppText variant="headingSm" color={Colors.textInverse} numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        <View style={styles.dateRow}>
          <AppText variant="caption" color={Colors.goldLight}>{item.date}</AppText>
          {!!item.time && <AppText variant="caption" color={Colors.goldLight}>  ·  {item.time}</AppText>}
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ── Main component ────────────────────────────────────────────────────────────
const EventPreview = () => {
  const { mode } = useTheme();
  const base      = mode === 'dark' ? DARK_BASE : LIGHT_BASE;
  const highlight = mode === 'dark' ? DARK_HL   : LIGHT_HL;

  const [events,  setEvents]  = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDataPublic({
        appName: Api.appName, moduleName: 'event',
        query: {}, limit: 10, skip: 0, sortBy: 'createdAt', order: 'descending',
      });
      if (data?.success === true) {
        console.log('[EVENT PREVIEW] Response:', data.data);
        setEvents(data.data || []);
      } else {
        console.log('[EVENT PREVIEW] No data:', data?.message);
      }
    } catch (e: any) {
      console.log('[EVENT PREVIEW] Error:', e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSeeAll = useCallback(() => router.push('/events' as never), []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ApiEvent>) => <EventCard item={item} />,
    [],
  );

  const shimmerData = [1, 2, 3];

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <SectionHeader title="Mga Kaganapan" onSeeAll={handleSeeAll} />
      </View>

      {loading ? (
        <FlatList
          data={shimmerData}
          keyExtractor={(i) => String(i)}
          renderItem={() => <EventShimmerCard base={base} highlight={highlight} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          scrollEnabled={false}
        />
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          removeClippedSubviews
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap:           { marginBottom: Spacing.md },
  header:         { paddingHorizontal: Spacing.md },
  list:           { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  card:           { width: CARD_W, height: CARD_H, borderRadius: Radius.md, overflow: 'hidden', position: 'relative' },
  image:          { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  overlay:        { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,20,50,0.55)' },
  cardContent:    { flex: 1, padding: Spacing.sm, justifyContent: 'flex-end', gap: Spacing.xs },
  title:          { lineHeight: 20 },
  dateRow:        { flexDirection: 'row', alignItems: 'center' },
  shimmerContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.sm, gap: 4 },
});

export default React.memo(EventPreview);
