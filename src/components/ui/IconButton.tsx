import React, { type ComponentProps } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { colors, touchTarget } from '../../theme'
import { selectionFeedback } from '../../utils/haptics'

type IconName = ComponentProps<typeof MaterialIcons>['name']

/**
 * 48 dp icon-only control with accessible label and selected/disabled state.
 * Feedback fires only when the press actually changes state.
 */
export function IconButton({
  name,
  label,
  onPress,
  selected = false,
  disabled = false,
  color,
  selectedColor,
  size = 22,
}: {
  name: IconName
  label: string
  onPress: () => void
  selected?: boolean
  disabled?: boolean
  color?: string
  selectedColor?: string
  size?: number
}) {
  const tint = disabled
    ? colors.textTertiary
    : selected
      ? (selectedColor ?? colors.accent)
      : (color ?? colors.textSecondary)
  return (
    <Pressable
      onPress={() => {
        selectionFeedback()
        onPress()
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [styles.target, (pressed || disabled) && styles.dimmed]}
    >
      <MaterialIcons name={name} size={size} color={tint} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  target: {
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.7,
  },
})
