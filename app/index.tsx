/**
 * index.tsx — Root redirect.
 *
 * Decision tree (in priority order):
 *
 *  1. Country not yet selected + feature enabled  → /country-select
 *  2. Authenticated                               → /home
 *  3. Web platform                                → /(public)
 *  4. Mobile, never onboarded                    → /welcome
 *  5. Mobile, onboarded but not logged in         → /(auth)/login
 */

import { Redirect } from 'expo-router';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useCountryStore, ENABLE_COUNTRY_SELECTION } from '../store/countryStore';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOnboarded     = useAuthStore((s) => s.isOnboarded);
  const country         = useCountryStore((s) => s.country);

  // 1. First-time user with country selection enabled → onboarding gate
  if (ENABLE_COUNTRY_SELECTION && country === null) {
    return <Redirect href="/country-select" />;
  }

  // 2. Logged-in user → main app
  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  // 3. Web → public landing page
  if (Platform.OS === 'web') {
    return <Redirect href="/(public)" />;
  }

  // 4. Mobile, never seen welcome → show it
  if (!isOnboarded) {
    return <Redirect href="/welcome" />;
  }

  // 5. Mobile, onboarded but logged out → login
  return <Redirect href="/(auth)/login" />;
}
