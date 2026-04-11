import React, { useMemo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { AppText } from '../ui';
import { getUpcomingFeasts } from '../../utils/liturgicalHelpers';

const HolyDayAlert = () => {
  const alert = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const feasts = getUpcomingFeasts(2);
    return feasts.find((f) => f.date === todayStr || f.date === tomorrow) ?? null;
  }, []);

  const handlePress = useCallback(() => router.push('/(tabs)/schedule' as never), []);

  if (!alert) return null;

  const isToday = alert.date === new Date().toISOString().split('T')[0];

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessible
      accessibilityLabel={`Holy day alert: ${alert.name}`}
      activeOpacity={0.85}
      style={styles.strip}
    >
      <Ionicons name="alert-circle-outline" size={16} color={Colors.textInverse} />
      <AppText variant="label" color={Colors.textInverse} style={styles.text}>
        {isToday ? 'Ngayon' : 'Bukas'}: {alert.name} — {alert.rank}
      </AppText>
      <AppText variant="caption" color={Colors.goldPale} style={styles.link}>
        Tingnan ang Misa →
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  strip: {
    backgroundColor: Colors.crimson,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    borderRadius: Radius.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  text: { flex: 1 },
  link: { flexShrink: 0 },
});

export default React.memo(HolyDayAlert);
