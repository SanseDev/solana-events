import React from 'react'
import { ActivityIndicator, StyleSheet, View, useWindowDimensions } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppText } from '@/components/app-text'
import { colors, primaryHeight, radius, screenPadding, spacing, touchTarget } from '@/src/theme'
import { selectionFeedback } from '@/src/utils/haptics'
import { AppPressable } from './ui/AppPressable'
import { actionDockLayout } from './eventDetailsActionBarLayout'

type CalendarState = 'idle' | 'adding' | 'added'

type Props = {
  primaryLabel: string
  primaryDisabled: boolean
  saved: boolean
  calendarState: CalendarState
  showCalendar: boolean
  onPrimary: () => void
  onSave: () => void
  onAddToCalendar: () => void
}

/** Fixed event-details dock. It owns visual hierarchy, not action behavior. */
export function EventDetailsActionDock({
  primaryLabel,
  primaryDisabled,
  saved,
  calendarState,
  showCalendar,
  onPrimary,
  onSave,
  onAddToCalendar,
}: Props) {
  const insets = useSafeAreaInsets()
  const { width, fontScale } = useWindowDimensions()
  const layout = actionDockLayout(width, fontScale, primaryLabel)

  const calendarLabel =
    calendarState === 'added'
      ? 'Added to calendar'
      : calendarState === 'adding'
        ? 'Adding to calendar'
        : 'Add to calendar'

  return (
    <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={layout === 'row' ? styles.row : styles.stacked}>
        <AppPressable
          onPress={onPrimary}
          accessibilityRole="button"
          accessibilityLabel={primaryLabel}
          accessibilityState={{ disabled: primaryDisabled }}
          disabled={primaryDisabled}
          style={({ pressed }) => [
            styles.primary,
            layout === 'row' && styles.primaryInRow,
            pressed && !primaryDisabled && styles.primaryPressed,
            primaryDisabled && styles.primaryDisabled,
          ]}
        >
          <AppText style={[styles.primaryText, primaryDisabled && styles.primaryTextDisabled]}>{primaryLabel}</AppText>
          {!primaryDisabled ? <MaterialIcons name="open-in-new" size={18} color={colors.onAccent} /> : null}
        </AppPressable>
        <View style={[styles.secondaryRow, layout === 'row' && styles.secondaryInRow]}>
          <SecondaryAction
            icon={saved ? 'bookmark' : 'bookmark-border'}
            label={saved ? 'Saved' : 'Save'}
            accessibilityLabel={saved ? 'Unsave event' : 'Save event'}
            selected={saved}
            onPress={() => {
              selectionFeedback()
              onSave()
            }}
          />
          {showCalendar ? (
            <SecondaryAction
              icon={calendarState === 'added' ? 'check' : 'event'}
              label={calendarState === 'added' ? 'Added' : 'Calendar'}
              accessibilityLabel={calendarLabel}
              selected={calendarState === 'added'}
              disabled={calendarState !== 'idle'}
              busy={calendarState === 'adding'}
              success={calendarState === 'added'}
              onPress={onAddToCalendar}
            />
          ) : null}
        </View>
      </View>
    </View>
  )
}

function SecondaryAction({
  icon,
  label,
  accessibilityLabel,
  selected = false,
  disabled = false,
  busy = false,
  success = false,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name']
  label: string
  accessibilityLabel: string
  selected?: boolean
  disabled?: boolean
  busy?: boolean
  success?: boolean
  onPress: () => void
}) {
  return (
    <AppPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected, disabled, busy }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondary,
        selected && styles.secondarySelected,
        pressed && !disabled && styles.secondaryPressed,
        disabled && !selected && styles.secondaryDisabled,
      ]}
    >
      {busy ? (
        <ActivityIndicator size="small" color={colors.textSecondary} />
      ) : (
        <MaterialIcons
          name={icon}
          size={20}
          color={success ? colors.success : selected ? colors.accent : colors.textPrimary}
        />
      )}
      <AppText style={[styles.secondaryText, selected && styles.secondaryTextSelected]}>{label}</AppText>
    </AppPressable>
  )
}

const styles = StyleSheet.create({
  dock: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    backgroundColor: colors.canvasRaised,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  stacked: {
    gap: spacing.sm,
  },
  primary: {
    minHeight: primaryHeight,
    paddingHorizontal: spacing.base,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
  },
  primaryInRow: {
    flex: 1,
  },
  primaryPressed: {
    backgroundColor: colors.accentPressed,
  },
  primaryDisabled: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  primaryText: {
    color: colors.onAccent,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryTextDisabled: {
    color: colors.textSecondary,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryInRow: {
    flex: 0,
  },
  secondary: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    flex: 1,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  secondarySelected: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  secondaryPressed: {
    backgroundColor: colors.surfacePressed,
  },
  secondaryDisabled: {
    opacity: 0.72,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  secondaryTextSelected: {
    color: colors.accent,
  },
})
