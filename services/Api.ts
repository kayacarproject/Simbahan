import axios from 'axios';

const Api = {
  baseUrl: 'https://api.hanaplatform.com/api/v1',
  appName: 'simbahan.conscor.com',
  timeout: 15_000,
  apiKey:  'sk_live_46012485b3c9824e07ee5902445bd4dc247af14740663584f5fd5b61859f62a1',
} as const;

export async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await axios.get<T>(`${Api.baseUrl}${endpoint}`, { timeout: Api.timeout });
  return res.data;
}

export default Api;
