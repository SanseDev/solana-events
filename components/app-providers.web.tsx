import { type PropsWithChildren } from 'react'
import { FavoritesProvider } from '@/src/hooks/useFavorites'
import { PreferencesProvider } from '@/src/hooks/usePreferences'

/**
 * Web provider stack. Deliberately omits MobileWalletProvider: MWA is a
 * native-only protocol, so the web session is reported as unsupported by
 * `useWalletSession` instead of faking a wallet connection.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <FavoritesProvider>
      <PreferencesProvider>{children}</PreferencesProvider>
    </FavoritesProvider>
  )
}
