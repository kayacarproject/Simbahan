import React, { useState, useCallback, useMemo } from 'react';
import {
  View, ScrollView, TouchableOpacity, Modal,
  StyleSheet, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientView from '../../components/ui/GradientView';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import BackBar from '../../components/ui/BackBar';
import WebLayout from '../../components/ui/WebLayout';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { useModule09Store } from '../../store/module09Store';
import { useUiStore } from '../../store/uiStore';

const isWeb = Platform.OS === 'web';

const DAYS_DATA = [
  { day: 1, date: 'Dis 16', gospel: 'Lucas 1:26-38', celebration: 'Unang Simbang Gabi — Pagsisimula ng Siyam na Araw' },
  { day: 2, date: 'Dis 17', gospel: 'Mateo 1:1-17',  celebration: 'Pangalawang Simbang Gabi — Pamilya ni Hesus' },
  { day: 3, date: 'Dis 18', gospel: 'Mateo 1:18-24', celebration: 'Ikatlong Simbang Gabi — Si Jose at Maria' },
  { day: 4, date: 'Dis 19', gospel: 'Lucas 1:5-25',  celebration: 'Ikaapat na Simbang Gabi — Pagsilang ni Juan Bautista' },
  { day: 5, date: 'Dis 20', gospel: 'Lucas 1:26-38', celebration: 'Ikalimang Simbang Gabi — Pagbati ng Anghel' },
  { day: 6, date: 'Dis 21', gospel: 'Lucas 1:39-45', celebration: 'Ikaanim na Simbang Gabi — Pagdalaw ni Maria' },
  { day: 7, date: 'Dis 22', gospel: 'Lucas 1:46-56', celebration: 'Ikapitong Simbang Gabi — Magnificat' },
  { day: 8, date: 'Dis 23', gospel: 'Lucas 1:57-66', celebration: 'Ikawalong Simbang Gabi — Pagsilang ni Juan' },
  { day: 9, date: 'Dis 24', gospel: 'Lucas 1:67-79', celebration: 'Huling Simbang Gabi — Benedictus' },
];

const FOODS = [
  { name: 'Puto Bumbong', icon: '🟣', desc: 'Malagkit na bigas na niluto sa kawayan' },
  { name: 'Bibingka',     icon: '🟡', desc: 'Malambot na bibingka na may itlog at kesong puti' },
  { name: 'Hot Choco',    icon: '🍫', desc: 'Mainit na tsokolate mula sa tablea' },
];

export default function SimbangGabiScreen() {
  const attendedDays = useModule09Store((s) => s.simbangGabi.attendedDays);
  const checkIn = useModule09Store((s) => s.checkInSimbangGabi);
  const showToast = useUiStore((s) => s.showToast);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  const isComplete = attendedDays.length === 9;
  const activeDay = useMemo(() => {
    for (let i = 1; i <= 9; i++) {
      if (!attendedDays.includes(i)) return i;
    }
    return 9;
  }, [attendedDays]);

  const handleCheckIn = useCallback(() => {
    if (!selectedDay) return;
    checkIn(selectedDay);
    showToast(`Araw ${selectedDay} — Naka-check in!`, 'success');
    if (attendedDays.length + 1 === 9) setShowComplete(true);
    setSelectedDay(null);
  }, [selectedDay, checkIn, showToast, attendedDays.length]);

  const dayInfo = selectedDay ? DAYS_DATA.find((d) => d.day === selectedDay) : null;

  const content = (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <BackBar />
      {/* Header */}
      <GradientView colors={[Colors.navyDark, Colors.navy]} style={styles.header}>
        <View style={styles.starsRow}>
          {['✦','✧','✦','✧','✦'].map((s, i) => (
            <AppText key={i} variant="caption" color={Colors.goldLight}>{s}</AppText>
          ))}
        </View>
        <AppText variant="displaySm" color={Colors.textInverse}>Simbang Gabi</AppText>
        <AppText variant="bodySm" color={Colors.goldLight}>
          {attendedDays.length}/9 Misa na nadaluhan
        </AppText>
      </GradientView>

      {/* 9-day grid */}
      <View style={styles.section}>
        <AppText variant="headingSm" color={Colors.navy} style={styles.sectionTitle}>Tracker</AppText>
        <View style={styles.grid}>
          {DAYS_DATA.map(({ day, date }) => {
            const done = attendedDays.includes(day);
            const isActive = day === activeDay && !done;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[
                  styles.dayCell,
                  done && styles.dayCellDone,
                  isActive && styles.dayCellActive,
                  selectedDay === day && styles.dayCellSelected,
                ]}
                accessible
                accessibilityLabel={`Araw ${day}, ${date}`}
              >
                {done ? (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.textInverse} />
                ) : (
                  <AppText variant="headingSm" color={isActive ? Colors.navyDark : Colors.textMuted}>
                    {day}
                  </AppText>
                )}
                <AppText
                  variant="caption"
                  color={done ? Colors.textInverse : isActive ? Colors.navyDark : Colors.textMuted}
                >
                  {date}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Day detail */}
      {dayInfo && (
        <View style={styles.card}>
          <AppText variant="headingSm" color={Colors.navy}>
            Araw {dayInfo.day} — {dayInfo.date}
          </AppText>
          <AppText variant="bodyMd" color={Colors.textSecondary}>{dayInfo.celebration}</AppText>
          <View style={styles.infoRow}>
            <Ionicons name="book-outline" size={14} color={Colors.gold} />
            <AppText variant="bodySm" color={Colors.textMuted} style={{ marginLeft: 4 }}>
              Ebanghelyo: {dayInfo.gospel}
            </AppText>
          </View>
          <AppText variant="bodySm" color={Colors.textMuted}>
            Misa: 4:30 AM · Simbahan ng Barangay Holy Spirit
          </AppText>
          {!attendedDays.includes(dayInfo.day) ? (
            <AppButton label={`I-check in: Araw ${dayInfo.day}`} onPress={handleCheckIn} />
          ) : (
            <View style={styles.checkedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.sage} />
              <AppText variant="label" color={Colors.sage}>Naka-check in na</AppText>
            </View>
          )}
        </View>
      )}

      {/* Food section */}
      <View style={styles.section}>
        <AppText variant="headingSm" color={Colors.navy} style={styles.sectionTitle}>
          Pagkain pagkatapos ng Misa
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.foodRow}>
          {FOODS.map((f) => (
            <View key={f.name} style={styles.foodCard}>
              <AppText style={styles.foodIcon}>{f.icon}</AppText>
              <AppText variant="headingSm" color={Colors.navy}>{f.name}</AppText>
              <AppText variant="caption" color={Colors.textMuted}>{f.desc}</AppText>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );

  return (
    <>
      {isWeb ? (
        <WebLayout>{content}</WebLayout>
      ) : (
        <SafeAreaView style={styles.screen} edges={['top']}>{content}</SafeAreaView>
      )}

      {/* Completion overlay */}
      <Modal visible={showComplete} transparent animationType="fade" onRequestClose={() => setShowComplete(false)}>
        <View style={styles.completionOverlay}>
          <View style={styles.completionCard}>
            <AppText style={styles.completionStars}>✦ ✧ ✦ ✧ ✦</AppText>
            <Ionicons name="star" size={64} color={Colors.gold} />
            <AppText variant="displaySm" color={Colors.navy} style={{ textAlign: 'center' }}>
              Binabati kita!
            </AppText>
            <AppText variant="bodyMd" color={Colors.textSecondary} style={{ textAlign: 'center' }}>
              Natapos mo ang lahat ng 9 na Simbang Gabi! Maligayang Pasko!
            </AppText>
            <AppButton label="Ibahagi ang Tagumpay" onPress={() => setShowComplete(false)} />
            <TouchableOpacity onPress={() => setShowComplete(false)} accessible accessibilityLabel="Isara">
              <AppText variant="bodySm" color={Colors.textMuted}>Isara</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  scroll: { paddingBottom: Spacing.xxl },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl, gap: 4, alignItems: 'center' },
  starsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  section: { padding: Spacing.md, gap: Spacing.sm },
  sectionTitle: { marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  dayCell: {
    width: '30%',
    aspectRatio: 1.2,
    backgroundColor: Colors.cream2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayCellDone: { backgroundColor: Colors.sage, borderColor: Colors.sage },
  dayCellActive: { backgroundColor: Colors.goldPale, borderColor: Colors.gold, borderWidth: 2 },
  dayCellSelected: { borderColor: Colors.navy, borderWidth: 2 },
  card: {
    backgroundColor: Colors.textInverse,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  checkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.sagePale,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  foodRow: { gap: Spacing.md, paddingVertical: Spacing.xs },
  foodCard: {
    width: 140,
    backgroundColor: Colors.textInverse,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
    alignItems: 'center',
  },
  foodIcon: { fontSize: 36 },
  completionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  completionCard: {
    backgroundColor: Colors.textInverse,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
    maxWidth: 360,
  },
  completionStars: { fontSize: 24, color: Colors.gold, letterSpacing: 8 },
});
