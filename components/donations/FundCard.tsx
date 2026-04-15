import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AppText from '../ui/AppText';
import AppButton from '../ui/AppButton';
import { Spacing, Radius } from '../../constants/Layout';
import { useTheme } from '../../theme/ThemeContext';

interface FundCardProps {
  id: string;
  title: string;
  description: string;
  goal: number;
  collected: number;
  startDate: string;
  endDate: string;
  gcashNumber?: string;
  gcashName?: string;
}

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0 });

const FundCard = ({ id, title, description, goal, collected, startDate, endDate, gcashNumber = '', gcashName = '' }: FundCardProps) => {
  const { theme } = useTheme();
  const pct = Math.min(100, Math.round((collected / goal) * 100));

  const handlePress = useCallback(() => {
    router.push({
      pathname: '/donations/[id]',
      params: { id, title, description, goal, collected, startDate, endDate, gcashNumber, gcashName },
    } as never);
  }, [id, title, description, goal, collected, startDate, endDate, gcashNumber, gcashName]);

  return (
    <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <View style={[styles.leftBorder, { backgroundColor: theme.accent }]} />
      <View style={styles.body}>
        <AppText variant="headingSm" color={theme.primary}>{title}</AppText>
        <AppText variant="bodySm" color={theme.textSecondary} style={styles.desc}>{description}</AppText>

        <View style={[styles.progressTrack, { backgroundColor: theme.surface2 }]}>
          <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: theme.accent }]} />
        </View>
        <View style={styles.progressLabels}>
          <AppText variant="caption" color={theme.accent}>{pct}% naabot</AppText>
          <AppText variant="caption" color={theme.textMuted}>{fmt(collected)} / {fmt(goal)}</AppText>
        </View>

        <View style={styles.footer}>
          <AppText variant="caption" color={theme.textMuted}>{startDate} – {endDate}</AppText>
          <AppButton label="Mag-donate" onPress={handlePress} variant="secondary" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card:           { flexDirection: 'row', borderWidth: 1, borderRadius: Radius.md, overflow: 'hidden' },
  leftBorder:     { width: 4 },
  body:           { flex: 1, padding: Spacing.md, gap: Spacing.sm },
  desc:           { marginBottom: 2 },
  progressTrack:  { height: 8, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill:   { height: '100%', borderRadius: Radius.full },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  footer:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
});

export default React.memo(FundCard);
