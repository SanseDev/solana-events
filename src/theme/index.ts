import { DarkTheme, type Theme } from '@react-navigation/native'
import { colors } from './colors'
import { radius, spacing, touchTarget } from './spacing'
import { typography } from './typography'

export { colors, radius, spacing, touchTarget, typography }

/** Navigation theme pinned to the app dark palette (dark-only MVP). */
export const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    text: colors.textPrimary,
  },
}
