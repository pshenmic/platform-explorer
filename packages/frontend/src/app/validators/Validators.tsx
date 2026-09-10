'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import * as Api from '../../util/Api'
import { ValidatorsList } from '../../components/validators'
import {
  readListScrollMode,
  writeListScrollMode,
  type ListScrollMode
} from '../../components/ui/lists/DataList/listScrollMode'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { LoadableState, PaginatedResultSet, Validator } from '../../types'
import './ValidatorsPage.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

type QueryFilters = Record<string, string | number | boolean | string[] | null | undefined>
const IDENTIFIER_RE = new RegExp('^[A-Za-z0-9]{43,44}$')
const HASH_RE = new RegExp('^[A-Fa-f0-9]{64}$')

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
  minAllowed: number
) {
  const range = value as { min?: unknown; max?: unknown } | undefined
  const min = toNumber(range?.min)
  const max = toNumber(range?.max)
  if (min != null && min >= minAllowed) out[minKey] = min
  if (max != null && max >= minAllowed) out[maxKey] = max
  const sentMin = out[minKey] as number | undefined
  const sentMax = out[maxKey] as number | undefined
  if (sentMin != null && sentMax != null && sentMax < sentMin) {
    delete out[minKey]
    delete out[maxKey]
  }
}

function toApiFilters(state: Record<string, unknown>): QueryFilters {
  const out: QueryFilters = {}
  addRange(out, state.blocks_proposed, 'blocks_proposed_min', 'blocks_proposed_max', 0)
  addRange(
    out,
    state.last_proposed_block_height,
    'last_proposed_block_height_min',
    'last_proposed_block_height_max',
    1
  )

  if (typeof state.identifier === 'string') {
    const query = state.identifier.trim()
    if (HASH_RE.test(query)) out.hash = query
    else if (IDENTIFIER_RE.test(query)) out.owner = query
  }

  const active = Array.isArray(state.isActive)
    ? (state.isActive as string[]).filter(v => v === 'current' || v === 'queued')
    : []
  if (active.length === 1) out.isActive = active[0] === 'current' ? 'true' : 'false'

  const ts = state.timestamp as {
    start?: Date | null
    end?: Date | null
    mode?: 'days' | 'rolling'
  } | null
  const start = ts?.start ? new Date(ts.start) : null
  const end = ts?.end ? new Date(ts.end) : null
  const startValid = start && !Number.isNaN(start.getTime())
  const endValid = end && !Number.isNaN(end.getTime())
  if (startValid && endValid) {
    const from = start.getTime() <= end.getTime() ? start : end
    const to = start.getTime() <= end.getTime() ? end : start
    if (ts?.mode !== 'rolling') {
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
    }
    out.last_proposed_block_timestamp_start = from.toISOString()
    out.last_proposed_block_timestamp_end = to.toISOString()
  }
  return out
}

function isEmptyFilterValue(value: unknown) {
  if (value == null || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every(
      item => item == null || item === ''
    )
  }
  return false
}

function asListResult(validator: Validator, pageSize: number): PaginatedResultSet<Validator> {
  return {
    resultSet: [validator],
    pagination: { page: 1, limit: pageSize, total: 1 }
  }
}

function emptyList(pageSize: number): PaginatedResultSet<Validator> {
  return {
    resultSet: [],
    pagination: { page: 1, limit: pageSize, total: 0 }
  }
}

