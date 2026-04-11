import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../ui/AppText';
import Badge from '../ui/Badge';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';

interface MassRowProps {
  time: string;
  language: string;
  presider?: string;
  note?: string;
}

function splitTime(time: string) {
  const match = time.match(/^(\d+:\d+)\s*(AM|PM|NN)?$/i);
  if (!match) return { main: time, period: '' };
  return { main: match[1], period: match[2] ?? '' };
}

const MassRow = ({ time, language, presider, note }: MassRowProps) => {
  const { main, period } = splitTime(time);
  return (
    <View style={styles.card}>
      <View style={styles.timeBox}>
        <AppText variant="headingMd" color={Colors.textInverse} style={styles.timeMain}>
          {main}
        </AppText>
        {!!period && (
          <AppText variant="caption" color={Colors.goldLight}>
            {period}
          </AppText>
        )}
      </View>
      <View style={styles.info}>
        {!!presider && (
          <AppText variant="bodyMd" color={Colors.textPrimary} numberOfLines={1}>
            {presider}
          </AppText>
        )}
        <Badge label={language} variant="gold" />
        {!!note && (
          <AppText variant="caption" color={Colors.textMuted} style={styles.note}>
            {note}
          </AppText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.textInverse,
  },
  timeBox: {
    width: 72,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    alignSelf: 'stretch',
  },
  timeMain: {
    fontSize: 18,
    lineHeight: 24,
  },
  info: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  note: {
    fontStyle: 'italic',
  },
});

export default React.memo(MassRow);
