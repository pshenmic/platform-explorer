import type { jest as Jest } from '@jest/globals'
declare const jest: typeof Jest
import { act, renderHook, waitFor } from '@testing-library/react'
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { useHomeStatus } from '../components/home/hooks/useHomeStatus'
import { networkHealth } from '../components/home/networkHealth'
import * as Api from '../util/Api'
import type { Status } from '../types'

jest.mock('../util/Api', () => ({ getStatus: jest.fn() }))
const statusMock = jest.mocked(Api.getStatus)
const clients: QueryClient[] = []
const statusAt = (now: number) =>
  ({
    tenderdash: { block: { timestamp: new Date(now).toISOString() } },
    api: { block: { timestamp: new Date(now).toISOString() } }
  }) as Status

beforeEach(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2026-09-25T10:00:00Z'))
  statusMock.mockReset()
  statusMock.mockImplementation(async () => statusAt(Date.now()))
  focusManager.setFocused(true)
  onlineManager.setOnline(true)
})
afterEach(() => {
  for (const client of clients.splice(0)) client.clear()
  focusManager.setFocused(undefined)
  onlineManager.setOnline(true)
  jest.useRealTimers()
})

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  clients.push(client)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { ...renderHook(() => useHomeStatus(), { wrapper }), client }
}

describe('home network health', () => {
  it('does not confuse a stale observation with an actual block delay', () => {
    const now = Date.now()
    const input = {
      status: statusAt(now - 20 * 60_000),
      now,
      updatedAt: now,
      fetching: false,
      error: false,
      pending: false
    }
    expect(networkHealth(input).kind).toBe('delayed')
    expect(networkHealth({ ...input, updatedAt: now - 20 * 60_000 }).label).toBe('Stale')
    expect(networkHealth({ ...input, error: true }).label).toBe('Unavailable')
    expect(networkHealth({ ...input, status: statusAt(now + 5 * 60_000) }).label).toBe('Unknown')
  })

  it('keeps Live during a routine refresh and shows failure without reporting the network offline', async () => {
    const { result, client } = mount()
    await waitFor(() => expect(result.current.health.label).toBe('Live'))
    let finish!: (value: Status) => void
    statusMock.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve
        })
    )
    act(() => {
      void client.refetchQueries({ queryKey: ['home', 'status'] })
    })
    await waitFor(() => expect(result.current.query.isFetching).toBe(true))
    expect(result.current.health.label).toBe('Live')
    await act(async () => {
      finish(statusAt(Date.now()))
    })
    statusMock.mockRejectedValue(new Error('network error'))
    await act(async () => {
      await client.refetchQueries({ queryKey: ['home', 'status'] })
    })
    await waitFor(() => expect(result.current.health.label).toBe('Unavailable'))
    expect(result.current.query.data).toBeTruthy()
    statusMock.mockImplementation(async () => statusAt(Date.now()))
    await act(async () => {
      await client.refetchQueries({ queryKey: ['home', 'status'] })
    })
    await waitFor(() => expect(result.current.health.label).toBe('Live'))
  })

  it('ages data while hidden and recovers on return without remounting', async () => {
    const { result } = mount()
    await waitFor(() => expect(result.current.health.label).toBe('Live'))
    const calls = statusMock.mock.calls.length
    act(() => focusManager.setFocused(false))
    await act(async () => {
      jest.advanceTimersByTime(20 * 60_000)
    })
    expect(statusMock.mock.calls).toHaveLength(calls)
    expect(result.current.health.label).toBe('Stale')
    let finish!: (value: Status) => void
    statusMock.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve
        })
    )
    act(() => focusManager.setFocused(true))
    await waitFor(() => expect(result.current.health.label).toBe('Updating'))
    await act(async () => {
      finish(statusAt(Date.now()))
    })
    await waitFor(() => expect(result.current.health.label).toBe('Live'))
  })

  it('recovers automatically after the connection returns', async () => {
    const { result } = mount()
    await waitFor(() => expect(result.current.health.label).toBe('Live'))
    act(() => onlineManager.setOnline(false))
    await act(async () => {
      jest.advanceTimersByTime(3 * 60_000)
    })
    expect(result.current.health.label).toBe('Stale')
    act(() => onlineManager.setOnline(true))
    await waitFor(() => expect(result.current.health.label).toBe('Live'))
  })
})
