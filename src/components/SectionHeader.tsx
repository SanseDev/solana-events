import React from 'react'
import { StyleSheet, View } from 'react-native'
import { AppText } from '@/components/app-text'
import { colors, typography } from '../theme'

export function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>{title}</AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    ...typography.sectionTitle,
  },
})
