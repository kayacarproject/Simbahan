import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientView from '../../components/ui/GradientView';
import AppText from '../../components/ui/AppText';
import BackBar from '../../components/ui/BackBar';
import WebLayout from '../../components/ui/WebLayout';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { useUiStore } from '../../store/uiStore';

const isWeb = Platform.OS === 'web';

const HOLY_DAYS = [
  {
    id: 'palm',
    day: 'Palm Sunday',
    tagalog: 'Linggo ng Palaspas',
    color: Colors.sage,
    fasting: false,
    description: 'Ipinagdiriwang ang pagpasok ni Hesus sa Jerusalem. Ang mga tao ay nagwagayway ng mga palaspas.',
    schedule: 'Misa ng Palaspas: 6AM, 8AM, 10AM, 12NN, 6PM',
    traditions: 'Pagpapala ng mga palaspas. Prusisyon bago ang Misa.',
  },
  {
    id: 'thursday',
    day: 'Holy Thursday',
    tagalog: 'Huwebes Santo',
    color: Colors.gold,
    fasting: false,
    description: 'Huling Hapunan ni Hesus kasama ang Kanyang mga alagad. Institusyon ng Eukaristiya at Pagpapari.',
    schedule: 'Misa ng Huling Hapunan: 6PM. Visita Iglesia pagkatapos.',
    traditions: 'Paghuhugas ng paa. Reposisyon ng Santissimo Sacramento.',
  },
  {
    id: 'friday',
    day: 'Good Friday',
    tagalog: 'Biyernes Santo',
    color: Colors.crimson,
    fasting: true,
    description: 'Pagpapaalaala sa pagpapasakit at kamatayan ni Hesukristo sa krus para sa ating kaligtasan.',
    schedule: 'Serbisyo ng Tatlong Oras: 12NN–3PM. Prusisyon ng Santo Entierro: 6PM.',
    traditions: 'Araw ng pag-aayuno at abstinensya. Visita Iglesia. Pagninilay sa Pitong Salita.',
  },
  {
    id: 'saturday',
    day: 'Black Saturday',
    tagalog: 'Sabado de Gloria',
    color: Colors.textMuted,
    fasting: false,
    description: 'Araw ng katahimikan at pagninilay. Hinihintay ang Muling Pagkabuhay ni Kristo.',
    schedule: 'Vigilia Pascual: 8PM o 10PM.',
    traditions: 'Pagpapala ng apoy at kandila. Pagbabasa ng mga hula. Pagbibinyag ng mga katekumeno.',
  },
  {
    id: 'easter',
    day: 'Easter Sunday',
    tagalog: 'Linggo ng Pagkabuhay',
    color: Colors.sage,
    fasting: false,
    description: 'Ipinagdiriwang ang Muling Pagkabuhay ni Hesukristo — pinakamahalagang kapistahan ng Simbahang Katoliko.',
    schedule: 'Salubong: 5AM. Misa: 6AM, 8AM, 10AM, 12NN, 6PM.',
    traditions: 'Salubong — pagtatagpo ng imahen ni Kristo at ng Mahal na Ina.',
  },
];

const CHURCHES = [
  'Quiapo Church (Minor Basilica of the Black Nazarene)',
  'San Sebastian Basilica',
  'San Agustin Church (Intramuros)',
  'Manila Cathedral',
  'Malate Church',
  'Paco Church',
  'Ermita Church',
];

const VISITA_PRAYER = 'Panginoon, habang binibisita namin ang mga simbahang ito, nawa\'y mapalalim ang aming pananampalataya at pagmamahal sa Inyo. Amen.';

function HolyDayCard({ item }: { item: typeof HOLY_DAYS[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.dayCard}>
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        style={styles.dayHeader}
        accessible
        accessibilityLabel={item.day}
      >
        <View style={[styles.dayDot, { backgroundColor: item.color }]} />
        <View style={{ flex: 1 }}>
          <AppText variant="headingSm" color={Colors.navy}>{item.day}</AppText>
          <AppText variant="caption" color={Colors.textMuted}>{item.tagalog}</AppText>
        </View>
        {item.fasting && (
          <View style={styles.fastingBadge}>
            <AppText variant="caption" color={Colors.crimson}>Pag-aayuno</AppText>
          </View>
        )}
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
      </TouchableOpacity>
      {open && (
        <View style={styles.dayBody}>
          <AppText variant="bodyMd" color={Colors.textSecondary}>{item.description}</AppText>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color={Colors.gold} />
            <AppText variant="bodySm" color={Colors.textPrimary} style={{ flex: 1 }}>{item.schedule}</AppText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="star-outline" size={14} color={Colors.gold} />
            <AppText variant="bodySm" color={Colors.textPrimary} style={{ flex: 1 }}>{item.traditions}</AppText>
          </View>
        </View>
      )}
    </View>
  );
}

