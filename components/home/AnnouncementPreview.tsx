import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Radius } from '../../constants/Layout';
import { AppText, Badge, SectionHeader } from '../ui';
import { useTheme } from '../../theme/ThemeContext';
import { getDataPublic } from '../../services/ApiHandler';
import Api from '../../services/Api';

// ── Theme-aware shimmer colors ────────────────────────────────────────────────
const LIGHT_BASE = '#E8E8E0'; const LIGHT_HL = '#F5F5EE';
const DARK_BASE  = '#22263A'; const DARK_HL  = '#2E3450';

type Announcement = {
  _id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  isPinned: string;
  author: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Ngayon';
  if (days === 1) return 'Kahapon';
  if (days < 7)  return `${days} araw na ang nakalipas`;
  return `${Math.floor(days / 7)} linggo na ang nakalipas`;
}

// ── Single shimmer bar ────────────────────────────────────────────────────────
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

// ── Shimmer card ──────────────────────────────────────────────────────────────
function AnnouncementShimmerCard({ base, highlight, surface, border }: {
  base: string; highlight: string; surface: string; border: string;
}) {
  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
      <View style={[styles.unread, { backgroundColor: base }]} />
      <View style={styles.cardBody}>
        <View style={styles.topRow}>
          <ShimmerBar width={64} height={20} base={base} highlight={highlight} style={{ borderRadius: Radius.full }} />
          <ShimmerBar width={80} height={11} base={base} highlight={highlight} />
        </View>
        <ShimmerBar width="85%" height={14} base={base} highlight={highlight} style={{ marginTop: 6 }} />
        <ShimmerBar width="60%" height={14} base={base} highlight={highlight} style={{ marginTop: 4 }} />
        <ShimmerBar width="100%" height={11} base={base} highlight={highlight} style={{ marginTop: 6 }} />
        <ShimmerBar width="75%" height={11} base={base} highlight={highlight} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const AnnouncementPreview = () => {
  const { theme, mode } = useTheme();
  const base      = mode === 'dark' ? DARK_BASE  : LIGHT_BASE;
  const highlight = mode === 'dark' ? DARK_HL    : LIGHT_HL;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDataPublic({
        appName: Api.appName, moduleName: 'announcement',
        query: {}, limit: 3, skip: 0, sortBy: 'createdAt', order: 'descending',
      });
      if (data?.success === true) {
        setAnnouncements(data.data || []);
      }
    } catch (e: any) {
      console.log('[ANNOUNCEMENT PREVIEW] Error:', e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleSeeAll = useCallback(() => router.push('/(tabs)/announcements' as never), []);
  const handlePress  = useCallback((id: string) => router.push(`/announcements/${id}` as never), []);

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Mga Anunsyo" onSeeAll={handleSeeAll} />

      {loading ? (
        // 3 shimmer cards
        Array.from({ length: 3 }).map((_, i) => (
          <AnnouncementShimmerCard key={i} base={base} highlight={highlight} surface={theme.surface} border={theme.border} />
        ))
      ) : announcements.length === 0 ? null : (
        announcements.map((item) => (
          <TouchableOpacity
            key={item._id}
            onPress={() => handlePress(item._id)}
            accessible
            accessibilityLabel={item.title}
            activeOpacity={0.8}
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            {item.isPinned === 'Yes' && <View style={[styles.unread, { backgroundColor: theme.accent }]} />}
            <View style={styles.cardBody}>
              <View style={styles.topRow}>
                <Badge label={item.category} variant="gold" />
                <AppText variant="caption" color={theme.textMuted}>{timeAgo(item.date)}</AppText>
              </View>
              <AppText variant="headingSm" color={theme.primary} numberOfLines={2} style={styles.title}>
                {item.title}
              </AppText>
              <AppText variant="bodySm" color={theme.textSecondary} numberOfLines={2}>
                {item.description}
              </AppText>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap:     { paddingHorizontal: Spacing.md },
  card:     { borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm, flexDirection: 'row', overflow: 'hidden' },
  unread:   { width: 4 },
  cardBody: { flex: 1, padding: Spacing.md, gap: Spacing.xs },
  topRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:    { marginTop: 2 },
});

export default React.memo(AnnouncementPreview);
