/**
 * Enterprise Geofencing Utility (Frontend)
 * Validates employee location against office coordinates before API call
 */

import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFICE_CONFIG_KEY = 'office-config-v1';

// Default office configuration - will be overridden by backend
let officeConfig = {
  latitude: 23.0092977,
  longitude: 72.522745,
  radiusMeters: 100,
  wfhRadiusMeters: 500,
  locationValidationRequired: true,
};

export type GeofenceResult = {
  isValid: boolean;
  distance: number;
  maxRadius: number;
  message: string;
};

/**
 * Load office config from storage (called on app start)
 */
export const loadOfficeConfig = async (): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(OFFICE_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      officeConfig = { ...officeConfig, ...parsed };
    }
  } catch {
    // Keep defaults
  }
};

/**
 * Save office config from backend
 */
export const saveOfficeConfig = async (config: {
  officeLat: number;
  officeLng: number;
  radiusMeters: number;
  wfhRadiusMeters: number;
  locationValidationRequired?: boolean;
}): Promise<void> => {
  officeConfig = {
    latitude: config.officeLat,
    longitude: config.officeLng,
    radiusMeters: config.radiusMeters,
    wfhRadiusMeters: config.wfhRadiusMeters,
    locationValidationRequired: config.locationValidationRequired ?? true,
  };
  await AsyncStorage.setItem(OFFICE_CONFIG_KEY, JSON.stringify(officeConfig));
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Check if employee is within office radius
 */
export const validateGeofence = (
  lat: number,
  lng: number,
  workMode: number = 1
): GeofenceResult => {
  const radius = workMode === 2 ? officeConfig.wfhRadiusMeters : officeConfig.radiusMeters;
  const distance = calculateDistance(
    lat,
    lng,
    officeConfig.latitude,
    officeConfig.longitude
  );
  const isInside = distance <= radius;

  // If location validation is disabled, always return valid (for audit still calculate distance)
  const isValid = officeConfig.locationValidationRequired ? isInside : true;

  return {
    isValid,
    distance: Math.round(distance),
    maxRadius: radius,
    message: !officeConfig.locationValidationRequired
      ? `Location validation disabled. Distance from office: ${Math.round(distance)}m`
      : isInside
        ? `Location verified: ${Math.round(distance)}m from office`
        : `You are ${Math.round(distance)}m away from office. Max allowed: ${radius}m`,
  };
};

/**
 * Request location permission and verify GPS is enabled
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    return false;
  }

  const enabled = await Location.hasServicesEnabledAsync();
  if (!enabled) {
    return false;
  }

  return true;
};

/**
 * Get current location with high accuracy
 */
export const getCurrentLocation = async (): Promise<Location.LocationObject> => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error('Location permission is required for attendance verification.');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Highest,
  });

  return location;
};

/**
 * Detect potential mock GPS
 */
export const detectMockLocation = (location: Location.LocationObject | null): {
  isMock: boolean;
  confidence: 'high' | 'low';
  message: string;
} => {
  if (!location) {
    return { isMock: false, confidence: 'low', message: 'No location data available' };
  }

  const { mocked, coords } = location;

  const checks = {
    mockedFlag: mocked === true,
    unrealisticAccuracy: coords.accuracy != null && coords.accuracy < 0,
    unrealisticSpeed: coords.speed != null && coords.speed > 150,
    missingAccuracy: coords.accuracy == null,
  };

  const isSuspicious = Object.values(checks).some(Boolean);

  return {
    isMock: isSuspicious,
    confidence: isSuspicious ? 'high' : 'low',
    message: isSuspicious
      ? 'Potential mock GPS detected. Please disable mock location apps.'
      : 'Location source appears genuine.',
  };
};