export default function HolyWeekScreen() {
  const showToast = useUiStore((s) => s.showToast);
  const [visitaStarted, setVisitaStarted] = useState(false);

  const handleVisita = useCallback(() => {
    setVisitaStarted(true);
    showToast('Simulan ang Visita Iglesia — Maligayang paglalakbay!', 'info');
  }, [showToast]);

  const content = (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <BackBar />
      <GradientView colors={[Colors.crimson, Colors.navy]} style={styles.header}>
        <AppText variant="displaySm" color={Colors.textInverse}>Mahal na Araw</AppText>
        <AppText variant="bodySm" color="rgba(255,255,255,0.75)">Holy Week Guide</AppText>
      </GradientView>

      {/* Timeline */}
      <View style={styles.section}>
        <AppText variant="headingSm" color={Colors.navy} style={styles.sectionTitle}>
          Mga Araw ng Mahal na Araw
        </AppText>
        <View style={styles.timeline}>
          {HOLY_DAYS.map((d, i) => (
            <View key={d.id} style={styles.timelineItem}>
              {i < HOLY_DAYS.length - 1 && <View style={styles.timelineLine} />}
              <HolyDayCard item={d} />
            </View>
          ))}
        </View>
      </View>

      {/* Visita Iglesia */}
      <View style={styles.section}>
        <View style={styles.visitaCard}>
          <View style={styles.visitaHeader}>
            <Ionicons name="navigate-outline" size={20} color={Colors.crimson} />
            <AppText variant="headingSm" color={Colors.crimson}>Visita Iglesia</AppText>
          </View>
          <AppText variant="bodySm" color={Colors.textSecondary}>
            Bisitahin ang pitong simbahan sa Biyernes Santo bilang pagpapahayag ng pananampalataya.
          </AppText>
          <View style={styles.churchList}>
            {CHURCHES.map((c, i) => (
              <View key={c} style={styles.churchRow}>
                <View style={styles.churchNum}>
                  <AppText variant="label" color={Colors.textInverse}>{i + 1}</AppText>
                </View>
                <AppText variant="bodySm" color={Colors.textPrimary} style={{ flex: 1 }}>{c}</AppText>
              </View>
            ))}
          </View>
          {visitaStarted && (
            <View style={styles.visitaPrayer}>
              <AppText variant="caption" color={Colors.gold}>✦ Panalangin</AppText>
              <AppText variant="bodySm" color={Colors.textSecondary} style={{ fontStyle: 'italic' }}>
                {VISITA_PRAYER}
              </AppText>
            </View>
          )}
          <TouchableOpacity
            onPress={handleVisita}
            style={styles.visitaBtn}
            accessible
            accessibilityLabel="Simulan ang Visita Iglesia"
          >
            <Ionicons name="walk-outline" size={18} color={Colors.textInverse} />
            <AppText variant="label" color={Colors.textInverse}>
              {visitaStarted ? 'Ipinagpapatuloy...' : 'Simulan ang Visita'}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  if (isWeb) return <WebLayout>{content}</WebLayout>;
  return <SafeAreaView style={styles.screen} edges={['top']}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  scroll: { paddingBottom: Spacing.xxl },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl, gap: 4 },
  section: { padding: Spacing.md, gap: Spacing.sm },
  sectionTitle: { marginBottom: 4 },
  timeline: { gap: Spacing.sm },
  timelineItem: { position: 'relative' },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 44,
    bottom: -Spacing.sm,
    width: 2,
    backgroundColor: Colors.border,
    zIndex: 0,
  },
  dayCard: {
    backgroundColor: Colors.textInverse,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  dayDot: { width: 12, height: 12, borderRadius: 6 },
  fastingBadge: {
    borderWidth: 1,
    borderColor: Colors.crimson,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  dayBody: {
    padding: Spacing.md,
    paddingTop: 0,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs },
  visitaCard: {
    backgroundColor: Colors.crimsonPale,
    borderWidth: 1,
    borderColor: Colors.crimson + '44',
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  visitaHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  churchList: { gap: Spacing.xs },
  churchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  churchNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitaPrayer: {
    backgroundColor: Colors.textInverse,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: 4,
  },
  visitaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.crimson,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    marginTop: Spacing.xs,
  },
});
