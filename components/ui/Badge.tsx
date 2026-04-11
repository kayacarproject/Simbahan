import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Radius, Spacing } from '../../constants/Layout';
import AppText from './AppText';

type BadgeVariant = 'navy' | 'gold' | 'crimson' | 'sage' | 'muted';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantMap: Record<BadgeVariant, { bg: string; text: string }> = {
  navy: { bg: Colors.navyLight, text: Colors.textInverse },
  gold: { bg: Colors.goldPale, text: Colors.navy },
  crimson: { bg: Colors.crimsonPale, text: Colors.crimson },
  sage: { bg: Colors.sagePale, text: Colors.sage },
  muted: { bg: Colors.cream2, text: Colors.textSecondary },
};

const Badge = ({ label, variant = 'muted', size = 'sm' }: BadgeProps) => {
  const { bg, text } = variantMap[variant];
  return (
    <View style={StyleSheet.flatten([styles.base, { backgroundColor: bg }, size === 'md' && styles.md])}>
      <AppText variant="caption" color={text} style={size === 'md' ? styles.textMd : undefined}>
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  textMd: {
    fontSize: 13,
  },
});

export default React.memo(Badge);
