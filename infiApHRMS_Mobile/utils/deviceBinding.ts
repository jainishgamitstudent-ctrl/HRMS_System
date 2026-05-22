/**
 * Enterprise Device Binding Utility
 * Prevents multiple devices per employee for attendance
 */

import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'attendance-device-id-v1';
const DEVICE_NAME_KEY = 'attendance-device-name-v1';

export type DeviceInfo = {
  deviceId: string;
  deviceName: string;
  devicePlatform: string;
};

/**
 * Generate a stable device identifier
 */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  let storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  let deviceId = storedDeviceId ?? '';

  if (!deviceId) {
    // Use Expo Device info or generate UUID
    const expoId = (Device.osInternalBuildId || Device.modelId) ?? '';
    deviceId = expoId || `device_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  let storedDeviceName = await AsyncStorage.getItem(DEVICE_NAME_KEY);
  let deviceName = storedDeviceName ?? '';
  if (!deviceName) {
    const manufacturer = Device.manufacturer || 'Unknown';
    const modelName = Device.modelName || 'Device';
    deviceName = `${manufacturer} ${modelName}`;
    await AsyncStorage.setItem(DEVICE_NAME_KEY, deviceName);
  }

  return {
    deviceId,
    deviceName,
    devicePlatform: Device.osName || 'unknown',
  };
};

/**
 * Check if this device is already registered (for UI warnings)
 */
export const isDeviceRegistered = async (): Promise<boolean> => {
  const id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  return !!id;
};

/**
 * Reset device binding (for device change requests)
 */
export const resetDeviceBinding = async (): Promise<void> => {
  await AsyncStorage.multiRemove([DEVICE_ID_KEY, DEVICE_NAME_KEY]);
};
