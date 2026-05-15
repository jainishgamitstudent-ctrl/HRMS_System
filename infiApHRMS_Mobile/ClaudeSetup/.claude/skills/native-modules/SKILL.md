---
name: native-modules
description: Apply when installing or configuring native Expo modules — permissions, camera, notifications, location, biometrics, and SecureStore.
user-invocable: true
---

# Native Modules Skill — Expo

## Installation Rule
ALWAYS use `npx expo install [package]` — NOT `npm install`.
Expo pins package versions to match your SDK. `npm install` breaks this.

## Permissions Pattern (all native features)
```typescript
import * as Camera from 'expo-camera'

async function requestCameraPermission() {
  const { status } = await Camera.requestCameraPermissionsAsync()
  if (status !== 'granted') {
    Alert.alert(
      'Camera Permission',
      'Camera access is required to take photos. Please enable it in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    )
    return false
  }
  return true
}
```

## SecureStore (tokens, secrets)
```typescript
import * as SecureStore from 'expo-secure-store'

// Store
await SecureStore.setItemAsync('auth_token', token)

// Read
const token = await SecureStore.getItemAsync('auth_token')

// Delete (logout)
await SecureStore.deleteItemAsync('auth_token')

// Key naming — descriptive, lowercase, underscored
// ✅ 'auth_token', 'refresh_token', 'user_id'
// ❌ 'token', 't', 'TOKEN'
```

## Push Notifications
```typescript
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

async function registerForPushNotifications() {
  if (!Device.isDevice) return null   // Simulators can't receive push

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') return null

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  })
  return token.data   // Send this to your server
}
```

## Biometric Auth
```typescript
import * as LocalAuthentication from 'expo-local-authentication'

async function authenticateWithBiometrics() {
  const hasBiometrics = await LocalAuthentication.hasHardwareAsync()
  const isEnrolled = await LocalAuthentication.isEnrolledAsync()

  if (!hasBiometrics || !isEnrolled) return false

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to continue',
    fallbackLabel: 'Use passcode',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  })

  return result.success
}
```

## Location
```typescript
import * as Location from 'expo-location'

async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') return null

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  })
  return location.coords
}
```

## app.json Permissions (required before submission)
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Used to take profile photos.",
        "NSLocationWhenInUseUsageDescription": "Used to show nearby results.",
        "NSFaceIDUsageDescription": "Used for quick secure login."
      }
    },
    "android": {
      "permissions": [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "USE_BIOMETRIC",
        "RECEIVE_BOOT_COMPLETED"
      ]
    }
  }
}
```

## Rule
Every permission string in `app.json` must explain WHY. App Store rejects vague descriptions.
