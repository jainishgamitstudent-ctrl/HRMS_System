---
name: navigation
description: Apply when setting up navigation, layouts, or deep links in Expo Router. Covers route groups, typed params, auth guards, and deep linking.
user-invocable: true
---

# Navigation Skill — Expo Router v3

## Root Layout (providers go here only)
```typescript
// app/_layout.tsx
import { Stack } from 'expo-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
```

## Auth Guard Pattern
```typescript
// app/(auth)/_layout.tsx
import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '@/store/auth'

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Redirect href="/(tabs)/" />
  return <Stack />
}

// app/(tabs)/_layout.tsx
export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />
  return <Tabs>...</Tabs>
}
```

## Tab Navigator
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarStyle: { backgroundColor: Colors.background, borderTopColor: Colors.border },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
```

## Typed Route Navigation
```typescript
// Navigate
import { router } from 'expo-router'
router.push('/posts/123')
router.push({ pathname: '/posts/[id]', params: { id: post._id } })
router.replace('/(auth)/login')
router.back()

// Read params
import { useLocalSearchParams } from 'expo-router'
const { id } = useLocalSearchParams<{ id: string }>()
```

## Modal Screen
```typescript
// app/(modals)/create-post.tsx
import { Stack } from 'expo-router'
export default function CreatePostModal() {
  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', title: 'New Post' }} />
      {/* content */}
    </>
  )
}
// Navigate to it:
router.push('/(modals)/create-post')
```

## Deep Link Config (app.json)
```json
{
  "expo": {
    "scheme": "myapp",
    "web": { "bundler": "metro" },
    "plugins": [["expo-router", { "origin": "https://myapp.com" }]]
  }
}
```
