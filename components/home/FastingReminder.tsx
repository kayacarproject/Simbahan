import React, { useMemo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { AppText } from '../ui';
import { useChurchStore } from '../../store/churchStore';

type Season = string;

const FASTING_SEASONS: Season[] = ['lent', 'advent'];

function shouldShowFasting(season: Season): boolean {
  const dayOfWeek = new Date().getDay();
  const isFriday = dayOfWeek === 5;
  const isSpecialSeason = FASTING_SEASONS.includes(season);
  return isFriday || isSpecialSeason;
}

function getCurrentSeason(calendar: { season: string; startDate: string; endDate: string }[]): string {
  const today = new Date().toISOString().split('T')[0];
  return calendar.find((c) => today >= c.startDate && today <= c.endDate)?.season ?? 'ordinary';
}

const FastingReminder = () => {
  const liturgicalCalendar = useChurchStore((s) => s.liturgicalCalendar);
  const season = useMemo(() => getCurrentSeason(liturgicalCalendar), [liturgicalCalendar]);
  const show = useMemo(() => shouldShowFasting(season), [season]);

  const handlePress = useCallback(() => router.push('/(tabs)/more' as never), []);

  if (!show) return null;

  const isFriday = new Date().getDay() === 5;
  const message = isFriday
    ? 'Ngayon ay Biyernes. Araw ito ng abstinensya at pagaayuno.'
    : 'Sa panahon ng Kuwaresma, inaanyayahan tayong mag-ayuno at mag-abstinensya.';

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessible
      accessibilityLabel="Fasting reminder"
      activeOpacity={0.85}
      style={styles.card}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="leaf-outline" size={22} color={Colors.sage} />
      </View>
      <View style={styles.content}>
        <AppText variant="headingSm" color={Colors.navy}>
          {isFriday ? 'Paalala: Biyernes' : 'Paalala: Kuwaresma'}
        </AppText>
        <AppText variant="bodySm" color={Colors.textSecondary} numberOfLines={2}>
          {message}
        </AppText>
        <AppText variant="label" color={Colors.sage} style={styles.link}>
          Alamin pa →
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.sagePale,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.sage + '40',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.sage + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: Spacing.xs },
  link: { marginTop: 2 },
});

export default React.memo(FastingReminder);
