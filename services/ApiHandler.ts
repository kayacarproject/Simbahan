import axios from 'axios';
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

// export const getDataPublic = async (endpoint: string, params?: Record<string, unknown>, extraHeaders: Record<string, string> = {}) => {
//   const url = `${Api.baseUrl}${endpoint}`;

//   console.log('[API] getDataPublic:', url, params ?? '');

//   try {
//     const res = await axios.get(url, {
//       headers: { 'Content-Type': 'application/json', ...extraHeaders },
//       params,
//       timeout: Api.timeout,
//     });

//     console.log('[API] Response:', res.data);
//     return res.data;
//   } catch (error: any) {
//     console.log('[API] Error:', error?.response?.data || error.message);
//     throw error;
//   }
// };

// export const dynamicProcess = async (endpoint: string, body: unknown, extraHeaders: Record<string, string> = {}) => {
//   const url = `${Api.baseUrl}${endpoint}`;
//   const headers = await authHeaders(extraHeaders);

//   console.log('[API] dynamicProcess:', url);
//   console.log('[API] Body:', body);

//   try {
//     const res = await axios.post(url, body, { headers, timeout: Api.timeout });
//     console.log('[API] Response:', res.data);
//     return res.data;
//   } catch (error: any) {
//     console.log('[API] Error:', error?.response?.data || error.message);
//     throw error;
//   }
// };

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
        'x-api-key': Api.apiKey,
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

export const getDataPublic = async (
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
  const token = await getToken();

  if (!token) throw new Error('Token not found');

  const url = `${Api.baseUrl}/mongo/getdata`;

  console.log('[API] getDataPublic Request:', body);

  try {
    const res = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...extraHeaders,
      },
      timeout: Api.timeout,
    });

    console.log('[API] getDataPublic Response:', res.data);
    return res.data;
  } catch (error: any) {
    console.log('[API] getDataPublic Error:', error?.response?.data || error.message);
    if (error?.response?.status === 401) throw new Error('Session expired');
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Upload image as multipart/form-data → returns downloadable URL
export const uploadImage = async (localUri: string, fileName: string = 'photo.jpg'): Promise<string> => {
  const token = await getToken();
  if (!token) throw new Error('Token not found');

  const url = `${Api.baseUrl}/files/upload`;

  const formData = new FormData();
  formData.append('file',              { uri: localUri, name: fileName, type: 'image/jpeg' } as any);
  formData.append('appName',           Api.appName);
  formData.append('moduleName',        'appuser');
  formData.append('folder',            'profile');
  formData.append('optimize',          'true');
  formData.append('maxWidth',          '800');
  formData.append('maxHeight',         '600');
  formData.append('quality',           '80');
  formData.append('format',            'webp');
  formData.append('generateThumbnail', 'false');
  formData.append('thumbnailWidth',    '200');
  formData.append('thumbnailHeight',   '200');

  console.log('[API] uploadImage Request:', { url, fileName });

  try {
    const res = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000,
    });
    console.log('[API] uploadImage Response:', res.data);
    const imageUrl: string =
      res.data?.data?.url ??
      res.data?.data?.fileUrl ??
      res.data?.data?.downloadUrl ??
      res.data?.data?.imageUrl ??
      res.data?.url ??
      res.data?.fileUrl ??
      (typeof res.data?.data === 'string' ? res.data.data : null);
    if (!imageUrl) throw new Error('No image URL in response');
    return imageUrl;
  } catch (error: any) {
    console.log('[API] uploadImage Error:', error?.response?.data || error.message);
    if (error?.response?.status === 401) throw new Error('Session expired');
    const msg = Array.isArray(error?.response?.data?.message)
      ? error.response.data.message.join(', ')
      : error?.response?.data?.message || error?.response?.data?.error || error.message;
    throw new Error(msg);
  }
};

export const updateDynamicData = async (
  body: {
    appName: string;
    moduleName: string;
    docId: string;
    body: Record<string, unknown>;
    [key: string]: unknown;
  },
  extraHeaders: Record<string, string> = {},
) => {
  const token = await getToken();

  if (!token) throw new Error('Token not found');

  const url = `${Api.baseUrl}/mongo/submitdata`;

  console.log('[API] updateDynamicData Request:', body);

  try {
    const res = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...extraHeaders,
      },
      timeout: Api.timeout,
    });

    console.log('[API] updateDynamicData Response:', res.data);
    return res.data;
  } catch (error: any) {
    console.log(
      '[API] updateDynamicData Error:',
      error?.response?.data || error.message,
    );

    if (error?.response?.status === 401) {
      throw new Error('Session expired');
    }

    throw new Error(error?.response?.data?.message || error.message);
  }
};
