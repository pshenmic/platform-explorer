import type { Status } from '../../types'

export const STATUS_FRESH_MS = 90_000
const BLOCK_FRESH_MS = 15 * 60_000

export type NetworkHealth = {
  kind: 'loading' | 'live' | 'delayed' | 'unknown'
  label: string
  title: string
  fresh: boolean
}

export function networkHealth({
  status,
  updatedAt,
  now,
  fetching,
  error,
  pending
}: {
  status?: Status
  updatedAt: number
  now: number
  fetching: boolean
  error: boolean
  pending: boolean
}): NetworkHealth {
  if (pending && fetching) {
    return { kind: 'loading', label: 'Checking', title: 'Checking network status.', fresh: false }
  }
  if (error && !fetching) {
    return {
      kind: 'unknown',
      label: 'Unavailable',
      title: 'Could not update network status.',
      fresh: false
    }
  }
  if (!status || !updatedAt || now - updatedAt > STATUS_FRESH_MS || error) {
    return {
      kind: 'unknown',
      label: fetching ? 'Updating' : 'Stale',
      title: 'Waiting for a fresh network status. The last available data may be out of date.',
      fresh: false
    }
  }
  const timestamp = status.tenderdash?.block?.timestamp || status.api?.block?.timestamp
  const age = timestamp ? now - new Date(timestamp).getTime() : NaN
  if (!Number.isFinite(age) || age < -60_000) {
    return {
      kind: 'unknown',
      label: 'Unknown',
      title: 'The latest block time is unavailable or invalid.',
      fresh: true
    }
  }
  return age < BLOCK_FRESH_MS
    ? {
        kind: 'live',
        label: 'Live',
        title: 'Recent blocks confirmed by the latest status check.',
        fresh: true
      }
    : {
        kind: 'delayed',
        label: 'Delayed',
        title: 'The latest status check reports no blocks in the last 15 minutes.',
        fresh: true
      }
}
