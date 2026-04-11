import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Typography } from '../../constants/Typography';
import { useTheme } from '../../theme/ThemeContext';

type Variant = keyof typeof Typography;

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
}

const AppText = ({ variant = 'bodyMd', color, style, children, ...props }: AppTextProps) => {
  const { theme } = useTheme();
  return (
    <Text
      style={StyleSheet.flatten([
        Typography[variant],
        { color: color ?? theme.text },
        style,
      ])}
      {...props}
    >
      {children}
    </Text>
  );
};

export default React.memo(AppText);
