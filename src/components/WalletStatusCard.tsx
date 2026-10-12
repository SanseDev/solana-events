import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import { AppText } from '@/components/app-text'
import type { WalletSession } from '../services/wallet'
import { colors, radius, spacing } from '../theme'

function shortAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

export function WalletStatusCard({ session }: { session: WalletSession }) {
  const { status, address, label, error, connect, disconnectWallet } = session

  const copyAddress = () => {
    if (address) {
      Clipboard.setString(address)
    }
  }

  return (
    <View style={styles.card}>
      {status === 'connected' && address ? (
        <>
          <View style={styles.connectedHeader}>
            <View style={styles.dot} />
            <AppText style={styles.connectedLabel}>Wallet connected</AppText>
          </View>
          <Pressable
            onPress={copyAddress}
            accessibilityRole="button"
            accessibilityLabel="Copy wallet address"
            style={({ pressed }) => [styles.addressRow, pressed && styles.pressed]}
          >
            <Text style={styles.address}>{shortAddress(address)}</Text>
            <Text style={styles.copyHint}>Copy</Text>
          </Pressable>
          {label ? <AppText style={styles.label}>{label}</AppText> : null}
          <Pressable
            onPress={disconnectWallet}
            accessibilityRole="button"
            accessibilityLabel="Disconnect wallet"
            style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
          >
            <Text style={styles.outlineText}>Disconnect</Text>
          </Pressable>
        </>
      ) : status === 'connecting' ? (
        <>
          <AppText style={styles.title}>Connecting…</AppText>
          <AppText style={styles.message}>Approve the request in your wallet, or cancel to stay disconnected.</AppText>
          <ActivityIndicator color={colors.accent} />
        </>
      ) : status === 'unsupported' ? (
        <>
          <AppText style={styles.title}>Wallet unavailable on web</AppText>
          <AppText style={styles.message}>
            Mobile Wallet Adapter requires the Android app with a native wallet such as Seeker or Phantom. The event
            catalog, saved events, and interests all work here without a wallet.
          </AppText>
        </>
      ) : (
        <>
          <AppText style={styles.title}>Connect your wallet</AppText>
          <AppText style={styles.message}>
            Connect a Mobile Wallet Adapter wallet to personalize your experience. The event catalog works fully without
            it.
          </AppText>
          <Pressable
            onPress={connect}
            accessibilityRole="button"
            accessibilityLabel="Connect wallet"
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>Connect wallet</Text>
          </Pressable>
        </>
      )}
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      <AppText style={styles.securityNote}>
        Your wallet is only used to connect. This app never asks for your recovery phrase.
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  connectedLabel: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '700',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.control,
    backgroundColor: colors.surfaceElevated,
  },
  address: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  copyHint: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 23,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: radius.control,
    backgroundColor: colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    minHeight: 44,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  outlineText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  securityNote: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.8,
  },
})
