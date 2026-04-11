import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Layout';
import AppText from './AppText';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

const SectionHeader = ({ title, onSeeAll }: SectionHeaderProps) => {
  const handlePress = useCallback(() => onSeeAll?.(), [onSeeAll]);

  return (
    <View style={styles.row}>
      <AppText variant="headingMd" color={Colors.textPrimary}>{title}</AppText>
      {onSeeAll && (
        <TouchableOpacity
          onPress={handlePress}
          accessible
          accessibilityLabel={`See all ${title}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText variant="label" color={Colors.gold}>See all</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
});

export default React.memo(SectionHeader);
