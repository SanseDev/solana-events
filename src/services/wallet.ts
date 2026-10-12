import { useCallback, useState } from 'react'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { AppConfig } from '@/constants/app-config'

export type WalletStatus = 'unsupported' | 'disconnected' | 'connecting' | 'connected'

export interface WalletSession {
  status: WalletStatus
  /** Base58 public address of the authorized account, null when not connected. */
  address: string | null
  /** Optional account label provided by the wallet. */
  label: string | null
  /** Non-null when the last connect attempt failed or was cancelled. */
  error: string | null
  connect: () => Promise<void>
  disconnectWallet: () => Promise<void>
}

/**
 * Single adapter to the starter's Mobile Wallet Adapter layer.
 * Screens must use this hook, never `useMobileWallet` directly (plan §4).
 */
export function useWalletSession(): WalletSession {
  const { accounts, account, signIn, disconnect } = useMobileWallet()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const address = account?.address.toBase58() ?? null
  const label = account?.label ?? null

  const connect = useCallback(async () => {
    setConnecting(true)
    setError(null)
    try {
      await signIn({ uri: AppConfig.uri })
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message
          ? `Wallet connection failed: ${cause.message}`
          : 'Wallet connection was cancelled or failed. You can retry any time.',
      )
    } finally {
      setConnecting(false)
    }
  }, [signIn])

  const disconnectWallet = useCallback(async () => {
    setError(null)
    try {
      await disconnect()
    } catch {
      setError('Disconnect failed. Try again.')
    }
  }, [disconnect])

  const status: WalletStatus =
    connecting && !address ? 'connecting' : address || (accounts?.length ?? 0) > 0 ? 'connected' : 'disconnected'

  return { status, address, label, error, connect, disconnectWallet }
}
