import { colors } from '@/src/theme/colors'

/**
 * Bridge between the app palette (src/theme) and the starter primitives
 * (AppView, AppText, tab bar) which read from this map.
 * Dark-only MVP: light mirrors dark.
 */
const palette = {
  background: colors.canvas,
  border: colors.borderSubtle,
  icon: colors.textSecondary,
  tabIconDefault: colors.textSecondary,
  tabIconSelected: colors.accent,
  text: colors.textPrimary,
  tint: colors.accent,
}

export const Colors = {
  light: palette,
  dark: palette,
}
