import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import Avatar from '../../components/ui/Avatar';
import WebLayout from '../../components/ui/WebLayout';
import { ProfileHeroShimmer, ProfileCardShimmer } from '../../components/skeletons/ProfileShimmer';
import { Spacing, Radius } from '../../constants/Layout';
import { useUiStore } from '../../store/uiStore';
import { useTheme } from '../../theme/ThemeContext';
import { getDataPublic, updateDynamicData } from '../../services/ApiHandler';
import { getUserId } from '../../services/authService';
import Api from '../../services/Api';

const isWeb = Platform.OS === 'web';
const isIOS = Platform.OS === 'ios';
const CIVIL_STATUSES = ['Single', 'Married', 'Widowed', 'Separated'];

const toDateObj = (str: string): Date => {
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
};

const formatDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const showToast = useUiStore((s) => s.showToast);

  const [avatar,       setAvatar]       = useState<string | null>(null);
  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [birthday,     setBirthday]     = useState('');
  const [barangay,     setBarangay]     = useState('');
  const [municipality, setMunicipality] = useState('');
  const [civil,        setCivil]        = useState('Single');
  const [showPicker,   setShowPicker]   = useState(false);
  const [pickerDate,   setPickerDate]   = useState(new Date());
  const [loading,      setLoading]      = useState(false);
  const [saving,       setSaving]       = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      const data = await getDataPublic({
        appName: Api.appName, moduleName: 'appuser',
        query: userId ? { _id: userId } : {},
        limit: 1, skip: 0, sortBy: 'createdAt', order: 'descending',
      });
      if (data?.success === true && data.data?.length > 0) {
        const u = data.data[0];
        setAvatar(u.avatar ?? null);
        setFirstName(u.firstName ?? '');
        setLastName(u.lastName ?? '');
        setBirthday(u.birthDate ?? '');
        setBarangay(u.barangay ?? '');
        setMunicipality(u.municipality ?? '');
        setCivil(u.civilStatus ?? 'Single');
        if (u.birthDate) setPickerDate(toDateObj(u.birthDate));
      }
    } catch (e: any) {
      console.log('[EDIT PROFILE] Fetch Error:', e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Date picker ─────────────────────────────────────────────────────────
  const onDateChange = useCallback((_: any, selected?: Date) => {
    if (isIOS) {
      if (selected) { setPickerDate(selected); setBirthday(formatDate(selected)); }
    } else {
      setShowPicker(false);
      if (selected) { setPickerDate(selected); setBirthday(formatDate(selected)); }
    }
  }, []);

  const confirmIOSDate = useCallback(() => {
    setBirthday(formatDate(pickerDate));
    setShowPicker(false);
  }, [pickerDate]);

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showToast('Punan ang Unang Pangalan at Apelyido.', 'error');
      return;
    }
    setSaving(true);
    try {
      const docId = await getUserId();
      if (!docId) throw new Error('User not found');
      const body = {
        appName: Api.appName, moduleName: 'appuser', docId,
        body: { firstName, lastName, birthDate: birthday, barangay, municipality, civilStatus: civil },
      };
      console.log('[EDIT PROFILE] Update Request:', body);
      const res = await updateDynamicData(body);
      console.log('[EDIT PROFILE] Update Response:', res);
      if (res?.success === true) {
        showToast('Na-save ang profile!', 'success');
        router.back();
      } else {
        showToast(res?.message || 'Hindi na-save. Subukan muli.', 'error');
      }
    } catch (e: any) {
      const msg = e?.message === 'Session expired'
        ? 'Session expired. Please log in again.'
        : e?.message || 'Hindi na-save. Subukan muli.';
      console.log('[EDIT PROFILE] Update Error:', e?.message);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }, [firstName, lastName, birthday, barangay, municipality, civil, showToast]);

  // ── Dynamic styles ───────────────────────────────────────────────────────
  const s = StyleSheet.create({
    screen:       { flex: 1, backgroundColor: theme.background },
    scroll:       { paddingBottom: Spacing.xxl },
    topBar:       { padding: Spacing.md, gap: Spacing.sm, backgroundColor: theme.background },
    backBtn:      { flexDirection: 'row' as const, alignItems: 'center' as const, gap: Spacing.xs },
    avatarSection:{ alignItems: 'center' as const, paddingVertical: Spacing.lg, gap: Spacing.sm },
    changePhotoBtn:{ borderWidth: 1, borderColor: theme.primary, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
    card:         { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: Radius.md, padding: Spacing.md, margin: Spacing.md, marginBottom: 0, gap: Spacing.sm },
    cardTitle:    { marginBottom: 4 },
    fieldWrap:    { gap: 4 },
    label:        { marginBottom: 2 },
    input:        {
      borderWidth: 1, borderColor: theme.inputBorder, borderRadius: Radius.sm,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
      fontFamily: 'DMSans_400Regular', fontSize: 14,
      color: theme.inputText, backgroundColor: theme.inputBackground,
      ...Platform.select({ web: { outlineStyle: 'none' } as any }),
    },
    dateBtn:      { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: theme.inputBackground },
    segLabel:     { marginBottom: 4 },
    segRow:       { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: Spacing.sm },
    segBtn:       { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border },
    segBtnActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    saveWrap:     { margin: Spacing.md },
    modalOverlay: { flex: 1, backgroundColor: theme.overlay, justifyContent: 'flex-end' as const },
    modalCard:    { backgroundColor: theme.surface, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, padding: Spacing.md },
    modalHeader:  { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.border, marginBottom: Spacing.sm },
    iosPicker:    { width: '100%' as any },
    webDoneBtn:   { backgroundColor: theme.primary, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center' as const, marginTop: Spacing.md },
  });

  function Field({ label, value, onChange, placeholder, keyboardType }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; keyboardType?: 'default' | 'email-address' | 'phone-pad';
  }) {
    return (
      <View style={s.fieldWrap}>
        <AppText variant="label" color={theme.textSecondary}>{label}</AppText>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder ?? label}
          placeholderTextColor={theme.inputPlaceholder}
          keyboardType={keyboardType ?? 'default'}
          style={s.input}
          accessible
          accessibilityLabel={label}
        />
      </View>
    );
  }

  const content = (
    <ScrollView style={s.screen} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessible accessibilityLabel="Bumalik">
          <Ionicons name="arrow-back" size={20} color={theme.primary} />
          <AppText variant="bodyMd" color={theme.primary}>Bumalik</AppText>
        </TouchableOpacity>
        <AppText variant="headingMd" color={theme.primary}>I-edit ang Profile</AppText>
      </View>

      {loading ? (
        <>
          <ProfileHeroShimmer />
          <ProfileCardShimmer rows={6} />
        </>
      ) : (
        <>
          {/* Avatar */}
          <View style={s.avatarSection}>
            <Avatar uri={avatar ?? undefined} name={`${firstName} ${lastName}`} size="lg" />
            <TouchableOpacity style={s.changePhotoBtn} accessible accessibilityLabel="Palitan ang larawan">
              <AppText variant="label" color={theme.primary}>Palitan ang Larawan</AppText>
            </TouchableOpacity>
          </View>

          <View style={s.card}>
            <AppText variant="headingSm" color={theme.primary} style={s.cardTitle}>Personal na Impormasyon</AppText>

            {/* 1 */}
            <Field label="Unang Pangalan" value={firstName} onChange={setFirstName} />
            {/* 2 */}
            <Field label="Apelyido" value={lastName} onChange={setLastName} />

            {/* 3 — Date picker */}
            <View style={s.fieldWrap}>
              <AppText variant="label" color={theme.textSecondary}>Kaarawan</AppText>
              <TouchableOpacity style={s.dateBtn} onPress={() => setShowPicker(true)} accessible accessibilityLabel="Pumili ng petsa ng kaarawan">
                <AppText variant="bodyMd" color={birthday ? theme.text : theme.inputPlaceholder}>
                  {birthday || 'YYYY-MM-DD'}
                </AppText>
                <Ionicons name="calendar-outline" size={18} color={theme.primary} />
              </TouchableOpacity>
            </View>

            {/* 4 */}
            <Field label="Barangay" value={barangay} onChange={setBarangay} />
            {/* 5 */}
            <Field label="Munisipalidad" value={municipality} onChange={setMunicipality} />

            {/* 6 — Civil status */}
            <AppText variant="label" color={theme.textSecondary} style={s.segLabel}>Katayuang Sibil</AppText>
            <View style={s.segRow}>
              {CIVIL_STATUSES.map((cs) => (
                <TouchableOpacity
                  key={cs}
                  onPress={() => setCivil(cs)}
                  style={[s.segBtn, civil === cs && s.segBtnActive]}
                  accessible
                  accessibilityLabel={cs}
                >
                  <AppText variant="label" color={civil === cs ? theme.textInverse : theme.textMuted}>{cs}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.saveWrap}>
            <AppButton label="I-save ang mga Pagbabago" onPress={handleSave} loading={saving} />
          </View>
        </>
      )}

      {/* Android picker */}
      {showPicker && !isIOS && !isWeb && (
        <DateTimePicker value={pickerDate} mode="date" display="default" maximumDate={new Date()} onChange={onDateChange} />
      )}

      {/* iOS picker modal */}
      {isIOS && (
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <View style={s.modalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <AppText variant="bodyMd" color={theme.textMuted}>Kanselahin</AppText>
                </TouchableOpacity>
                <AppText variant="headingSm" color={theme.primary}>Kaarawan</AppText>
                <TouchableOpacity onPress={confirmIOSDate}>
                  <AppText variant="bodyMd" color={theme.primary}>Tapos na</AppText>
                </TouchableOpacity>
              </View>
              <DateTimePicker value={pickerDate} mode="date" display="spinner" maximumDate={new Date()} onChange={onDateChange} style={s.iosPicker} />
            </View>
          </View>
        </Modal>
      )}

      {/* Web picker modal */}
      {isWeb && showPicker && (
        <Modal visible transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <AppText variant="headingSm" color={theme.primary} style={{ marginBottom: Spacing.sm }}>
                Pumili ng Kaarawan
              </AppText>
              <TextInput
                value={birthday}
                onChangeText={setBirthday}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.inputPlaceholder}
                style={s.input}
                accessible
                accessibilityLabel="Kaarawan"
              />
              <TouchableOpacity style={s.webDoneBtn} onPress={() => setShowPicker(false)}>
                <AppText variant="label" color={theme.textInverse}>Tapos na</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );

  if (isWeb) return <WebLayout>{content}</WebLayout>;
  return <SafeAreaView style={s.screen} edges={['top']}>{content}</SafeAreaView>;
}
