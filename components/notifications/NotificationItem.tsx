import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../ui/AppText';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { Notification, NotifType } from '../../store/module10Store';

const ICON_MAP: Record<NotifType, React.ComponentProps<typeof Ionicons>['name']> = {
  announcement: 'newspaper-outline',
  event:        'star-outline',
  sacrament:    'water-outline',
  reading:      'book-outline',
  general:      'notifications-outline',
};

const COLOR_MAP: Record<NotifType, string> = {
  announcement: Colors.navy,
  event:        Colors.gold,
  sacrament:    Colors.sage,
  reading:      Colors.crimson,
  general:      Colors.textMuted,
};

interface Props {
  item: Notification;
  onPress: (id: string) => void;
}

const NotificationItem = ({ item, onPress }: Props) => {
  const handlePress = useCallback(() => onPress(item.id), [item.id, onPress]);
  const iconColor = COLOR_MAP[item.type];

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.row, !item.isRead && styles.rowUnread]}
      activeOpacity={0.8}
      accessible
      accessibilityLabel={item.title}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={ICON_MAP[item.type]} size={20} color={iconColor} />
      </View>
      <View style={styles.content}>
        <AppText
          variant={item.isRead ? 'bodyMd' : 'headingSm'}
          color={Colors.textPrimary}
          numberOfLines={1}
        >
          {item.title}
        </AppText>
        <AppText variant="bodySm" color={Colors.textSecondary} numberOfLines={2}>
          {item.body}
        </AppText>
        <AppText variant="caption" color={Colors.textMuted}>{item.time}</AppText>
      </View>
      {!item.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.textInverse,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rowUnread: { backgroundColor: Colors.goldPale + '55', borderColor: Colors.gold + '44' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 2 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
    marginTop: 4,
  },
});

export default React.memo(NotificationItem);
