import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, Platform, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useUiStore } from '../../store/uiStore';
import { useTheme } from '../../theme/ThemeContext';
import WebLayout from '../../components/ui/WebLayout';
import AppText from '../../components/ui/AppText';
import MassScheduleShimmer from '../../components/skeletons/MassScheduleShimmer';
import { getDataPublic } from '../../services/ApiHandler';
import Api from '../../services/Api';

type MassDay = {
  _id: string;
  day: string;
  dayIndex: number;
  times: string;
  language: string;
  notes: string;
};

const Fonts = {
  heading:    'PlayfairDisplay_700Bold',
  body:       'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
} as const;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const isWeb = Platform.OS === 'web';

export default function ScheduleScreen() {
  const { theme } = useTheme();
  const { isWeb: isWebBreakpoint } = useBreakpoint();
  const showToast = useUiStore((s) => s.showToast);

  const [schedule,     setSchedule]     = useState<MassDay[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    const body = {
      appName: Api.appName, moduleName: 'massschedule',
      query: {}, limit: 10, skip: 0, sortBy: 'createdAt', order: 'descending' as const,
    };
    console.log('[SCHEDULE] Request:', body);
    try {
      const data = await getDataPublic(body);
      if (data?.success === true) {
        console.log('[SCHEDULE] Response:', data.data);
        const sorted = (data.data as MassDay[]).slice().sort((a, b) => a.dayIndex - b.dayIndex);
        setSchedule(sorted);
      } else {
        console.log('[SCHEDULE] No data:', data?.message);
        setSchedule([]);
      }
    } catch (e: any) {
      const msg = e?.message === 'Session expired'
        ? 'Session expired. Please log in again.'
        : 'Hindi ma-load ang iskedyul. Subukan muli.';
      console.log('[SCHEDULE] Error:', e?.response?.data || e.message);
      showToast(msg, 'error');
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  const selectedDay = useMemo(
    () => DAYS[new Date(selectedDate + 'T00:00:00').getDay()],
    [selectedDate],
  );

  const daySchedule = useMemo(
    () => schedule.find((d) => d.day === selectedDay),
    [schedule, selectedDay],
  );

  const timesList = useMemo(
    () => daySchedule ? daySchedule.times.split(',').map((t) => t.trim()).filter(Boolean) : [],
    [daySchedule],
  );

  // Calendar theme — rebuilt per render so it reacts to mode changes
  const calendarTheme = {
    backgroundColor:            theme.background,
    calendarBackground:         theme.background,
    selectedDayBackgroundColor: theme.primary,
    selectedDayTextColor:       Colors.textInverse,
    todayTextColor:             theme.accent,
    arrowColor:                 theme.primary,
    dayTextColor:               theme.text,
    textDisabledColor:          theme.textMuted,
    monthTextColor:             theme.text,
    textDayFontFamily:          Fonts.body,
    textMonthFontFamily:        Fonts.heading,
    textDayHeaderFontFamily:    Fonts.bodyMedium,
  };

  const renderTime = useCallback(({ item }: ListRenderItemInfo<string>) => (
    <View style={[styles.timeRow, { backgroundColor: theme.surface2, borderLeftColor: theme.accent }]}>
      <Text style={[styles.timeText, { color: theme.primary }]}>{item}</Text>
      <Text style={[styles.massLabel, { color: theme.textMuted }]}>Holy Mass</Text>
    </View>
  ), [theme]);

  const DayCard = useCallback(() => {
    if (loading) return <MassScheduleShimmer />;

    if (!daySchedule) {
      return (
        <View style={styles.emptyWrap}>
          <Ionicons name="calendar-outline" size={36} color={theme.textMuted} />
          <AppText variant="bodySm" color={theme.textMuted} style={styles.emptyText}>
            Walang Misa sa araw na ito.
          </AppText>
        </View>
      );
    }

    const langs = daySchedule.language.split(',').map((l) => l.trim());

    return (
      <View style={[styles.dayCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {/* Day title + language badges */}
        <View style={styles.dayCardHeader}>
          <AppText variant="headingMd" color={theme.primary}>{daySchedule.day}</AppText>
          <View style={styles.langRow}>
            {langs.map((lang) => (
              <View key={lang} style={[styles.langBadge, { backgroundColor: theme.accentPale }]}>
                <AppText variant="caption" color={theme.primary}>{lang}</AppText>
              </View>
            ))}
          </View>
        </View>

        {/* Mass times */}
        <FlatList
          data={timesList}
          renderItem={renderTime}
          keyExtractor={(t) => t}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        />

        {/* Notes */}
        {!!daySchedule.notes && (
          <View style={[styles.notesRow, { backgroundColor: theme.accentPale }]}>
            <Ionicons name="information-circle-outline" size={14} color={theme.accent} />
            <AppText variant="caption" color={theme.textMuted} style={styles.notesText}>
              {daySchedule.notes}
            </AppText>
          </View>
        )}
      </View>
    );
  }, [loading, daySchedule, timesList, renderTime, theme]);

  const webContent = (
    <View style={styles.webLayout}>
      <View style={styles.webLeft}>
        <Text style={[styles.webHeading, { color: theme.text }]}>Mass Schedule</Text>
        <View style={[styles.calendarCard, { backgroundColor: theme.surface }]}>
          <Calendar
            onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
            markedDates={{ [selectedDate]: { selected: true, selectedColor: theme.primary } }}
            theme={calendarTheme}
          />
        </View>
      </View>
      <View style={styles.webRight}>
        <Text style={[styles.webSubHeading, { color: theme.text }]}>{selectedDay} Masses</Text>
        <DayCard />
      </View>
    </View>
  );

  const mobileContent = (
    <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: theme.background }}>
      <View style={styles.mobileHeader}>
        <Text style={[styles.mobileHeading, { color: theme.text }]}>Mass Schedule</Text>
      </View>
      <Calendar
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: theme.primary } }}
        theme={calendarTheme}
      />
      <View style={styles.mobileBody}>
        <Text style={[styles.mobileSubHeading, { color: theme.text }]}>{selectedDay} Masses</Text>
        <DayCard />
      </View>
    </ScrollView>
  );

  if (isWeb) {
    return (
      <WebLayout>
        <View style={[styles.screen, { backgroundColor: theme.background }]}>{webContent}</View>
      </WebLayout>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>
      {mobileContent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Day card
  dayCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  langRow:  { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  langBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    gap: Spacing.sm,
  },
  timeText:  { fontFamily: Fonts.bodyMedium, fontSize: 15, flex: 1 },
  massLabel: { fontFamily: Fonts.body, fontSize: 13 },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  notesText: { flex: 1 },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: { textAlign: 'center' },

  // Web
  webLayout:    { flexDirection: 'row', flex: 1, paddingHorizontal: 32, paddingTop: 16 },
  webLeft:      { flex: 1, marginRight: 24 },
  webRight:     { flex: 1, paddingTop: 64 },
  webHeading:   { fontFamily: Fonts.heading, fontSize: 32, marginBottom: 16 },
  webSubHeading:{ fontFamily: Fonts.heading, fontSize: 20, marginBottom: 12 },
  calendarCard: { borderRadius: 16, overflow: 'hidden' },

  // Mobile
  mobileHeader:    { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  mobileHeading:   { fontFamily: Fonts.heading, fontSize: 26 },
  mobileBody:      { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xxl },
  mobileSubHeading:{ fontFamily: Fonts.heading, fontSize: 18, marginBottom: 12 },
});
