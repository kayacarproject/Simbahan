import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Platform, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import GradientView from '../../components/ui/GradientView';
import AppText from '../../components/ui/AppText';
import BackBar from '../../components/ui/BackBar';
import WebLayout from '../../components/ui/WebLayout';
import FundCard from '../../components/donations/FundCard';
import FundShimmer from '../../components/skeletons/FundShimmer';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { useUiStore } from '../../store/uiStore';
import { useChurchStore } from '../../store/churchStore';
import { useTheme } from '../../theme/ThemeContext';
import { getDataPublic } from '../../services/ApiHandler';
import Api from '../../services/Api';

type Fund = {
  _id: string; title: string; description: string;
  goal: number; collected: number; startDate: string;
  endDate: string; gcashNumber: string; gcashName: string; isActive: string;
};

const isWeb = Platform.OS === 'web';
const keyExtractor = (item: Fund) => item._id;
const Separator = () => <View style={{ height: Spacing.md }} />;

export default function DonationsScreen() {
  const { theme } = useTheme();
  const showToast = useUiStore((s) => s.showToast);
  const donations = useChurchStore((s) => s.donations);
  const total = donations.reduce((sum, d) => sum + d.amount, 0);

  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFunds = useCallback(async () => {
    setLoading(true);
    const body = { appName: Api.appName, moduleName: 'donationfund', query: {}, limit: 10, skip: 0, sortBy: 'createdAt', order: 'descending' as const };
    console.log('[DONATIONS] Request:', body);
    try {
      const data = await getDataPublic(body);
      if (data?.success === true) {
        console.log('[DONATIONS] Response:', data.data);
        setFunds((data.data || []).filter((f: Fund) => f.isActive === 'Yes'));
      } else {
        console.log('[DONATIONS] No data:', data?.message);
        setFunds([]);
      }
    } catch (e: any) {
      const msg = e?.message === 'Session expired' ? 'Session expired. Please log in again.' : 'Hindi ma-load ang mga pondo. Subukan muli.';
      console.log('[DONATIONS] Error:', e?.response?.data || e.message);
      showToast(msg, 'error');
      setFunds([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchFunds(); }, [fetchFunds]);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<Fund>) => (
    <FundCard
      id={item._id} title={item.title} description={item.description}
      goal={item.goal} collected={item.collected}
      startDate={item.startDate} endDate={item.endDate}
      gcashNumber={item.gcashNumber} gcashName={item.gcashName}
    />
  ), []);

  const ShimmerList = (
    <View style={styles.shimmerWrap}>
      {Array.from({ length: 4 }).map((_, i) => (
        <React.Fragment key={i}>
          <FundShimmer />
          {i < 3 && <View style={{ height: Spacing.md }} />}
        </React.Fragment>
      ))}
    </View>
  );

  const EmptyState = (
    <View style={styles.emptyWrap}>
      <Ionicons name="gift-outline" size={40} color={theme.textMuted} />
      <AppText variant="bodySm" color={theme.textMuted} style={styles.emptyText}>
        Walang aktibong pondo sa ngayon.
      </AppText>
    </View>
  );

  const ListHeader = (
    <>
      <BackBar />
      <GradientView colors={[Colors.crimson, Colors.crimsonLight]} style={[styles.header, { marginHorizontal: -Spacing.md }]}>
        <AppText variant="displaySm" color={Colors.textInverse}>Mga Donasyon</AppText>
        <AppText variant="bodySm" color="rgba(255,255,255,0.75)">Suportahan ang inyong parokya</AppText>
      </GradientView>

      <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.summaryLeft}>
          <AppText variant="displayMd" color={theme.primary} style={styles.totalAmt}>
            ₱{total.toLocaleString('en-PH')}
          </AppText>
          <AppText variant="bodySm" color={theme.textMuted}>{donations.length} donasyon</AppText>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/donations/history' as never)}
          style={[styles.historyBtn, { borderColor: theme.border }]}
          accessible accessibilityLabel="Tingnan ang kasaysayan"
        >
          <AppText variant="label" color={theme.primary}>Kasaysayan</AppText>
          <Ionicons name="chevron-forward" size={14} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <AppText variant="headingSm" color={theme.primary}>Mga Aktibong Pondo</AppText>
      </View>
    </>
  );

  const listStyle = [styles.listContent, { backgroundColor: theme.background }];

  const list = loading ? (
    <FlatList data={[]} renderItem={null} ListHeaderComponent={ListHeader} ListFooterComponent={ShimmerList}
      contentContainerStyle={listStyle} showsVerticalScrollIndicator={false}
      style={{ backgroundColor: theme.background }} />
  ) : (
    <FlatList data={funds} renderItem={renderItem} keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader} ListEmptyComponent={EmptyState} ItemSeparatorComponent={Separator}
      contentContainerStyle={listStyle} showsVerticalScrollIndicator={false}
      removeClippedSubviews initialNumToRender={5} maxToRenderPerBatch={5}
      style={{ backgroundColor: theme.background }} />
  );

  if (isWeb) return <WebLayout><View style={[styles.screen, { backgroundColor: theme.background }]}>{list}</View></WebLayout>;
  return <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>{list}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen:       { flex: 1 },
  header:       { paddingTop: Spacing.lg, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.md, gap: 4 },
  summaryCard:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, margin: Spacing.md, marginBottom: 0 },
  summaryLeft:  { flex: 1, marginRight: Spacing.sm },
  totalAmt:     { lineHeight: 36 },
  historyBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderWidth: 1, borderRadius: Radius.sm, flexShrink: 0 },
  sectionHeader:{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  listContent:  { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  shimmerWrap:  { gap: 0 },
  emptyWrap:    { alignItems: 'center', marginTop: Spacing.xl, gap: Spacing.sm },
  emptyText:    { textAlign: 'center' },
});
