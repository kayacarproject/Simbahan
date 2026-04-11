import React from 'react';
import { View, ViewStyle, StyleProp, StyleSheet } from 'react-native';

let LinearGradient: React.ComponentType<any> | null = null;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {}

interface GradientViewProps {
  colors: string[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

const GradientView = ({
  colors,
  style,
  children,
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
}: GradientViewProps) => {
  if (LinearGradient) {
    return (
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={start}
        end={end}
        style={style}
      >
        {children}
      </LinearGradient>
    );
  }
  return <View style={StyleSheet.flatten([style, { backgroundColor: colors[0] }])}>{children}</View>;
};

export default GradientView;
