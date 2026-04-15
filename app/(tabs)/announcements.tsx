import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, FlatList, ScrollView, Pressable, TouchableOpacity,
  StyleSheet, ListRenderItemInfo, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AnnouncementCard from '../../components/ui/AnnouncementCard';
import GradientView from '../../components/ui/GradientView';
import AppText from '../../components/ui/AppText';
import WebLayout from '../../components/ui/WebLayout';
import AnnouncementShimmer from '../../components/skeletons/AnnouncementShimmer';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useUiStore } from '../../store/uiStore';
import { useTheme } from '../../theme/ThemeContext';
import { getDataPublic } from '../../services/ApiHandler';
import Api from '../../services/Api';

type Announcement = {
  _id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  image?: string | null;
  isPinned: string;
  author: string;
};

const CATEGORIES = ['Lahat', 'Mass', 'Event', 'Sacrament', 'Youth', 'Ministry'];
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x300/1A2B5E/FFFFFF/png?text=Anunsyo';
const Separator = () => <View style={{ height: 8 }} />;
const keyExtractor = (item: Announcement) => item._id;
const isWeb = Platform.OS === 'web';

export default function AnnouncementsTab() {
  const { theme } = useTheme();
  const openSidebar = useUiStore((s) => s.openSidebar);
  const { isWeb: isWebBreakpoint } = useBreakpoint();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('Lahat');
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    const body = {
      appName: Api.appName, moduleName: 'announcement',
      query: {}, limit: 10, skip: 0, sortBy: 'createdAt', order: 'descending' as const,
    };
    console.log('[ANNOUNCEMENTS] Request:', body);
    try {
      const data = await getDataPublic(body);
      if (data?.success === true) {
        console.log('[ANNOUNCEMENTS] Response:', data.data);
        setAnnouncements(data.data || []);
      } else {
        console.log('[ANNOUNCEMENTS] No data:', data?.message);
        setAnnouncements([]);
      }
    } catch (e: any) {
      if (e?.message === 'Session expired') {
        console.log('[ANNOUNCEMENTS] Error: Session expired');
      } else {
        console.log('[ANNOUNCEMENTS] Error:', e?.response?.data || e.message);
      }
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const filtered = useMemo(() =>
    activeCategory === 'Lahat'
      ? announcements
      : announcements.filter((a) => a.category === activeCategory),
    [announcements, activeCategory],
  );

  const handlePress = useCallback((id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
    router.push(`/announcements/${id}` as never);
  }, []);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<Announcement>) => (
    <AnnouncementCard
      id={item._id}
      title={item.title}
      category={item.category}
      date={item.date}
      description={item.description}
      image={item.image || PLACEHOLDER_IMAGE}
      isPinned={item.isPinned === 'Yes'}
      isRead={readIds.has(item._id)}
      publishedBy={item.author}
      onPress={handlePress}
    />
  ), [handlePress, readIds]);

  const ListHeader = (
    <>
      <GradientView colors={[Colors.navyDark, Colors.navy]} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          {!isWeb && (
            <TouchableOpacity onPress={openSidebar} style={styles.menuBtn} activeOpacity={0.7} accessible accessibilityLabel="Open menu">
              <Ionicons name="menu" size={24} color={Colors.textInverse} />
            </TouchableOpacity>
          )}
          <View style={styles.headerText}>
            <AppText variant="displaySm" color={Colors.textInverse} style={styles.headerTitle}>
              Mga Anunsyo
            </AppText>
            <AppText variant="bodySm" color={Colors.goldLight}>Parish announcements &amp; notices</AppText>
          </View>
        </View>
      </GradientView>

      {/* Category filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterRow, { backgroundColor: theme.background }]}>
        {CATEGORIES.map((cat) => {
          const active = cat === activeCategory;
          return (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.pill,
                active
                  ? { backgroundColor: theme.primary }
                  : { backgroundColor: theme.surface2 },
              ]}
              accessible
              accessibilityLabel={cat}
            >
              <AppText variant="label" color={active ? Colors.textInverse : theme.textMuted}>
                {cat}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );

  const ShimmerList = (
    <View style={[styles.shimmerWrap, { backgroundColor: theme.background }]}>
      {Array.from({ length: 5 }).map((_, i) => (
        <React.Fragment key={i}>
          <AnnouncementShimmer />
          {i < 4 && <View style={{ height: 8 }} />}
        </React.Fragment>
      ))}
    </View>
  );

  const ListEmpty = !loading ? (
    <View style={styles.emptyWrap}>
      <Ionicons name="newspaper-outline" size={40} color={theme.textMuted} />
      <AppText variant="bodySm" color={theme.textMuted} style={styles.emptyText}>
        Walang anunsyo sa kategoryang ito.
      </AppText>
    </View>
  ) : null;

  const listContentStyle = [
    styles.listContent,
    { backgroundColor: theme.background },
    isWebBreakpoint && styles.listContentWeb,
  ];

  const list = loading ? (
    <FlatList
      data={[]}
      renderItem={null}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ShimmerList}
      contentContainerStyle={listContentStyle}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: theme.background }}
    />
  ) : (
    <FlatList
      data={filtered}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={ListEmpty}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={listContentStyle}
      numColumns={isWebBreakpoint ? 2 : 1}
      columnWrapperStyle={isWebBreakpoint ? styles.columnWrapper : undefined}
      key={isWebBreakpoint ? 'web' : 'mobile'}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={5}
      style={{ backgroundColor: theme.background }}
    />
  );

  if (isWeb) {
    return (
      <WebLayout>
        <View style={[styles.screen, { backgroundColor: theme.background }]}>{list}</View>
      </WebLayout>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>
      {list}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:          { flex: 1 },
  headerGradient:  { paddingTop: Spacing.lg, paddingBottom: Spacing.xl, marginHorizontal: -Spacing.md },
  headerRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingHorizontal: Spacing.md },
  menuBtn:         { padding: Spacing.xs, marginTop: 2 },
  headerText:      { flex: 1 },
  headerTitle:     { marginBottom: 4 },
  filterRow:       { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm, marginHorizontal: -Spacing.md },
  pill:            { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full },
  listContent:     { padding: Spacing.md, paddingBottom: Spacing.xl },
  listContentWeb:  { paddingHorizontal: Spacing.xl },
  columnWrapper:   { gap: Spacing.md },
  shimmerWrap:     { padding: Spacing.md },
  emptyWrap:       { alignItems: 'center', marginTop: Spacing.xl, gap: Spacing.sm },
  emptyText:       { textAlign: 'center' },
});
