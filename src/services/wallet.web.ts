import type { WalletSession } from './wallet'

/**
 * Web stub for the MWA wallet session. The Mobile Wallet Adapter protocol
 * only runs inside native Android/iOS apps, so the web build reports a
 * permanent `unsupported` status instead of simulating a connection.
 */
export function useWalletSession(): WalletSession {
  return {
    status: 'unsupported',
    address: null,
    label: null,
    error: null,
    connect: async () => {},
    disconnectWallet: async () => {},
  }
}
