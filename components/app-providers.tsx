import { type PropsWithChildren } from 'react'
import { MobileWalletProvider } from '@wallet-ui/react-native-web3js'
import { AppConfig } from '@/constants/app-config'
import { FavoritesProvider } from '@/src/hooks/useFavorites'
import { PreferencesProvider } from '@/src/hooks/usePreferences'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <MobileWalletProvider
      chain={AppConfig.chain}
      endpoint={AppConfig.clusterEndpoint}
      identity={{ name: AppConfig.name, uri: AppConfig.uri }}
    >
      <FavoritesProvider>
        <PreferencesProvider>{children}</PreferencesProvider>
      </FavoritesProvider>
    </MobileWalletProvider>
  )
}
