import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { colors, chipHeight, radius, spacing } from '../theme'
import { selectionFeedback } from '../utils/haptics'

export function FilterChip({
  label,
  selected,
  onPress,
  onRemove,
  disabled = false,
}: {
  label: string
  selected: boolean
  onPress: () => void
  /** When set, renders the removable active-filter variant. */
  onRemove?: () => void
  disabled?: boolean
}) {
  if (onRemove) {
    return (
      <Pressable
        onPress={() => {
          selectionFeedback()
          onRemove()
        }}
        accessibilityRole="button"
        accessibilityLabel={`Remove filter ${label}`}
        style={({ pressed }) => [styles.chip, styles.removable, pressed && styles.chipPressed]}
      >
        <Text style={styles.selectedText}>{label}</Text>
        <MaterialIcons name="close" size={14} color={colors.textPrimary} />
      </Pressable>
    )
  }
  return (
    <Pressable
      onPress={() => {
        selectionFeedback()
        onPress()
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipIdle,
        disabled && styles.chipDisabled,
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={selected ? styles.selectedText : styles.idleText}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    minHeight: chipHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  removable: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.borderStrong,
  },
  chipIdle: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipPressed: {
    opacity: 0.8,
  },
  idleText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  selectedText: {
    color: colors.onAccent,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
})
