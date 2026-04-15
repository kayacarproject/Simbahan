import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Img from '../ui/Img';
import { router } from 'expo-router';
import AppText from '../ui/AppText';
import Badge from '../ui/Badge';
import { Spacing, Radius } from '../../constants/Layout';
import { useTheme } from '../../theme/ThemeContext';

interface NovenaCardProps {
  id: string;
  patron: string;
  feastDate: string;
  description?: string;
  duration?: number;
  image?: string;
  completedDays?: number[];
}

const NovenaCard = ({ id, patron, feastDate, description = '', duration = 9, image, completedDays = [] }: NovenaCardProps) => {
  const { theme } = useTheme();
  const progress = completedDays.length;

  const handlePress = useCallback(() => {
    router.push({
      pathname: '/novenas/[id]',
      params: { id, patron, feastDate, description, duration },
    } as never);
  }, [id, patron, feastDate, description, duration]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      activeOpacity={0.8}
      accessible
      accessibilityLabel={patron}
    >
      <View style={styles.imgWrap}>
        {image ? (
          <Img source={{ uri: image }} style={styles.img} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.imgFallback, { backgroundColor: theme.accentPale }]}>
            <Ionicons name="book-outline" size={28} color={theme.accent} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <AppText variant="headingSm" color={theme.primary} numberOfLines={2}>{patron}</AppText>
        <AppText variant="caption" color={theme.textMuted}>{feastDate}</AppText>
        <Badge label="Nobena" variant="gold" />
        {progress > 0 && (
          <View style={styles.progressRow}>
            <View style={[styles.progressTrack, { backgroundColor: theme.surface2 }]}>
              <View style={[styles.progressFill, { width: `${(progress / 9) * 100}%` as any, backgroundColor: theme.success }]} />
            </View>
            <AppText variant="caption" color={theme.success}>{progress}/9</AppText>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  imgWrap:     { width: 72, height: 80 },
  img:         { width: 72, height: 80 },
  imgFallback: { width: 72, height: 80, alignItems: 'center', justifyContent: 'center' },
  info:        { flex: 1, paddingVertical: Spacing.sm, gap: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 2 },
});

export default React.memo(NovenaCard);
