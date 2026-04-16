import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import WebLayout from '../../components/ui/WebLayout';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { useChurchStore } from '../../store/churchStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

const isWeb = Platform.OS === 'web';

const GCASH_STEPS = [
  { icon: 'phone-portrait-outline' as const, en: 'Open GCash app', fil: 'Buksan ang GCash app' },
  { icon: 'qr-code-outline' as const, en: 'Tap "Send Money" or scan QR', fil: 'I-tap ang "Send Money" o i-scan ang QR' },
  { icon: 'keypad-outline' as const, en: 'Enter amount and confirm', fil: 'Ilagay ang halaga at kumpirmahin' },
  { icon: 'checkmark-circle-outline' as const, en: 'Screenshot your receipt', fil: 'I-screenshot ang inyong resibo' },
];

export default function DonationDetailScreen() {
  const { id, title, description, goal, collected, startDate, endDate, gcashNumber, gcashName } =
    useLocalSearchParams<{
      id: string;
      title: string;
      description: string;
      goal: string;
      collected: string;
      startDate: string;
      endDate: string;
      gcashNumber: string;
      gcashName: string;
    }>();

  const fund = {
    id,
    title,
    description,
    goal: Number(goal),
    collected: Number(collected),
    startDate,
    endDate,
    gcashNumber,
    gcashName,
  };

  const logDonation = useChurchStore((s) => s.logDonation);
  const currentUser = useAuthStore((s) => s.currentUser);
  const showToast = useUiStore((s) => s.showToast);

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [qrVisible, setQrVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!amount || isNaN(Number(amount))) {
      showToast('Ilagay ang tamang halaga', 'error');
      return;
    }
    setSaving(true);
    logDonation({
      id: `don_${Date.now()}`,
      memberId: currentUser?.id ?? '',
      memberName: currentUser?.fullName ?? 'Anonymous',
      amount: Number(amount),
      currency: 'PHP',
      category: fund?.title ?? 'Donation',
      date,
      method: 'gcash',
      notes: note,
      isAnonymous: !currentUser,
    });
    showToast('Naitala ang donasyon!', 'success');
    setSaving(false);
    router.back();
  }, [amount, date, note, fund, currentUser, logDonation, showToast]);

  if (!id || !title) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <AppText variant="bodyMd" color={Colors.textMuted} style={{ padding: Spacing.lg }}>
          Hindi nahanap ang pondo.
        </AppText>
      </SafeAreaView>
    );
  }

  const pct = Math.min(100, Math.round((fund.collected / fund.goal) * 100));

  const content = (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessible accessibilityLabel="Bumalik">
        <Ionicons name="arrow-back" size={20} color={Colors.navy} />
        <AppText variant="bodyMd" color={Colors.navy}>Bumalik</AppText>
      </TouchableOpacity>

      {/* Fund Info */}
      <View style={styles.card}>
        <AppText variant="headingMd" color={Colors.navy}>{fund.title}</AppText>
        <AppText variant="bodySm" color={Colors.textSecondary}>{fund.description}</AppText>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
        </View>
        <View style={styles.progressLabels}>
          <AppText variant="caption" color={Colors.gold}>{pct}%</AppText>
          <AppText variant="caption" color={Colors.textMuted}>
            ₱{fund.collected.toLocaleString()} / ₱{fund.goal.toLocaleString()}
          </AppText>
        </View>
      </View>

      {/* GCash Steps */}
      <View style={styles.card}>
        <AppText variant="headingSm" color={Colors.navy} style={styles.cardTitle}>
          Paano Mag-donate via GCash
        </AppText>
        {GCASH_STEPS.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <AppText variant="label" color={Colors.textInverse}>{i + 1}</AppText>
            </View>
            <Ionicons name={step.icon} size={18} color={Colors.gold} style={{ marginRight: Spacing.sm }} />
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMd" color={Colors.textPrimary}>{step.fil}</AppText>
              <AppText variant="caption" color={Colors.textMuted}>{step.en}</AppText>
            </View>
          </View>
        ))}
        <View style={styles.gcashInfo}>
          <AppText variant="bodySm" color={Colors.textSecondary}>
            GCash: <AppText variant="headingSm" color={Colors.navy}>{fund.gcashNumber}</AppText>
          </AppText>
          <AppText variant="caption" color={Colors.textMuted}>{fund.gcashName}</AppText>
        </View>
      </View>

      {/* QR Code */}
      <View style={styles.card}>
        <AppText variant="headingSm" color={Colors.navy} style={styles.cardTitle}>QR Code</AppText>
        <TouchableOpacity
          onPress={() => setQrVisible(true)}
          style={styles.qrWrap}
          accessible
          accessibilityLabel="I-tap para palakihin ang QR code"
        >
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={80} color={Colors.navy} />
          </View>
          <AppText variant="caption" color={Colors.textMuted} style={{ marginTop: Spacing.xs }}>
            I-tap para palakihin
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Donation Form */}
      <View style={styles.card}>
        <AppText variant="headingSm" color={Colors.navy} style={styles.cardTitle}>
          Itala ang Inyong Donasyon
        </AppText>

        <AppText variant="label" color={Colors.textSecondary} style={styles.fieldLabel}>Halaga (₱)</AppText>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
          accessible
          accessibilityLabel="Halaga"
        />

        <AppText variant="label" color={Colors.textSecondary} style={styles.fieldLabel}>Petsa</AppText>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
          accessible
          accessibilityLabel="Petsa"
        />

        <AppText variant="label" color={Colors.textSecondary} style={styles.fieldLabel}>Tala (opsyonal)</AppText>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Halimbawa: Para sa simbahan"
          placeholderTextColor={Colors.textMuted}
          style={[styles.input, styles.inputMulti]}
          multiline
          numberOfLines={3}
          accessible
          accessibilityLabel="Tala"
        />

        <AppButton label="I-save ang Donasyon" onPress={handleSave} loading={saving} />
      </View>

      {/* Disclaimer */}
      <View style={styles.infoNote}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
        <AppText variant="caption" color={Colors.textMuted} style={{ flex: 1, marginLeft: Spacing.xs }}>
          Ang mga donasyong ito ay self-reported lamang at hindi awtomatikong nabe-verify ng sistema.
        </AppText>
      </View>
    </ScrollView>
  );

  return (
    <>
      {isWeb ? (
        <WebLayout>{content}</WebLayout>
      ) : (
        <SafeAreaView style={styles.screen} edges={['top']}>{content}</SafeAreaView>
      )}

      {/* QR Fullscreen Modal */}
      <Modal visible={qrVisible} transparent animationType="fade" onRequestClose={() => setQrVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setQrVisible(false)}
          accessible
          accessibilityLabel="Isara"
        >
          <View style={styles.modalContent}>
            <Ionicons name="qr-code" size={220} color={Colors.navy} />
            <AppText variant="bodySm" color={Colors.textMuted} style={{ marginTop: Spacing.md }}>
              {fund.gcashNumber} · {fund.gcashName}
            </AppText>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.textInverse,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardTitle: { marginBottom: 4 },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.cream2,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
  },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  gcashInfo: {
    backgroundColor: Colors.cream2,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  qrWrap: { alignItems: 'center', paddingVertical: Spacing.md },
  qrPlaceholder: {
    width: 140,
    height: 140,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cream2,
  },
  fieldLabel: { marginBottom: -4 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.textInverse,
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: Spacing.md,
    backgroundColor: Colors.cream2,
    borderRadius: Radius.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: Colors.textInverse,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
});
