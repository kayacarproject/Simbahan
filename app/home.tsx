import React, { useMemo } from 'react';
import { ScrollView, View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '../constants/Layout';
import { useChurchStore } from '../store/churchStore';
import { useTheme } from '../theme/ThemeContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import WebLayout from '../components/ui/WebLayout';
import HomeHeader from '../components/home/HomeHeader';
import NextMassCard from '../components/home/NextMassCard';
import QuickActions from '../components/home/QuickActions';
import GospelCard from '../components/home/GospelCard';
import AnnouncementPreview from '../components/home/AnnouncementPreview';
import EventPreview from '../components/home/EventPreview';
import FeastCountdown from '../components/home/FeastCountdown';
import FamilyCard from '../components/home/FamilyCard';
import FastingReminder from '../components/home/FastingReminder';

const isWeb = Platform.OS === 'web';

export default function HomeScreen() {
  useAuthGuard();
  const { theme } = useTheme();
  const announcements = useChurchStore((s) => s.announcements);
  const hasUnread = useMemo(() => announcements.some((a) => !a.isRead), [announcements]);

  const content = (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
    >
      <HomeHeader hasUnread={hasUnread} />
      <NextMassCard />
      <QuickActions />
      <View style={styles.gap} />
      <GospelCard />
      <View style={styles.gap} />
      <AnnouncementPreview />
      <View style={styles.gap} />
      <EventPreview />
      <FeastCountdown />
      <View style={styles.gap} />
      <FamilyCard />
      <View style={styles.gap} />
      <FastingReminder />
      <View style={styles.bottomPad} />
    </ScrollView>
  );

  if (isWeb) return <WebLayout>{content}</WebLayout>;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:    { flex: 1 },
  content:   { paddingBottom: Spacing.xxl },
  gap:       { height: Spacing.md },
  bottomPad: { height: Spacing.xxl },
});
