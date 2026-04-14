import axios from 'axios';

const Api = {
  baseUrl: 'https://api.hanaplatform.com/api/v1',
  appName: 'simbahan.conscor.com',
  timeout: 15_000,
  apiKey:  '',
} as const;

export async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await axios.get<T>(`${Api.baseUrl}${endpoint}`, { timeout: Api.timeout });
  return res.data;
}

export default Api;
