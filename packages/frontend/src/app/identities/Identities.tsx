'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import * as Api from '../../util/Api'
import IdentitiesList from '../../components/identities/IdentitiesList'
import {
  readListScrollMode,
  writeListScrollMode,
  type ListScrollMode
} from '../../components/ui/lists/DataList/listScrollMode'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Identity, LoadableState, PaginatedResultSet } from '../../types'
import './IdentitiesPage.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

type QueryFilters = Record<string, string | number | boolean | string[] | null | undefined>
const IDENTIFIER_RE = new RegExp('^[A-Za-z0-9]{43,44}$')

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

function toApiFilters(state: Record<string, unknown>): QueryFilters {
  const out: QueryFilters = {}
  addRange(out, state.balance, 'balance_min', 'balance_max', 0, 0)
  addRange(out, state.tx_count, 'tx_count_min', 'tx_count_max', 0, 0)
  addRange(out, state.documents_count, 'documents_count_min', 'documents_count_max', 0, 0)
  addRange(out, state.data_contracts, 'data_contracts_min', 'data_contracts_max', 0, 0)

  if (typeof state.identifier === 'string') {
    const query = state.identifier.trim()
    if (IDENTIFIER_RE.test(query)) out.identifier = query
    else if (query) out.name = query
  }

  const types = Array.isArray(state.identity_type)
    ? (state.identity_type as string[]).filter(v => v === 'regular' || v === 'masternode')
    : []
  if (types.length === 1) out.identity_type = types[0]

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

function flattenSearchIdentities(payload: unknown): string[] {
  const raw = (payload as { identities?: unknown })?.identities
  const list = Array.isArray(raw) ? raw.flat(2) : []
  const ids: string[] = []
  for (const item of list) {
    if (typeof item === 'string' && IDENTIFIER_RE.test(item)) ids.push(item)
    else if (
      item &&
      typeof item === 'object' &&
      typeof (item as Identity).identifier === 'string'
    ) {
      ids.push((item as Identity).identifier)
    }
  }
  return [...new Set(ids)]
}

function Identities() {
  const [identities, setIdentities] = useState<LoadableState<PaginatedResultSet<Identity>>>({
    data: {} as PaginatedResultSet<Identity>,
    loading: true,
    error: false
  })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(0)
  const [scrollMode, setScrollMode] = useState<ListScrollMode>('pages')
  const [loadingMore, setLoadingMore] = useState(false)
  const fetchGen = useRef(0)
  const [filters, setFilters] = useState<QueryFilters>({ identity_type: 'regular' })
  const [columnFilters, setColumnFilters] = useState<Record<string, unknown>>({
    identity_type: ['regular']
  })
  const [sort, setSort] = useState<{ order_by: string; order: 'asc' | 'desc' }>({
    order_by: 'balance',
    order: 'desc'
  })
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setScrollMode(readListScrollMode('identities'))
  }, [])

  useEffect(() => {
    const gen = ++fetchGen.current
    const replace = scrollMode === 'pages' || currentPage === 0
    if (replace) {
      setIdentities(prev => ({ ...prev, loading: true, error: false }))
      setLoadingMore(false)
    } else {
      setLoadingMore(true)
    }

    const identifier = typeof filters.identifier === 'string' ? filters.identifier : ''
    const name = typeof filters.name === 'string' ? filters.name : ''
    const listFilters: QueryFilters = { ...filters }
    delete listFilters.identifier
    delete listFilters.name

    const request = identifier
      ? Api.getIdentity(identifier)
          .then(identity => ({
            resultSet: [identity],
            pagination: { page: 1, limit: pageSize, total: 1 }
          }))
          .catch(() => ({
            resultSet: [] as Identity[],
            pagination: { page: 1, limit: pageSize, total: 0 }
          }))
      : name
        ? Api.search(encodeURIComponent(name)).then(async (res: unknown) => {
            const ids = flattenSearchIdentities(res).slice(0, pageSize)
            const q = name.toLowerCase()
            const items = (
              await Promise.all(ids.map(id => Api.getIdentity(id).catch(() => null)))
            ).filter((item): item is Identity => {
              if (!item) return false
              const alias = item.aliases?.find(a => a.status === 'ok')?.alias?.toLowerCase() ?? ''
              return item.identifier.toLowerCase() === q || alias === q || alias.startsWith(q)
            })
            return {
              resultSet: items,
              pagination: { page: 1, limit: Math.max(1, items.length), total: items.length }
            }
          })
        : Api.getIdentities(
            Math.max(1, currentPage + 1),
            Math.max(1, pageSize),
            sort.order,
            sort.order_by,
            {
              includeMasternodes: !listFilters.identity_type,
              filters: listFilters
            }
          )

    request
      .then(res => {
        if (gen !== fetchGen.current) return
        setTotal(res.pagination.total)
        if (replace) {
          fetchHandlerSuccess(setIdentities, res)
        } else {
          setIdentities(prev => {
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
          fetchHandlerError(setIdentities, err)
        }
        setLoadingMore(false)
      })
  }, [currentPage, pageSize, filters, scrollMode, sort.order, sort.order_by])

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
    urlParameters.delete('show-all')
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
    const id = window.setTimeout(() => {
      const next = toApiFilters(columnFilters)
      setFilters(prev => {
        if (JSON.stringify(prev) === JSON.stringify(next)) return prev
        setCurrentPage(0)
        return next
      })
    }, 400)
    return () => window.clearTimeout(id)
  }, [columnFilters])

  const onScrollModeChange = useCallback((mode: ListScrollMode) => {
    writeListScrollMode('identities', mode)
    setScrollMode(mode)
    setCurrentPage(0)
  }, [])

  const onLoadMore = useCallback(() => {
    setCurrentPage(page => page + 1)
  }, [])

  const items = identities.data?.resultSet ?? []
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
    <div className={'ListPage IdentitiesPage'}>
      <div className={'InfoBlock'}>
        {identities.error ? (
          <div className={'ListPage__Error'}>
            <ErrorMessageBlock />
          </div>
        ) : null}
        <IdentitiesList
          identities={items}
          loading={identities.loading && (scrollMode === 'pages' || items.length === 0)}
          filterValues={columnFilters}
          onFilterChange={onColumnFilterChange}
          paging={paging}
          title={'Identities'}
          pinFirst={true}
          page={currentPage}
          sort={sort}
          sortDefault={{ order_by: 'balance', order: 'desc' }}
          onSortChange={next => {
            setSort({
              order_by: next.order_by,
              order: next.order === 'asc' ? 'asc' : 'desc'
            })
            setCurrentPage(0)
          }}
        />
      </div>
    </div>
  )
}

export default Identities
