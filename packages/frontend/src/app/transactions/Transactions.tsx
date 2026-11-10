'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import * as Api from '../../util/Api'
import TransactionsList from '../../components/transactions/TransactionsList'
import {
  applyTypeParams,
  parseTypeParams
} from '../../components/transactions/transactionsListHref'
import {
  toTransactionsApiFilters,
  TX_TYPES,
  BATCH_TYPES,
  type QueryFilters
} from '../../components/transactions/transactionsApiFilters'
import {
  readListScrollMode,
  writeListScrollMode,
  type ListScrollMode
} from '../../components/ui/lists/DataList/listScrollMode'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useSearchParams } from 'next/navigation'
import type { LoadableState, PaginatedResultSet, Transaction } from '../../types'
import './Transactions.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
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
  const searchParams = useSearchParams()
  const typeParams = parseTypeParams(searchParams)
  const batchTypes = typeParams.batch_type.filter(type => BATCH_TYPES.has(type))
  const urlTypes = [
    ...new Set(
      batchTypes.length
        ? batchTypes
        : typeParams.transaction_type.filter(type => TX_TYPES.has(type))
    )
  ]
  const urlTypeKey = JSON.stringify(urlTypes)
  const [typeKey, setTypeKey] = useState(urlTypeKey)
  const [transactions, setTransactions] = useState<LoadableState<PaginatedResultSet<Transaction>>>({
    data: {} as PaginatedResultSet<Transaction>,
    loading: true,
    error: false
  })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const [scrollMode, setScrollMode] = useState<ListScrollMode>('continuous')
  const [loadingMore, setLoadingMore] = useState(false)
  const fetchGen = useRef(0)
  const [filters, setFilters] = useState<QueryFilters>(() =>
    toTransactionsApiFilters({ type: urlTypes })
  )
  const [columnFilters, setColumnFilters] = useState<Record<string, unknown>>(() => ({
    type: urlTypes
  }))
  const pathname = usePathname()

  if (typeKey !== urlTypeKey) {
    const next = { ...columnFilters, type: urlTypes }
    setTypeKey(urlTypeKey)
    setColumnFilters(next)
    setFilters(toTransactionsApiFilters(next))
    setCurrentPage(
      scrollMode === 'pages' ? Math.max(0, Number(searchParams.get('page')) - 1 || 0) : 0
    )
    setTransactions(prev => ({
      ...prev,
      data: null,
      loading: true,
      error: false
    }))
  }

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
      : Api.getTransactions(
          Math.max(1, currentPage + 1),
          Math.max(1, pageSize),
          'desc',
          listFilters
        )

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
  }, [searchParams, scrollMode])

  useEffect(() => {
    const urlParameters = new URLSearchParams(window.location.search)
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
    if (href !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, '', href)
    }
  }, [currentPage, pageSize, scrollMode, pathname])

  const onColumnFilterChange = (key: string, value: unknown) => {
    if (key === 'type') {
      const next = toTransactionsApiFilters({ type: value })
      const params = applyTypeParams(new URLSearchParams(window.location.search), {
        transaction_type: (next.transaction_type as string[]) || [],
        batch_type: (next.batch_type as string[]) || []
      })
      params.delete('page')
      const query = params.toString()
      const href = query ? `${pathname}?${query}` : pathname
      if (href !== `${window.location.pathname}${window.location.search}`) {
        window.history.pushState(null, '', href)
      }
      return
    }
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
