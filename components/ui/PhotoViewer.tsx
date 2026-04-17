import React, { useCallback, useEffect } from 'react';
import {
  Modal, View, TouchableOpacity, StyleSheet,
  useWindowDimensions, StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, runOnJS, Easing,
} from 'react-native-reanimated';
import {
  Gesture, GestureDetector, GestureHandlerRootView,
} from 'react-native-gesture-handler';
import AppText from './AppText';

interface PhotoViewerProps {
  uri: string;
  visible: boolean;
  onClose: () => void;
  name?: string;
}

const SPRING = { damping: 20, stiffness: 200 };
const MAX_SCALE = 6;
const MIN_SCALE = 0.8;

export default function PhotoViewer({ uri, visible, onClose, name }: PhotoViewerProps) {
  const { width: W, height: H } = useWindowDimensions();

  // Animation values
  const opacity    = useSharedValue(0);
  const scale      = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX     = useSharedValue(0);
  const savedY     = useSharedValue(0);

  // Fade in on open
  useEffect(() => {
    if (visible) {
      scale.value      = 1;
      savedScale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedX.value     = 0;
      savedY.value     = 0;
      opacity.value    = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });
    }
  }, [visible]);

  const close = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 }, () => runOnJS(onClose)());
    scale.value   = withSpring(0.9, SPRING);
  }, [onClose]);

  const resetPosition = () => {
    translateX.value = withSpring(0, SPRING);
    translateY.value = withSpring(0, SPRING);
    savedX.value     = 0;
    savedY.value     = 0;
  };

  // ── Pinch to zoom ──────────────────────────────────────────────────────────
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(MIN_SCALE, Math.min(savedScale.value * e.scale, MAX_SCALE));
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value      = withSpring(1, SPRING);
        savedScale.value = 1;
        runOnJS(resetPosition)();
      } else {
        savedScale.value = scale.value;
      }
    });

  // ── Pan to move ────────────────────────────────────────────────────────────
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    })
    .onEnd((e) => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
      // Snap back to center if not zoomed
      if (scale.value <= 1) {
        translateX.value = withSpring(0, SPRING);
        translateY.value = withSpring(0, SPRING);
        savedX.value     = 0;
        savedY.value     = 0;
        // Close if swiped down fast
        if (e.velocityY > 1200 && Math.abs(e.velocityX) < Math.abs(e.velocityY)) {
          runOnJS(close)();
        }
      }
    });

  // ── Double-tap to zoom ─────────────────────────────────────────────────────
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value      = withSpring(1, SPRING);
        savedScale.value = 1;
        translateX.value = withSpring(0, SPRING);
        translateY.value = withSpring(0, SPRING);
        savedX.value     = 0;
        savedY.value     = 0;
      } else {
        scale.value      = withSpring(2.5, SPRING);
        savedScale.value = 2.5;
      }
    });

  // ── Single tap to close ────────────────────────────────────────────────────
  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => { runOnJS(close)(); });

  const composed = Gesture.Simultaneous(pinch, pan);
  const tapGestures = Gesture.Exclusive(doubleTap, singleTap);
  const allGestures = Gesture.Simultaneous(tapGestures, composed);

  const imgStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    backgroundColor: `rgba(0,0,0,${opacity.value * 0.95})`,
  }));

  if (!visible) return null;

  // Circle size — 85% of screen width
  const CIRCLE = Math.round(W * 0.85);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={close}
    >
      <StatusBar hidden />
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]}>

          {/* Close button */}
          <TouchableOpacity onPress={close} style={styles.closeBtn} accessible accessibilityLabel="Isara">
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Name label */}
          {!!name && (
            <AppText variant="headingSm" style={styles.nameLabel}>{name}</AppText>
          )}

          {/* Circular clip wrapper — fixed position, clips to circle */}
          <View style={[
            styles.circleClip,
            {
              width: CIRCLE,
              height: CIRCLE,
              borderRadius: CIRCLE / 2,
              top: H / 2 - CIRCLE / 2,
              left: W / 2 - CIRCLE / 2,
            },
          ]}>
            {/* Gesture + transform applied inside the clip */}
            <GestureDetector gesture={allGestures}>
              <Animated.View style={[{ width: CIRCLE, height: CIRCLE }, imgStyle]}>
                <Image
                  source={{ uri }}
                  style={{ width: CIRCLE, height: CIRCLE }}
                  contentFit="cover"
                  transition={0}
                />
              </Animated.View>
            </GestureDetector>
          </View>

          {/* Gold ring border around the circle */}
          <View style={[
            styles.circleBorder,
            {
              width: CIRCLE + 4,
              height: CIRCLE + 4,
              borderRadius: (CIRCLE + 4) / 2,
              top: H / 2 - CIRCLE / 2 - 2,
              left: W / 2 - CIRCLE / 2 - 2,
            },
          ]} />

          {/* Hint */}
          {/* <AppText variant="caption" style={styles.hint}>
            Double-tap to zoom · Pinch · Swipe down to close
          </AppText> */}

        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  closeBtn:     {
    position: 'absolute', top: 52, right: 16, zIndex: 20,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  nameLabel:    {
    position: 'absolute', top: 58, left: 0, right: 0,
    textAlign: 'center', color: '#fff', zIndex: 10,
  },
  circleClip:   {
    position: 'absolute',
    overflow: 'hidden',   // clips image to circle
    zIndex: 5,
  },
  circleBorder: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#C9922A', // gold accent
    zIndex: 6,
  },
  hint:         {
    position: 'absolute', bottom: 44, left: 0, right: 0,
    textAlign: 'center', color: 'rgba(255,255,255,0.4)',
  },
});
