import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface FloatingCrossProps {
  size?: number;
  color?: string;
  opacity?: number;
  style?: object;
}

const FloatingCross = ({
  size = 40,
  color = Colors.textInverse,
  opacity = 0.08,
  style,
}: FloatingCrossProps) => {
  const thickness = Math.max(4, size * 0.18);
  const armH = size * 0.38;

  return (
    <View style={StyleSheet.flatten([styles.wrap, { width: size, height: size, opacity }, style])} pointerEvents="none">
      {/* Vertical bar */}
      <View
        style={StyleSheet.flatten([
          styles.bar,
          {
            width: thickness,
            height: size,
            backgroundColor: color,
            borderRadius: thickness / 2,
          },
        ])}
      />
      {/* Horizontal bar */}
      <View
        style={StyleSheet.flatten([
          styles.bar,
          styles.horizontal,
          {
            width: size,
            height: thickness,
            backgroundColor: color,
            borderRadius: thickness / 2,
            top: armH,
          },
        ])}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
  },
  horizontal: {
    left: 0,
  },
});

export default React.memo(FloatingCross);
