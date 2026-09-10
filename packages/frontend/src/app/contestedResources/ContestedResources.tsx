'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import * as Api from '../../util/Api'
import { ContestedResourcesList } from '../../components/contestedResources'
import {
  readListScrollMode,
  writeListScrollMode,
  type ListScrollMode
} from '../../components/ui/lists/DataList/listScrollMode'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type {
  ContestedResource,
  DataContract,
  LoadableState,
  PaginatedResultSet
} from '../../types'
import './ContestedResourcesPage.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

type QueryFilters = Record<string, string | number | boolean | string[] | null | undefined>
const IDENTIFIER_RE = new RegExp('^[A-Za-z0-9]{43,44}$')

function encodeResourceValueQuery(query: string): string | null {
  const q = query.trim()
  if (!q) return null
  try {
    const decoded = JSON.parse(atob(q))
    if (Array.isArray(decoded)) return q
  } catch {}
  try {
    const parsed = JSON.parse(q)
    if (Array.isArray(parsed)) return btoa(JSON.stringify(parsed))
  } catch {}
  const dot = q.lastIndexOf('.')
  if (dot > 0) {
    return btoa(JSON.stringify([q.slice(dot + 1), q.slice(0, dot)]))
  }
  return btoa(JSON.stringify([q]))
}

function toApiFilters(state: Record<string, unknown>): QueryFilters {
  const out: QueryFilters = {}

  if (typeof state.resourceValue === 'string' && state.resourceValue.trim()) {
    out.resource_value = encodeResourceValueQuery(state.resourceValue)
  }

  if (typeof state.contract === 'string') {
    const contract = state.contract.trim()
    if (IDENTIFIER_RE.test(contract)) out.contract_id = contract
    else if (contract) out.contract_name = contract
  }

  const documentTypes = Array.isArray(state.document_type_name)
    ? (state.document_type_name as string[]).filter(Boolean)
    : typeof state.document_type_name === 'string' && state.document_type_name.trim()
      ? [state.document_type_name.trim()]
      : []
  if (documentTypes.length === 1) out.document_type_name = documentTypes[0]

  const voting = Array.isArray(state.voting_finished)
    ? (state.voting_finished as string[]).filter(v => v === 'true' || v === 'false')
    : []
  if (voting.length === 1) out.voting_finished = voting[0]

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
    out.timestamp_start = from.toISOString()
    out.timestamp_end = to.toISOString()
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

function ContestedResources() {
  const [resources, setResources] = useState<LoadableState<PaginatedResultSet<ContestedResource>>>({
    data: {} as PaginatedResultSet<ContestedResource>,
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
    setScrollMode(readListScrollMode('contestedResources'))
  }, [])

  useEffect(() => {
    const gen = ++fetchGen.current
    const replace = scrollMode === 'pages' || currentPage === 0
    if (replace) {
      setResources(prev => ({ ...prev, loading: true, error: false }))
      setLoadingMore(false)
    } else {
      setLoadingMore(true)
    }

    const resourceValue = typeof filters.resource_value === 'string' ? filters.resource_value : ''
    const contractName = typeof filters.contract_name === 'string' ? filters.contract_name : ''
    const listFilters: QueryFilters = { ...filters }
    delete listFilters.resource_value
    delete listFilters.contract_name

    const request = resourceValue
      ? Api.getContestedResourceByValue(resourceValue)
          .then(item => ({
            resultSet: [item],
            pagination: { page: 1, limit: pageSize, total: 1 }
          }))
          .catch(() => ({
            resultSet: [] as ContestedResource[],
            pagination: { page: 1, limit: pageSize, total: 0 }
          }))
      : contractName && !listFilters.contract_id
        ? Api.search(encodeURIComponent(contractName)).then((res: unknown) => {
            const payload = res as { dataContracts?: DataContract[] }
            const q = contractName.toLowerCase()
            const match = (payload?.dataContracts ?? []).find(contract => {
              const n = contract.name?.toLowerCase() ?? ''
              const id = contract.identifier?.toLowerCase() ?? ''
              return n === q || n.startsWith(q) || id === q
            })
            if (!match?.identifier) {
              return {
                resultSet: [] as ContestedResource[],
                pagination: { page: 1, limit: pageSize, total: 0 }
              }
            }
            return Api.getContestedResources(
              Math.max(1, currentPage + 1),
              Math.max(1, pageSize),
              'desc',
              undefined,
              {
                ...listFilters,
                contract_id: match.identifier
              }
            )
          })
        : Api.getContestedResources(
            Math.max(1, currentPage + 1),
            Math.max(1, pageSize),
            'desc',
            undefined,
            listFilters
          )

    request
      .then(res => {
        if (gen !== fetchGen.current) return
        setTotal(res.pagination.total)
        if (replace) {
          fetchHandlerSuccess(setResources, res)
        } else {
          setResources(prev => {
            const seen = new Set(
              (prev.data?.resultSet ?? []).map(item => JSON.stringify(item.resourceValue))
            )
            const extra = res.resultSet.filter(item => {
              const key = JSON.stringify(item.resourceValue)
              if (!item.resourceValue || seen.has(key)) return false
              seen.add(key)
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
          fetchHandlerError(setResources, err)
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
    writeListScrollMode('contestedResources', mode)
    setScrollMode(mode)
    setCurrentPage(0)
  }, [])

  const onLoadMore = useCallback(() => {
    setCurrentPage(page => page + 1)
  }, [])

  const items = resources.data?.resultSet ?? []
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
    <div className={'ListPage ContestedResources ContestedResourcesPage'}>
      <div className={'InfoBlock'}>
        {resources.error ? (
          <div className={'ListPage__Error'}>
            <ErrorMessageBlock />
          </div>
        ) : null}
        <ContestedResourcesList
          contestedResources={items}
          loading={resources.loading && (scrollMode === 'pages' || items.length === 0)}
          filterValues={columnFilters}
          onFilterChange={onColumnFilterChange}
          paging={paging}
          title={'Contested resources'}
          pinFirst={true}
        />
      </div>
    </div>
  )
}

export default ContestedResources
