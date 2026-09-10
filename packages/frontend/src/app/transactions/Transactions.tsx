'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import * as Api from '../../util/Api'
import TransactionsList from '../../components/transactions/TransactionsList'
import {
  BATCH_TYPE_VALUES,
  TRANSACTION_TYPE_VALUES
} from '../../components/transactions/TransactionsFilter'
import {
  readListScrollMode,
  writeListScrollMode,
  type ListScrollMode
} from '../../components/ui/lists/DataList/listScrollMode'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { LoadableState, PaginatedResultSet, Transaction } from '../../types'
import './Transactions.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

type QueryFilters = Record<string, string | number | boolean | string[] | null | undefined>

const TX_TYPES = new Set(TRANSACTION_TYPE_VALUES)
const BATCH_TYPES = new Set(BATCH_TYPE_VALUES)

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

function toTransactionsApiFilters(state: Record<string, unknown>): QueryFilters {
  const out: QueryFilters = {}
  addRange(out, state.gas, 'gas_min', 'gas_max', 0, 0)

  if (typeof state.hash === 'string') {
    const hash = state.hash.trim()
    if (/^[A-Za-z0-9]{64}$/.test(hash)) out.hash = hash
  }

  if (typeof state.owner === 'string') {
    const owner = state.owner.trim()
    if (/^[A-Za-z0-9]{43,44}$/.test(owner)) out.owner = owner
  }

  const status = Array.isArray(state.status)
    ? (state.status as string[]).filter(v => v === 'SUCCESS' || v === 'FAIL')
    : []
  if (status.length === 1) out.status = status[0]

  const typeSelected = Array.isArray(state.type) ? (state.type as string[]) : []
  const txTypes = typeSelected.filter(v => TX_TYPES.has(v))
  const batchTypes = typeSelected.filter(v => BATCH_TYPES.has(v))
  if (batchTypes.length) {
    out.transaction_type = ['BATCH']
    out.batch_type = batchTypes
  } else if (txTypes.length) {
    out.transaction_type = txTypes
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

interface TransactionsProps {
  defaultPage?: number
  defaultPageSize?: number
}

function Transactions({ defaultPage = 1, defaultPageSize }: TransactionsProps) {
  const [transactions, setTransactions] = useState<LoadableState<PaginatedResultSet<Transaction>>>({
    data: {} as PaginatedResultSet<Transaction>,
    loading: true,
    error: false
  })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const [scrollMode, setScrollMode] = useState<ListScrollMode>('pages')
  const [loadingMore, setLoadingMore] = useState(false)
  const fetchGen = useRef(0)
  const [filters, setFilters] = useState<QueryFilters>({})
  const [columnFilters, setColumnFilters] = useState<Record<string, unknown>>({})
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setScrollMode(readListScrollMode('transactions'))
  }, [])

  useEffect(() => {
    const gen = ++fetchGen.current
    const replace = scrollMode === 'pages' || currentPage === 0
    if (replace) {
      setTransactions(prev => ({ ...prev, loading: true, error: false }))
      setLoadingMore(false)
    } else {
      setLoadingMore(true)
    }

    const hash = typeof filters.hash === 'string' ? filters.hash : ''
    const listFilters = { ...filters }
    delete listFilters.hash
    const request = hash
      ? Api.getTransaction(hash).then(tx => ({
          resultSet: [tx],
          pagination: { page: 1, limit: pageSize, total: 1 }
        }))
      : Api.getTransactions(Math.max(1, currentPage + 1), Math.max(1, pageSize), 'desc', listFilters)

    request
      .then(res => {
        if (gen !== fetchGen.current) return
        setTotal(res.pagination.total)
        if (replace) {
          fetchHandlerSuccess(setTransactions, res)
        } else {
          setTransactions(prev => {
            const seen = new Set((prev.data?.resultSet ?? []).map(tx => tx.hash))
            const extra = res.resultSet.filter(tx => {
              if (!tx.hash || seen.has(tx.hash)) return false
              seen.add(tx.hash)
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
          fetchHandlerError(setTransactions, err)
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
        const next = toTransactionsApiFilters(columnFilters)
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
    writeListScrollMode('transactions', mode)
    setScrollMode(mode)
    setCurrentPage(0)
  }, [])

  const onLoadMore = useCallback(() => {
    setCurrentPage(page => page + 1)
  }, [])

  const items = transactions.data?.resultSet ?? []
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
    <div className={'ListPage Transactions'}>
      <div className={'InfoBlock'}>
        {transactions.error ? (
          <div className={'ListPage__Error'}>
            <ErrorMessageBlock />
          </div>
        ) : null}
        <TransactionsList
          transactions={items}
          loading={transactions.loading && (scrollMode === 'pages' || items.length === 0)}
          filterValues={columnFilters}
          onFilterChange={onColumnFilterChange}
          paging={paging}
          title={'Transactions'}
          pinFirst={true}
        />
      </div>
    </div>
  )
}

export default Transactions
