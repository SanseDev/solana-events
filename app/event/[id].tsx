import React, { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { AppText } from '@/components/app-text'
import { EmptyState } from '@/src/components/EmptyState'
import { EventArtwork } from '@/src/components/EventArtwork'
import { AppPressable } from '@/src/components/ui/AppPressable'
import { getEventById } from '@/src/data/eventCatalog'
import { COMMUNITIES_BY_ID } from '@/src/data/communities'
import { ATTENDANCE_MODE_LABELS, EVENT_FORMAT_LABELS, TOPIC_LABELS, type Event } from '@/src/domain/event'
import { useFavorites } from '@/src/hooks/useFavorites'
import { addEventToCalendar } from '@/src/services/calendar'
import { openExternalUrl } from '@/src/services/externalLinks'
import { formatDateOnlySpan, formatDateTime, formatEventDateRange } from '@/src/utils/dates'
import { getEventStatus, getRegistrationState } from '@/src/utils/eventStatus'
import { selectionFeedback } from '@/src/utils/haptics'
import { colors, primaryHeight, radius, screenPadding, spacing, touchTarget, typography } from '@/src/theme'

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <AppText style={styles.blockLabel}>{label}</AppText>
      {children}
    </View>
  )
}

function StaticChip({ text }: { text: string }) {
  return (
    <View style={styles.staticChip}>
      <AppText style={styles.staticChipText}>{text}</AppText>
    </View>
  )
}

