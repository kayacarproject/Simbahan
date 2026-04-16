import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Spacing } from '../../constants/Layout';
import AppText from './AppText';
import { useTheme } from '../../theme/ThemeContext';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

const SectionHeader = ({ title, onSeeAll }: SectionHeaderProps) => {
  const { theme } = useTheme();
  const handlePress = useCallback(() => onSeeAll?.(), [onSeeAll]);

  return (
    <View style={styles.row}>
      <AppText variant="headingMd" color={theme.text}>{title}</AppText>
      {onSeeAll && (
        <TouchableOpacity
          onPress={handlePress}
          accessible
          accessibilityLabel={`See all ${title}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText variant="label" color={theme.accent}>See all</AppText>
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
