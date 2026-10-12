import React from 'react'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import type { Meta, StoryObj } from '@storybook/react-native'
import { EventDetailsActionDock } from '../../src/components/EventDetailsActionDock'
import { colors, spacing } from '../../src/theme'

const meta = {
  title: 'Event details/Action dock',
  component: EventDetailsActionDock,
  decorators: [
    (Story) => (
      <SafeAreaProvider>
        <View
          style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: spacing.xxl, backgroundColor: colors.canvas }}
        >
          <Story />
        </View>
      </SafeAreaProvider>
    ),
  ],
  args: {
    primaryLabel: 'Register',
    primaryDisabled: false,
    saved: false,
    calendarState: 'idle',
    showCalendar: true,
    onPrimary: () => undefined,
    onSave: () => undefined,
    onAddToCalendar: () => undefined,
  },
} satisfies Meta<typeof EventDetailsActionDock>

export default meta

type Story = StoryObj<typeof meta>

export const Register: Story = {}

export const Saved: Story = {
  args: { saved: true },
}

export const CalendarAdded: Story = {
  args: { calendarState: 'added' },
}

export const RegistrationClosed: Story = {
  args: { primaryLabel: 'Registration closed', primaryDisabled: true },
}

export const OfficialSource: Story = {
  args: { primaryLabel: 'View official source' },
}