/** Persistent bottom dock: flexible primary CTA plus compact Save/calendar icon actions. */
function ActionBar({
  event,
  registration,
  saved,
  calendarState,
  onSave,
  onAddToCalendar,
}: {
  event: Event
  registration: ReturnType<typeof getRegistrationState>
  saved: boolean
  calendarState: 'idle' | 'adding' | 'added'
  onSave: () => void
  onAddToCalendar: () => void
}) {
  const insets = useSafeAreaInsets()
  const { width, fontScale } = useWindowDimensions()
  const registrationClosed = registration === 'closed'
  const calendarEligible = getEventStatus(event, new Date()) !== 'ended' && Platform.OS !== 'web'
  const primaryLabel = registrationClosed
    ? 'Registration closed'
    : event.registrationUrl
      ? 'Register'
      : 'View official source'
  // One row when the CTA label keeps comfortable room at normal text size;
  // narrow screens and enlarged accessibility text stack the icon actions
  // under a full-width CTA instead of squeezing or truncating it.
  const singleRow = width >= 360 && fontScale <= 1.3

  const onPrimary = () => {
    const url = event.registrationUrl ?? event.officialSourceUrl
    openExternalUrl(url).catch(() => {
      Alert.alert('Could not open link', 'Please try again later.')
    })
  }

  const primary = (
    <AppPressable
      onPress={onPrimary}
      accessibilityRole="button"
      accessibilityLabel={primaryLabel}
      disabled={registrationClosed}
      style={({ pressed }) => [
        styles.primaryButton,
        singleRow && styles.primaryFlexible,
        pressed && styles.primaryPressed,
        registrationClosed && styles.primaryDisabled,
      ]}
    >
      <AppText style={[styles.primaryText, registrationClosed ? styles.primaryTextDisabled : null]}>
        {primaryLabel}
      </AppText>
    </AppPressable>
  )

  const saveAction = (
    <AppPressable
      onPress={() => {
        selectionFeedback()
        onSave()
      }}
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Unsave event' : 'Save event'}
      accessibilityState={{ selected: saved }}
      style={({ pressed }) => [
        styles.iconButton,
        !singleRow && styles.iconButtonWide,
        saved && styles.iconButtonSaved,
        pressed && styles.iconButtonPressed,
      ]}
    >
      <MaterialIcons
        name={saved ? 'bookmark' : 'bookmark-border'}
        size={22}
        color={saved ? colors.accent : colors.textSecondary}
      />
    </AppPressable>
  )

  const calendarAction = calendarEligible ? (
    <AppPressable
      onPress={onAddToCalendar}
      accessibilityRole="button"
      accessibilityLabel={
        calendarState === 'added'
          ? 'Added to calendar'
          : calendarState === 'adding'
            ? 'Adding to calendar'
            : 'Add to calendar'
      }
      accessibilityState={{
        selected: calendarState === 'added',
        disabled: calendarState !== 'idle',
        busy: calendarState === 'adding',
      }}
      disabled={calendarState !== 'idle'}
      style={({ pressed }) => [
        styles.iconButton,
        !singleRow && styles.iconButtonWide,
        calendarState === 'added' && styles.iconButtonAdded,
        pressed && styles.iconButtonPressed,
      ]}
    >
      {calendarState === 'adding' ? (
        <ActivityIndicator size="small" color={colors.textSecondary} />
      ) : (
        <MaterialIcons
          name={calendarState === 'added' ? 'check' : 'event'}
          size={22}
          color={calendarState === 'added' ? colors.success : colors.textSecondary}
        />
      )}
    </AppPressable>
  ) : null

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {singleRow ? (
        <View style={styles.actionRow}>
          {primary}
          {saveAction}
          {calendarAction}
        </View>
      ) : (
        <View style={styles.stackedRows}>
          {primary}
          <View style={styles.actionRow}>
            {saveAction}
            {calendarAction}
          </View>
        </View>
      )}
    </View>
  )
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const event = useMemo(() => (typeof id === 'string' ? getEventById(id) : undefined), [id])
  const now = useMemo(() => new Date(), [])
  const { isFavorite, toggleFavorite, persistError } = useFavorites()
  const [calendarState, setCalendarState] = useState<'idle' | 'adding' | 'added'>('idle')

  if (!event) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <EmptyState
          title="Event not found"
          message="This event is no longer in the catalog."
          ctaLabel="Back to Discover"
          onCta={() => router.push('/(tabs)/discover')}
        />
      </SafeAreaView>
    )
  }

  const status = getEventStatus(event, now)
  const registration = getRegistrationState(event, now)
  const saved = isFavorite(event.id)
  const dateText = event.allDay
    ? formatDateOnlySpan(event.startAt, event.endAt)
    : formatEventDateRange(event.startAt, event.endAt, event.timezoneLabel)
  const place =
    event.attendanceMode === 'online' ? 'Online' : [event.venue, event.city, event.country].filter(Boolean).join(', ')

  const onAddToCalendar = async () => {
    if (calendarState !== 'idle') {
      return
    }
    setCalendarState('adding')
    const result = await addEventToCalendar(event)
    setCalendarState(result === 'added' ? 'added' : 'idle')
    if (result === 'added') {
      return
    }
    if (result === 'permission-denied') {
      Alert.alert('Calendar access needed', 'Allow calendar access in Android settings to add this event.')
      return
    }
    if (result === 'no-calendar') {
      Alert.alert('No calendar found', 'Add a calendar account on this device, then try again.')
      return
    }
    Alert.alert('Could not add event', 'Please try again later.')
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.body}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppPressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
          </AppPressable>
          <View style={styles.coverWrap}>
            <EventArtwork event={event} variant="cover" />
          </View>
          <View style={styles.header}>
            <AppText style={styles.overline}>
              {EVENT_FORMAT_LABELS[event.format].toUpperCase()} ·{' '}
              {ATTENDANCE_MODE_LABELS[event.attendanceMode].toUpperCase()}
            </AppText>
            <AppText style={styles.title}>{event.title}</AppText>
            <AppText style={styles.organizer}>{event.organizer}</AppText>
          </View>
          {persistError ? <AppText style={styles.persistError}>{persistError}</AppText> : null}
          <InfoBlock label="When">
            <AppText style={styles.blockValue}>{dateText}</AppText>
          </InfoBlock>
          {event.registrationDeadline ? (
            <InfoBlock label="Registration deadline">
              <AppText
                style={[
                  styles.blockValue,
                  registration === 'closed' ? { color: colors.danger } : { color: colors.warning },
                ]}
              >
                {formatDateTime(event.registrationDeadline, event.timezoneLabel)}
              </AppText>
            </InfoBlock>
          ) : null}
          <InfoBlock label="Where">
            <AppText style={styles.blockValue}>{place}</AppText>
          </InfoBlock>
          <InfoBlock label="About">
            <AppText style={styles.description}>{event.description}</AppText>
          </InfoBlock>
          <InfoBlock label="Topics">
            <View style={styles.chipWrap}>
              {event.topics.map((topic) => (
                <StaticChip key={topic} text={TOPIC_LABELS[topic]} />
              ))}
            </View>
          </InfoBlock>
          {event.communityIds.length > 0 ? (
            <InfoBlock label="Communities">
              <View style={styles.chipWrap}>
                {event.communityIds.map((communityId) => (
                  <StaticChip key={communityId} text={COMMUNITIES_BY_ID.get(communityId)?.name ?? communityId} />
                ))}
              </View>
            </InfoBlock>
          ) : null}
          <AppText style={styles.verified}>
            Details verified on {event.lastVerifiedAt}.
            {status === 'ended' ? ' This event has ended.' : status === 'ongoing' ? ' Happening now.' : ''}
          </AppText>
        </ScrollView>
        <ActionBar
          event={event}
          registration={registration}
          saved={saved}
          calendarState={calendarState}
          onSave={() => toggleFavorite(event.id)}
          onAddToCalendar={onAddToCalendar}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  body: {
    flex: 1,
  },
  content: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  coverWrap: {
    marginHorizontal: -screenPadding,
  },
  backButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: touchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvasRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  header: {
    gap: spacing.xs,
  },
  overline: {
    color: colors.accent,
    ...typography.overline,
  },
  title: {
    color: colors.textPrimary,
    ...typography.detailTitle,
  },
  organizer: {
    color: colors.textSecondary,
    ...typography.bodyCompact,
  },
  block: {
    gap: spacing.xs,
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  blockLabel: {
    color: colors.textSecondary,
    ...typography.overline,
  },
  blockValue: {
    color: colors.textPrimary,
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  description: {
    color: colors.textPrimary,
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  staticChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  staticChipText: {
    color: colors.textSecondary,
    ...typography.label,
  },
  verified: {
    color: colors.textTertiary,
    ...typography.label,
    fontSize: 12,
    lineHeight: 16,
  },
  persistError: {
    color: colors.warning,
    ...typography.label,
  },
  bar: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.canvasRaised,
    shadowColor: colors.canvas,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.85,
    shadowRadius: 8,
    elevation: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stackedRows: {
    gap: spacing.sm,
  },
  primaryButton: {
    minHeight: primaryHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryFlexible: {
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
    fontWeight: '600',
    lineHeight: 22,
  },
  primaryTextDisabled: {
    color: colors.textSecondary,
  },
  iconButton: {
    width: touchTarget,
    minHeight: primaryHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  iconButtonWide: {
    flex: 1,
  },
  iconButtonSaved: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accentMuted,
  },
  iconButtonAdded: {
    borderColor: colors.borderStrong,
  },
  iconButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
})
