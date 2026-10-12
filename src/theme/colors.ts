/** Design tokens from docs/implementation-plan.md §7. Dark-only for MVP. */
export const colors = {
  background: '#0B1020',
  surface: '#151C31',
  surfaceElevated: '#1C2540',
  textPrimary: '#F6F7FB',
  textSecondary: '#AAB4CD',
  border: '#2A3554',
  accent: '#8B7CFF',
  accentStrong: '#6C5CE7',
  success: '#4ED6A1',
  warning: '#F6BE6A',
  danger: '#FF748D',
} as const

export type ColorToken = keyof typeof colors
