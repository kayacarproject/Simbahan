import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="join-church" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
