import React, { useState, useCallback } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
  BackHandler, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import GradientView from '../../components/ui/GradientView';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { AppText, Card, ScreenHeader } from '../../components/ui';
import ImagePickerModal from '../../components/ui/ImagePickerModal';
import DateOfBirthPicker from '../../components/ui/DateOfBirthPicker';
import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../theme/ThemeContext';
import { AppTheme } from '../../theme/light';
import Api from '../../services/Api';
import { a11y } from '../../utils/a11y';

const isWeb = Platform.OS === 'web';
const CIVIL_STATUS = ['Single', 'Married', 'Widowed', 'Separated'];

// ── Shared field component (outside screen for stable reference) ─────────────
function FormInput({
  label, value, onChangeText, placeholder,
  keyboardType, secureTextEntry, prefix, accessibilityLabel, theme,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: any; secureTextEntry?: boolean;
  prefix?: string; accessibilityLabel?: string; theme: AppTheme;
}) {
  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <AppText variant="label" color={theme.textSecondary} style={{ marginBottom: 4 }}>
        {label}
      </AppText>
      <View style={[fStyles.inputRow, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
        {prefix && (
          <AppText variant="bodyMd" color={theme.textMuted} style={{ marginRight: Spacing.xs }}>{prefix}</AppText>
        )}
        <TextInput
          style={[fStyles.input, { color: theme.inputText }, Platform.select({ web: { outlineStyle: 'none' } as any })]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor={theme.inputPlaceholder}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          {...a11y}
          accessibilityLabel={accessibilityLabel ?? label}
        />
      </View>
    </View>
  );
}

const fStyles = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, height: 44 },
  input:    { flex: 1, fontSize: 14, fontFamily: 'DMSans_400Regular', height: 44 },
});

