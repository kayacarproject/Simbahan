import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Image as ExpoImage, ImageProps } from 'expo-image';

type Props = Omit<ImageProps, 'source'> & {
  source: { uri?: string } | number;
  style?: any;
};

/**
 * Cross-platform image:
 * - Web  → plain <img> with object-fit, avoids expo-image broken square bug on Vercel
 * - Native → expo-image (full caching + transitions)
 */
const Img = ({ source, style, contentFit = 'cover', ...rest }: Props) => {
  if (Platform.OS === 'web') {
    const uri = typeof source === 'object' && 'uri' in source ? source.uri : undefined;
    const flat = StyleSheet.flatten(style) ?? {};
    const {
      width,
      height,
      borderRadius,
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius,
      position,
      top,
      left,
      right,
      bottom,
      flex,
      flexShrink,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      margin,
    } = flat as any;

    return (
      <img
        src={uri}
        alt={rest.accessibilityLabel as string | undefined}
        style={{
          display: 'block',
          objectFit: contentFit as any,
          width: width ?? '100%',
          height: height ?? '100%',
          borderRadius: borderRadius >= 9999 ? '50%' : borderRadius,
          borderTopLeftRadius,
          borderTopRightRadius,
          borderBottomLeftRadius,
          borderBottomRightRadius,
          position,
          top,
          left,
          right,
          bottom,
          flex,
          flexShrink,
          marginLeft,
          marginRight,
          marginTop,
          marginBottom,
          margin,
        }}
      />
    );
  }

  return <ExpoImage source={source} style={style} contentFit={contentFit} {...rest} />;
};

export default React.memo(Img);
