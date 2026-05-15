---
name: animations
description: Apply when adding animations to React Native. Uses Reanimated 3 worklets for 60fps performance — never the legacy Animated API.
user-invocable: true
---

# Animations Skill — Reanimated 3

## Core Rule
ALL animations use `react-native-reanimated` worklets — they run on the UI thread at 60/120fps.
Never use `Animated` from `react-native` (JS thread, causes jank).

## Fade In
```typescript
import Animated, { useAnimatedStyle, useSharedValue, withTiming, FadeIn } from 'react-native-reanimated'

// Entry animation (declarative — simplest)
<Animated.View entering={FadeIn.duration(300)}>
  {children}
</Animated.View>

// Manual fade (when you control the trigger)
function FadeView({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(visible ? 1 : 0)

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 250 })
  }, [visible])

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return <Animated.View style={animStyle}>{children}</Animated.View>
}
```

## Scale on Press (bouncy button)
```typescript
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

function AnimatedButton({ onPress, children }) {
  const scale = useSharedValue(1)

  const gesture = Gesture.Tap()
    .onBegin(() => { scale.value = withSpring(0.95) })
    .onFinalize(() => {
      scale.value = withSpring(1)
      runOnJS(onPress)()
    })

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animStyle}>{children}</Animated.View>
    </GestureDetector>
  )
}
```

## Slide-in Bottom Sheet
```typescript
import Animated, { useSharedValue, useAnimatedStyle, withSpring, SlideInDown } from 'react-native-reanimated'

<Animated.View entering={SlideInDown.springify().damping(15)}>
  {/* bottom sheet content */}
</Animated.View>
```

## Layout Transition (list reorders)
```typescript
import Animated, { LinearTransition } from 'react-native-reanimated'

<Animated.FlatList
  data={items}
  itemLayoutAnimation={LinearTransition}
  renderItem={renderItem}
  keyExtractor={(item) => item._id}
/>
```

## Skeleton Loader (shimmer)
```typescript
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated'

function Skeleton({ width, height }: { width: number; height: number }) {
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true)
  }, [])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View style={[{ width, height, borderRadius: 8, backgroundColor: Colors.surface }, style]} />
  )
}
```

## Rules
- `useSharedValue` → replaces `useRef(new Animated.Value(0))`
- Worklets run on UI thread — don't call React state setters inside worklets, use `runOnJS(setter)(value)`
- `useAnimatedStyle` for style derivations — never compute in JS render
- `withSpring` for interactive gestures, `withTiming` for time-based transitions
- Always cleanup: shared values are automatically GC'd, but cancel infinite animations on unmount
