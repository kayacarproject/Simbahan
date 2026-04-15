import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Img from './Img';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radius, Shadows } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';
import AppText from './AppText';
import { useTheme } from '../../theme/ThemeContext';
import { formatShortDate, timeAgo } from '../../utils/dateHelpers';

type Props = {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  image?: string;
  isPinned: boolean;
  isRead: boolean;
  publishedBy: string;
  onPress: (id: string) => void;
};

const AnnouncementCard = ({ id, title, category, date, description, image, isPinned, isRead, publishedBy, onPress }: Props) => {
  const { theme } = useTheme();
  const handlePress = useCallback(() => onPress(id), [id, onPress]);
  const preview = description.length > 120 ? description.slice(0, 120) + '...' : description;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderLeftColor: isPinned ? theme.accent : 'transparent' },
        pressed && styles.pressed,
      ]}
      accessible
      accessibilityLabel={title}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.badgeWrap}>
          <View style={[styles.badge, { backgroundColor: theme.accentPale }]}>
            <AppText variant="caption" color={theme.primary}>{category}</AppText>
          </View>
          {!isRead && <View style={[styles.unreadDot, { backgroundColor: theme.danger }]} />}
        </View>
        <AppText variant="caption" color={theme.textMuted}>{formatShortDate(date)}</AppText>
      </View>

      {/* Image */}
      {!!image && (
        <Img source={{ uri: image }} style={styles.image} contentFit="cover" transition={200} />
      )}

      {/* Title */}
      <AppText variant="headingSm" color={theme.primary} style={styles.title} numberOfLines={2}>
        {title}
      </AppText>

      {/* Preview */}
      <AppText variant="bodySm" color={theme.textSecondary} style={styles.preview}>
        {preview}
      </AppText>

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={12} color={theme.textMuted} />
          <AppText variant="caption" color={theme.textMuted} style={styles.metaText}>{publishedBy}</AppText>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={12} color={theme.textMuted} />
          <AppText variant="caption" color={theme.textMuted} style={styles.metaText}>{timeAgo(date)}</AppText>
        </View>
      </View>

      {/* Pinned label */}
      {isPinned && (
        <View style={styles.pinnedLabel}>
          <AppText variant="caption" color={theme.accent}>📌 Naka-pin</AppText>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    ...Shadows.sm,
  },
  pressed: { opacity: 0.85 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  badgeWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  unreadDot: { width: 7, height: 7, borderRadius: 4 },
  image: { width: '100%', height: 140, borderRadius: Radius.sm, marginBottom: Spacing.sm },
  title: { marginBottom: Spacing.xs },
  preview: { marginBottom: Spacing.sm, lineHeight: 18 },
  bottomRow: { flexDirection: 'row', gap: Spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { marginLeft: 2 },
  pinnedLabel: { marginTop: Spacing.xs },
});

export default React.memo(AnnouncementCard);
