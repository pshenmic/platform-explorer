import type { Status } from '../../types'

export function contestedHref(resourceValue: unknown): string {
  try {
    return `/contestedResource/${btoa(JSON.stringify(resourceValue))}`
  } catch {
    return '/contestedResources'
  }
}

// compact K/M/B number formatter
export function compact(value: unknown): string | null {
  if (typeof value !== 'number' || isNaN(value)) return null
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`
  return String(Math.round(value))
}

// Middle-truncate a base58 identifier: CGdDaiN…i2AZ
export function shortId(id: unknown): string {
  if (typeof id !== 'string') return ''
  return id.length > 14 ? `${id.slice(0, 7)}…${id.slice(-4)}` : id
}

export function isNetworkLive(status?: Status | null): boolean {
  const ts = status?.tenderdash?.block?.timestamp || status?.api?.block?.timestamp
  if (!ts) return false
  return (Date.now() - new Date(ts).getTime()) / 1000 / 60 < 15
}

export function isApiOperational(status?: Status | null): boolean {
  const td = status?.tenderdash?.block?.timestamp
  const api = status?.api?.block?.timestamp
  if (!td || !api) return false
  const a = new Date(api).getTime()
  const t = new Date(td).getTime()
  return !Number.isNaN(a) && !Number.isNaN(t) && Math.abs(a - t) <= 10 * 60 * 1000
}

// map Tenderdash chain ids to short display labels (mainnet/testnet/devnet)
export function formatNetworkLabel (network: unknown): string | null {
  if (network == null || network === '') return null
  const n = String(network).toLowerCase()
  if (n === 'evo1' || n === 'mainnet' || n.includes('mainnet')) return 'mainnet'
  if (n.includes('testnet') || n.includes('test-net') || n.startsWith('dash-test')) return 'testnet'
  if (n.includes('devnet') || n.includes('regtest') || n === 'local') return 'devnet'
  return String(network)
}

// middle-truncate a display name; the ".dash" suffix survives and can be styled separately
export function trimName(name: unknown, head = 8, tail = 5): { text: string; dash: boolean } {
  const hasDash = typeof name === 'string' && name.endsWith('.dash')
  const base = hasDash ? (name as string).slice(0, -5) : name
  const trimmed =
    typeof base === 'string' && base.length > head + tail + 1
      ? `${base.slice(0, head)}…${base.slice(-tail)}`
      : typeof base === 'string'
        ? base
        : ''
  return { text: trimmed, dash: hasDash }
}
