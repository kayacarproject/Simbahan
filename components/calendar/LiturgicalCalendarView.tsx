import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Layout';
import { AppText, Badge, Divider } from '../ui';
import { useChurchStore } from '../../store/churchStore';
import HolyDayAlert from './HolyDayAlert';
import SaintOfTheDay from './SaintOfTheDay';
import {
  getCurrentSeason,
  getLiturgicalSeasonBg,
  getUpcomingFeasts,
  getMarkedDates,
  isAbstinenceDay,
  formatFilipinoDate,
} from '../../utils/liturgicalHelpers';

const LITURGICAL_YEAR = 'Taon C';

const LiturgicalCalendarView = () => {
  const liturgicalCalendar = useChurchStore((s) => s.liturgicalCalendar);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [panelOpen, setPanelOpen] = useState(false);

  const currentSeason = useMemo(() => getCurrentSeason(liturgicalCalendar), [liturgicalCalendar]);
  const seasonBg = useMemo(
    () => getLiturgicalSeasonBg(currentSeason?.season ?? 'ordinary'),
    [currentSeason]
  );
  const upcomingFeasts = useMemo(() => getUpcomingFeasts(30), []);
  const markedDates = useMemo(() => {
    const base = getMarkedDates(upcomingFeasts);
    return {
      ...base,
      [selectedDate]: {
        ...(base[selectedDate] ?? {}),
        selected: true,
        selectedColor: Colors.navy,
      },
      [todayStr]: {
        ...(base[todayStr] ?? {}),
        today: true,
      },
    };
  }, [upcomingFeasts, selectedDate, todayStr]);

  const abstinence = useMemo(() => isAbstinenceDay(liturgicalCalendar), [liturgicalCalendar]);

  const handleDayPress = useCallback((day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setPanelOpen(true);
  }, []);

  const selectedFeast = useMemo(
    () => upcomingFeasts.find((f) => f.date === selectedDate),
    [upcomingFeasts, selectedDate]
  );

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: Colors.cream,
      calendarBackground: Colors.cream,
      selectedDayBackgroundColor: Colors.navy,
      selectedDayTextColor: Colors.textInverse,
      todayTextColor: Colors.crimson,
      arrowColor: Colors.navy,
      dotColor: Colors.gold,
      textDayFontFamily: 'DMSans_400Regular',
      textMonthFontFamily: 'PlayfairDisplay_700Bold',
      textDayHeaderFontFamily: 'DMSans_500Medium',
      textDayFontSize: 13,
      textMonthFontSize: 16,
      textDayHeaderFontSize: 11,
      dayTextColor: Colors.textPrimary,
      textDisabledColor: Colors.textMuted,
      monthTextColor: Colors.navy,
    }),
    []
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      bounces={false}
    >
      {/* Holy Day Alert */}
      <HolyDayAlert />

      {/* Season Banner */}
      <View style={StyleSheet.flatten([styles.seasonBanner, { backgroundColor: seasonBg }])}>
        <AppText variant="label" color={Colors.textInverse} style={styles.seasonLabel}>
          {(currentSeason?.season ?? 'ORDINARY').toUpperCase()} TIME
        </AppText>
        <AppText variant="displaySm" color={Colors.textInverse} numberOfLines={2}>
          {currentSeason?.name ?? 'Ordinary Time'}
        </AppText>
        <View style={styles.seasonMeta}>
          <AppText variant="caption" color={Colors.textInverse} style={styles.seasonYear}>
            {LITURGICAL_YEAR}
          </AppText>
          <View style={StyleSheet.flatten([styles.colorDot, { backgroundColor: Colors.textInverse }])} />
          <AppText variant="caption" color={Colors.textInverse}>
            {formatFilipinoDate()}
          </AppText>
        </View>
        {abstinence && (
          <View style={styles.fastingBadge}>
            <Ionicons name="leaf-outline" size={12} color={Colors.textInverse} />
            <AppText variant="caption" color={Colors.textInverse}> Araw ng Abstinensya</AppText>
          </View>
        )}
      </View>

      {/* Calendar */}
      <View style={styles.calendarWrap}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={calendarTheme}
          enableSwipeMonths
        />
      </View>

      {/* Day Press Panel */}
      {panelOpen && (
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <AppText variant="headingSm" color={Colors.navy}>{selectedDate}</AppText>
            <TouchableOpacity
              onPress={() => setPanelOpen(false)}
              accessible
              accessibilityLabel="Close panel"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          {selectedFeast ? (
            <View style={styles.panelContent}>
              <AppText variant="headingSm" color={Colors.navy}>{selectedFeast.name}</AppText>
              <Badge
                label={selectedFeast.rank}
                variant={selectedFeast.rank === 'Solemnity' ? 'gold' : 'navy'}
              />
              {isAbstinenceDay([]) && (
                <View style={styles.fastingRow}>
                  <Ionicons name="leaf-outline" size={14} color={Colors.sage} />
                  <AppText variant="bodySm" color={Colors.sage}> Araw ng Pag-aayuno</AppText>
                </View>
              )}
            </View>
          ) : (
            <AppText variant="bodySm" color={Colors.textMuted}>
              Walang espesyal na kapistahan sa araw na ito.
            </AppText>
          )}
        </View>
      )}

      <Divider />

      {/* Saint of the Day */}
      <View style={styles.section}>
        <SaintOfTheDay />
      </View>

      {/* Upcoming Feasts */}
      <View style={styles.section}>
        <AppText variant="headingSm" color={Colors.navy} style={styles.sectionTitle}>
          Mga Darating na Kapistahan
        </AppText>
        {upcomingFeasts.length === 0 ? (
          <AppText variant="bodySm" color={Colors.textMuted}>
            Walang kapistahan sa susunod na 30 araw.
          </AppText>
        ) : (
          upcomingFeasts.map((feast) => (
            <View key={feast.date} style={styles.feastRow}>
              <View style={styles.dateBadge}>
                <AppText variant="label" color={Colors.textInverse} style={styles.dateBadgeText}>
                  {feast.date.slice(5)}
                </AppText>
              </View>
              <View style={styles.feastInfo}>
                <AppText variant="bodyMd" color={Colors.textPrimary} numberOfLines={2}>
                  {feast.name}
                </AppText>
                <Badge
                  label={feast.rank}
                  variant={feast.rank === 'Solemnity' ? 'gold' : feast.rank === 'Feast' ? 'navy' : 'muted'}
                />
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingBottom: Spacing.xxl },
  seasonBanner: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  seasonLabel: { letterSpacing: 1.5, opacity: 0.8 },
  seasonMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs },
  seasonYear: { opacity: 0.85 },
  colorDot: { width: 4, height: 4, borderRadius: 2, opacity: 0.6 },
  fastingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  calendarWrap: {
    backgroundColor: Colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  panel: {
    backgroundColor: Colors.textInverse,
    margin: Spacing.md,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelContent: { gap: Spacing.sm },
  fastingRow: { flexDirection: 'row', alignItems: 'center' },
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.md, gap: Spacing.sm },
  sectionTitle: { marginBottom: Spacing.xs },
  feastRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateBadge: {
    backgroundColor: Colors.navy,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 48,
    alignItems: 'center',
  },
  dateBadgeText: { fontSize: 11 },
  feastInfo: { flex: 1, gap: Spacing.xs },
});

export default React.memo(LiturgicalCalendarView);
