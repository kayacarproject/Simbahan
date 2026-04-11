import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewProps } from 'react-native';
import { Radius, Shadows, Spacing } from '../../constants/Layout';
import { useTheme } from '../../theme/ThemeContext';

interface CardProps extends ViewProps {
  onPress?: () => void;
  children: React.ReactNode;
  accessibilityLabel?: string;
}

const Card = ({ onPress, children, style, accessibilityLabel, ...props }: CardProps) => {
  const { theme } = useTheme();
  const cardStyle = [
    styles.base,
    { backgroundColor: theme.surface, borderColor: theme.border },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        accessible
        accessibilityLabel={accessibilityLabel}
        activeOpacity={0.8}
        style={cardStyle as any}
        {...(props as any)}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
});

export default React.memo(Card);
