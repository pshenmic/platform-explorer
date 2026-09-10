import type { Validator } from '../../../types'
import { decodeDateFromURL, encodeDateToURL } from '@utils/url'
import { useQueryState } from 'nuqs'

export const useValidatorsFilters = () => {
  const [isActive, setIsActive] = useQueryState('isActive', { scroll: false, shallow: true })
  const [blocksMin, setBlocksMin] = useQueryState('blocks_proposed_min', {
    scroll: false,
    shallow: true
  })
  const [blocksMax, setBlocksMax] = useQueryState('blocks_proposed_max', {
    scroll: false,
    shallow: true
  })
  const [heightMin, setHeightMin] = useQueryState('last_proposed_block_height_min', {
    scroll: false,
    shallow: true
  })
  const [heightMax, setHeightMax] = useQueryState('last_proposed_block_height_max', {
    scroll: false,
    shallow: true
  })
  const [tsStart, setTsStart] = useQueryState('last_proposed_block_timestamp_start', {
    scroll: false,
    shallow: true
  })
  const [tsEnd, setTsEnd] = useQueryState('last_proposed_block_timestamp_end', {
    scroll: false,
    shallow: true
  })
  const [hash, setHash] = useQueryState('last_proposed_block_hash', {
    scroll: false,
    shallow: true
  })

  const tsStartISO = (() => {
    const d = decodeDateFromURL(tsStart)
    return d ? d.toISOString() : tsStart || undefined
  })()
  const tsEndISO = (() => {
    const d = decodeDateFromURL(tsEnd)
    return d ? d.toISOString() : tsEnd || undefined
  })()

  const filters = {
    isActive: isActive === 'true' || isActive === 'false' ? isActive : undefined,
    blocks_proposed_min: blocksMin != null && blocksMin !== '' ? Number(blocksMin) : undefined,
    blocks_proposed_max: blocksMax != null && blocksMax !== '' ? Number(blocksMax) : undefined,
    last_proposed_block_height_min:
      heightMin != null && heightMin !== '' ? Number(heightMin) : undefined,
    last_proposed_block_height_max:
      heightMax != null && heightMax !== '' ? Number(heightMax) : undefined,
    last_proposed_block_timestamp_start: tsStartISO,
    last_proposed_block_timestamp_end: tsEndISO,
    last_proposed_block_hash: hash || undefined
  }

  const setFilters = (next: Record<string, unknown>) => {
    if (!next) return

    if ('isActive' in next) {
      setIsActive((next.isActive as string | undefined) || null)
    }

    if ('blocks_proposed_min' in next) {
      setBlocksMin(
        next.blocks_proposed_min !== '' && next.blocks_proposed_min != null
          ? String(next.blocks_proposed_min as string | number)
          : null
      )
    }
    if ('blocks_proposed_max' in next) {
      setBlocksMax(
        next.blocks_proposed_max !== '' && next.blocks_proposed_max != null
          ? String(next.blocks_proposed_max as string | number)
          : null
      )
    }

    if ('last_proposed_block_height_min' in next) {
      setHeightMin(
        next.last_proposed_block_height_min !== '' && next.last_proposed_block_height_min != null
          ? String(next.last_proposed_block_height_min as string | number)
          : null
      )
    }
    if ('last_proposed_block_height_max' in next) {
      setHeightMax(
        next.last_proposed_block_height_max !== '' && next.last_proposed_block_height_max != null
          ? String(next.last_proposed_block_height_max as string | number)
          : null
      )
    }

    if ('last_proposed_block_timestamp_start' in next) {
      const encoded = encodeDateToURL(
        next.last_proposed_block_timestamp_start as string | number | Date | null | undefined
      )
      setTsStart(encoded ?? null)
    }
    if ('last_proposed_block_timestamp_end' in next) {
      const encoded = encodeDateToURL(
        next.last_proposed_block_timestamp_end as string | number | Date | null | undefined
      )
      setTsEnd(encoded ?? null)
    }

    if ('last_proposed_block_hash' in next) {
      setHash((next.last_proposed_block_hash as string | undefined) || null)
    }
  }

  return { filters, setFilters }
}
