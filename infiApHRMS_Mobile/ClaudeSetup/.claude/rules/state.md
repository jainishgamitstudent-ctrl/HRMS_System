---
paths:
  - "store/**/*.ts"
  - "hooks/**/*.ts"
  - "lib/queryClient.ts"
---

# State Rules — TanStack Query + Zustand

## What lives where
| Data type | Where |
|---|---|
| Server data (posts, users, etc.) | TanStack Query cache |
| Auth token | `expo-secure-store` only |
| Auth state (user object) | Zustand (hydrated from SecureStore on startup) |
| UI state (modals, theme, tabs) | Zustand |
| Form state | React Hook Form |
| Screen-local state | `useState` |

## TanStack Query Patterns
```typescript
// Query hook template
export function usePostsQuery(userId: string) {
  return useQuery({
    queryKey: ['posts', userId],       // Always include all variables in key
    queryFn: () => api.posts.getAll(userId),
    staleTime: 1000 * 60,              // 1 min — don't refetch too aggressively
    gcTime: 1000 * 60 * 10,           // Keep in cache 10 min
  })
}

// Mutation hook template
export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.posts.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
}
```

## Zustand Store Template
```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { MMKVLoader } from 'react-native-mmkv-storage'

const storage = MMKVLoader.withInstanceID('zustand').initialize()

interface UIStore {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => storage),
    }
  )
)
```

## Auth Store — secure pattern
```typescript
// Auth tokens NEVER go into Zustand or MMKV
// Only non-sensitive user metadata in Zustand
import * as SecureStore from 'expo-secure-store'

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const { user, token } = await api.auth.login(credentials)
    await SecureStore.setItemAsync('auth_token', token)  // Token → SecureStore
    set({ user, isAuthenticated: true })                 // User metadata → Zustand
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token')
    set({ user: null, isAuthenticated: false })
  },
}))
```
