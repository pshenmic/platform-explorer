import { decodeDateFromURL, encodeDateToURL } from '@utils/url'
import { useQueryState } from 'nuqs'

export const useTokensFilters = () => {
  const [dataContract, setDataContract] = useQueryState('data_contract', { scroll: false, shallow: true })
  const [owner, setOwner] = useQueryState('owner', { scroll: false, shallow: true })
  const [minSupplyMin, setMinSupplyMin] = useQueryState('min_supply_min', { scroll: false, shallow: true })
  const [minSupplyMax, setMinSupplyMax] = useQueryState('min_supply_max', { scroll: false, shallow: true })
  const [maxSupplyMin, setMaxSupplyMin] = useQueryState('max_supply_min', { scroll: false, shallow: true })
  const [maxSupplyMax, setMaxSupplyMax] = useQueryState('max_supply_max', { scroll: false, shallow: true })
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
    data_contract: dataContract || undefined,
    owner: owner || undefined,
    min_supply_min: minSupplyMin ? Number(minSupplyMin) : undefined,
    min_supply_max: minSupplyMax ? Number(minSupplyMax) : undefined,
    max_supply_min: maxSupplyMin ? Number(maxSupplyMin) : undefined,
    max_supply_max: maxSupplyMax ? Number(maxSupplyMax) : undefined,
    timestamp_start: tsStartISO,
    timestamp_end: tsEndISO
  }

  const setFilters = (next) => {
    if (!next) return
    if ('data_contract' in next) setDataContract(next.data_contract || null)
    if ('owner' in next) setOwner(next.owner || null)

    if ('min_supply_min' in next) setMinSupplyMin(next.min_supply_min != null && next.min_supply_min !== '' ? String(next.min_supply_min) : null)
    if ('min_supply_max' in next) setMinSupplyMax(next.min_supply_max != null && next.min_supply_max !== '' ? String(next.min_supply_max) : null)
    if ('max_supply_min' in next) setMaxSupplyMin(next.max_supply_min != null && next.max_supply_min !== '' ? String(next.max_supply_min) : null)
    if ('max_supply_max' in next) setMaxSupplyMax(next.max_supply_max != null && next.max_supply_max !== '' ? String(next.max_supply_max) : null)

    if ('timestamp_start' in next) setTsStart(encodeDateToURL(next.timestamp_start) ?? null)
    if ('timestamp_end' in next) setTsEnd(encodeDateToURL(next.timestamp_end) ?? null)
  }

  return { filters, setFilters }
}
