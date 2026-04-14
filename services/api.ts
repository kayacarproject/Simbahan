import { API_BASE_URL } from '../constants/config';

const Api = {
  baseUrl: API_BASE_URL,
  appName: 'simbahan.conscor.com',
  timeout: 15000,
  apiKey: '',
} as const;

export async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${Api.baseUrl}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export default Api;