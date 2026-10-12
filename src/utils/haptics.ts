import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'

/**
 * Light selection feedback for state-changing controls (chips, filters, save).
 * Fire-and-forget: unsupported platforms and failures are skipped silently.
 */
export function selectionFeedback(): void {
  if (Platform.OS === 'web') {
    return
  }
  Haptics.selectionAsync().catch(() => undefined)
}
