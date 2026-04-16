import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Spacing, Radius } from '../../constants/Layout';
import { AppText } from '../ui';
import { useChurchStore } from '../../store/churchStore';
import { useTheme } from '../../theme/ThemeContext';

const GospelCard = () => {
  const { theme } = useTheme();
  const reading = useChurchStore((s) => s.todayReadings);
  const handlePress = useCallback(() => router.push('/(tabs)/schedule' as never), []);

  if (!reading) return null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessible
      accessibilityLabel="Read today's gospel"
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <View style={[styles.topBorder, { backgroundColor: theme.accent }]} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Ionicons name="book-outline" size={16} color={theme.accent} />
          <AppText variant="label" color={theme.accent} style={styles.sectionLabel}>
            MABUTING BALITA NGAYON
          </AppText>
        </View>
        <AppText variant="headingSm" color={theme.primary} style={styles.title} numberOfLines={2}>
          {reading.title}
        </AppText>
        <View style={styles.refRow}>
          <AppText variant="bodySm" color={theme.textMuted}>{reading.gospel.reference}</AppText>
          <View style={[styles.dot, { backgroundColor: theme.textMuted }]} />
          <AppText variant="bodySm" color={theme.textMuted}>{reading.weekday}</AppText>
        </View>
        <AppText variant="bodyMd" color={theme.textSecondary} numberOfLines={3} style={styles.excerpt}>
          {reading.gospel.text}
        </AppText>
        <View style={styles.readRow}>
          <AppText variant="label" color={theme.accent}>Basahin...</AppText>
          <Ionicons name="arrow-forward" size={13} color={theme.accent} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card:         { borderRadius: Radius.md, marginHorizontal: Spacing.md, borderWidth: 1, overflow: 'hidden' },
  topBorder:    { height: 4 },
  body:         { padding: Spacing.md, gap: Spacing.xs },
  titleRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  sectionLabel: { letterSpacing: 0.8 },
  title:        { marginTop: 2 },
  refRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  dot:          { width: 3, height: 3, borderRadius: 2 },
  excerpt:      { lineHeight: 22 },
  readRow:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
});

export default React.memo(GospelCard);
