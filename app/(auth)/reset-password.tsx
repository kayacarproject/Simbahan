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
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../../components/ui';
import AppButton from '../../components/ui/AppButton';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';
import { validatePassword } from '../../utils/authValidation';
import { resetPassword } from '../../services/authService';

export default function ResetPasswordScreen() {
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordError = password ? validatePassword(password) : null;
  const confirmError = confirm && password !== confirm ? 'Passwords do not match.' : null;
  const canSubmit = !loading && !passwordError && !confirmError && password.length > 0 && confirm.length > 0;

  const handleSubmit = useCallback(async () => {
    const pErr = validatePassword(password);
    if (pErr) { setError(pErr); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email, otp, password);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, otp, password, confirm]);

  if (success) {
    return (
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.sage} />
          </View>
          <AppText variant="headingMd" color={Colors.navy} style={styles.successTitle}>
            Password Reset!
          </AppText>
          <AppText variant="bodySm" color={Colors.textMuted} style={styles.successSub}>
            Your password has been updated successfully. You can now sign in with your new password.
          </AppText>
          <AppButton
            label="Back to Sign In"
            onPress={() => router.replace('/(auth)/login')}
            accessibilityLabel="Back to sign in"
          />
        </View>
      </SafeAreaView>
    );
  }

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
            <Ionicons name="key-outline" size={40} color={Colors.navy} />
          </View>

          <AppText variant="headingMd" color={Colors.navy} style={styles.title}>
            Create New Password
          </AppText>
          <AppText variant="bodySm" color={Colors.textMuted} style={styles.subtitle}>
            Your new password must be at least 8 characters.
          </AppText>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.crimson} />
              <AppText variant="bodySm" color={Colors.crimson} style={styles.errorText}>
                {error}
              </AppText>
            </View>
          ) : null}

          {/* New Password */}
          <AppText variant="caption" color={Colors.textSecondary} style={styles.label}>
            New Password
          </AppText>
          <View style={[styles.inputWrap, passwordError ? styles.inputError : null]}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={StyleSheet.flatten([styles.input, styles.inputFlex])}
              placeholder="Enter new password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
              secureTextEntry={!showPassword}
              accessibilityLabel="New password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <AppText variant="caption" color={Colors.crimson} style={styles.fieldError}>
              {passwordError}
            </AppText>
          ) : null}

          {/* Confirm Password */}
          <AppText variant="caption" color={Colors.textSecondary} style={styles.label}>
            Confirm Password
          </AppText>
          <View style={[styles.inputWrap, confirmError ? styles.inputError : null]}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={StyleSheet.flatten([styles.input, styles.inputFlex])}
              placeholder="Confirm new password"
              placeholderTextColor={Colors.textMuted}
              value={confirm}
              onChangeText={(v) => { setConfirm(v); setError(''); }}
              secureTextEntry={!showConfirm}
              accessibilityLabel="Confirm password"
            />
            <TouchableOpacity
              onPress={() => setShowConfirm((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              <Ionicons
                name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          {confirmError ? (
            <AppText variant="caption" color={Colors.crimson} style={styles.fieldError}>
              {confirmError}
            </AppText>
          ) : null}

          <View style={styles.submitWrap}>
            <AppButton
              label="Reset Password"
              onPress={handleSubmit}
              loading={loading}
              disabled={!canSubmit}
              accessibilityLabel="Reset password"
            />
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
  label: { marginBottom: Spacing.xs },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.textInverse,
    height: 48,
    marginBottom: Spacing.xs,
  },
  inputError: { borderColor: Colors.crimson },
  inputIcon: { marginRight: Spacing.xs },
  input: { flex: 1, ...Typography.bodyMd, color: Colors.textPrimary, height: 48 },
  inputFlex: { flex: 1 },
  fieldError: { marginBottom: Spacing.sm },
  submitWrap: { marginTop: Spacing.md },
  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successIcon: { marginBottom: Spacing.md },
  successTitle: { marginBottom: Spacing.sm, textAlign: 'center' },
  successSub: { textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl },
});
