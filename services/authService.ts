
import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = 'https://api.hanaplatform.com/api/v1';
const APP_NAME = 'simbahan.conscor.com';
export const TOKEN_KEY = 'simbahan_auth_token';
export const STORAGE_KEY_TOKEN = 'access_token';
export const STORAGE_KEY_USER_ID = 'user_id';

export interface AuthUser {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

// Actual shape: { status, message, data: { access_token, refresh_token, user } }
export interface LoginData {
  access_token: string;
  refresh_token?: string;
  user?: AuthUser;
  [key: string]: unknown;
}

export interface LoginResponse {
  status?: string;
  message?: string;
  data?: LoginData;
  [key: string]: unknown;
}

export const REFRESH_TOKEN_KEY = 'simbahan_refresh_token';

// SecureStore has no web support — fall back to in-memory on web
const memStore: Record<string, string> = {};

function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') { memStore[key] = value; return Promise.resolve(); }
  return SecureStore.setItemAsync(key, value);
}

function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return Promise.resolve(memStore[key] ?? null);
  return SecureStore.getItemAsync(key);
}

function secureDel(key: string): Promise<void> {
  if (Platform.OS === 'web') { delete memStore[key]; return Promise.resolve(); }
  return SecureStore.deleteItemAsync(key);
}

// ── Public helpers ────────────────────────────────────────────────────────

/** Returns the stored access token, or null if not logged in. */
export function getToken(): Promise<string | null> {
  return secureGet(STORAGE_KEY_TOKEN);
}

/** Returns the stored user ID, or null if not logged in. */
export function getUserId(): Promise<string | null> {
  return secureGet(STORAGE_KEY_USER_ID);
}

/** Clears all auth data from secure storage. */
export async function logout(): Promise<void> {
  await Promise.all([
    secureDel(STORAGE_KEY_TOKEN),
    secureDel(STORAGE_KEY_USER_ID),
    secureDel(REFRESH_TOKEN_KEY),
    secureDel(TOKEN_KEY),
  ]);
}

/** @internal — used by apiLogin only */
export const tokenStorage = {
  set: (value: string) => secureSet(TOKEN_KEY, value),
  setRefresh: (value: string) => secureSet(REFRESH_TOKEN_KEY, value),
  get: () => secureGet(TOKEN_KEY),
  delete: logout,
};

const LOGIN_URL = `${BASE_URL}/auth/login`;

export async function apiLogin(identifier: string, password: string): Promise<LoginResponse> {
  const payload = { appName: APP_NAME, identifier, password };

  console.log('[AUTH] ── Request ──────────────────────────');
  console.log('[AUTH] URL    :', LOGIN_URL);
  console.log('[AUTH] Payload:', JSON.stringify({ ...payload, password: `(${password.length} chars)` }));

  try {
    const response = await axios.post<LoginResponse>(LOGIN_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('[AUTH] ── Response ─────────────────────────');
    console.log('[AUTH] HTTP Status  :', response.status);
    console.log('[AUTH] response.data:', JSON.stringify(response.data, null, 2));
    console.log('[AUTH] response.data.data:', JSON.stringify(response.data?.data, null, 2));

    const body = response.data;

    // API-level error: 200 OK but status === 'error'
    if (body.status === 'error') {
      console.log('[AUTH] API returned status=error:', body.message);
      throw new Error(body.message ?? 'Login failed. Please try again.');
    }

    // Correct path: response.data.data.access_token
    const token = response.data?.data?.access_token;
    console.log('[AUTH] Token:', token ? token.slice(0, 20) + '…' : 'NOT FOUND');

    if (!token) {
      throw new Error('Login failed. Please try again.');
    }

    const refreshToken = response.data?.data?.refresh_token;
    const user: AuthUser = (response.data?.data?.user ?? {}) as AuthUser;
    const userId = (user.id ?? user._id ?? '') as string;

    console.log('[AUTH] Refresh Token:', refreshToken ? refreshToken.slice(0, 20) + '…' : 'none');
    console.log('[AUTH] User ID      :', userId || '(not in response)');

    // Store with canonical keys used across the app
    await Promise.all([
      secureSet(STORAGE_KEY_TOKEN, token),
      secureSet(STORAGE_KEY_USER_ID, userId),
      tokenStorage.set(token),
      ...(refreshToken ? [tokenStorage.setRefresh(refreshToken)] : []),
    ]);

    console.log('[AUTH] Token saved   :', token.slice(0, 20) + '…');
    console.log('[AUTH] User ID saved :', userId || '(empty)');

    return { ...body, data: { ...body.data, access_token: token, user: { ...user, id: userId } } };

  } catch (err) {
    // Re-throw API-level errors (thrown above) without re-wrapping
    if (axios.isAxiosError(err) === false && err instanceof Error) throw err;

    const e = err as AxiosError<Record<string, unknown>>;

    console.log('[AUTH] ── Error ────────────────────────────');
    console.log('[AUTH] message         :', e.message);
    console.log('[AUTH] status          :', e.response?.status);
    console.log('[AUTH] response.data   :', JSON.stringify(e.response?.data, null, 2));

    const serverMsg =
      (e.response?.data?.message as string) ??
      (e.response?.data?.error as string) ??
      (e.response?.data?.msg as string);

    const message = serverMsg
      ?? (e.response?.status === 401 ? 'Invalid credentials.' : null)
      ?? (e.response?.status === 422 ? 'Invalid request data.' : null)
      ?? (e.response?.status === 404 ? 'Account not found.' : null)
      ?? e.message
      ?? 'Login failed. Please try again.';

    throw new Error(message);
  }
}

export async function apiLogout(): Promise<void> {
  await logout();
}
// Mock auth service — swap fetch() calls for real API endpoints when ready

const MOCK_OTP = '123456';
const MOCK_DELAY = 1200;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function sendOtp(email: string): Promise<void> {
  await delay(MOCK_DELAY);
  // Real: await fetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
  if (!email) throw new Error('Email is required.');
}

export async function verifyOtp(email: string, otp: string): Promise<void> {
  await delay(MOCK_DELAY);
  // Real: await fetch('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) })
  if (otp !== MOCK_OTP) throw new Error('Invalid or expired OTP. Please try again.');
}

export async function resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
  await delay(MOCK_DELAY);
  // Real: await fetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) })
  if (!newPassword) throw new Error('Password is required.');
 
}
