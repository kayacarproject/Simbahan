import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Radius, Spacing } from '../../constants/Layout';

type Props = {
  day: string;
  times: string[];
  isToday: boolean;
};

const MassTimeCard = ({ day, times, isToday }: Props) => (
  <View style={[styles.card, isToday && styles.cardActive]}>
    <Text style={[styles.day, isToday && styles.dayActive]}>{day}</Text>
    {times.map((t) => (
      <Text key={t} style={[styles.time, isToday && styles.timeActive]}>{t}</Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginRight: Spacing.sm,
    backgroundColor: '#F3F4F6',
    minWidth: 110,
  },
  cardActive: { backgroundColor: Colors.navy },
  day: { fontFamily: 'DMSans_500Medium', color: Colors.textPrimary, fontSize: 13, marginBottom: 6 },
  dayActive: { color: Colors.gold },
  time: { fontFamily: 'DMSans_400Regular', color: '#6B7280', fontSize: 12, marginBottom: 2 },
  timeActive: { color: '#E5E7EB' },
});

export default React.memo(MassTimeCard);
