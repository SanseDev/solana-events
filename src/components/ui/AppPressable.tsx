import React, { type PropsWithChildren } from 'react'
import {
  Animated,
  Pressable,
  useAnimatedValue,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { colors } from '../../theme'

/**
 * Shared pressable with 120 ms opacity/scale feedback. Motion is visual only;
 * navigation and state changes never depend on it. The caller's style is
 * applied to the animated wrapper so feedback covers the whole control.
 */
export function AppPressable({
  children,
  style,
  ...pressableProps
}: PropsWithChildren<PressableProps & { style?: StyleProp<ViewStyle> }>) {
  const scale = useAnimatedValue(1)
  const opacity = useAnimatedValue(1)

  const animate = (toScale: number, toOpacity: number) => {
    Animated.timing(scale, { toValue: toScale, duration: 120, useNativeDriver: true }).start()
    Animated.timing(opacity, { toValue: toOpacity, duration: 120, useNativeDriver: true }).start()
  }

  return (
    <Pressable onPressIn={() => animate(0.98, 0.85)} onPressOut={() => animate(1, 1)} {...pressableProps}>
      <Animated.View style={[style, { transform: [{ scale }], opacity }]}>{children}</Animated.View>
    </Pressable>
  )
}

/** Static pressed treatment for list rows that keep their own Pressable. */
export const pressedBackground = colors.surfacePressed
