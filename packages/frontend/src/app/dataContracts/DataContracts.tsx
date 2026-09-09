'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as Api from '../../util/Api'
import DataContractsList from '../../components/dataContracts/DataContractsList'
import {
  readListScrollMode,
  writeListScrollMode,
  type ListScrollMode
} from '../../components/ui/lists/DataList/listScrollMode'
import { ErrorMessageBlock } from '@components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { DataContract, LoadableState, PaginatedResultSet } from '../../types'
import './DataContractsPage.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

type QueryFilters = Record<string, string | number | boolean | string[] | null | undefined>
const IDENTIFIER_RE = /^[A-Za-z0-9]{43,44}$/

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

function toContractsApiFilters(state: Record<string, unknown>): QueryFilters {
  const out: QueryFilters = {}
  addRange(out, state.documents, 'documents_count_min', 'documents_count_max', 0, 0)

  if (typeof state.identifier === 'string') {
    const query = state.identifier.trim()
    if (IDENTIFIER_RE.test(query)) out.identifier = query
    else if (query) out.name = query
  }

  if (typeof state.owner === 'string') {
    const owner = state.owner.trim()
    if (IDENTIFIER_RE.test(owner)) out.owner = owner
  }

  const withTokens = Array.isArray(state.with_tokens)
    ? (state.with_tokens as string[]).filter(v => v === 'true' || v === 'false')
    : []
  if (withTokens.length === 1) out.with_tokens = withTokens[0]

  const system = Array.isArray(state.system)
    ? (state.system as string[]).filter(v => v === 'true' || v === 'false')
    : []
  if (system.length === 1) out.is_system = system[0]

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

function DataContractsLayout() {
  const [contracts, setContracts] = useState<LoadableState<PaginatedResultSet<DataContract>>>({
    data: {} as PaginatedResultSet<DataContract>,
    loading: true,
    error: false
  })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(0)
  const [scrollMode, setScrollMode] = useState<ListScrollMode>('pages')
  const [loadingMore, setLoadingMore] = useState(false)
  const [systemItems, setSystemItems] = useState<DataContract[]>([])
  const fetchGen = useRef(0)
  const [filters, setFilters] = useState<QueryFilters>({})
  const [columnFilters, setColumnFilters] = useState<Record<string, unknown>>({})
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setScrollMode(readListScrollMode('dataContracts'))
  }, [])

  useEffect(() => {
    Api.getDataContracts(1, 12, 'desc', 'block_height', { is_system: 'true' }).then(res => {
      setSystemItems(res.resultSet)
    })
  }, [])

  useEffect(() => {
    const gen = ++fetchGen.current
    const replace = scrollMode === 'pages' || currentPage === 0
    if (replace) {
      setContracts(prev => ({ ...prev, loading: true, error: false }))
      setLoadingMore(false)
    } else {
      setLoadingMore(true)
    }

    const identifier = typeof filters.identifier === 'string' ? filters.identifier : ''
    const name = typeof filters.name === 'string' ? filters.name : ''
    const listFilters: QueryFilters = { ...filters }
    delete listFilters.identifier
    delete listFilters.name
    if (listFilters.is_system == null) listFilters.is_system = 'false'

    const request = identifier
      ? Api.getDataContractByIdentifier(identifier).then(contract => ({
          resultSet: [contract],
          pagination: { page: 1, limit: pageSize, total: 1 }
        }))
      : name
        ? Api.search(encodeURIComponent(name)).then((res: unknown) => {
            const payload = res as { dataContracts?: DataContract[] }
            const q = name.toLowerCase()
            const list = (payload?.dataContracts ?? []).filter(contract => {
              const n = contract.name?.toLowerCase() ?? ''
              return n === q || n.startsWith(q)
            })
            return {
              resultSet: list,
              pagination: { page: 1, limit: Math.max(1, list.length), total: list.length }
            }
          })
        : Api.getDataContracts(
            Math.max(1, currentPage + 1),
            Math.max(1, pageSize),
            'desc',
            'block_height',
            listFilters
          )

    request
      .then(res => {
        if (gen !== fetchGen.current) return
        setTotal(res.pagination.total)
        if (replace) {
          fetchHandlerSuccess(setContracts, res)
        } else {
          setContracts(prev => {
            const seen = new Set((prev.data?.resultSet ?? []).map(item => item.identifier))
            const extra = res.resultSet.filter(item => {
              if (!item.identifier || seen.has(item.identifier)) return false
              seen.add(item.identifier)
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
          fetchHandlerError(setContracts, err)
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
        const next = toContractsApiFilters(columnFilters)
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
    writeListScrollMode('dataContracts', mode)
    setScrollMode(mode)
    setCurrentPage(0)
  }, [])

  const onLoadMore = useCallback(() => {
    setCurrentPage(page => page + 1)
  }, [])

  const includeSystem = filters.is_system == null && !filters.identifier && !filters.name
  const pageItems = contracts.data?.resultSet ?? []
  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, pageSize)))
  const atEnd =
    scrollMode === 'pages' ? currentPage + 1 >= pageCount : pageItems.length >= total
  const listItems =
    includeSystem && atEnd && systemItems.length > 0
      ? [...pageItems, ...systemItems]
      : pageItems
  const displayTotal = total + (includeSystem ? systemItems.length : 0)

  const paging = {
    mode: scrollMode,
    onModeChange: onScrollModeChange,
    total: displayTotal,
    pageSize,
    page: currentPage,
    onPageChange: setCurrentPage,
    onLoadMore,
    loadingMore,
    hasMore: pageItems.length < total
  }

  return (
    <div className={'ListPage DataContractsPage'}>
      <div className={'InfoBlock'}>
        {contracts.error ? (
          <div className={'ListPage__Error'}>
            <ErrorMessageBlock />
          </div>
        ) : null}
        <DataContractsList
          dataContracts={listItems}
          loading={contracts.loading && (scrollMode === 'pages' || pageItems.length === 0)}
          filterValues={columnFilters}
          onFilterChange={onColumnFilterChange}
          paging={paging}
          title={'Data contracts'}
          pinFirst={true}
        />
      </div>
    </div>
  )
}

export default DataContractsLayout
