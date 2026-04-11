import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Radius, Spacing } from '../../constants/Layout';
import AppText from './AppText';

type Season = 'advent' | 'lent' | 'christmas' | 'ordinary' | 'easter' | 'pentecost';

interface LiturgicalBadgeProps {
  season: Season;
}

const seasonConfig: Record<Season, { bg: string; text: string; label: string }> = {
  advent: { bg: Colors.advent, text: Colors.textInverse, label: 'Advent' },
  lent: { bg: Colors.lent, text: Colors.textInverse, label: 'Lent' },
  christmas: { bg: Colors.goldPale, text: Colors.navy, label: 'Christmas' },
  ordinary: { bg: Colors.sagePale, text: Colors.sage, label: 'Ordinary Time' },
  easter: { bg: Colors.goldPale, text: Colors.navy, label: 'Easter' },
  pentecost: { bg: Colors.crimsonPale, text: Colors.crimson, label: 'Pentecost' },
};

const LiturgicalBadge = ({ season }: LiturgicalBadgeProps) => {
  const { bg, text, label } = seasonConfig[season];
  return (
    <View style={StyleSheet.flatten([styles.badge, { backgroundColor: bg }])}>
      <View style={StyleSheet.flatten([styles.dot, { backgroundColor: text }])} />
      <AppText variant="caption" color={text}>{label}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default React.memo(LiturgicalBadge);
