import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { isValidOtp } from '../../utils/authValidation';
import { verifyOtp, sendOtp } from '../../services/authService';

const RESEND_SECONDS = 60;
const OTP_LENGTH = 6;

export default function OtpVerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleVerify = useCallback(async () => {
    if (!isValidOtp(otp)) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      router.push({ pathname: '/(auth)/reset-password', params: { email, otp } });
    } catch (e: any) {
      setError(e.message ?? 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, otp]);

  const handleResend = useCallback(async () => {
    setResending(true);
    setError('');
    try {
      await sendOtp(email);
      setTimer(RESEND_SECONDS);
      setOtp('');
      inputRef.current?.focus();
    } catch (e: any) {
      setError(e.message ?? 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  }, [email]);

  const handleOtpChange = useCallback((v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
    setError('');
  }, []);

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
            <Ionicons name="chatbubble-ellipses-outline" size={40} color={Colors.navy} />
          </View>

          <AppText variant="headingMd" color={Colors.navy} style={styles.title}>
            Enter Verification Code
          </AppText>
          <AppText variant="bodySm" color={Colors.textMuted} style={styles.subtitle}>
            We sent a 6-digit code to{' '}
            <AppText variant="bodySm" color={Colors.navy}>{email}</AppText>
          </AppText>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.crimson} />
              <AppText variant="bodySm" color={Colors.crimson} style={styles.errorText}>
                {error}
              </AppText>
            </View>
          ) : null}

          <TextInput
            ref={inputRef}
            style={[styles.otpInput, error ? styles.inputError : null]}
            value={otp}
            onChangeText={handleOtpChange}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            placeholder="• • • • • •"
            placeholderTextColor={Colors.textMuted}
            textAlign="center"
            accessibilityLabel="6-digit verification code"
            autoFocus
          />

          <AppButton
            label="Verify Code"
            onPress={handleVerify}
            loading={loading}
            disabled={otp.length !== OTP_LENGTH || loading}
            accessibilityLabel="Verify code"
          />

          <View style={styles.resendRow}>
            {timer > 0 ? (
              <AppText variant="bodySm" color={Colors.textMuted}>
                Resend code in{' '}
                <AppText variant="bodySm" color={Colors.navy}>{timer}s</AppText>
              </AppText>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                accessibilityLabel="Resend OTP"
              >
                <AppText variant="bodySm" color={resending ? Colors.textMuted : Colors.navy}>
                  {resending ? 'Sending…' : 'Resend Code'}
                </AppText>
              </TouchableOpacity>
            )}
          </View>

          {/* Hint for demo */}
          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
            <AppText variant="caption" color={Colors.textMuted} style={styles.hintText}>
              Demo code: 123456
            </AppText>
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
  otpInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.textInverse,
    height: 64,
    marginBottom: Spacing.md,
    ...Typography.displaySm,
    color: Colors.navy,
    letterSpacing: 12,
  },
  inputError: { borderColor: Colors.crimson },
  resendRow: { alignItems: 'center', marginTop: Spacing.md },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  hintText: { marginLeft: 2 },
});
