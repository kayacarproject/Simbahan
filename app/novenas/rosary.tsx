import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppText from '../../components/ui/AppText';
import WebLayout from '../../components/ui/WebLayout';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';

const isWeb = Platform.OS === 'web';

const MYSTERIES: Record<string, { label: string; mysteries: string[] }> = {
  Sunday:    { label: 'Glorious Mysteries',  mysteries: ['Resurrection','Ascension','Descent of Holy Spirit','Assumption of Mary','Coronation of Mary'] },
  Monday:    { label: 'Joyful Mysteries',    mysteries: ['Annunciation','Visitation','Nativity','Presentation','Finding in Temple'] },
  Tuesday:   { label: 'Sorrowful Mysteries', mysteries: ['Agony in Garden','Scourging','Crowning with Thorns','Carrying the Cross','Crucifixion'] },
  Wednesday: { label: 'Glorious Mysteries',  mysteries: ['Resurrection','Ascension','Descent of Holy Spirit','Assumption of Mary','Coronation of Mary'] },
  Thursday:  { label: 'Luminous Mysteries',  mysteries: ['Baptism of Jesus','Wedding at Cana','Proclamation of Kingdom','Transfiguration','Institution of Eucharist'] },
  Friday:    { label: 'Sorrowful Mysteries', mysteries: ['Agony in Garden','Scourging','Crowning with Thorns','Carrying the Cross','Crucifixion'] },
  Saturday:  { label: 'Joyful Mysteries',    mysteries: ['Annunciation','Visitation','Nativity','Presentation','Finding in Temple'] },
};

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const today = DAYS[new Date().getDay()];

const SECTIONS = [
  { id: 'opening', label: 'Mga Pambungad na Panalangin', content: "Apostles' Creed, Our Father, 3 Hail Marys, Glory Be" },
  { id: 'decades', label: 'Sampung Butil (Decades)', content: 'Para sa bawat misteryo: Our Father × 1, Hail Mary × 10, Glory Be × 1, Fatima Prayer × 1' },
  { id: 'closing', label: 'Mga Pangwakas na Panalangin', content: 'Hail Holy Queen (Salve Regina), Litany of the Blessed Virgin Mary' },
];

function AccordionSection({ label, content }: { label: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.accordion}>
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        style={styles.accordionHeader}
        accessible
        accessibilityLabel={label}
      >
        <AppText variant="headingSm" color={Colors.navy} style={{ flex: 1 }}>{label}</AppText>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
      </TouchableOpacity>
      {open && (
        <View style={styles.accordionBody}>
          <AppText variant="bodyMd" color={Colors.textSecondary}>{content}</AppText>
        </View>
      )}
    </View>
  );
}

export default function RosaryScreen() {
  const [selectedDay, setSelectedDay] = useState(today);
  const mystery = MYSTERIES[selectedDay];

  const content = (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessible accessibilityLabel="Bumalik">
          <Ionicons name="arrow-back" size={20} color={Colors.navy} />
        </TouchableOpacity>
        <View>
          <AppText variant="displaySm" color={Colors.navy}>Rosaryo</AppText>
          <AppText variant="bodySm" color={Colors.textMuted}>The Holy Rosary</AppText>
        </View>
      </View>

      {/* Day picker */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
        {DAYS.map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => setSelectedDay(d)}
            style={[styles.dayChip, selectedDay === d && styles.dayChipActive]}
            accessible
            accessibilityLabel={d}
          >
            <AppText variant="label" color={selectedDay === d ? Colors.textInverse : Colors.textMuted}>
              {d.slice(0, 3)}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Mystery */}
      <View style={styles.mysteryCard}>
        <View style={styles.mysteryHeader}>
          <Ionicons name="ellipse-outline" size={20} color={Colors.gold} />
          <AppText variant="headingMd" color={Colors.navy}>{mystery.label}</AppText>
        </View>
        {mystery.mysteries.map((m, i) => (
          <View key={m} style={styles.mysteryRow}>
            <View style={styles.mysteryNum}>
              <AppText variant="label" color={Colors.textInverse}>{i + 1}</AppText>
            </View>
            <AppText variant="bodyMd" color={Colors.textPrimary}>{m}</AppText>
          </View>
        ))}
      </View>

      {/* Accordion sections */}
      <View style={styles.section}>
        <AppText variant="headingSm" color={Colors.navy} style={styles.sectionTitle}>Mga Bahagi ng Rosaryo</AppText>
        {SECTIONS.map((s) => (
          <AccordionSection key={s.id} label={s.label} content={s.content} />
        ))}
      </View>
    </ScrollView>
  );

  if (isWeb) return <WebLayout>{content}</WebLayout>;
  return <SafeAreaView style={styles.screen} edges={['top']}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  scroll: { paddingBottom: Spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.textInverse,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: Spacing.xs },
  dayRow: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm },
  dayChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.cream2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayChipActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  mysteryCard: {
    backgroundColor: Colors.textInverse,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    margin: Spacing.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  mysteryHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  mysteryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 2 },
  mysteryNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { padding: Spacing.md, gap: Spacing.sm },
  sectionTitle: { marginBottom: 4 },
  accordion: {
    backgroundColor: Colors.textInverse,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  accordionBody: {
    padding: Spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
