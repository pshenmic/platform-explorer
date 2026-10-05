import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals'
import { createElement, type ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCoreBlockLink } from '../util/useCoreBlockLink'

const originalFetch = globalThis.fetch
const lookup = jest.fn<typeof fetch>()
const base = 'https://testnet.dashscan.io'

function setup(height: number | undefined) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const hook = renderHook(() => useCoreBlockLink(height, base), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children)
  })
  return { ...hook, client }
}

beforeEach(() => {
  lookup.mockReset()
  globalThis.fetch = lookup
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('Core block links', () => {
  test('shows no link until the correct network hash is available', async () => {
    lookup.mockResolvedValue({
      status: 200,
      json: async () => ({ height: 42, hash: 'a'.repeat(64), network: 'testnet' })
    } as Response)
    const { result } = setup(42)
    expect(result.current).toBeUndefined()
    await waitFor(() => expect(result.current).toBe(`${base}/blocks/${'a'.repeat(64)}`))
  })

  test.each([undefined, -1, Number.NaN, 1.5])('does not request invalid height %s', height => {
    const { result } = setup(height)
    expect(result.current).toBeUndefined()
    expect(lookup).not.toHaveBeenCalled()
  })

  test.each([
    { height: 42, hash: 'a'.repeat(64), network: 'mainnet' },
    { height: 43, hash: 'a'.repeat(64), network: 'testnet' },
    { height: 42, hash: 'invalid', network: 'testnet' }
  ])('does not link mismatched or invalid results', async response => {
    lookup.mockResolvedValue({ status: 200, json: async () => response } as Response)
    const { result, client } = setup(42)
    await waitFor(() =>
      expect(client.getQueryState(['coreBlockHash', 'testnet', 42])?.status).toBe('success')
    )
    expect(result.current).toBeUndefined()
  })

  test('keeps the height unlinked when RPC is unavailable', async () => {
    lookup.mockRejectedValue(new Error('unavailable'))
    const { result, client } = setup(42)
    await waitFor(() =>
      expect(client.getQueryState(['coreBlockHash', 'testnet', 42])?.status).toBe('error')
    )
    expect(result.current).toBeUndefined()
  })
})
