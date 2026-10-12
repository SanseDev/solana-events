import React from 'react'
import { StyleSheet, View } from 'react-native'
import { AppText } from '@/components/app-text'
import { ATTENDANCE_MODE_LABELS, type Event } from '../domain/event'
import { formatCardTimeRange } from '../utils/dates'
import { colors } from '../theme/colors'

/** Single combined meta line: place · time · attendance (event-local). */
export function EventMetaRow({ event }: { event: Event }) {
  const place = event.attendanceMode === 'online' ? 'Online' : (event.city ?? event.country ?? '')
  const time = formatCardTimeRange(event.startAt, event.endAt)
  const parts = [place, time, ATTENDANCE_MODE_LABELS[event.attendanceMode]]
  return (
    <View style={styles.row}>
      <AppText style={styles.meta} numberOfLines={1}>
        {parts.filter(Boolean).join('  ·  ')}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
})
