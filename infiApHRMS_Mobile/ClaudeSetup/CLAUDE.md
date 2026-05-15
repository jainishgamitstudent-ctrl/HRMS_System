# Project Brain — React Native

## Stack
- **Framework:** React Native 0.74+ with Expo SDK 51 (Managed → Bare workflow)
- **Language:** TypeScript 5 (strict)
- **Navigation:** Expo Router v3 (file-based, like Next.js App Router)
- **State:** Zustand (client) + TanStack Query v5 (server state)
- **Styling:** NativeWind v4 (Tailwind for RN) + StyleSheet for perf-critical paths
- **Auth:** Clerk (or JWT stored in SecureStore — never AsyncStorage)
- **Storage:** MMKV (fast key-value) + Expo SecureStore (secrets)
- **API client:** Custom fetch wrapper with TanStack Query
- **Forms:** React Hook Form + Zod
- **Testing:** Jest + React Native Testing Library + Detox (E2E)
- **CI/CD:** EAS Build + EAS Submit
- **Push notifications:** Expo Notifications
- **Analytics:** Posthog (or Amplitude)

## Project Structure
```
/
├── app/                    ← Expo Router screens (file = route)
│   ├── (auth)/             ← Auth group (login, register, forgot-password)
│   ├── (tabs)/             ← Tab navigator group
│   │   ├── index.tsx       ← Home tab
│   │   ├── explore.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx         ← Root layout (providers go here)
│   └── +not-found.tsx
├── components/             ← Reusable UI components
│   ├── ui/                 ← Primitive components (Button, Input, Card)
│   └── [feature]/          ← Feature-specific components
├── hooks/                  ← Custom hooks
├── store/                  ← Zustand stores
├── lib/                    ← API client, utils, constants
│   ├── api.ts              ← Typed fetch wrapper
│   └── queryClient.ts      ← TanStack Query config
├── types/                  ← Global TypeScript types
├── assets/                 ← Images, fonts, icons
├── constants/              ← Colors, sizes, spacing tokens
└── shared/                 ← Zod schemas shared with backend
    └── schemas/
```

## Commands
```bash
# Development
npx expo start                    # Start dev server
npx expo start --ios              # iOS simulator
npx expo start --android          # Android emulator
npx expo start --tunnel           # Physical device via tunnel

# Building
eas build --platform ios          # EAS cloud build (iOS)
eas build --platform android      # EAS cloud build (Android)
eas build --local --platform ios  # Local build

# Testing
npm test                          # Jest unit + component tests
npm run test:e2e                  # Detox E2E tests
npm run test:e2e:ios              # Detox on iOS
npm run test:e2e:android          # Detox on Android

# Code quality
npm run lint                      # ESLint
npm run lint:fix                  # ESLint auto-fix
npm run type-check                # tsc --noEmit
npx expo-doctor                   # Diagnose config issues

# OTA updates
eas update --branch production    # Push JS update (no store review)
eas update --branch staging
```

## Conventions

### TypeScript
- Strict mode — `"strict": true` in tsconfig
- No `any` — use `unknown` and narrow
- Props interfaces always named `[Component]Props`
- Navigation params typed via `RootStackParamList` or Expo Router types

### Platform-specific code
```typescript
// Inline — simple differences
const padding = Platform.OS === 'ios' ? 44 : 16

// File splits — complex differences
// Button.ios.tsx   ← iOS version
// Button.android.tsx ← Android version
// Button.tsx       ← Shared fallback / types
```

### Styling
- NativeWind classes for layout and spacing
- `StyleSheet.create()` for animations and perf-critical components
- Never hardcode colors — always from `constants/Colors.ts`
- Safe areas via `useSafeAreaInsets()` — never hardcode status bar height

### Security
- Secrets ONLY in `expo-secure-store` — never `AsyncStorage` or `MMKV`
- API keys for backend calls only — never bundle secret keys in the app
- `expo-crypto` for any hashing
- Certificate pinning for sensitive apps

### Navigation (Expo Router)
- Typed routes via `expo-router/types` generation
- `router.push()` for new screens, `router.replace()` for auth transitions
- Params via `useLocalSearchParams<{ id: string }>()`
- Deep links configured in `app.json` scheme

### Performance
- `FlatList` or `FlashList` for any list > 20 items — never `.map()` in ScrollView
- `useMemo` / `useCallback` on anything passed to list `renderItem`
- Hermes engine enabled (default in Expo SDK 50+)
- Image: `expo-image` (not built-in Image) — disk + memory cache

## Key Principles
- Test on real devices, not just simulators
- Android and iOS parity — build for both from day one
- Offline-first where possible — TanStack Query persistence + MMKV
- Never block the JS thread — heavy work in worklets (Reanimated) or native modules
- OTA updates for JS-only fixes, EAS build for native changes
