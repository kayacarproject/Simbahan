const Api = {
  baseUrl:  'https://api.hanaplatform.com/api/v1',
  appName:  'simbahan.conscor.com',
  timeout:  15_000, // ms
  apiKey:   '', // set if the API supports x-api-key fallback
} as const;

export default Api;