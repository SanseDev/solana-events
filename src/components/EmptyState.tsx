import React, { type ComponentProps } from 'react'
import { StyleSheet, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { AppText } from '@/components/app-text'
import { AppPressable } from './ui/AppPressable'
import { colors, primaryHeight, radius, spacing, typography } from '../theme'

/** Static empty state with optional icon and one primary CTA. Never fake content. */
export function EmptyState({
  title,
  message,
  ctaLabel,
  onCta,
  icon,
}: {
  title: string
  message: string
  ctaLabel?: string
  onCta?: () => void
  icon?: ComponentProps<typeof MaterialIcons>['name']
}) {
  return (
    <View style={styles.container}>
      {icon ? <MaterialIcons name={icon} size={32} color={colors.textTertiary} /> : null}
      <AppText style={styles.title}>{title}</AppText>
      <AppText style={styles.message}>{message}</AppText>
      {ctaLabel && onCta ? (
        <AppPressable onPress={onCta} accessibilityRole="button" accessibilityLabel={ctaLabel} style={styles.cta}>
          <AppText style={styles.ctaText}>{ctaLabel}</AppText>
        </AppPressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.base,
  },
  title: {
    color: colors.textPrimary,
    ...typography.cardTitle,
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    ...typography.bodyCompact,
    textAlign: 'center',
  },
  cta: {
    marginTop: spacing.md,
    minHeight: primaryHeight,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: colors.onAccent,
    ...typography.label,
    fontSize: 15,
    lineHeight: 20,
  },
})
