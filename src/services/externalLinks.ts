import { Linking } from 'react-native'

/** Opens only https URLs; dataset entries are verified before shipping. */
export async function openExternalUrl(url: string): Promise<void> {
  if (!url.startsWith('https://')) {
    throw new Error('Refusing to open non-https URL')
  }
  await Linking.openURL(url)
}
