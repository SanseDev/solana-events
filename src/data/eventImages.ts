/**
 * Local event artwork only. Each entry must use a literal `require()` so Metro
 * bundles it for offline use. Do not derive asset paths from catalog JSON.
 *
 * Add an entry only after recording the source, required attribution, and
 * permission or license basis below. The current repository has no verified
 * event artwork, so every catalog event intentionally uses EventArtwork's
 * designed fallback.
 */
export interface EventImageAsset {
  /** Literal Metro asset module returned by `require()`. */
  source: number
  sourceUrl: string
  attribution: string
  permissionOrLicense: string
}

export const EVENT_IMAGES: Readonly<Record<string, EventImageAsset | undefined>> = {}

export function getEventImage(eventId: string): EventImageAsset | undefined {
  return EVENT_IMAGES[eventId]
}

/** Keeps view state separate from catalog lookup so a failed load never hides its fallback. */
export function shouldRenderEventImage(
  image: EventImageAsset | undefined,
  loadFailed: boolean,
): image is EventImageAsset {
  return image !== undefined && !loadFailed
}
