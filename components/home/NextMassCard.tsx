import React, { useMemo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Spacing, Radius, Shadows } from '../../constants/Layout';
import { AppText, Badge } from '../ui';
import { useChurchStore } from '../../store/churchStore';
import { useTheme } from '../../theme/ThemeContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getNextMass(schedule: { day: string; times: string[]; dayIndex: number }[]): { time: string; day: string } {
  const now = new Date();
  const todayIdx = now.getDay();
  const todayEntry = schedule.find((s) => s.dayIndex === todayIdx);
  if (todayEntry) {
    for (const t of todayEntry.times) {
      const [timePart, period] = t.split(' ');
      const [h, m] = timePart.split(':').map(Number);
      let hour = h;
      if (period === 'PM' && h !== 12) hour += 12;
      if (period === 'AM' && h === 12) hour = 0;
      if (hour > now.getHours() || (hour === now.getHours() && (m ?? 0) > now.getMinutes())) {
        return { time: t, day: todayEntry.day };
      }
    }
  }
  for (let i = 1; i <= 7; i++) {
    const nextIdx = (todayIdx + i) % 7;
    const entry = schedule.find((s) => s.dayIndex === nextIdx);
    if (entry && entry.times.length > 0) return { time: entry.times[0], day: entry.day };
  }
  return { time: '7:00 AM', day: 'Sunday' };
}

const NextMassCard = () => {
  const { theme } = useTheme();
  const massSchedule = useChurchStore((s) => s.massSchedule);
  const { time, day } = useMemo(() => getNextMass(massSchedule as any), [massSchedule]);
  const handlePress = useCallback(() => router.push('/(tabs)/schedule' as never), []);

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessible
      accessibilityLabel="View mass schedule"
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <View style={[styles.leftBorder, { backgroundColor: theme.accent }]} />
      <View style={styles.content}>
        <AppText variant="label" color={theme.accent} style={styles.label}>SUSUNOD NA MISA</AppText>
        <AppText variant="displayMd" color={theme.primary} style={styles.time}>{time}</AppText>
        <View style={styles.row}>
          <Badge label={day} variant="navy" size="sm" />
          <AppText variant="bodySm" color={theme.textMuted} style={styles.presider}>
            Fr. Jose Maria Santos
          </AppText>
        </View>
      </View>
      <View style={styles.linkWrap}>
        <AppText variant="label" color={theme.accent}>Tingnan lahat</AppText>
        <Ionicons name="arrow-forward" size={14} color={theme.accent} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    marginTop: -Spacing.md,
    marginHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    ...(Shadows.md as object),
  },
  leftBorder: { width: 4, alignSelf: 'stretch' },
  content:    { flex: 1, padding: Spacing.md, gap: Spacing.xs },
  label:      { letterSpacing: 1 },
  time:       { lineHeight: 34 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  presider:   { flexShrink: 1 },
  linkWrap:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: Spacing.md },
});

export default React.memo(NextMassCard);
