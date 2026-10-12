import { type PropsWithChildren } from 'react'
import { AppTheme } from '@/components/app-theme'
import { FavoritesProvider } from '@/src/hooks/useFavorites'
import { InterestsProvider } from '@/src/hooks/useInterests'

/**
 * Web provider stack. Deliberately omits MobileWalletProvider: MWA is a
 * native-only protocol, so the web session is reported as unsupported by
 * `useWalletSession` instead of faking a wallet connection.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AppTheme>
      <FavoritesProvider>
        <InterestsProvider>{children}</InterestsProvider>
      </FavoritesProvider>
    </AppTheme>
  )
}
