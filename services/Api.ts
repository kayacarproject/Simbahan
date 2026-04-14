import Constants from 'expo-constants';

const Api = {
  baseUrl: 'https://api.hanaplatform.com/api/v1',
  appName: 'simbahan.conscor.com',
  timeout: 15000,
  apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_KEY ?? '',
} as const;

export default Api;