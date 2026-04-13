import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../../components/ui';
import AppButton from '../../components/ui/AppButton';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';
import { isValidEmail } from '../../utils/authValidation';
import { sendOtp } from '../../services/authService';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendOtp(email.trim());
      router.push({ pathname: '/(auth)/otp-verify', params: { email: email.trim() } });
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={Colors.navy} />
          </TouchableOpacity>

          <View style={styles.iconWrap}>
            <Ionicons name="lock-open-outline" size={40} color={Colors.navy} />
          </View>

          <AppText variant="headingMd" color={Colors.navy} style={styles.title}>
            Forgot Password?
          </AppText>
          <AppText variant="bodySm" color={Colors.textMuted} style={styles.subtitle}>
            Enter your email and we'll send you a 6-digit code to reset your password.
          </AppText>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.crimson} />
              <AppText variant="bodySm" color={Colors.crimson} style={styles.errorText}>
                {error}
              </AppText>
            </View>
          ) : null}

          <View style={[styles.inputWrap, error ? styles.inputError : null]}>
            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={(v) => { setEmail(v); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Email address"
            />
          </View>

          <AppButton
            label="Send Reset Code"
            onPress={handleSubmit}
            loading={loading}
            disabled={!email.trim() || loading}
            accessibilityLabel="Send reset code"
          />

          <View style={styles.loginRow}>
            <AppText variant="bodySm" color={Colors.textMuted}>Remember your password? </AppText>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} accessibilityLabel="Back to login">
              <AppText variant="bodySm" color={Colors.navy}>Sign In</AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.cream },
  scroll: { flexGrow: 1, padding: Spacing.lg, paddingTop: Spacing.md },
  backBtn: { marginBottom: Spacing.lg, alignSelf: 'flex-start', padding: Spacing.xs },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.goldPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: { marginBottom: Spacing.xs },
  subtitle: { marginBottom: Spacing.lg, lineHeight: 20 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.crimsonPale,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  errorText: { flex: 1 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.textInverse,
    height: 48,
    marginBottom: Spacing.md,
  },
  inputError: { borderColor: Colors.crimson },
  inputIcon: { marginRight: Spacing.xs },
  input: { flex: 1, ...Typography.bodyMd, color: Colors.textPrimary, height: 48 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
});
