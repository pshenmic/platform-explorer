import { decodeDateFromURL, encodeDateToURL } from '@utils/url'
import { useQueryState } from 'nuqs'

export const useDataContractsFilters = () => {
  const [owner, setOwner] = useQueryState('owner', { scroll: false, shallow: true })
  const [isSystem, setIsSystem] = useQueryState('is_system', { scroll: false, shallow: true })
  const [withTokens, setWithTokens] = useQueryState('with_tokens', { scroll: false, shallow: true })
  const [dcMin, setDcMin] = useQueryState('documents_count_min', { scroll: false, shallow: true })
  const [dcMax, setDcMax] = useQueryState('documents_count_max', { scroll: false, shallow: true })
  const [tsStart, setTsStart] = useQueryState('timestamp_start', { scroll: false, shallow: true })
  const [tsEnd, setTsEnd] = useQueryState('timestamp_end', { scroll: false, shallow: true })

  const tsStartISO = (() => {
    const d = decodeDateFromURL(tsStart)
    return d ? d.toISOString() : (tsStart || undefined) // поддержим обратную совместимость, если уже ISO
  })()
  const tsEndISO = (() => {
    const d = decodeDateFromURL(tsEnd)
    return d ? d.toISOString() : (tsEnd || undefined)
  })()

  const filters = {
    owner: owner || undefined,
    is_system: isSystem,
    with_tokens: withTokens,
    documents_count_min: dcMin != null && dcMin !== '' ? Number(dcMin) : undefined,
    documents_count_max: dcMax != null && dcMax !== '' ? Number(dcMax) : undefined,
    timestamp_start: tsStartISO,
    timestamp_end: tsEndISO
  }

  const setFilters = (next) => {
    if (!next) return

    if ('owner' in next) {
      setOwner(next.owner || null)
    }

    if ('is_system' in next) {
      const value = next.is_system ? 'true' : null
      setIsSystem(value)
    }

    if ('with_tokens' in next) {
      const value = next.with_tokens != null ? String(next.with_tokens) : null
      setWithTokens(value)
    }

    if ('documents_count_min' in next) {
      setDcMin(next.documents_count_min !== '' && next.documents_count_min != null ? String(next.documents_count_min) : null)
    }

    if ('documents_count_max' in next) {
      setDcMax(next.documents_count_max !== '' && next.documents_count_max != null ? String(next.documents_count_max) : null)
    }

    if ('timestamp_start' in next) {
      const encoded = encodeDateToURL(next.timestamp_start)
      setTsStart(encoded ?? null)
    }
    if ('timestamp_end' in next) {
      const encoded = encodeDateToURL(next.timestamp_end)
      setTsEnd(encoded ?? null)
    }
  }

  return { filters, setFilters }
}
