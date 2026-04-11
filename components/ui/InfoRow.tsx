import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Layout';
import AppText from './AppText';

interface InfoRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
    {icon && (
      <Ionicons name={icon} size={16} color={Colors.gold} style={styles.icon} />
    )}
    <AppText variant="bodySm" color={Colors.textMuted} style={styles.label}>
      {label}
    </AppText>
    <AppText variant="bodyMd" color={Colors.textPrimary} style={styles.value}>
      {value}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  label: {
    width: 100,
    marginRight: Spacing.sm,
  },
  value: {
    flex: 1,
  },
});

export default React.memo(InfoRow);
