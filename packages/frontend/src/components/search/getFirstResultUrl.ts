import type { SearchResultsData } from './SearchResultsList'
import type { SearchCategory } from './constants'

export const getFirstResultUrl = (data: SearchResultsData | null | undefined): string | null => {
  if (!data || Object.keys(data).length === 0) return null

  const firstCategory = (Object.keys(data) as SearchCategory[]).find(
    category => (data[category]?.length ?? 0) > 0
  )

  if (firstCategory && (data[firstCategory]?.length ?? 0) > 0) {
    const firstItem = data[firstCategory]![0] as Record<string, unknown>

    switch (firstCategory) {
      case 'identities':
        return `/identity/${(firstItem as { identifier?: string }).identifier}`
      case 'blocks': {
        const header = (firstItem as { header?: { hash?: string } }).header
        return `/block/${header?.hash}`
      }
      case 'transactions':
        return `/transaction/${(firstItem as { hash?: string }).hash}`
      case 'dataContracts':
        return `/dataContract/${(firstItem as { identifier?: string }).identifier}`
      case 'documents':
        return `/document/${(firstItem as { identifier?: string }).identifier}`
      case 'validators':
        return `/validator/${(firstItem as { proTxHash?: string }).proTxHash}`
      case 'tokens':
        return `/token/${(firstItem as { identifier?: string }).identifier}`
      case 'platformAddresses':
        return `/platformAddress/${(firstItem as { bech32mAddress?: string }).bech32mAddress}`
      default:
        return null
    }
  }

  return null
}

export const getOnlyResultUrl = (data: SearchResultsData | null | undefined): string | null => {
  const total = Object.values(data ?? {}).reduce((sum, items) => sum + (items?.length ?? 0), 0)
  return total === 1 ? getFirstResultUrl(data) : null
}
