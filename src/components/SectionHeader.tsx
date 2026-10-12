import React from 'react'
import { StyleSheet, View } from 'react-native'
import { AppText } from '@/components/app-text'
import { colors } from '../theme/colors'

export function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.accentBar} />
      <AppText style={styles.title}>{title}</AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
})
