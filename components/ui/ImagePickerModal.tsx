import React, { useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius, Shadows } from '../../constants/Layout';
import AppText from './AppText';

interface Props {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string) => void;
}

const SHEET_HEIGHT = 220;

async function requestAndLaunch(
  launcher: () => Promise<ImagePicker.ImagePickerResult>,
  onImageSelected: (uri: string) => void,
  onClose: () => void,
) {
  const result = await launcher();
  if (!result.canceled && result.assets[0]?.uri) {
    onImageSelected(result.assets[0].uri);
  }
  onClose();
}

// ── Web file input (invisible, triggered programmatically) ───────────────────
function WebFilePicker({ onImageSelected, onClose }: Omit<Props, 'visible'>) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) { onClose(); return; }
      const uri = URL.createObjectURL(file);
      onImageSelected(uri);
      onClose();
    },
    [onImageSelected, onClose],
  );

  // Trigger immediately on mount
  React.useEffect(() => {
    inputRef.current?.click();
  }, []);

  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={handleChange}
      onCancel={onClose}
    />
  );
}

// ── Mobile bottom sheet ──────────────────────────────────────────────────────
export default function ImagePickerModal({ visible, onClose, onImageSelected }: Props) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const overlayOpacity = useSharedValue(0);

  const [webOpen, setWebOpen] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      if (Platform.OS === 'web') {
        setWebOpen(true);
        return;
      }
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      overlayOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(SHEET_HEIGHT, { duration: 220 });
      overlayOpacity.value = withTiming(0, { duration: 220 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const dismiss = useCallback(() => {
    translateY.value = withTiming(SHEET_HEIGHT, { duration: 220 }, () =>
      runOnJS(onClose)(),
    );
    overlayOpacity.value = withTiming(0, { duration: 220 });
  }, [onClose]);

  const openCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take a photo.');
      onClose();
      return;
    }
    await requestAndLaunch(
      () => ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [1, 1] }),
      onImageSelected,
      dismiss,
    );
  }, [onImageSelected, dismiss, onClose]);

  const openGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required.');
      onClose();
      return;
    }
    await requestAndLaunch(
      () => ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [1, 1] }),
      onImageSelected,
      dismiss,
    );
  }, [onImageSelected, dismiss, onClose]);

  // Web: render invisible file input
  if (Platform.OS === 'web') {
    if (!webOpen) return null;
    return (
      <WebFilePicker
        onImageSelected={(uri) => { setWebOpen(false); onImageSelected(uri); }}
        onClose={() => { setWebOpen(false); onClose(); }}
      />
    );
  }

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={dismiss}>
      {/* Overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* Handle bar */}
        <View style={styles.handle} />

        <AppText variant="headingSm" color={Colors.navy} style={styles.sheetTitle}>
          Profile Photo
        </AppText>

        <View style={styles.optionsRow}>
          {/* Camera */}
          <TouchableOpacity
            onPress={openCamera}
            style={styles.optionBtn}
            activeOpacity={0.75}
            accessibilityLabel="Take photo"
          >
            <View style={[styles.optionIcon, { backgroundColor: Colors.navy }]}>
              <Ionicons name="camera" size={24} color={Colors.textInverse} />
            </View>
            <AppText variant="bodySm" color={Colors.textSecondary} style={styles.optionLabel}>
              Camera
            </AppText>
          </TouchableOpacity>

          {/* Gallery */}
          <TouchableOpacity
            onPress={openGallery}
            style={styles.optionBtn}
            activeOpacity={0.75}
            accessibilityLabel="Choose from gallery"
          >
            <View style={[styles.optionIcon, { backgroundColor: Colors.gold }]}>
              <Ionicons name="images" size={24} color={Colors.textInverse} />
            </View>
            <AppText variant="bodySm" color={Colors.textSecondary} style={styles.optionLabel}>
              Gallery
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Cancel */}
        <TouchableOpacity onPress={dismiss} style={styles.cancelBtn} activeOpacity={0.75}>
          <AppText variant="bodyMd" color={Colors.crimson}>Cancel</AppText>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.cream,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
    height: SHEET_HEIGHT,
    ...Shadows.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderDark,
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  optionBtn: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  optionLabel: {
    marginTop: 2,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
});