// ── Web-only compact input ───────────────────────────────────────────────────
function WebInput({
  icon, placeholder, value, onChangeText,
  keyboardType, secureTextEntry, rightSlot, theme,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  placeholder: string; value: string; onChangeText: (v: string) => void;
  keyboardType?: any; secureTextEntry?: boolean;
  rightSlot?: React.ReactNode; theme: AppTheme;
}) {
  return (
    <View style={[wStyles.inputWrap, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
      <Ionicons name={icon} size={16} color={theme.textMuted} style={{ marginRight: Spacing.xs }} />
      <TextInput
        style={[wStyles.input, { color: theme.inputText }, Platform.select({ web: { outlineStyle: 'none' } as any })]}
        placeholder={placeholder}
        placeholderTextColor={theme.inputPlaceholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        {...a11y}
        accessibilityLabel={placeholder}
      />
      {rightSlot}
    </View>
  );
}

const wStyles = StyleSheet.create({
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, height: 44, marginBottom: Spacing.xs },
  input:     { flex: 1, fontSize: 14, fontFamily: 'DMSans_400Regular', height: 44 },
});

export default function RegisterScreen() {
  const { theme } = useTheme();
  const [firstName,       setFirstName]       = useState('');
  const [lastName,        setLastName]        = useState('');
  const [mobile,          setMobile]          = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [barangay,        setBarangay]        = useState('');
  const [municipality,    setMunicipality]    = useState('');
  const [civilStatus,     setCivilStatus]     = useState('Single');
  const [showPw,          setShowPw]          = useState(false);
  const [showCpw,         setShowCpw]         = useState(false);
  const [photoUri,        setPhotoUri]        = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [dob,             setDob]             = useState<Date | null>(null);

  const { showToast } = useToast();
  const { width } = useWindowDimensions();
  const isWide = isWeb && width >= 768;

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => { router.back(); return true; });
      return () => sub.remove();
    }, []),
  );

  const handleJoinNow = useCallback(() => {
    if (!firstName.trim() || !lastName.trim()) { showToast({ type: 'error', message: 'Please enter your first and last name.' }); return; }
    if (!email.trim() || !password.trim())     { showToast({ type: 'error', message: 'Please enter your email and password.' }); return; }
    if (password !== confirmPassword)           { showToast({ type: 'error', message: 'Passwords do not match.' }); return; }
    if (!dob)                                   { showToast({ type: 'error', message: 'Please select your date of birth.' }); return; }

    const formData = {
      appName: Api.appName,
      firstName: firstName.trim(), lastName: lastName.trim(),
      email: email.trim(), password,
      mobile: mobile.trim(),
      birthDate: dob.toISOString().split('T')[0],
      civilStatus,
      barangay: barangay.trim(), municipality: municipality.trim(),
      profile: photoUri ?? undefined,
    };
    console.log('[REGISTER] Passing Data:', { ...formData, password: `(${formData.password.length} chars)` });
    router.push({ pathname: '/(auth)/join-church', params: { formData: JSON.stringify(formData) } });
  }, [firstName, lastName, email, password, confirmPassword, mobile, dob, civilStatus, barangay, municipality, photoUri, showToast]);

  // ── Web form ───────────────────────────────────────────────────────────────
  const WebFormContent = (
    <>
      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <View style={{ flex: 1 }}>
          <AppText variant="label" color={theme.textSecondary} style={{ marginBottom: 4, marginTop: Spacing.sm }}>First Name</AppText>
          <WebInput icon="person-outline" placeholder="Juan" value={firstName} onChangeText={setFirstName} theme={theme} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="label" color={theme.textSecondary} style={{ marginBottom: 4, marginTop: Spacing.sm }}>Last Name</AppText>
          <WebInput icon="person-outline" placeholder="dela Cruz" value={lastName} onChangeText={setLastName} theme={theme} />
        </View>
      </View>

      <AppText variant="label" color={theme.textSecondary} style={{ marginBottom: 4, marginTop: Spacing.sm }}>Email</AppText>
      <WebInput icon="mail-outline" placeholder="you@email.com" value={email} onChangeText={(v) => setEmail(v.toLowerCase())} keyboardType="email-address" theme={theme} />

      <AppText variant="label" color={theme.textSecondary} style={{ marginBottom: 4, marginTop: Spacing.sm }}>Mobile</AppText>
      <WebInput icon="call-outline" placeholder="+63 9XX XXX XXXX" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" theme={theme} />

      <AppText variant="label" color={theme.textSecondary} style={{ marginBottom: 4, marginTop: Spacing.sm }}>Password</AppText>
      <WebInput icon="lock-closed-outline" placeholder="Min. 8 characters" value={password} onChangeText={setPassword} secureTextEntry={!showPw} theme={theme}
        rightSlot={<TouchableOpacity onPress={() => setShowPw(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={16} color={theme.textMuted} /></TouchableOpacity>}
      />

      <AppText variant="label" color={theme.textSecondary} style={{ marginBottom: 4, marginTop: Spacing.sm }}>Confirm Password</AppText>
      <WebInput icon="lock-closed-outline" placeholder="Re-enter password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showCpw} theme={theme}
        rightSlot={<TouchableOpacity onPress={() => setShowCpw(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Ionicons name={showCpw ? 'eye-off-outline' : 'eye-outline'} size={16} color={theme.textMuted} /></TouchableOpacity>}
      />

      <AppText variant="caption" color={theme.textMuted} style={{ marginVertical: Spacing.md, textAlign: 'center', lineHeight: 18 }}>
        By registering, you agree to our Terms of Service and Privacy Policy.
      </AppText>

      <TouchableOpacity onPress={handleJoinNow} style={[styles.joinBtn, { backgroundColor: theme.primary }]} {...a11y} accessibilityLabel="Create account" activeOpacity={0.85}>
        <AppText variant="label" color={Colors.textInverse} style={{ fontSize: 15 }}>Create Account</AppText>
      </TouchableOpacity>

      <View style={styles.loginRow}>
        <AppText variant="bodySm" color={theme.textMuted}>Already have an account? </AppText>
        <TouchableOpacity onPress={() => router.back()} {...a11y} accessibilityLabel="Sign in">
          <AppText variant="bodySm" color={theme.primary}>Sign in</AppText>
        </TouchableOpacity>
      </View>
    </>
  );

  // ── WEB LAYOUT ─────────────────────────────────────────────────────────────
  if (isWeb) {
    return (
      <View style={[styles.webScreen, { backgroundColor: theme.surface2 }]}>
        {/* <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} /> */}
        {isWide ? (
          <>
            <GradientView colors={[Colors.navyDark, Colors.navy]} style={styles.leftPanel}>
              <View style={styles.brandContent}>
                <View style={styles.crossBadge}>
                  <AppText variant="displayMd" color={Colors.textInverse}>✝</AppText>
                </View>
                <AppText variant="displayMd" color={Colors.textInverse} style={{ lineHeight: 40 }}>Simbahan</AppText>
                <AppText variant="bodyLg" color={Colors.goldLight} style={{ opacity: 0.85, marginBottom: Spacing.lg }}>Join your parish community</AppText>
                <View style={{ gap: Spacing.sm }}>
                  {['Connect with your parish family', 'Track Simbang Gabi attendance', 'Submit sacrament requests', 'Manage family & dependents'].map((f) => (
                    <View key={f} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
                      <AppText variant="bodySm" color={Colors.textInverse} style={{ marginLeft: 8, opacity: 0.9 }}>{f}</AppText>
                    </View>
                  ))}
                </View>
              </View>
              <TouchableOpacity onPress={() => router.replace('/(public)')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm }} accessibilityLabel="Back to homepage">
                <Ionicons name="arrow-back" size={14} color={Colors.goldLight} />
                <AppText variant="caption" color={Colors.goldLight} style={{ marginLeft: 4 }}>Back to Homepage</AppText>
              </TouchableOpacity>
            </GradientView>

            <View style={[styles.rightPanel, { backgroundColor: theme.surface2 }]}>
              <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={[styles.webCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <AppText variant="displaySm" color={theme.primary} style={{ marginBottom: 4 }}>Create Account</AppText>
                  <AppText variant="bodySm" color={theme.textMuted} style={{ marginBottom: Spacing.lg }}>Register to access your parish app</AppText>
                  {WebFormContent}
                </View>
              </ScrollView>
            </View>
          </>
        ) : (
          <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <GradientView colors={[Colors.navyDark, Colors.navy]} style={styles.tabletHeader}>
              <AppText variant="displaySm" color={Colors.textInverse}>✝ Simbahan</AppText>
              <AppText variant="bodySm" color={Colors.goldLight}>Join your parish community</AppText>
            </GradientView>
            <View style={[styles.tabletCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <AppText variant="headingMd" color={theme.primary} style={{ marginBottom: Spacing.md }}>Create Account</AppText>
              {WebFormContent}
            </View>
          </ScrollView>
        )}
      </View>
    );
  }

  // ── MOBILE LAYOUT ──────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top']}>
        {/* <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} backgroundColor={theme.background} /> */}
        <ScreenHeader title="Create Account" subtitle="Join your parish community" onBack={() => router.back()} />

        <ScrollView style={[styles.flex, { backgroundColor: theme.background }]} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Avatar */}
          {/* <View style={styles.avatarWrap}>
            <TouchableOpacity onPress={() => setShowImagePicker(true)} activeOpacity={0.8} accessibilityLabel="Add profile photo">
              {photoUri ? (
                <View style={[styles.avatarCircle, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                  {React.createElement(require('expo-image').Image, { source: { uri: photoUri }, style: { width: 80, height: 80, borderRadius: 40 }, contentFit: 'cover' })}
                </View>
              ) : (
                <View style={[styles.avatarCircle, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                  <Ionicons name="camera-outline" size={28} color={theme.textMuted} />
                </View>
              )}
            </TouchableOpacity>
            <AppText variant="caption" color={theme.textMuted} style={{ marginTop: Spacing.xs }}>
              {photoUri ? 'Change photo' : 'Add photo'}
            </AppText>
          </View> */}

          <ImagePickerModal visible={showImagePicker} onClose={() => setShowImagePicker(false)} onImageSelected={(uri) => { setPhotoUri(uri); setShowImagePicker(false); }} />

          <AppText variant="headingSm" color={theme.primary} style={styles.sectionTitle}>Personal Information</AppText>
          <Card style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <FormInput label="First Name"  value={firstName}  onChangeText={setFirstName}  theme={theme} />
            <FormInput label="Last Name"   value={lastName}   onChangeText={setLastName}   theme={theme} />
            <DateOfBirthPicker value={dob} onChange={setDob} />
            <View style={{ marginBottom: Spacing.sm }}>
              <AppText variant="label" color={theme.textSecondary} style={{ marginBottom: 4 }}>Civil Status</AppText>
              <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
                {CIVIL_STATUS.map((s) => (
                  <TouchableOpacity
                    key={s} onPress={() => setCivilStatus(s)}
                    style={[styles.segment, { borderColor: theme.border, backgroundColor: civilStatus === s ? theme.primary : theme.surface2 }]}
                    {...a11y} accessibilityLabel={s} activeOpacity={0.8}
                  >
                    <AppText variant="caption" color={civilStatus === s ? Colors.textInverse : theme.textSecondary}>{s}</AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>

          <AppText variant="headingSm" color={theme.primary} style={styles.sectionTitle}>Contact Details</AppText>
          <Card style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <FormInput label="Mobile"           value={mobile}          onChangeText={setMobile}          prefix="+63" keyboardType="phone-pad" placeholder="9XX XXX XXXX" theme={theme} />
            <FormInput label="Email"            value={email}           onChangeText={(v) => setEmail(v.toLowerCase())}           keyboardType="email-address" placeholder="you@email.com" theme={theme} />
            <FormInput label="Password"         value={password}        onChangeText={setPassword}        secureTextEntry placeholder="Min. 8 characters" theme={theme} />
            <FormInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Re-enter password" theme={theme} />
          </Card>

          <AppText variant="headingSm" color={theme.primary} style={styles.sectionTitle}>Address</AppText>
          <Card style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <FormInput label="Barangay"           value={barangay}     onChangeText={setBarangay}     theme={theme} />
            <FormInput label="Municipality / City" value={municipality} onChangeText={setMunicipality} theme={theme} />
          </Card>

          <TouchableOpacity onPress={handleJoinNow} style={[styles.joinBtn, { backgroundColor: theme.primary }]} {...a11y} accessibilityLabel="Join Now" activeOpacity={0.8}>
            <AppText variant="label" color={Colors.textInverse} style={styles.joinBtnText}>Join Now</AppText>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <AppText variant="bodySm" color={theme.textMuted}>Already have an account? </AppText>
            <TouchableOpacity onPress={() => router.back()} {...a11y} accessibilityLabel="Sign in">
              <AppText variant="bodySm" color={theme.primary}>Sign in</AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:         { flex: 1 },
  scroll:       { padding: Spacing.md, paddingBottom: Spacing.xxl },
  avatarWrap:   { alignItems: 'center', marginBottom: Spacing.lg },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { marginBottom: Spacing.sm },
  card:         { marginBottom: Spacing.md, padding: Spacing.md, borderWidth: 1, borderRadius: Radius.md },
  segment:      { flex: 1, paddingVertical: Spacing.xs, borderRadius: Radius.sm, borderWidth: 1, alignItems: 'center' },
  joinBtn:      { borderRadius: Radius.md, height: 50, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  joinBtnText:  { fontSize: 15 },
  loginRow:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  // Web
  webScreen:    { flex: 1, flexDirection: 'row' },
  leftPanel:    { flex: 1, justifyContent: 'space-between', padding: Spacing.xxl },
  brandContent: { flex: 1, justifyContent: 'center', gap: Spacing.md },
  crossBadge:   { width: 64, height: 64, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  rightPanel:   { flex: 1, justifyContent: 'center' },
  formScroll:   { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  webCard:      { borderRadius: Radius.lg, padding: Spacing.xl, width: '100%', maxWidth: 480, borderWidth: 1 },
  tabletHeader: { width: '100%', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xl, alignItems: 'center', gap: 4 },
  tabletCard:   { borderRadius: Radius.lg, padding: Spacing.xl, width: '100%', maxWidth: 520, borderWidth: 1, marginTop: -Radius.lg },
});
