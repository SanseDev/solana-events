jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn().mockResolvedValue(undefined),
    canOpenURL: jest.fn().mockResolvedValue(true),
  },
}))

import { Linking } from 'react-native'
import { openExternalUrl } from '../externalLinks'

const openURL = Linking.openURL as jest.MockedFunction<typeof Linking.openURL>

beforeEach(() => {
  openURL.mockClear()
})

describe('openExternalUrl', () => {
  it('opens https urls from the verified dataset', async () => {
    await openExternalUrl('https://example.com/event')
    expect(openURL).toHaveBeenCalledWith('https://example.com/event')
  })

  it('rejects http urls without ever calling Linking', async () => {
    await expect(openExternalUrl('http://example.com/insecure')).rejects.toThrow(/https/)
    expect(openURL).not.toHaveBeenCalled()
  })

  it('rejects non-web schemes', async () => {
    await expect(openExternalUrl('solana://evil')).rejects.toThrow()
    expect(openURL).not.toHaveBeenCalled()
  })

  it('rejects empty urls', async () => {
    await expect(openExternalUrl('')).rejects.toThrow()
  })
})
