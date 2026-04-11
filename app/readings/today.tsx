import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ScreenHeader } from '../../components/ui';
import TodayReadings from '../../components/calendar/TodayReadings';

export default function TodayReadingsScreen() {
  const handleBack = useCallback(() => router.back(), []);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title="Pagbasa ng Araw"
        subtitle="Mabuting Balita"
        onBack={handleBack}
      />
      <View style={styles.content}>
        <TodayReadings />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  content: { flex: 1 },
});
