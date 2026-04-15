import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { AppText } from '../ui';
import { useTheme } from '../../theme/ThemeContext';

type Action = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
  accent: string;
};

const ACTIONS: Action[] = [
  { id: '1', label: 'Anunsyo',    icon: 'newspaper-outline', route: '/(tabs)/announcements', accent: Colors.navy },
  { id: '2', label: 'Kaganapan', icon: 'calendar-outline',  route: '/(tabs)/schedule',       accent: Colors.gold },
  { id: '3', label: 'Donasyon',  icon: 'gift-outline',      route: '/donations',             accent: Colors.sage },
  { id: '4', label: 'Panalangin',icon: 'heart-outline',     route: '/novenas',               accent: Colors.crimson },
];

const ActionItem = React.memo(({ item }: { item: Action }) => {
  const { theme } = useTheme();
  const handlePress = useCallback(() => router.push(item.route as never), [item.route]);
  return (
    <TouchableOpacity
      onPress={handlePress}
      accessible
      accessibilityLabel={item.label}
      activeOpacity={0.75}
      style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: item.accent + '18' }]}>
        <Ionicons name={item.icon} size={24} color={item.accent} />
      </View>
      <AppText variant="label" color={theme.text} style={styles.label}>{item.label}</AppText>
    </TouchableOpacity>
  );
});

const QuickActions = () => (
  <View style={styles.grid}>
    {ACTIONS.map((a) => <ActionItem key={a.id} item={a} />)}
  </View>
);

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginTop: Spacing.md },
  item: { width: '47.5%', borderRadius: Radius.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  label: { flexShrink: 1 },
});

export default React.memo(QuickActions);
