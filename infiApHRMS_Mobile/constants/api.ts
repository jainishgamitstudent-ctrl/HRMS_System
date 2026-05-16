import { Platform } from 'react-native';
import Constants from 'expo-constants';

const resolveDevHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } }).manifest2
      ?.extra?.expoClient?.hostUri ||
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(':')[0];
};

const DEFAULT_API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000/api/v1',
  ios: 'http://localhost:3000/api/v1',
  default: 'http://localhost:3000/api/v1',
});

const envApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const devHost = resolveDevHost();
const DEV_HOST_API_BASE_URL = devHost ? `http://${devHost}:3000/api/v1` : null;

const resolveApiBaseUrl = () => {
  if (envApiBaseUrl) {
    return envApiBaseUrl;
  }

  if (__DEV__) {
    return DEV_HOST_API_BASE_URL || DEFAULT_API_BASE_URL;
  }

  throw new Error(
    'Missing EXPO_PUBLIC_API_BASE_URL for production build. Set this in EAS environment variables.'
  );
};

export const API_BASE_URL = resolveApiBaseUrl();
export const ADMIN_API_URL = API_BASE_URL;
