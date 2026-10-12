import { type PropsWithChildren } from 'react'
import { MobileWalletProvider } from '@wallet-ui/react-native-web3js'
import { AppConfig } from '@/constants/app-config'
import { FavoritesProvider } from '@/src/hooks/useFavorites'
import { InterestsProvider } from '@/src/hooks/useInterests'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <MobileWalletProvider
      chain={AppConfig.chain}
      endpoint={AppConfig.clusterEndpoint}
      identity={{ name: AppConfig.name, uri: AppConfig.uri }}
    >
      <FavoritesProvider>
        <InterestsProvider>{children}</InterestsProvider>
      </FavoritesProvider>
    </MobileWalletProvider>
  )
}
