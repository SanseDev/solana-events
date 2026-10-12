import React from 'react'
import { StyleSheet, View } from 'react-native'
import { AppText } from '@/components/app-text'
import { ATTENDANCE_MODE_LABELS, EVENT_FORMAT_LABELS, type Event } from '../domain/event'
import { colors } from '../theme/colors'

/** Single meta line: format · attendance · city or Online. */
export function EventMetaRow({ event }: { event: Event }) {
  const place = event.attendanceMode === 'online' ? 'Online' : (event.city ?? event.country ?? '')
  const parts = [EVENT_FORMAT_LABELS[event.format], ATTENDANCE_MODE_LABELS[event.attendanceMode]]
  if (place.length > 0) {
    parts.push(place)
  }
  return (
    <View style={styles.row}>
      <AppText style={styles.meta}>{parts.join('  ·  ')}</AppText>
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
