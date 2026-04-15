import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import GradientView from '../../components/ui/GradientView';
import AppText from '../../components/ui/AppText';
import BackBar from '../../components/ui/BackBar';
import WebLayout from '../../components/ui/WebLayout';
import NovenaCard from '../../components/novenas/NovenaCard';
import NovenaCardShimmer from '../../components/skeletons/NovenaCardShimmer';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { useModule09Store } from '../../store/module09Store';
import { useUiStore } from '../../store/uiStore';
import { useTheme } from '../../theme/ThemeContext';
import { getDataPublic } from '../../services/ApiHandler';
import Api from '../../services/Api';
import novenasData from '../../data/novenas.json';

type Novena = {
  _id: string;
  title: string;
  patron: string;
  feastDate: string;
  duration: number;
  description: string;
  isActive: string;
};

const isWeb = Platform.OS === 'web';

const DEVOTIONS = [
  { id: 'rosary',  label: 'Rosaryo', icon: 'ellipse-outline'  as const, route: '/novenas/rosary' },
  { id: 'chaplet', label: 'Chaplet', icon: 'infinite-outline' as const, route: '/novenas/rosary' },
  { id: 'angelus', label: 'Angelus', icon: 'sunny-outline'    as const, route: '/novenas/rosary' },
  { id: 'litany',  label: 'Litanya', icon: 'list-outline'     as const, route: '/novenas/rosary' },
];

export default function NovenasScreen() {
  const { theme } = useTheme();
  const novenaProgress = useModule09Store((s) => s.novenaProgress);
  const showToast = useUiStore((s) => s.showToast);
  const featured = novenasData[0];

  const [novenas, setNovenas] = useState<Novena[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNovenas = useCallback(async () => {
    setLoading(true);
    const body = {
      appName: Api.appName, moduleName: 'novena',
      query: {}, limit: 10, skip: 0, sortBy: 'createdAt', order: 'descending' as const,
    };
    console.log('[NOVENAS] Request:', body);
    try {
      const data = await getDataPublic(body);
      if (data?.success === true) {
        console.log('[NOVENAS] Response:', data.data);
        setNovenas(data.data || []);
      } else {
        console.log('[NOVENAS] No data:', data?.message);
        setNovenas([]);
      }
    } catch (e: any) {
      const msg = e?.message === 'Session expired'
        ? 'Session expired. Please log in again.'
        : 'Hindi ma-load ang mga nobena. Subukan muli.';
      console.log('[NOVENAS] Error:', e?.response?.data || e.message);
      showToast(msg, 'error');
      setNovenas([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchNovenas(); }, [fetchNovenas]);

  const getProgress = useCallback(
    (id: string) => novenaProgress.find((p) => p.novenaId === id)?.completedDays ?? [],
    [novenaProgress],
  );

  const content = (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <BackBar />

      {/* Header gradient — always gold, intentional */}
      <GradientView colors={[Colors.gold, Colors.goldLight]} style={styles.header}>
        <AppText variant="displaySm" color={Colors.navyDark}>Mga Nobena at Dasal</AppText>
        <AppText variant="bodySm" color={Colors.navyDark} style={{ opacity: 0.7 }}>
          Prayers &amp; devotions
        </AppText>
      </GradientView>

      {/* Featured novena */}
      <View style={styles.section}>
        <AppText variant="headingSm" color={theme.primary} style={styles.sectionTitle}>Itinatampok</AppText>
        <GradientView colors={[Colors.crimson, Colors.crimsonLight]} style={styles.featuredCard}>
          <AppText variant="caption" color="rgba(255,255,255,0.7)">Kasalukuyang Nobena</AppText>
          <AppText variant="headingMd" color={Colors.textInverse}>{featured.patron}</AppText>
          <View style={styles.featuredMeta}>
            <View style={[styles.dayBadge, { backgroundColor: theme.surface }]}>
              <AppText variant="label" color={Colors.crimson}>Araw 1 ng 9</AppText>
            </View>
            <AppText variant="caption" color="rgba(255,255,255,0.8)">{featured.feastDate}</AppText>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/novenas/${featured.id}` as never)}
            style={[styles.continueBtn, { backgroundColor: theme.surface }]}
            accessible
            accessibilityLabel="Ituloy ang nobena"
          >
            <AppText variant="label" color={Colors.crimson}>Ituloy →</AppText>
          </TouchableOpacity>
        </GradientView>
      </View>

      {/* Novena list */}
      <View style={styles.section}>
        <AppText variant="headingSm" color={theme.primary} style={styles.sectionTitle}>Lahat ng Nobena</AppText>
        <View style={styles.list}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <NovenaCardShimmer key={i} />)
          ) : novenas.length === 0 ? (
            <AppText variant="bodySm" color={theme.textMuted}>Walang nobena sa ngayon.</AppText>
          ) : (
            novenas.map((n) => (
              <NovenaCard
                key={n._id}
                id={n._id}
                patron={n.patron}
                feastDate={n.feastDate}
                description={n.description}
                duration={n.duration}
                completedDays={getProgress(n._id)}
              />
            ))
          )}
        </View>
      </View>

      {/* Devotions grid */}
      <View style={styles.section}>
        <AppText variant="headingSm" color={theme.primary} style={styles.sectionTitle}>Mga Debosyon</AppText>
        <View style={styles.grid}>
          {DEVOTIONS.map((d) => (
            <TouchableOpacity
              key={d.id}
              onPress={() => router.push(d.route as never)}
              style={[styles.devotionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              accessible
              accessibilityLabel={d.label}
              activeOpacity={0.8}
            >
              <Ionicons name={d.icon} size={28} color={theme.accent} />
              <AppText variant="label" color={theme.primary} style={styles.devotionLabel}>{d.label}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  if (isWeb) return <WebLayout>{content}</WebLayout>;
  return <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen:       { flex: 1 },
  scroll:       { paddingBottom: Spacing.xxl },
  header:       { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl, gap: 4 },
  section:      { padding: Spacing.md, gap: Spacing.sm },
  sectionTitle: { marginBottom: 4 },
  featuredCard: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dayBadge:     { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  continueBtn:  { alignSelf: 'flex-start', borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, marginTop: Spacing.xs },
  list:         { gap: Spacing.sm },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  devotionCard: { flex: 1, minWidth: '45%', borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', gap: Spacing.sm },
  devotionLabel:{ textAlign: 'center' },
});
