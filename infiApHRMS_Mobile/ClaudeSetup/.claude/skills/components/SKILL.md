---
name: components
description: Apply when building any React Native UI component. Enforces StyleSheet, platform shadows, expo-image, Pressable, and testID patterns.
user-invocable: true
---

# React Native Component Skill

## Full Primitive Component Template
```typescript
// components/ui/Button.tsx
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { Colors } from '@/constants/Colors'

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  testID?: string
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  testID = 'button',
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.white : Colors.primary}
          testID="activity-indicator"
        />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`], styles[`${size}Label`]]}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  // Variants
  primary:     { backgroundColor: Colors.primary },
  secondary:   { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  destructive: { backgroundColor: Colors.danger },
  ghost:       { backgroundColor: 'transparent' },
  // Sizes
  sm: { paddingHorizontal: 12, paddingVertical: 8,  minHeight: 36 },
  md: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
  lg: { paddingHorizontal: 24, paddingVertical: 16, minHeight: 52 },
  // States
  pressed:  { opacity: 0.75 },
  disabled: { opacity: 0.4 },
  // Labels
  label:           { fontWeight: '600', letterSpacing: -0.2 },
  primaryLabel:    { color: Colors.white },
  secondaryLabel:  { color: Colors.text },
  destructiveLabel:{ color: Colors.white },
  ghostLabel:      { color: Colors.primary },
  smLabel: { fontSize: 14 },
  mdLabel: { fontSize: 16 },
  lgLabel: { fontSize: 18 },
})
```

## Card Template
```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Android shadow
    elevation: 3,
  },
})
```

## Colors Token File
```typescript
// constants/Colors.ts
export const Colors = {
  primary:    '#FF6B35',
  background: '#0A0A0F',
  surface:    'rgba(255,255,255,0.04)',
  border:     'rgba(255,255,255,0.08)',
  text:       '#FFFFFF',
  textMuted:  'rgba(255,255,255,0.6)',
  white:      '#FFFFFF',
  danger:     '#EF4444',
} as const
```

## Checklist
- [ ] `StyleSheet.create()` for all styles
- [ ] `testID` on every interactive element
- [ ] `accessibilityRole` + `accessibilityLabel` on pressables
- [ ] Platform shadows: `shadowColor/shadowOffset/shadowOpacity/shadowRadius` + `elevation`
- [ ] `expo-image` not built-in Image
- [ ] Colors from `Colors` constant — no hex literals
