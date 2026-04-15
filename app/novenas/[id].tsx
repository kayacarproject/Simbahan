import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import WebLayout from '../../components/ui/WebLayout';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { useModule09Store } from '../../store/module09Store';
import { useUiStore } from '../../store/uiStore';

const isWeb = Platform.OS === 'web';

export default function NovenaDetailScreen() {
  const { id, patron, feastDate, description, duration } = useLocalSearchParams<{
    id: string;
    patron: string;
    feastDate: string;
    description: string;
    duration: string;
  }>();

  const novenaProgress = useModule09Store((s) => s.novenaProgress);
  const markPrayed = useModule09Store((s) => s.markPrayed);
  const showToast = useUiStore((s) => s.showToast);

  const totalDays = Number(duration) || 9;

  const completedDays = useMemo(
    () => novenaProgress.find((p) => p.novenaId === id)?.completedDays ?? [],
    [novenaProgress, id]
  );

  const [activeDay, setActiveDay] = useState(1);

  const handleMarkPrayed = useCallback(() => {
    if (!id) return;
    markPrayed(id, activeDay);
    showToast(`Araw ${activeDay} — naitala ang dasal!`, 'success');
    if (activeDay < totalDays) setActiveDay((d) => d + 1);
  }, [id, activeDay, markPrayed, showToast, totalDays]);

  if (!id || !patron) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnPlain}>
          <Ionicons name="arrow-back" size={20} color={Colors.navy} />
          <AppText variant="bodyMd" color={Colors.navy}>Bumalik</AppText>
        </TouchableOpacity>
        <AppText variant="bodyMd" color={Colors.textMuted} style={{ padding: Spacing.lg }}>
          Hindi nahanap ang nobena.
        </AppText>
      </SafeAreaView>
    );
  }

  const content = (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.heroWrap}>
        <View style={styles.heroGradient}>
          <Ionicons name="book-outline" size={64} color={Colors.gold} />
        </View>
        <View style={styles.heroOverlay}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessible accessibilityLabel="Bumalik">
            <Ionicons name="arrow-back" size={20} color={Colors.textInverse} />
          </TouchableOpacity>
          <View style={styles.heroBottom}>
            <View style={styles.feastBadge}>
              <AppText variant="caption" color={Colors.navy}>{feastDate}</AppText>
            </View>
            <AppText variant="displaySm" color={Colors.textInverse}>{patron}</AppText>
          </View>
        </View>
      </View>

      {/* Info card */}
      <View style={styles.card}>
        <AppText variant="bodyMd" color={Colors.textSecondary}>{description}</AppText>
        <View style={styles.traditionNote}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.gold} />
          <AppText variant="caption" color={Colors.textMuted} style={{ flex: 1 }}>
            Ang nobena ay isang {totalDays}-araw na panalangin na may espesyal na intensyon.
          </AppText>
        </View>
      </View>

      {/* Day selector */}
      <View style={styles.card}>
        <AppText variant="headingSm" color={Colors.navy}>Pumili ng Araw</AppText>
        <View style={styles.dayRow}>
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
            const done = completedDays.includes(day);
            const active = day === activeDay;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setActiveDay(day)}
                style={[
                  styles.dayPill,
                  done && styles.dayPillDone,
                  active && !done && styles.dayPillActive,
                ]}
                accessible
                accessibilityLabel={`Araw ${day}`}
              >
                {done ? (
                  <Ionicons name="checkmark" size={14} color={Colors.textInverse} />
                ) : (
                  <AppText variant="label" color={active ? Colors.textInverse : Colors.textMuted}>
                    {day}
                  </AppText>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Prayer placeholder */}
      <View style={styles.card}>
        <AppText variant="headingSm" color={Colors.navy}>Araw {activeDay} — Panalangin</AppText>
        <View style={styles.meditationNote}>
          <AppText variant="caption" color={Colors.gold}>✦ Meditasyon</AppText>
          <AppText variant="bodySm" color={Colors.textSecondary}>
            Huminga nang malalim at ihanda ang inyong puso sa panalangin.
          </AppText>
        </View>
      </View>

      <View style={styles.card}>
        <AppText variant="caption" color={Colors.gold}>✦ Panalangin</AppText>
        <AppText variant="bodyMd" color={Colors.textPrimary} style={styles.prayerText}>
          O {patron}, pakinggan ang aming mga panalangin sa araw na ito. Ipanalangin mo kami sa harapan ng Diyos at tulungan mo kaming maging tapat sa aming pananampalataya.
        </AppText>
        <View style={styles.scriptureRef}>
          <Ionicons name="book-outline" size={14} color={Colors.textMuted} />
          <AppText variant="caption" color={Colors.textMuted} style={{ marginLeft: 4 }}>
            Mateo 7:7 — "Humingi kayo at kayo'y bibigyan..."
          </AppText>
        </View>
      </View>

      {/* Navigation + mark prayed */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => setActiveDay((d) => Math.max(1, d - 1))}
          style={[styles.navBtn, activeDay === 1 && styles.navBtnDisabled]}
          disabled={activeDay === 1}
          accessible
          accessibilityLabel="Nakaraang araw"
        >
          <Ionicons name="chevron-back" size={18} color={activeDay === 1 ? Colors.textMuted : Colors.navy} />
          <AppText variant="label" color={activeDay === 1 ? Colors.textMuted : Colors.navy}>Nakaraan</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveDay((d) => Math.min(totalDays, d + 1))}
          style={[styles.navBtn, activeDay === totalDays && styles.navBtnDisabled]}
          disabled={activeDay === totalDays}
          accessible
          accessibilityLabel="Susunod na araw"
        >
          <AppText variant="label" color={activeDay === totalDays ? Colors.textMuted : Colors.navy}>Susunod</AppText>
          <Ionicons name="chevron-forward" size={18} color={activeDay === totalDays ? Colors.textMuted : Colors.navy} />
        </TouchableOpacity>
      </View>

      <View style={styles.markWrap}>
        <AppButton
          label={completedDays.includes(activeDay) ? '✓ Naitala na' : 'Markahan bilang Nanalangin'}
          onPress={handleMarkPrayed}
          variant={completedDays.includes(activeDay) ? 'ghost' : 'primary'}
          disabled={completedDays.includes(activeDay)}
        />
      </View>
    </ScrollView>
  );

  if (isWeb) return <WebLayout>{content}</WebLayout>;
  return <SafeAreaView style={styles.screen} edges={['top']}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  scroll: { paddingBottom: Spacing.xxl },
  heroWrap: { height: 220, position: 'relative' },
  heroGradient: {
    width: '100%',
    height: 220,
    backgroundColor: Colors.navyDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: { gap: Spacing.xs },
  feastBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  card: {
    backgroundColor: Colors.textInverse,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    margin: Spacing.md,
    marginBottom: 0,
    gap: Spacing.sm,
  },
  traditionNote: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  dayPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cream2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayPillActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  dayPillDone: { backgroundColor: Colors.sage, borderColor: Colors.sage },
  meditationNote: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: 4,
  },
  prayerText: { lineHeight: 24 },
  scriptureRef: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: Spacing.md,
    marginBottom: 0,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.textInverse,
  },
  navBtnDisabled: { opacity: 0.4 },
  markWrap: { margin: Spacing.md },
  backBtnPlain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
  },
});
