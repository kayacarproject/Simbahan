import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, ScrollView, Pressable, StyleSheet, Platform, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppText from '../../components/ui/AppText';
import WebLayout from '../../components/ui/WebLayout';
import DonationHistoryShimmer from '../../components/skeletons/DonationHistoryShimmer';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { useUiStore } from '../../store/uiStore';
import { useTheme } from '../../theme/ThemeContext';
import { getDataPublic } from '../../services/ApiHandler';
import Api from '../../services/Api';

type Donation = {
  _id: string; memberName: string; amount: number; currency: string;
  category: string; date: string; method: string; notes: string; isAnonymous: string;
};

const isWeb = Platform.OS === 'web';
const keyExtractor = (item: Donation) => item._id;
const Separator = () => <View style={{ height: Spacing.sm }} />;

const METHOD_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  cash: 'cash-outline', gcash: 'phone-portrait-outline', bank_transfer: 'business-outline',
};
const METHOD_COLOR: Record<string, string> = {
  cash: Colors.sage, gcash: Colors.navy, bank_transfer: Colors.gold,
};
const CATEGORIES = ['Lahat', 'Building Fund', 'Sunday Collection', 'Mass Intention', 'Candle Offering', 'Baptism Fee', 'Fiesta Fund'];

export default function DonationHistoryScreen() {
  const { theme } = useTheme();
  const showToast = useUiStore((s) => s.showToast);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Lahat');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const body = { appName: Api.appName, moduleName: 'donation', query: {}, limit: 10, skip: 0, sortBy: 'createdAt', order: 'descending' as const };
    console.log('[DONATION HISTORY] Request:', body);
    try {
      const data = await getDataPublic(body);
      if (data?.success === true) {
        console.log('[DONATION HISTORY] Response:', data.data);
        setDonations(data.data || []);
      } else {
        console.log('[DONATION HISTORY] No data:', data?.message);
        setDonations([]);
      }
    } catch (e: any) {
      const msg = e?.message === 'Session expired' ? 'Session expired. Please log in again.' : 'Hindi ma-load ang kasaysayan. Subukan muli.';
      console.log('[DONATION HISTORY] Error:', e?.response?.data || e.message);
      showToast(msg, 'error');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = useMemo(() =>
    activeCategory === 'Lahat' ? donations : donations.filter((d) => d.category === activeCategory),
    [donations, activeCategory],
  );
  const total = useMemo(() => filtered.reduce((sum, d) => sum + d.amount, 0), [filtered]);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<Donation>) => {
    const method = item.method ?? 'cash';
    const icon = METHOD_ICON[method] ?? 'cash-outline';
    const iconColor = METHOD_COLOR[method] ?? Colors.sage;
    const displayName = item.isAnonymous === 'Yes' ? 'Anonymous' : item.memberName;
    return (
      <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.iconWrap, { backgroundColor: iconColor + '18' }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.rowLeft}>
          <AppText variant="headingSm" color={theme.text} numberOfLines={1}>{item.category}</AppText>
          <AppText variant="caption" color={theme.textMuted}>{displayName}</AppText>
          <AppText variant="caption" color={theme.textMuted}>{item.date}</AppText>
          {!!item.notes && <AppText variant="caption" color={theme.textMuted} numberOfLines={1}>{item.notes}</AppText>}
        </View>
        <View style={styles.rowRight}>
          <AppText variant="headingSm" color={theme.accent}>₱{item.amount.toLocaleString('en-PH')}</AppText>
          <AppText variant="caption" color={theme.textMuted} style={styles.methodLabel}>{method.replace('_', ' ')}</AppText>
        </View>
      </View>
    );
  }, [theme]);

  const ShimmerList = (
    <View style={styles.shimmerWrap}>
      {Array.from({ length: 6 }).map((_, i) => (
        <React.Fragment key={i}>
          <DonationHistoryShimmer />
          {i < 5 && <View style={{ height: Spacing.sm }} />}
        </React.Fragment>
      ))}
    </View>
  );

  const EmptyState = (
    <View style={styles.emptyWrap}>
      <Ionicons name="receipt-outline" size={40} color={theme.textMuted} />
      <AppText variant="bodySm" color={theme.textMuted} style={styles.emptyText}>Walang kasaysayan ng donasyon.</AppText>
    </View>
  );

  const ListHeader = (
    <>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessible accessibilityLabel="Bumalik">
          <Ionicons name="arrow-back" size={20} color={theme.primary} />
          <AppText variant="bodyMd" color={theme.primary}>Bumalik</AppText>
        </TouchableOpacity>
        <AppText variant="headingMd" color={theme.primary}>Kasaysayan ng Donasyon</AppText>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View>
          <AppText variant="displaySm" color={theme.primary}>₱{total.toLocaleString('en-PH')}</AppText>
          <AppText variant="bodySm" color={theme.textMuted}>{filtered.length} kabuuang donasyon</AppText>
        </View>
        <View style={styles.summaryBadges}>
          {(['cash', 'gcash', 'bank_transfer'] as const).map((m) => {
            const count = filtered.filter((d) => d.method === m).length;
            if (!count) return null;
            return (
              <View key={m} style={[styles.methodBadge, { backgroundColor: METHOD_COLOR[m] + '18' }]}>
                <Ionicons name={METHOD_ICON[m]} size={12} color={METHOD_COLOR[m]} />
                <AppText variant="caption" color={METHOD_COLOR[m]}>{count}</AppText>
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
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

  const listStyle = [styles.listContent, { backgroundColor: theme.background }];

  const list = loading ? (
    <FlatList data={[]} renderItem={null} ListHeaderComponent={ListHeader} ListFooterComponent={ShimmerList}
      contentContainerStyle={listStyle} showsVerticalScrollIndicator={false}
      style={{ backgroundColor: theme.background }} />
  ) : (
    <FlatList data={filtered} renderItem={renderItem} keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader} ListEmptyComponent={EmptyState} ItemSeparatorComponent={Separator}
      contentContainerStyle={listStyle} showsVerticalScrollIndicator={false}
      removeClippedSubviews initialNumToRender={10} maxToRenderPerBatch={10}
      style={{ backgroundColor: theme.background }} />
  );

  if (isWeb) return <WebLayout><View style={[styles.screen, { backgroundColor: theme.background }]}>{list}</View></WebLayout>;
  return <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>{list}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen:        { flex: 1 },
  topBar:        { padding: Spacing.md, gap: Spacing.sm },
  backBtn:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  summaryCard:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, gap: 4 },
  summaryBadges: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', justifyContent: 'flex-end' },
  methodBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  filterRow:     { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm },
  pill:          { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full },
  listContent:   { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  row:           { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  iconWrap:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowLeft:       { flex: 1, gap: 2 },
  rowRight:      { alignItems: 'flex-end', gap: 2 },
  methodLabel:   { textTransform: 'capitalize' },
  shimmerWrap:   { gap: 0 },
  emptyWrap:     { alignItems: 'center', marginTop: Spacing.xl, gap: Spacing.sm },
  emptyText:     { textAlign: 'center' },
});
