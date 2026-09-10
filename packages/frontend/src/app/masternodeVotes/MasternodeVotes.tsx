'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import * as Api from '../../util/Api'
import { VotesList } from '../../components/contestedResources/votes'
import {
  readListScrollMode,
  writeListScrollMode,
  type ListScrollMode
} from '../../components/ui/lists/DataList/listScrollMode'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { LoadableState, PaginatedResultSet, Vote } from '../../types'
import './MasternodeVotes.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

type QueryFilters = Record<string, string | number | boolean | string[] | null | undefined>
const IDENTIFIER_RE = new RegExp('^[A-Za-z0-9]{43,44}$')

function pickOne(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const items = value.filter(item => item != null && item !== '')
    return items.length === 1 ? String(items[0]) : undefined
  }
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number') return String(value)
  return undefined
}

function toApiFilters(state: Record<string, unknown>): QueryFilters {
  const out: QueryFilters = {}

  if (typeof state.voter_identity === 'string') {
    const voter = state.voter_identity.trim()
    if (IDENTIFIER_RE.test(voter)) out.voter_identity = voter
  }

  if (typeof state.towards_identity === 'string') {
    const towards = state.towards_identity.trim()
    if (IDENTIFIER_RE.test(towards)) out.towards_identity = towards
  }

  const choice = pickOne(state.choice)
  if (choice === '0' || choice === '1' || choice === '2') out.choice = choice

  const power = pickOne(state.power)
  if (power === '1' || power === '4') out.power = power

  const ts = state.timestamp as
    | { start?: Date | null; end?: Date | null; mode?: 'days' | 'rolling' }
    | null
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

function MasternodeVotes() {
  const [votes, setVotes] = useState<LoadableState<PaginatedResultSet<Vote>>>({
    data: {} as PaginatedResultSet<Vote>,
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
    setScrollMode(readListScrollMode('masternodeVotes'))
  }, [])

  useEffect(() => {
    const gen = ++fetchGen.current
    const replace = scrollMode === 'pages' || currentPage === 0
    if (replace) {
      setVotes(prev => ({ ...prev, loading: true, error: false }))
      setLoadingMore(false)
    } else {
      setLoadingMore(true)
    }

    Api.getMasternodeVotes(Math.max(1, currentPage + 1), Math.max(1, pageSize), 'desc', filters)
      .then(res => {
        if (gen !== fetchGen.current) return
        setTotal(res.pagination.total)
        if (replace) {
          fetchHandlerSuccess(setVotes, res)
        } else {
          setVotes(prev => {
            const seen = new Set((prev.data?.resultSet ?? []).map(item => item.txHash || ''))
            const extra = res.resultSet.filter(item => {
              if (!item.txHash || seen.has(item.txHash)) return false
              seen.add(item.txHash)
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
          fetchHandlerError(setVotes, err)
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
    writeListScrollMode('masternodeVotes', mode)
    setScrollMode(mode)
    setCurrentPage(0)
  }, [])

  const onLoadMore = useCallback(() => {
    setCurrentPage(page => page + 1)
  }, [])

  const items = votes.data?.resultSet ?? []
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
    <div className={'ListPage MasternodeVotes'}>
      <div className={'InfoBlock'}>
        {votes.error ? (
          <div className={'ListPage__Error'}>
            <ErrorMessageBlock />
          </div>
        ) : null}
        <VotesList
          votes={items}
          loading={votes.loading && (scrollMode === 'pages' || items.length === 0)}
          filterValues={columnFilters}
          onFilterChange={onColumnFilterChange}
          paging={paging}
          title={'Masternode votes'}
          pinFirst={true}
        />
      </div>
    </div>
  )
}

export default MasternodeVotes
