import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const projectRoot = path.resolve(__dirname, '../../..')

function readSource(relativePath: string): string {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

describe('wallet service safety (plan §8)', () => {
  const walletServiceSource = readSource('src/services/wallet.ts')

  const forbiddenMwaOperations = [
    'signIn',
    'signMessage',
    'signMessages',
    'signTransaction',
    'signTransactions',
    'signAndSendTransaction',
    'signAndSendTransactions',
    'getBalance',
    'getAccountInfo',
    'requestAirdrop',
    'sendRawTransaction',
  ]

  it.each(forbiddenMwaOperations)('never calls MWA operation `%s`', (operation) => {
    expect(walletServiceSource).not.toContain(operation)
  })

  it('authorizes with connect() only', () => {
    expect(walletServiceSource).toMatch(/\bconnect\b/)
  })

  it('is the only app code importing the MWA hook', () => {
    const screenDirs = ['app', 'src/components']
    for (const dir of screenDirs) {
      const entries = readdirSync(path.join(projectRoot, dir), { recursive: true }) as string[]
      const codeFiles = entries.filter((f) => /\.(tsx|ts)$/.test(f))
      for (const file of codeFiles) {
        expect(readSource(`${dir}/${file}`)).not.toContain('useMobileWallet')
      }
    }
  })
})

describe('release identity (plan §14)', () => {
  it('points AppConfig.uri at the real GitHub repository', () => {
    const appConfigSource = readSource('constants/app-config.ts')
    expect(appConfigSource).toContain("uri = 'https://github.com/SanseDev/solana-events'")
  })
})
