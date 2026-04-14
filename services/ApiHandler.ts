import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Api from './Api';
import { getToken } from './authService';

// ── Shared headers ────────────────────────────────────────────────────────────

async function authHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// ── Core helpers ──────────────────────────────────────────────────────────────

export const getRequest = async (endpoint: string, extraHeaders: Record<string, string> = {}) => {
  const url = `${Api.baseUrl}${endpoint}`;
  const headers = await authHeaders(extraHeaders);

  console.log('[API] GET', url);
  console.log('[API] Headers:', headers);

  try {
    const res = await axios.get(url, { headers, timeout: Api.timeout });
    console.log('[API] Response:', res.data);
    return res.data;
  } catch (error: any) {
    console.log('[API] Error:', error?.response?.data || error.message);
    throw error;
  }
};

export const postRequest = async (endpoint: string, body: unknown, extraHeaders: Record<string, string> = {}) => {
  const url = `${Api.baseUrl}${endpoint}`;
  const headers = await authHeaders(extraHeaders);

  console.log('[API] POST', url);
  console.log('[API] Body:', body);
  console.log('[API] Headers:', headers);

  try {
    const res = await axios.post(url, body, { headers, timeout: Api.timeout });
    console.log('[API] Response:', res.data);
    return res.data;
  } catch (error: any) {
    console.log('[API] Error:', error?.response?.data || error.message);
    throw error;
  }
};

export const putRequest = async (endpoint: string, body: unknown, extraHeaders: Record<string, string> = {}) => {
  const url = `${Api.baseUrl}${endpoint}`;
  const headers = await authHeaders(extraHeaders);

  console.log('[API] PUT', url);
  console.log('[API] Body:', body);

  try {
    const res = await axios.put(url, body, { headers, timeout: Api.timeout });
    console.log('[API] Response:', res.data);
    return res.data;
  } catch (error: any) {
    console.log('[API] Error:', error?.response?.data || error.message);
    throw error;
  }
};

export const deleteRequest = async (endpoint: string, extraHeaders: Record<string, string> = {}) => {
  const url = `${Api.baseUrl}${endpoint}`;
  const headers = await authHeaders(extraHeaders);

  console.log('[API] DELETE', url);

  try {
    const res = await axios.delete(url, { headers, timeout: Api.timeout });
    console.log('[API] Response:', res.data);
    return res.data;
  } catch (error: any) {
    console.log('[API] Error:', error?.response?.data || error.message);
    throw error;
  }
};

// ── API functions ─────────────────────────────────────────────────────────────

export const apiLogin = async (body: { appName: string; identifier: string; password: string }, extraHeaders: Record<string, string> = {}) => {
  const url = `${Api.baseUrl}/auth/login`;

  console.log('[API] Login Request:', { ...body, password: `(${body.password.length} chars)` });

  try {
    const res = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      timeout: Api.timeout,
    });

    console.log('[API] Login Response:', res.data);
    return res.data;
  } catch (error: any) {
    console.log('[API] Login Error:', error?.response?.data || error.message);
    throw error;
  }
};

export const getDataPublic = async (endpoint: string, params?: Record<string, unknown>, extraHeaders: Record<string, string> = {}) => {
  const url = `${Api.baseUrl}${endpoint}`;

  console.log('[API] getDataPublic:', url, params ?? '');

  try {
    const res = await axios.get(url, {
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      params,
      timeout: Api.timeout,
    });

    console.log('[API] Response:', res.data);
    return res.data;
  } catch (error: any) {
    console.log('[API] Error:', error?.response?.data || error.message);
    throw error;
  }
};

export const dynamicProcess = async (endpoint: string, body: unknown, extraHeaders: Record<string, string> = {}) => {
  const url = `${Api.baseUrl}${endpoint}`;
  const headers = await authHeaders(extraHeaders);

  console.log('[API] dynamicProcess:', url);
  console.log('[API] Body:', body);

  try {
    const res = await axios.post(url, body, { headers, timeout: Api.timeout });
    console.log('[API] Response:', res.data);
    return res.data;
  } catch (error: any) {
    console.log('[API] Error:', error?.response?.data || error.message);
    throw error;
  }
};

export const apiRegister = async (
  body: {
    appName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile: string;
    birthDate: string;
    civilStatus: string;
    barangay: string;
    municipality: string;
    username?: string;
    profile?: string | null;
    [key: string]: unknown;
  },
  extraHeaders: Record<string, string> = {},
) => {
  const url = `${Api.baseUrl}/auth/signup`;

  console.log('[API] Register Request:', { ...body, password: `(${body.password.length} chars)` });

  try {
    const res = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      timeout: Api.timeout,
    });

    console.log('[API] Register Response:', res.data);
    return res.data;
  } catch (error: any) {
    console.log('[API] Register Error:', error?.response?.data || error.message);
    throw error;
  }
};

export const getData = async (
  body: {
    appName: string;
    moduleName: string;
    query?: Record<string, unknown>;
    limit?: number;
    skip?: number;
    sortBy?: string;
    order?: 'ascending' | 'descending';
    [key: string]: unknown;
  },
  extraHeaders: Record<string, string> = {},
) => {
  const url = `${Api.baseUrl}/mongo/getdata`;

  // Read from the canonical key written by login/register
  const token = await SecureStore.getItemAsync('access_token');

  console.log('[API] TOKEN:', token ? token.slice(0, 20) + '…' : 'NOT FOUND');

  if (!token) {
    console.log('[API] ERROR: No token found in storage');
    throw new Error('User not authenticated. Token missing.');
  }

  console.log('[API] GETDATA Request:', body);

  try {
    const res = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(Api.apiKey ? { 'x-api-key': Api.apiKey } : {}),
        ...extraHeaders,
      },
      timeout: Api.timeout,
    });

    console.log('[API] GETDATA Response:', res.data);
    return res.data;
  } catch (error: any) {
    console.log('[API] GETDATA Error Full:', {
      message: error?.message,
      status:  error?.response?.status,
      data:    error?.response?.data,
    });
    throw error;
  }
};

export const getPublicData = async (
  body: {
    appName: string;
    moduleName: string;
    query?: Record<string, unknown>;
    limit?: number;
    skip?: number;
    sortBy?: string;
    order?: 'ascending' | 'descending';
    [key: string]: unknown;
  },
  extraHeaders: Record<string, string> = {},
) => {
  const url = `${Api.baseUrl}/mongo/getdata`;

  console.log('[API] PUBLIC GETDATA Request:', body);

  try {
    const res = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      timeout: Api.timeout,
    });

    console.log('[API] PUBLIC GETDATA Response:', res.data);
    return res.data;
  } catch (error: any) {
    console.log('[API] PUBLIC GETDATA Error:', error?.response?.data || error.message);
    throw error;
  }
};
