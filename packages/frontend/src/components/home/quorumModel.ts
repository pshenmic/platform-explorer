import type { PlatformQuorum } from '../../util/Api'

export function quorumKey(hash: unknown) {
  return typeof hash === 'string' ? hash.toUpperCase() : ''
}

export function memberKey(hash: unknown) {
  return typeof hash === 'string' ? hash.toLowerCase() : ''
}

export function memberKeysInCoreOrder(members: PlatformQuorum['members']) {
  return [...new Set((members ?? []).map(m => memberKey(m.proTxHash)).filter(Boolean))]
}

export function sortProTxKeys(keys: string[]) {
  return [...keys].sort((a, b) => a.localeCompare(b))
}

// Preserve the card's display order. Offsets are UI positions, not a consensus schedule.
export function orderQuorums(quorums: PlatformQuorum[]) {
  const height = (q: PlatformQuorum) => q.blockHeight ?? q.creationHeight ?? 0
  const list = quorums.filter(q => q.quorumHash).sort((a, b) => height(b) - height(a))
  const current = list.findIndex(q => q.isCurrent)
  const start = Math.max(0, current)
  return list.map((_, offset) => ({
    ...list[(start + offset) % list.length],
    offset,
    isLive: current >= 0 && offset === 0
  }))
}
