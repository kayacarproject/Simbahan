import React, { useState, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Switch, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import Avatar from '../../components/ui/Avatar';
import WebLayout from '../../components/ui/WebLayout';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { useAuthStore } from '../../store/authStore';
import { useModule10Store } from '../../store/module10Store';
import { useUiStore } from '../../store/uiStore';

const isWeb = Platform.OS === 'web';
const CIVIL_STATUSES = ['Single', 'Married', 'Widowed', 'Separated'];

function Field({ label, value, onChange, placeholder, keyboardType }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.fieldWrap}>
      <AppText variant="label" color={Colors.textSecondary}>{label}</AppText>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? label}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType ?? 'default'}
        style={styles.input}
        accessible
        accessibilityLabel={label}
      />
    </View>
  );
}

export default function EditProfileScreen() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const profileEdits = useModule10Store((s) => s.profileEdits);
  const saveProfileEdits = useModule10Store((s) => s.saveProfileEdits);
  const showToast = useUiStore((s) => s.showToast);

  const [firstName, setFirstName] = useState(profileEdits.firstName ?? currentUser?.firstName ?? '');
  const [lastName,  setLastName]  = useState(profileEdits.lastName  ?? currentUser?.lastName  ?? '');
  const [phone,     setPhone]     = useState(profileEdits.phone     ?? currentUser?.phone     ?? '');
  const [email,     setEmail]     = useState(profileEdits.email     ?? currentUser?.email     ?? '');
  const [barangay,  setBarangay]  = useState(profileEdits.barangay  ?? currentUser?.barangay  ?? '');
  const [birthday,  setBirthday]  = useState(profileEdits.birthday  ?? currentUser?.birthDate ?? '');
  const [civil,     setCivil]     = useState(profileEdits.civilStatus ?? 'Single');
  const [visible,   setVisible]   = useState(profileEdits.directoryVisible ?? true);

  const handleSave = useCallback(() => {
    saveProfileEdits({ firstName, lastName, phone, email, barangay, birthday, civilStatus: civil, directoryVisible: visible });
    showToast('Na-save ang profile!', 'success');
    router.back();
  }, [firstName, lastName, phone, email, barangay, birthday, civil, visible, saveProfileEdits, showToast]);

  const content = (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessible accessibilityLabel="Bumalik">
          <Ionicons name="arrow-back" size={20} color={Colors.navy} />
          <AppText variant="bodyMd" color={Colors.navy}>Bumalik</AppText>
        </TouchableOpacity>
        <AppText variant="headingMd" color={Colors.navy}>I-edit ang Profile</AppText>
      </View>

      {/* Avatar placeholder */}
      <View style={styles.avatarSection}>
        <Avatar uri={currentUser?.avatar} name={`${firstName} ${lastName}`} size="lg" />
        <TouchableOpacity style={styles.changePhotoBtn} accessible accessibilityLabel="Palitan ang larawan">
          <AppText variant="label" color={Colors.navy}>Palitan ang Larawan</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <AppText variant="headingSm" color={Colors.navy} style={styles.cardTitle}>Personal na Impormasyon</AppText>
        <Field label="Unang Pangalan" value={firstName} onChange={setFirstName} />
        <Field label="Apelyido"       value={lastName}  onChange={setLastName}  />
        <Field label="Kaarawan"       value={birthday}  onChange={setBirthday}  placeholder="YYYY-MM-DD" />
        <Field label="Barangay"       value={barangay}  onChange={setBarangay}  />

        <AppText variant="label" color={Colors.textSecondary} style={styles.segLabel}>Katayuang Sibil</AppText>
        <View style={styles.segRow}>
          {CIVIL_STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setCivil(s)}
              style={[styles.segBtn, civil === s && styles.segBtnActive]}
              accessible
              accessibilityLabel={s}
            >
              <AppText variant="label" color={civil === s ? Colors.textInverse : Colors.textMuted}>{s}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <AppText variant="headingSm" color={Colors.navy} style={styles.cardTitle}>Pakikipag-ugnayan</AppText>
        <Field label="Telepono" value={phone} onChange={setPhone} keyboardType="phone-pad" />
        <Field label="Email"    value={email} onChange={setEmail} keyboardType="email-address" />
      </View>

      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <AppText variant="headingSm" color={Colors.navy}>Makikita sa Direktoryo</AppText>
            <AppText variant="caption" color={Colors.textMuted}>Ipakita ang inyong profile sa ibang miyembro</AppText>
          </View>
          <Switch
            value={visible}
            onValueChange={setVisible}
            trackColor={{ false: Colors.border, true: Colors.navy }}
            thumbColor={Colors.textInverse}
            accessible
            accessibilityLabel="Directory visibility"
          />
        </View>
      </View>

      <View style={styles.saveWrap}>
        <AppButton label="I-save ang mga Pagbabago" onPress={handleSave} />
      </View>
    </ScrollView>
  );

  if (isWeb) return <WebLayout>{content}</WebLayout>;
  return <SafeAreaView style={styles.screen} edges={['top']}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  scroll: { paddingBottom: Spacing.xxl },
  topBar: { padding: Spacing.md, gap: Spacing.sm },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  changePhotoBtn: {
    borderWidth: 1, borderColor: Colors.navy, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.textInverse, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.md, margin: Spacing.md, marginBottom: 0, gap: Spacing.sm,
  },
  cardTitle: { marginBottom: 4 },
  fieldWrap: { gap: 4 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  segLabel: { marginBottom: 4 },
  segRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  segBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full, backgroundColor: Colors.cream2,
    borderWidth: 1, borderColor: Colors.border,
  },
  segBtnActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  saveWrap: { margin: Spacing.md },
});
