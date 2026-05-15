import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/api';
import { getStoredAuthSession } from './auth';

/**
 * Request push notification permissions and return the Expo push token.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

/**
 * Register the push token with the backend.
 */
export async function registerPushToken(token: string): Promise<void> {
  try {
    const session = await getStoredAuthSession();
    if (!session?.token) {
      console.log('[Push] No auth session, skipping token registration');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/notifications/push-token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.warn('[Push] Token registration failed:', response.status, text);
    } else {
      console.log('[Push] Token registered successfully');
    }
  } catch (err) {
    console.warn('[Push] Token registration error:', err);
  }
}

/**
 * Configure default notification handler for foreground notifications.
 */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Set up Android notification channel.
 */
export async function setupAndroidNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4f46e5',
    });
  }
}
