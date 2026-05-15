---
paths:
  - "components/**/*.tsx"
  - "components/**/*.ts"
---

# Component Rules — React Native

## Component Types
- `components/ui/` — Pure primitives (Button, Input, Card, Text, Badge). No business logic. No API calls.
- `components/[feature]/` — Feature components. Can use query hooks. Tied to a domain.

## Styling Rules
```typescript
// ✅ StyleSheet.create for all styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700' },
})

// ✅ NativeWind for simple layout classes
<View className="flex-1 p-4 bg-background">

// ❌ Inline style objects — new reference every render
<View style={{ flex: 1, padding: 16 }}>
```

## Colors — always from constants
```typescript
import { Colors } from '@/constants/Colors'
// Never: color: '#FF6B35'
// Always: color: Colors.primary
```

## Images — always expo-image
```typescript
import { Image } from 'expo-image'
// Never: import { Image } from 'react-native'

<Image
  source={{ uri: url }}
  style={styles.image}
  contentFit="cover"
  transition={300}
  placeholder={blurhash}
/>
```

## Lists — always FlatList or FlashList
```typescript
// ✅ FlatList for variable-height items
<FlatList
  data={items}
  keyExtractor={(item) => item._id}   // Stable unique ID, never index
  renderItem={renderItem}              // useCallback-wrapped, defined outside JSX
  showsVerticalScrollIndicator={false}
/>

// ✅ FlashList for large lists (install @shopify/flash-list)
// ❌ Never: items.map() inside ScrollView
```

## Pressable over TouchableOpacity
```typescript
// ✅ Platform-native feedback
<Pressable
  onPress={onPress}
  style={({ pressed }) => [styles.button, pressed && styles.pressed]}
  testID="my-button"   // Required for Detox tests
>

// ❌ Avoid TouchableOpacity in new code
```

## Platform-specific shadows
```typescript
// ✅ Both platforms
const styles = StyleSheet.create({
  card: {
    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Android
    elevation: 4,
  },
})
```
