import { describe, expect, test } from '@jest/globals'
import { getL1ExplorerLink } from '../util/l1Explorer'
import { NETWORK_OPTIONS } from '../constants/networks'

describe('DashScan links', () => {
  test.each([
    ['mainnet', 'https://dashscan.io'],
    ['testnet', 'https://testnet.dashscan.io']
  ])('uses the correct explorer for %s', (network, expectedBase) => {
    const base = NETWORK_OPTIONS[network].l1explorerBaseUrl
    expect(base).toBe(expectedBase)
    expect(getL1ExplorerLink(base, 'block', 'A'.repeat(64))).toBe(
      `${expectedBase}/blocks/${'a'.repeat(64)}`
    )
    expect(getL1ExplorerLink(base, 'transaction', 'B'.repeat(64))).toBe(
      `${expectedBase}/transactions/${'b'.repeat(64)}`
    )
    expect(getL1ExplorerLink(base, 'address', 'yRxmN1L3FMfiDYHnnghP7bEr7tsqxAhyWe')).toBe(
      `${expectedBase}/address/yRxmN1L3FMfiDYHnnghP7bEr7tsqxAhyWe`
    )
  })

  test('does not generate links for heights, missing values or malformed hashes', () => {
    expect(getL1ExplorerLink('https://dashscan.io', 'block', '1162452')).toBeUndefined()
    expect(getL1ExplorerLink('https://dashscan.io', 'transaction', 'invalid')).toBeUndefined()
    expect(getL1ExplorerLink(undefined, 'address', 'address')).toBeUndefined()
    expect(getL1ExplorerLink('https://dashscan.io', 'address', '')).toBeUndefined()
  })

  test('encodes identifiers and avoids duplicate slashes', () => {
    expect(getL1ExplorerLink('https://dashscan.io/', 'address', 'invalid/value')).toBe(
      'https://dashscan.io/address/invalid%2Fvalue'
    )
  })
})
