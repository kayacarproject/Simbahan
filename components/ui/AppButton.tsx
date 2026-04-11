import React, { useCallback } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Typography } from '../../constants/Typography';
import { Radius, Spacing } from '../../constants/Layout';
import { useTheme } from '../../theme/ThemeContext';
import { AppTheme } from '../../theme/light';
import AppText from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

function getVariantColors(variant: Variant, theme: AppTheme) {
  switch (variant) {
    case 'primary':
      return { bg: theme.primary, text: theme.textInverse, border: 'transparent' };
    case 'secondary':
      return { bg: theme.accentPale, text: theme.primary, border: theme.accent };
    case 'ghost':
      return { bg: 'transparent', text: theme.primary, border: theme.border };
  }
}

const AppButton = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel,
}: AppButtonProps) => {
  const { theme } = useTheme();
  const vs = getVariantColors(variant, theme);

  const handlePress = useCallback(() => {
    if (!loading && !disabled) onPress();
  }, [loading, disabled, onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      accessible
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      style={[
        styles.base,
        { backgroundColor: vs.bg, borderColor: vs.border, opacity: disabled ? 0.5 : 1 },
      ]}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.text} />
      ) : (
        <AppText variant="label" color={vs.text} style={styles.label}>
          {label}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  label: {
    ...Typography.label,
    fontSize: 14,
  },
});

export default React.memo(AppButton);
