import { clusterApiUrl } from '@solana/web3.js'
import type { Chain } from '@solana-mobile/mobile-wallet-adapter-protocol'

/** App identity shared with wallets during MWA authorization. */
export class AppConfig {
  static name = 'Solana Events'
  /** Shown by wallets as the requesting app link. Replace with the final repo URL before release. */
  static uri = 'https://github.com/solana-events/solana-events'
  /** Wallet provider needs an endpoint; the app performs no RPC calls in the MVP. */
  static chain: Chain = 'devnet'
  static clusterEndpoint = clusterApiUrl('devnet')
}
