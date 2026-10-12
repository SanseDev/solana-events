export type ActionDockLayout = 'row' | 'stacked'

/** Keeps every action label readable at its minimum 48 dp touch target. */
export function actionDockLayout(width: number, fontScale: number, primaryLabel: string): ActionDockLayout {
  return width >= 360 && fontScale <= 1.15 && primaryLabel === 'Register' ? 'row' : 'stacked'
}
