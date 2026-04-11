import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppText from '../ui/AppText';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';

interface MemberCardProps {
  id: string;
  fullName: string;
  barangay: string;
  ministries: string[];
  familyName?: string;
  avatar?: string;
}

const MemberCard = ({ id, fullName, barangay, ministries, familyName, avatar }: MemberCardProps) => {
  const handlePress = useCallback(() => {
    router.push(`/community/member/${id}` as never);
  }, [id]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.card}
      activeOpacity={0.8}
      accessible
      accessibilityLabel={fullName}
    >
      <Avatar uri={avatar} name={fullName} size="md" />
      <View style={styles.info}>
        <AppText variant="headingSm" color={Colors.textPrimary} numberOfLines={1}>
          {fullName}
        </AppText>
        <AppText variant="caption" color={Colors.textMuted} numberOfLines={1}>
          {barangay}
        </AppText>
        {ministries.length > 0 && (
          <View style={styles.badges}>
            {ministries.slice(0, 2).map((m) => (
              <Badge key={m} label={m} variant="navy" />
            ))}
            {ministries.length > 2 && (
              <Badge label={`+${ministries.length - 2}`} variant="muted" />
            )}
          </View>
        )}
        {!!familyName && (
          <AppText variant="caption" color={Colors.textMuted}>
            {familyName}
          </AppText>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textInverse,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
});

export default React.memo(MemberCard);
