type L1Object = 'address' | 'transaction' | 'block'

const paths: Record<L1Object, string> = {
  address: 'address',
  transaction: 'transactions',
  block: 'blocks'
}

export function getL1ExplorerLink(
  baseUrl: string | null | undefined,
  kind: L1Object,
  identifier: string | null | undefined
): string | undefined {
  if (!baseUrl || !identifier) return undefined
  if (kind !== 'address' && !/^[a-f0-9]{64}$/i.test(identifier)) return undefined

  const value = kind === 'address' ? identifier : identifier.toLowerCase()
  return `${baseUrl.replace(/\/$/, '')}/${paths[kind]}/${encodeURIComponent(value)}`
}
