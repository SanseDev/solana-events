/** Typography scale from docs/implementation-plan.md §7. System font only. */
export const typography = {
  pageTitle: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  sectionTitle: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  cardTitle: { fontSize: 17, fontWeight: '600', lineHeight: 23 },
  body: { fontSize: 15, lineHeight: 22 },
  bodyLarge: { fontSize: 16, lineHeight: 24 },
  meta: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  chip: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
} as const

export type TypographyToken = keyof typeof typography
