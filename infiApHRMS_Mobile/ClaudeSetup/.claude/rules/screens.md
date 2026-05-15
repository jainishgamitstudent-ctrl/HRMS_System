---
paths:
  - "app/**/*.tsx"
  - "app/**/*.ts"
---

# Screen Rules — Expo Router

## Screen File Responsibilities
Screens are thin. They:
1. Get route params via `useLocalSearchParams<{ id: string }>()`
2. Call a query hook for data
3. Handle loading/error states
4. Set navigator options via `<Stack.Screen options={{...}} />`
5. Render the layout + presentational component

Screens do NOT contain business logic, styled primitives, or inline data fetching.

## Safe Area — Mandatory
```typescript
// Never hardcode status bar / bottom tab heights
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const insets = useSafeAreaInsets()
// Use insets.top, insets.bottom in contentContainerStyle
```

## Navigation
```typescript
import { router, useLocalSearchParams, Stack } from 'expo-router'

// Push a new screen
router.push('/posts/123')

// Replace (auth transitions — no back button)
router.replace('/(auth)/login')

// Typed params
const { id } = useLocalSearchParams<{ id: string }>()
```

## Loading / Error Pattern
```typescript
if (isLoading) return <LoadingScreen />
if (error)     return <ErrorScreen message={error.message} />
if (!data)     return <ErrorScreen message="Not found" />
// Only then render the real content
```

## Layout Groups
- `(auth)/` — unauthenticated screens, redirect if logged in
- `(tabs)/` — main tab navigator
- `(modals)/` — modal sheets, presented with `presentation: 'modal'`

## Route Naming
- File name = URL segment: `app/posts/[id].tsx` → `/posts/123`
- Groups in `()` don't appear in the URL: `(tabs)/home.tsx` → `/home`
- `_layout.tsx` is the layout wrapper, not a screen
