import React, { useMemo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { AppText, Badge, SectionHeader } from '../ui';
import { useChurchStore } from '../../store/churchStore';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Ngayon';
  if (days === 1) return 'Kahapon';
  if (days < 7) return `${days} araw na ang nakalipas`;
  return `${Math.floor(days / 7)} linggo na ang nakalipas`;
}

const AnnouncementPreview = () => {
  const announcements = useChurchStore((s) => s.announcements);

  const preview = useMemo(() => announcements.slice(0, 2), [announcements]);

  const handleSeeAll = useCallback(() => router.push('/(tabs)/announcements' as never), []);
  const handlePress = useCallback(
    (id: string) => router.push(`/announcements/${id}` as never),
    []
  );

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Mga Anunsyo" onSeeAll={handleSeeAll} />
      {preview.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => handlePress(item.id)}
          accessible
          accessibilityLabel={item.title}
          activeOpacity={0.8}
          style={styles.card}
        >
          {!item.isRead && <View style={styles.unread} />}
          <View style={styles.cardBody}>
            <View style={styles.topRow}>
              <Badge label={item.category} variant="gold" />
              <AppText variant="caption" color={Colors.textMuted}>{timeAgo(item.date)}</AppText>
            </View>
            <AppText variant="headingSm" color={Colors.navy} numberOfLines={2} style={styles.title}>
              {item.title}
            </AppText>
            <AppText variant="bodySm" color={Colors.textSecondary} numberOfLines={2}>
              {item.description}
            </AppText>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.md },
  card: {
    backgroundColor: Colors.textInverse,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  unread: {
    width: 4,
    backgroundColor: Colors.gold,
  },
  cardBody: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { marginTop: 2 },
});

export default React.memo(AnnouncementPreview);
