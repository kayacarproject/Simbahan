import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Layout';
import AppText from './AppText';
import AppButton from './AppButton';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon = 'leaf-outline', title, message, actionLabel, onAction }: EmptyStateProps) => (
  <View style={styles.container} accessible accessibilityLabel={title}>
    <Ionicons name={icon} size={48} color={Colors.border} />
    <AppText variant="headingSm" color={Colors.textSecondary} style={styles.title}>
      {title}
    </AppText>
    {message && (
      <AppText variant="bodySm" color={Colors.textMuted} style={styles.message}>
        {message}
      </AppText>
    )}
    {actionLabel && onAction && (
      <View style={styles.action}>
        <AppButton label={actionLabel} onPress={onAction} variant="secondary" />
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  message: {
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  action: {
    marginTop: Spacing.lg,
    minWidth: 160,
  },
});

export default React.memo(EmptyState);
