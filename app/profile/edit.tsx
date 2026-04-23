import React, { useState, useCallback, useEffect } from 'react';
import {
  View, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Platform, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import Avatar from '../../components/ui/Avatar';
import ImagePickerModal from '../../components/ui/ImagePickerModal';
import WebLayout from '../../components/ui/WebLayout';
import { ProfileHeroShimmer, ProfileCardShimmer } from '../../components/skeletons/ProfileShimmer';
import { Spacing, Radius } from '../../constants/Layout';
import { useUiStore } from '../../store/uiStore';
import { useTheme } from '../../theme/ThemeContext';
import { getDataPublic, updateDynamicData, uploadImage } from '../../services/ApiHandler';
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

function Field({ label, value, onChange, placeholder, keyboardType, inputStyle }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: 'default' | 'email-address' | 'phone-pad';
  inputStyle?: object;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <AppText variant="label" color="#8A8A8A">{label}</AppText>
      <TextInput
        value={value} onChangeText={onChange}
        placeholder={placeholder ?? label} placeholderTextColor="#8A8A8A"
        keyboardType={keyboardType ?? 'default'}
        style={[fieldStyles.input, inputStyle]}
        accessible accessibilityLabel={label}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap:  { gap: 4 },
  input: {
    borderWidth: 1, borderColor: '#E5E5E0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#1A1A1A',
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
});

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const showToast = useUiStore((s) => s.showToast);

  const [avatar,        setAvatar]        = useState<string | null>(null);
  const [firstName,     setFirstName]     = useState('');
  const [lastName,      setLastName]      = useState('');
  const [birthday,      setBirthday]      = useState('');
  const [barangay,      setBarangay]      = useState('');
  const [municipality,  setMunicipality]  = useState('');
  const [civil,         setCivil]         = useState('Single');
  const [showDatePicker,setShowDatePicker]= useState(false);
  const [pickerDate,    setPickerDate]    = useState(new Date());
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [uploadingImg,  setUploadingImg]  = useState(false);
  const [removingImg,   setRemovingImg]   = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [imgModalOpen,  setImgModalOpen]  = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
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
        setAvatar(u.profile ?? u.avatar ?? null);
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

  // ── Image upload — called by ImagePickerModal ────────────────────────────
  const handleImageSelected = useCallback(async (localUri: string) => {
    setUploadingImg(true);
    try {
      const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `profile_${Date.now()}.${ext}`;
      console.log('[EDIT PROFILE] Uploading image:', localUri);
      const imageUrl = await uploadImage(localUri, fileName);
      console.log('[EDIT PROFILE] Image URL:', imageUrl);
      const docId = await getUserId();
      if (docId) {
        await updateDynamicData({
          appName: Api.appName, moduleName: 'appuser', docId,
          body: { profile: imageUrl },
        });
      }
      setAvatar(imageUrl);
      showToast('Na-update ang larawan!', 'success');
    } catch (e: any) {
      console.log('[EDIT PROFILE] Upload Error:', e?.message);
      showToast(e?.message || 'Hindi na-upload ang larawan.', 'error');
    } finally {
      setUploadingImg(false);
    }
  }, [showToast]);

  // ── Image remove ─────────────────────────────────────────────────────────
  const handleRemoveImage = useCallback(async () => {
    setConfirmRemove(false);
    setRemovingImg(true);
    try {
      const docId = await getUserId();
      if (docId) {
        await updateDynamicData({
          appName: Api.appName, moduleName: 'appuser', docId,
          body: { profile: '' },
        });
      }
      setAvatar(null);
      showToast('Natanggal ang larawan.', 'success');
    } catch (e: any) {
      console.log('[EDIT PROFILE] Remove Image Error:', e?.message);
      showToast(e?.message || 'Hindi natanggal ang larawan.', 'error');
    } finally {
      setRemovingImg(false);
    }
  }, [showToast]);

  // ── Date picker ──────────────────────────────────────────────────────────
  const onDateChange = useCallback((_: any, selected?: Date) => {
    if (isIOS) {
      if (selected) { setPickerDate(selected); setBirthday(formatDate(selected)); }
    } else {
      setShowDatePicker(false);
      if (selected) { setPickerDate(selected); setBirthday(formatDate(selected)); }
    }
  }, []);

  const confirmIOSDate = useCallback(() => {
    setBirthday(formatDate(pickerDate));
    setShowDatePicker(false);
  }, [pickerDate]);

  // ── Save ─────────────────────────────────────────────────────────────────
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

  // ── Dynamic styles ────────────────────────────────────────────────────────
  const s = StyleSheet.create({
    screen:        { flex: 1, backgroundColor: theme.background },
    scroll:        { paddingBottom: Spacing.xxl },
    topBar:        { padding: Spacing.md, gap: Spacing.sm, backgroundColor: theme.background },
    backBtn:       { flexDirection: 'row' as const, alignItems: 'center' as const, gap: Spacing.xs },
    avatarSection: { alignItems: 'center' as const, paddingVertical: Spacing.lg, gap: Spacing.sm },
    avatarWrap:    { position: 'relative' as const, alignItems: 'center' as const, justifyContent: 'center' as const, ...(Platform.OS === 'web' ? { overflow: 'hidden', borderRadius: '50%' } as any : {}) },
    avatarBorder:  { position: 'absolute' as const, top: -3, left: -3, right: -3, bottom: -3, borderRadius: Platform.OS === 'web' ? ('50%' as any) : 9999, borderWidth: 2, borderColor: theme.accent },
    cameraBtn:     { position: 'absolute' as const, bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: theme.primary, alignItems: 'center' as const, justifyContent: 'center' as const, borderWidth: 2, borderColor: theme.background },
    changePhotoBtn:{ borderWidth: 1, borderColor: theme.primary, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
    card:          { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: Radius.md, padding: Spacing.md, margin: Spacing.md, marginBottom: 0, gap: Spacing.sm },
    cardTitle:     { marginBottom: 4 },
    fieldWrap:     { gap: 4 },
    input:         { borderWidth: 1, borderColor: theme.inputBorder, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontFamily: 'DMSans_400Regular', fontSize: 14, color: theme.inputText, backgroundColor: theme.inputBackground, ...Platform.select({ web: { outlineStyle: 'none' } as any }) },
    dateBtn:       { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: theme.inputBackground },
    segLabel:      { marginBottom: 4 },
    segRow:        { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: Spacing.sm },
    segBtn:        { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border },
    segBtnActive:  { backgroundColor: theme.primary, borderColor: theme.primary },
    saveWrap:      { margin: Spacing.md },
    modalOverlay:  { flex: 1, backgroundColor: theme.overlay, justifyContent: 'flex-end' as const },
    modalCard:     { backgroundColor: theme.surface, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, padding: Spacing.md },
    modalHeader:   { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.border, marginBottom: Spacing.sm },
    iosPicker:     { width: '100%' as any },
    webDoneBtn:    { backgroundColor: theme.primary, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center' as const, marginTop: Spacing.md },
    confirmOverlay: { justifyContent: 'center' as const },
    confirmCard:   { backgroundColor: theme.surface, borderRadius: Radius.lg, padding: Spacing.xl, marginHorizontal: Spacing.xl, alignItems: 'center' as const, gap: Spacing.sm },
    confirmIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.dangerPale, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: Spacing.xs },
    confirmTitle:  { textAlign: 'center' as const },
    confirmMsg:    { textAlign: 'center' as const, marginBottom: Spacing.sm },
    confirmBtns:   { flexDirection: 'row' as const, gap: Spacing.sm, width: '100%' as any },
    confirmBtn:    { flex: 1, borderWidth: 1, borderRadius: Radius.sm, paddingVertical: Spacing.sm, alignItems: 'center' as const },
  });

  const content = (
    <ScrollView style={s.screen} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      {/* Top bar */}
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
            <TouchableOpacity onPress={() => setImgModalOpen(true)} activeOpacity={0.8} accessible accessibilityLabel="Palitan ang larawan">
              <View style={s.avatarWrap}>
                <Avatar uri={avatar ?? undefined} name={`${firstName} ${lastName}`} size="lg" />
                <View style={s.avatarBorder} />
                <View style={s.cameraBtn}>
                  {uploadingImg
                    ? <ActivityIndicator size={12} color="#fff" />
                    : <Ionicons name="camera" size={14} color="#fff" />
                  }
                </View>
              </View>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <TouchableOpacity onPress={() => setImgModalOpen(true)} style={s.changePhotoBtn} accessible accessibilityLabel="Palitan ang larawan">
                <AppText variant="label" color={theme.primary}>
                  {uploadingImg ? 'Ina-upload...' : 'Palitan ang Larawan'}
                </AppText>
              </TouchableOpacity>
              {!!avatar && (
                <TouchableOpacity
                  onPress={() => setConfirmRemove(true)}
                  disabled={removingImg}
                  style={[s.changePhotoBtn, { borderColor: theme.danger }]}
                  accessible accessibilityLabel="Tanggalin ang larawan"
                >
                  <AppText variant="label" color={theme.danger}>
                    {removingImg ? 'Tinatanggal...' : 'Tanggalin'}
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Form */}
          <View style={s.card}>
            <AppText variant="headingSm" color={theme.primary} style={s.cardTitle}>Personal na Impormasyon</AppText>
            <Field label="Unang Pangalan" value={firstName} onChange={setFirstName} inputStyle={s.input} />
            <Field label="Apelyido"       value={lastName}  onChange={setLastName}  inputStyle={s.input} />

            {/* Date picker trigger */}
            <View style={s.fieldWrap}>
              <AppText variant="label" color={theme.textSecondary}>Kaarawan</AppText>
              <TouchableOpacity style={s.dateBtn} onPress={() => setShowDatePicker(true)} accessible accessibilityLabel="Pumili ng petsa ng kaarawan">
                <AppText variant="bodyMd" color={birthday ? theme.text : theme.inputPlaceholder}>
                  {birthday || 'YYYY-MM-DD'}
                </AppText>
                <Ionicons name="calendar-outline" size={18} color={theme.primary} />
              </TouchableOpacity>
            </View>

            <Field label="Barangay"      value={barangay}     onChange={setBarangay}     inputStyle={s.input} />
            <Field label="Munisipalidad" value={municipality} onChange={setMunicipality} inputStyle={s.input} />

            <AppText variant="label" color={theme.textSecondary} style={s.segLabel}>Katayuang Sibil</AppText>
            <View style={s.segRow}>
              {CIVIL_STATUSES.map((cs) => (
                <TouchableOpacity key={cs} onPress={() => setCivil(cs)}
                  style={[s.segBtn, civil === cs && s.segBtnActive]} accessible accessibilityLabel={cs}>
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

      {/* Android date picker */}
      {showDatePicker && !isIOS && !isWeb && (
        <DateTimePicker value={pickerDate} mode="date" display="default" maximumDate={new Date()} onChange={onDateChange} />
      )}

      {/* iOS date picker modal */}
      {isIOS && (
        <Modal visible={showDatePicker} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <View style={s.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
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

      {/* Confirm remove image modal */}
      <Modal visible={confirmRemove} transparent animationType="fade">
        <View style={[s.modalOverlay, s.confirmOverlay]}>
          <View style={s.confirmCard}>
            <View style={s.confirmIconWrap}>
              <Ionicons name="trash-outline" size={28} color={theme.danger} />
            </View>
            <AppText variant="headingSm" color={theme.primary} style={s.confirmTitle}>
              Tanggalin ang Larawan?
            </AppText>
            <AppText variant="bodySm" color={theme.textMuted} style={s.confirmMsg}>
              Matatanggal ang iyong profile photo. Hindi ito mababawi.
            </AppText>
            <View style={s.confirmBtns}>
              <TouchableOpacity
                onPress={() => setConfirmRemove(false)}
                style={[s.confirmBtn, { borderColor: theme.border, backgroundColor: theme.surface2 }]}
                accessible accessibilityLabel="Kanselahin"
              >
                <AppText variant="label" color={theme.textSecondary}>Kanselahin</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRemoveImage}
                style={[s.confirmBtn, { backgroundColor: theme.danger, borderColor: theme.danger }]}
                accessible accessibilityLabel="Oo, tanggalin"
              >
                <AppText variant="label" color={theme.textInverse}>Oo, Tanggalin</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Web date picker modal */}
      {isWeb && showDatePicker && (
        <Modal visible transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <AppText variant="headingSm" color={theme.primary} style={{ marginBottom: Spacing.sm }}>
                Pumili ng Kaarawan
              </AppText>
              <TextInput value={birthday} onChangeText={setBirthday} placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.inputPlaceholder} style={s.input} accessible accessibilityLabel="Kaarawan" />
              <TouchableOpacity style={s.webDoneBtn} onPress={() => setShowDatePicker(false)}>
                <AppText variant="label" color={theme.textInverse}>Tapos na</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );

  return (
    <>
      {isWeb ? <WebLayout>{content}</WebLayout> : <SafeAreaView style={s.screen} edges={['top']}>{content}</SafeAreaView>}

      {/* Image picker modal — rendered outside ScrollView so it overlays correctly */}
      <ImagePickerModal
        visible={imgModalOpen}
        onClose={() => setImgModalOpen(false)}
        onImageSelected={handleImageSelected}
      />
    </>
  );
}
