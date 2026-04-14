import { decodeDateFromURL, encodeDateToURL } from '@utils/url'
import { useQueryState } from 'nuqs'

export const useTokensFilters = () => {
  const [dataContract, setDataContract] = useQueryState('data_contract', { scroll: false, shallow: true })
  const [owner, setOwner] = useQueryState('owner', { scroll: false, shallow: true })
  const [positionMin, setPositionMin] = useQueryState('position_min', { scroll: false, shallow: true })
  const [positionMax, setPositionMax] = useQueryState('position_max', { scroll: false, shallow: true })
  const [tsStart, setTsStart] = useQueryState('timestamp_start', { scroll: false, shallow: true })
  const [tsEnd, setTsEnd] = useQueryState('timestamp_end', { scroll: false, shallow: true })

  const tsStartISO = (() => {
    const d = decodeDateFromURL(tsStart)
    return d ? d.toISOString() : (tsStart || undefined)
  })()
  const tsEndISO = (() => {
    const d = decodeDateFromURL(tsEnd)
    return d ? d.toISOString() : (tsEnd || undefined)
  })()

  const filters = {
    contract_id: dataContract || undefined,
    owner: owner || undefined,
    position_min: positionMin != null && positionMin !== '' ? Number(positionMin) : undefined,
    position_max: positionMax != null && positionMax !== '' ? Number(positionMax) : undefined,
    timestamp_start: tsStartISO,
    timestamp_end: tsEndISO
  }

  const setFilters = (next) => {
    if (!next) return
    if ('contract_id' in next) setDataContract(next.contract_id || null)
    if ('owner' in next) setOwner(next.owner || null)

    if ('position_min' in next) setPositionMin(next.position_min != null && next.position_min !== '' ? String(next.position_min) : null)
    if ('position_max' in next) setPositionMax(next.position_max != null && next.position_max !== '' ? String(next.position_max) : null)

    if ('timestamp_start' in next) setTsStart(encodeDateToURL(next.timestamp_start) ?? null)
    if ('timestamp_end' in next) setTsEnd(encodeDateToURL(next.timestamp_end) ?? null)
  }

  return { filters, setFilters }
}
