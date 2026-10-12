/** Spacing scale (px) from docs/implementation-plan.md §7. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const

export type SpacingToken = keyof typeof spacing

export const radius = {
  control: 12,
  card: 16,
} as const

/** Minimum accessible touch target. */
export const touchTarget = 44