function Validators() {
  const [validators, setValidators] = useState<LoadableState<PaginatedResultSet<Validator>>>({
    data: {} as PaginatedResultSet<Validator>,
    loading: true,
    error: false
  })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(0)
  const [scrollMode, setScrollMode] = useState<ListScrollMode>('pages')
  const [loadingMore, setLoadingMore] = useState(false)
  const fetchGen = useRef(0)
  const [filters, setFilters] = useState<QueryFilters>({})
  const [columnFilters, setColumnFilters] = useState<Record<string, unknown>>({})
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setScrollMode(readListScrollMode('validators'))
  }, [])

  useEffect(() => {
    const gen = ++fetchGen.current
    const replace = scrollMode === 'pages' || currentPage === 0
    if (replace) {
      setValidators(prev => ({ ...prev, loading: true, error: false }))
      setLoadingMore(false)
    } else {
      setLoadingMore(true)
    }

    const hash = typeof filters.hash === 'string' ? filters.hash : ''
    const owner = typeof filters.owner === 'string' ? filters.owner : ''
    const listFilters: QueryFilters = { ...filters }
    delete listFilters.hash
    delete listFilters.owner

    const request = hash
      ? Api.getValidatorByProTxHash(hash)
          .then(validator => asListResult(validator, pageSize))
          .catch(() =>
            Api.getValidators(Math.max(1, currentPage + 1), Math.max(1, pageSize), 'asc', {
              ...listFilters,
              last_proposed_block_hash: hash
            })
          )
      : owner
        ? Api.getValidatorByMasternodeIdentity(owner)
            .then(validator => asListResult(validator, pageSize))
            .catch(() =>
              Api.getValidators(Math.max(1, currentPage + 1), Math.max(1, pageSize), 'asc', {
                ...listFilters,
                owner
              }).catch(() => emptyList(pageSize))
            )
        : Api.getValidators(Math.max(1, currentPage + 1), Math.max(1, pageSize), 'asc', listFilters)

    request
      .then(res => {
        if (gen !== fetchGen.current) return
        setTotal(res.pagination.total)
        if (replace) {
          fetchHandlerSuccess(setValidators, res)
        } else {
          setValidators(prev => {
            const seen = new Set((prev.data?.resultSet ?? []).map(item => item.proTxHash || ''))
            const extra = res.resultSet.filter(item => {
              if (!item.proTxHash || seen.has(item.proTxHash)) return false
              seen.add(item.proTxHash)
              return true
            })
            return {
              loading: false,
              error: false,
              data: {
                ...res,
                resultSet: [...(prev.data?.resultSet ?? []), ...extra]
              }
            }
          })
        }
        setLoadingMore(false)
      })
      .catch(err => {
        if (gen !== fetchGen.current) return
        if (replace) {
          setTotal(0)
          fetchHandlerError(setValidators, err)
        }
        setLoadingMore(false)
      })
  }, [currentPage, pageSize, filters, scrollMode])

  useEffect(() => {
    setPageSize(
      parseInt(searchParams.get('page-size') || '', 10) || paginateConfig.pageSize.default
    )
    if (scrollMode !== 'pages') return
    const page = parseInt(searchParams.get('page') || '', 10) || paginateConfig.defaultPage
    setCurrentPage(Math.max(page - 1, 0))
  }, [searchParams, pathname, scrollMode])

  useEffect(() => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))
    if (pageSize === paginateConfig.pageSize.default) {
      urlParameters.delete('page-size')
    } else {
      urlParameters.set('page-size', String(pageSize))
    }
    if (scrollMode === 'pages' && currentPage + 1 !== paginateConfig.defaultPage) {
      urlParameters.set('page', String(currentPage + 1))
    } else {
      urlParameters.delete('page')
    }
    const next = urlParameters.toString()
    const href = next ? `${pathname}?${next}` : pathname
    router.replace(href, { scroll: false })
  }, [currentPage, pageSize, scrollMode])

  const onColumnFilterChange = (key: string, value: unknown) => {
    setColumnFilters(prev => {
      if (isEmptyFilterValue(value)) {
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
        const next = toApiFilters(columnFilters)
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

  const onScrollModeChange = useCallback((mode: ListScrollMode) => {
    writeListScrollMode('validators', mode)
    setScrollMode(mode)
    setCurrentPage(0)
  }, [])

  const onLoadMore = useCallback(() => {
    setCurrentPage(page => page + 1)
  }, [])

  const items = validators.data?.resultSet ?? []
  const paging = {
    mode: scrollMode,
    onModeChange: onScrollModeChange,
    total,
    pageSize,
    page: currentPage,
    onPageChange: setCurrentPage,
    onPageSizeChange: (size: number) => {
      setPageSize(size)
      setCurrentPage(0)
    },
    onLoadMore,
    loadingMore,
    hasMore: items.length < total
  }

  return (
    <div className={'ListPage ValidatorsPage'}>
      <div className={'InfoBlock'}>
        {validators.error ? (
          <div className={'ListPage__Error'}>
            <ErrorMessageBlock />
          </div>
        ) : null}
        <ValidatorsList
          list={items}
          loading={validators.loading && (scrollMode === 'pages' || items.length === 0)}
          filterValues={columnFilters}
          onFilterChange={onColumnFilterChange}
          paging={paging}
          title={'Validators'}
          pinFirst={true}
        />
      </div>
    </div>
  )
}

export default Validators
