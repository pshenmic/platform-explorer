export function contestedHref (resourceValue) {
  try {
    return `/contestedResource/${btoa(JSON.stringify(resourceValue))}`
  } catch {
    return '/contestedResources'
  }
}

// Compact k/M/B formatter for the masternodes "secured" value.
export function compact (value) {
  if (typeof value !== 'number' || isNaN(value)) return null
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`
  return String(Math.round(value))
}

// Middle-truncate a base58 identifier: CGdDaiN…i2AZ
export function shortId (id) {
  if (typeof id !== 'string') return ''
  return id.length > 14 ? `${id.slice(0, 7)}…${id.slice(-4)}` : id
}

export function isNetworkLive (status) {
  const ts = status?.tenderdash?.block?.timestamp || status?.api?.block?.timestamp
  if (!ts) return false
  return (new Date() - new Date(ts)) / 1000 / 60 < 15
}

export function isApiOperational (status) {
  const td = status?.tenderdash?.block?.timestamp
  const api = status?.api?.block?.timestamp
  if (!td || !api) return false
  const a = new Date(api).getTime()
  const t = new Date(td).getTime()
  return !Number.isNaN(a) && !Number.isNaN(t) && Math.abs(a - t) <= 10 * 60 * 1000
}
