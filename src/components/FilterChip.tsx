import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { colors, radius } from '../theme'

export function FilterChip({
  label,
  selected,
  onPress,
  onRemove,
}: {
  label: string
  selected: boolean
  onPress: () => void
  /** When set, renders the removable active-filter variant. */
  onRemove?: () => void
}) {
  if (onRemove) {
    return (
      <Pressable
        onPress={onRemove}
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
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipIdle,
        pressed && styles.chipPressed,
      ]}
    >
      <View style={selected ? styles.dotSelected : styles.dotIdle} />
      <Text style={selected ? styles.selectedText : styles.idleText}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.control,
    borderWidth: 1,
  },
  removable: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.accent,
  },
  chipIdle: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipPressed: {
    opacity: 0.8,
  },
  dotIdle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },
  dotSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  idleText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
})
