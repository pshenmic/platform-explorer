'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import BlocksList from '../../components/blocks/BlocksList'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Block, LoadableState, PaginatedResultSet } from '../../types'
import './Blocks.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

type QueryFilters = Record<string, string | number | boolean | string[] | null | undefined>

function toNumber(value: unknown): number | null {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function addRange(
  out: QueryFilters,
  value: unknown,
  minKey: string,
  maxKey: string,
  minAllowed: number,
  maxAllowed: number
) {
  const range = value as { min?: unknown; max?: unknown } | undefined
  const min = toNumber(range?.min)
  const max = toNumber(range?.max)
  if (min != null && min >= minAllowed) out[minKey] = min
  if (max != null && max >= maxAllowed) out[maxKey] = max
  const sentMin = out[minKey] as number | undefined
  const sentMax = out[maxKey] as number | undefined
  if (sentMin != null && sentMax != null && sentMax < sentMin) {
    delete out[minKey]
    delete out[maxKey]
  }
}

function toBlocksApiFilters(state: Record<string, unknown>): QueryFilters {
  const out: QueryFilters = {}
  addRange(out, state.height, 'height_min', 'height_max', 1, 2)
  addRange(out, state.epoch_index, 'epoch_index_min', 'epoch_index_max', 0, 1)
  addRange(out, state.tx_count, 'tx_count_min', 'tx_count_max', 0, 0)
  addRange(out, state.gas, 'gas_min', 'gas_max', 0, 0)
  if (typeof state.validator === 'string') {
    const validator = state.validator.trim()
    if (/^[A-Za-z0-9]{64}$/.test(validator)) out.validator = validator
  }
  if (typeof state.hash === 'string') {
    const hash = state.hash.trim()
    if (/^[A-Za-z0-9]{64}$/.test(hash)) out.hash = hash
  }
  const ts = state.timestamp as
    | { start?: Date | null; end?: Date | null; mode?: 'days' | 'rolling' }
    | null
  const start = ts?.start ? new Date(ts.start) : null
  const end = ts?.end ? new Date(ts.end) : null
  const startValid = start && !Number.isNaN(start.getTime())
  const endValid = end && !Number.isNaN(end.getTime())
  if (startValid && endValid) {
    if (ts?.mode === 'rolling') {
      const from = start.getTime() <= end.getTime() ? start : end
      const to = start.getTime() <= end.getTime() ? end : start
      out.timestamp_start = from.toISOString()
      out.timestamp_end = to.toISOString()
    } else {
      const from = start.getTime() <= end.getTime() ? start : end
      const to = start.getTime() <= end.getTime() ? end : start
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      out.timestamp_start = from.toISOString()
      out.timestamp_end = to.toISOString()
    }
  }
  return out
}

function isBadTimestampRange(error: unknown): boolean {
  return error instanceof Error && /Bad timestamp range/i.test(error.message)
}

async function lastBlockAtOrBefore(iso: string): Promise<Block | null> {
  const res = await Api.getBlocks(1, 1, 'desc', { timestamp_end: iso })
  return res.resultSet?.[0] ?? null
}

const heightRangeCache = new Map<string, { height_min: number; height_max: number }>()
const HEIGHT_CACHE_MAX = 32

function heightCacheKey(startIso: string, endIso: string) {
  return `${startIso}|${endIso}`
}

function rememberHeightRange(startIso: string, endIso: string, value: { height_min: number; height_max: number }) {
  if (heightRangeCache.size >= HEIGHT_CACHE_MAX) {
    const first = heightRangeCache.keys().next().value
    if (first) heightRangeCache.delete(first)
  }
  heightRangeCache.set(heightCacheKey(startIso, endIso), value)
}

async function getBlocksWithFilters(
  page: number,
  pageSize: number,
  filters: QueryFilters
): Promise<PaginatedResultSet<Block>> {
  const startIso = typeof filters.timestamp_start === 'string' ? filters.timestamp_start : null
  const endIso = typeof filters.timestamp_end === 'string' ? filters.timestamp_end : null
  const cachedHeights =
    startIso && endIso ? heightRangeCache.get(heightCacheKey(startIso, endIso)) : undefined

  const applyHeightRange = (bounds: { height_min: number; height_max: number }) => {
    const next: QueryFilters = { ...filters }
    delete next.timestamp_start
    delete next.timestamp_end
    const existingMin = toNumber(next.height_min)
    const existingMax = toNumber(next.height_max)
    next.height_min =
      existingMin != null ? Math.max(existingMin, bounds.height_min) : bounds.height_min
    next.height_max =
      existingMax != null ? Math.min(existingMax, bounds.height_max) : bounds.height_max
    if (toNumber(next.height_max)! < toNumber(next.height_min)!) {
      return Promise.resolve({
        resultSet: [] as Block[],
        pagination: { page, limit: pageSize, total: 0 }
      })
    }
    return Api.getBlocks(page, pageSize, 'desc', next)
  }

  if (cachedHeights) {
    return applyHeightRange(cachedHeights)
  }

  try {
    return await Api.getBlocks(page, pageSize, 'desc', filters)
  } catch (error) {
    if (!isBadTimestampRange(error)) throw error
    if (!startIso || !endIso) throw error

    const lastBeforeStart = await lastBlockAtOrBefore(
      new Date(new Date(startIso).getTime() - 1).toISOString()
    )
    const lastAtEnd = await lastBlockAtOrBefore(endIso)
    if (!lastAtEnd) {
      return { resultSet: [], pagination: { page, limit: pageSize, total: 0 } }
    }

    const heightMinResolved = lastBeforeStart ? lastBeforeStart.header.height + 1 : 1
    const heightMaxResolved = lastAtEnd.header.height
    if (heightMaxResolved < heightMinResolved) {
      return { resultSet: [], pagination: { page, limit: pageSize, total: 0 } }
    }

    const bounds = { height_min: heightMinResolved, height_max: heightMaxResolved }
    rememberHeightRange(startIso, endIso, bounds)
    return applyHeightRange(bounds)
  }
}

interface BlocksProps {
  defaultPage?: number
  defaultPageSize?: number
}

function Blocks({ defaultPage = 1, defaultPageSize }: BlocksProps) {
  const [blocks, setBlocks] = useState<LoadableState<PaginatedResultSet<Block>>>({
    data: {} as PaginatedResultSet<Block>,
    loading: true,
    error: false
  })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const pageCount = Math.ceil(total / pageSize) ? Math.ceil(total / pageSize) : 1
  const [filters, setFilters] = useState<QueryFilters>({})
  const [columnFilters, setColumnFilters] = useState<Record<string, unknown>>({})
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setBlocks(prev => ({ ...prev, loading: true, error: false }))

    const fetchData = async () => {
      const hash = typeof filters.hash === 'string' ? filters.hash : ''
      const request = hash
        ? Api.getBlockByHash(hash).then(block => ({
            resultSet: [block],
            pagination: { page: 1, limit: pageSize, total: 1 }
          }))
        : getBlocksWithFilters(Math.max(1, currentPage + 1), Math.max(1, pageSize), filters)

      request
        .then(res => {
          setTotal(res.pagination.total)
          fetchHandlerSuccess(setBlocks, res)
        })
        .catch(err => {
          setTotal(0)
          fetchHandlerError(setBlocks, err)
        })
    }

    fetchData()
  }, [currentPage, pageSize, filters])

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '', 10) || paginateConfig.defaultPage
    setCurrentPage(Math.max(page - 1, 0))
    setPageSize(
      parseInt(searchParams.get('page-size') || '', 10) || paginateConfig.pageSize.default
    )
  }, [searchParams, pathname])

  useEffect(() => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))

    if (
      currentPage + 1 === paginateConfig.defaultPage &&
      pageSize === paginateConfig.pageSize.default
    ) {
      urlParameters.delete('page')
      urlParameters.delete('page-size')
    } else {
      urlParameters.set('page', String(currentPage + 1))
      urlParameters.set('page-size', String(pageSize))
    }

    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  }, [currentPage, pageSize])

  const onColumnFilterChange = (key: string, value: unknown) => {
    setColumnFilters(prev => {
      if (
        value == null ||
        value === '' ||
        (typeof value === 'object' &&
          !Array.isArray(value) &&
          Object.values(value as Record<string, unknown>).every(
            item => item == null || item === ''
          ))
      ) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: value }
    })
  }

  useEffect(() => {
    const ts = columnFilters.timestamp as { start?: unknown; end?: unknown } | undefined
    const dateRangeReady = Boolean(ts?.start && ts?.end)
    const id = window.setTimeout(
      () => {
        const next = toBlocksApiFilters(columnFilters)
        setFilters(prev => {
          if (JSON.stringify(prev) === JSON.stringify(next)) return prev
          setCurrentPage(0)
          return next
        })
      },
      dateRangeReady ? 0 : 400
    )
    return () => window.clearTimeout(id)
  }, [columnFilters])

  return (
    <div className={'ListPage Blocks'}>
      <div className={'InfoBlock'}>
        {blocks.error ? (
          <div className={'ListPage__Error'}>
            <ErrorMessageBlock />
          </div>
        ) : null}
        <BlocksList
          blocks={blocks.data?.resultSet}
          loading={blocks.loading}
          filterValues={columnFilters}
          onFilterChange={onColumnFilterChange}
        />

        {!blocks.loading && (blocks.data?.resultSet?.length ?? 0) > 0 && (
          <div className={'ListNavigation'}>
            <div className={'ListNavigation__Balance'} />
            <Pagination
              onPageChange={({ selected }) => setCurrentPage(selected)}
              pageCount={pageCount}
              forcePage={currentPage}
            />
            <PageSizeSelector
              PageSizeSelectHandler={e => setPageSize(Number(e?.value))}
              value={pageSize}
              items={paginateConfig.pageSize.values}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Blocks
