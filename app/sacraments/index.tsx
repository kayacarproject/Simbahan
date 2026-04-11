import React, { useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import GradientView from '../../components/ui/GradientView';
import AppText from '../../components/ui/AppText';
import BackBar from '../../components/ui/BackBar';
import WebLayout from '../../components/ui/WebLayout';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { useModule09Store } from '../../store/module09Store';
import { useAuthStore } from '../../store/authStore';

const isWeb = Platform.OS === 'web';

const SACRAMENTS = [
  { type: 'baptism',      labelFil: 'Binyag',       labelEn: 'Baptism',      icon: 'water-outline'      as const, note: 'Para sa mga sanggol at matatanda' },
  { type: 'marriage',     labelFil: 'Kasal',         labelEn: 'Wedding',      icon: 'heart-outline'      as const, note: 'Sakramento ng Matrimonyo' },
  { type: 'confirmation', labelFil: 'Kumpil',        labelEn: 'Confirmation', icon: 'flame-outline'      as const, note: 'Pagpapatibay ng pananampalataya' },
  { type: 'anointing',    labelFil: 'Panghuling Habilin', labelEn: 'Anointing', icon: 'medkit-outline'  as const, note: 'Para sa mga maysakit' },
  { type: 'funeral',      labelFil: 'Libing',        labelEn: 'Funeral',      icon: 'flower-outline'     as const, note: 'Misa ng Libing' },
  { type: 'other',        labelFil: 'Iba pa',        labelEn: 'Other',        icon: 'ellipsis-horizontal-outline' as const, note: 'Iba pang kahilingan' },
];

const STATUS_COLORS: Record<string, string> = {
  confirmed: Colors.sage,
  approved:  Colors.sage,
  pending:   Colors.gold,
  submitted: Colors.navy,
};

export default function SacramentsScreen() {
  const requests = useModule09Store((s) => s.sacramentRequests);
  const currentUser = useAuthStore((s) => s.currentUser);

  const myRequests = requests
    .filter((r) => r.memberId === currentUser?.id)
    .slice(0, 2);

  const handleSacrament = useCallback((type: string) => {
    router.push({ pathname: '/sacraments/request', params: { type } } as never);
  }, []);

  const content = (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <BackBar />
      <GradientView colors={[Colors.crimson, Colors.crimsonLight]} style={styles.header}>
        <AppText variant="displaySm" color={Colors.textInverse}>Mga Sakramento</AppText>
        <AppText variant="bodySm" color="rgba(255,255,255,0.75)">Sacramental requests</AppText>
      </GradientView>

      {/* Info card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.navy} />
        <AppText variant="bodySm" color={Colors.textSecondary} style={{ flex: 1 }}>
          Ang mga sakramento ay espesyal na ritwal ng Simbahang Katoliko. Pumili ng uri ng sakramento para magsumite ng kahilingan.
        </AppText>
      </View>

      {/* Grid */}
      <View style={styles.section}>
        <AppText variant="headingSm" color={Colors.navy} style={styles.sectionTitle}>Pumili ng Sakramento</AppText>
        <View style={styles.grid}>
          {SACRAMENTS.map((s) => (
            <TouchableOpacity
              key={s.type}
              onPress={() => handleSacrament(s.type)}
              style={styles.sacCard}
              accessible
              accessibilityLabel={s.labelFil}
              activeOpacity={0.8}
            >
              <Ionicons name={s.icon} size={28} color={Colors.crimson} />
              <AppText variant="headingSm" color={Colors.navy}>{s.labelFil}</AppText>
              <AppText variant="caption" color={Colors.textMuted}>{s.labelEn}</AppText>
              <AppText variant="caption" color={Colors.textMuted} numberOfLines={2}>{s.note}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* My requests */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <AppText variant="headingSm" color={Colors.navy}>Aking mga Kahilingan</AppText>
          <TouchableOpacity onPress={() => router.push('/sacraments/request' as never)} accessible accessibilityLabel="Bagong kahilingan">
            <AppText variant="label" color={Colors.navy}>+ Bago</AppText>
          </TouchableOpacity>
        </View>
        {myRequests.length === 0 ? (
          <AppText variant="bodySm" color={Colors.textMuted}>Wala pang kahilingan.</AppText>
        ) : (
          myRequests.map((r) => (
            <View key={r.id} style={[styles.requestCard, { borderLeftColor: STATUS_COLORS[r.status] ?? Colors.navy }]}>
              <AppText variant="headingSm" color={Colors.navy} style={{ textTransform: 'capitalize' }}>{r.type}</AppText>
              <AppText variant="caption" color={Colors.textMuted}>{r.preferredDate}</AppText>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[r.status] + '22' }]}>
                <AppText variant="caption" color={STATUS_COLORS[r.status] ?? Colors.navy} style={{ textTransform: 'capitalize' }}>
                  {r.status}
                </AppText>
              </View>
            </View>
          ))
        )}
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.textInverse,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    margin: Spacing.md,
    marginBottom: 0,
  },
  section: { padding: Spacing.md, gap: Spacing.sm },
  sectionTitle: { marginBottom: 4 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  sacCard: {
    width: '47%',
    backgroundColor: Colors.textInverse,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
  },
  requestCard: {
    backgroundColor: Colors.textInverse,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginTop: 2,
  },
});
