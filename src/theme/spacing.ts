/** Spacing scale (px): 4, 8, 12, 16, 20, 24, 32, 40. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const

export type SpacingToken = keyof typeof spacing

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
} as const

/** Minimum accessible touch target; primary actions use `primaryHeight`. */
export const touchTarget = 48
export const primaryHeight = 52
export const chipHeight = 36
/** Screen horizontal padding. */
export const screenPadding = spacing.lg
/** Separation between major screen sections. */
export const sectionGap = spacing.xxl
