'use client'

import { useEffect, useState, useMemo } from 'react'
import * as Api from '../../util/Api'
import TransactionsList from '../../components/transactions/TransactionsList'
import TransactionsFilter, {
  TRANSACTION_TYPE_VALUES,
  BATCH_TYPE_VALUES
} from '../../components/transactions/TransactionsFilter'
import {
  applyTypeParams,
  parseTypeParams
} from '../../components/transactions/transactionsListHref'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useIsMobile } from '../../hooks'
import NetworkStatsInline from '../../components/stats/NetworkStatsInline'
import PageTitle from '../../components/intro/PageTitle'
import TransactionsChartCompact from '../../components/charts/TransactionsChartCompact'
import introContent from './introContent'
import './Transactions.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function Transactions({ defaultPage = 1, defaultPageSize }: any) {
  const [currentPage, setCurrentPage] = useState(defaultPage ? parseInt(defaultPage) - 1 : 0)
  const [pageSize, setPageSize] = useState(
    (defaultPageSize ?? null) ? defaultPageSize : paginateConfig.pageSize.default
  )
  const [total, setTotal] = useState(0)
  const [transactions, setTransactions] = useState<{
    data: any[]
    loading: boolean
    error: unknown
  }>({ data: [], loading: true, error: null })
  const pageCount = Math.ceil(total / pageSize)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  const typeParams = useMemo(() => {
    const parsed = parseTypeParams(searchParams)
    const allow = (list: any, allowed: any) => list.filter((v: any) => allowed.includes(v))
    return {
      transaction_type: allow(parsed.transaction_type, TRANSACTION_TYPE_VALUES),
      batch_type: allow(parsed.batch_type, BATCH_TYPE_VALUES)
    }
  }, [searchParams])

  const apiFilters = useMemo(() => {
    const next: Record<string, string[]> = {}
    if (typeParams.transaction_type.length) next.transaction_type = typeParams.transaction_type
    if (typeParams.batch_type.length) next.batch_type = typeParams.batch_type
    return next
  }, [typeParams])

  const filterUiState = useMemo(() => {
    const next: Record<string, string[]> = {}
    if (typeParams.transaction_type.length) next.transaction_type = typeParams.transaction_type
    if (typeParams.batch_type.length) next.batch_type = typeParams.batch_type
    return next
  }, [typeParams])

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setTransactions(prev => ({ ...prev, loading: true, error: null }))

        const response = await Api.getTransactions(
          Math.max(1, currentPage + 1),
          Math.max(1, pageSize),
          'desc',
          apiFilters
        )

        setTotal(response.pagination.total)
        setTransactions({ data: response.resultSet, loading: false, error: null })
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setTotal(0)
        setTransactions({
          data: [],
          loading: false,
          error: error instanceof Error ? error.message : error
        })
      }
    }

    fetchTransactions()
  }, [currentPage, pageSize, apiFilters])

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '', 10) || paginateConfig.defaultPage
    setCurrentPage(Math.max(page - 1, 0))
    setPageSize(
      parseInt(searchParams.get('page-size') || '', 10) || paginateConfig.pageSize.default
    )
  }, [searchParams, pathname])

  useEffect(() => {
    const urlParameters = new URLSearchParams()
    applyTypeParams(urlParameters, typeParams)

    if (
      currentPage + 1 !== paginateConfig.defaultPage ||
      pageSize !== paginateConfig.pageSize.default
    ) {
      urlParameters.set('page', String(currentPage + 1))
      urlParameters.set('page-size', String(pageSize))
    }

    const next = urlParameters.toString()
    const current = searchParams.toString()
    if (next === current) return
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [currentPage, pageSize, typeParams, pathname, router, searchParams])

  const filtersChangeHandler = (newFilters: any) => {
    const urlParameters = new URLSearchParams()
    const tt = Array.isArray(newFilters?.transaction_type) ? newFilters.transaction_type : []
    const bt = Array.isArray(newFilters?.batch_type) ? newFilters.batch_type : []
    applyTypeParams(urlParameters, { transaction_type: tt, batch_type: bt })
    setCurrentPage(0)
    router.replace(urlParameters.toString() ? `${pathname}?${urlParameters}` : pathname, {
      scroll: false
    })
  }

  const handlePageChange = (newPage: any) => {
    setCurrentPage(Math.max(0, newPage?.selected))
  }

  const handlePageSizeChange = (newSize: any) => {
    const size = typeof newSize === 'object' ? newSize.value : parseInt(newSize)
    setPageSize(Math.max(1, size))
    setCurrentPage(0)
  }

  return (
    <div className={'ListPage Transactions'}>
      <div className={'InfoBlock'}>
        <div className={'Transactions__Controls'}>
          <PageTitle
            title={'Transactions'}
            description={introContent}
            className={'Transactions__Title'}
          />

          <NetworkStatsInline className={'Transactions__Stats'} />

          <TransactionsFilter
            onFilterChange={filtersChangeHandler}
            initialFilters={filterUiState}
            isMobile={isMobile}
            className={'Transactions__Filters'}
          />
        </div>

        <TransactionsChartCompact className={'Transactions__Chart'} />

        {!transactions.error ? (
          !transactions.loading ? (
            <TransactionsList transactions={transactions.data} />
          ) : (
            <LoadingList itemsCount={pageSize} />
          )
        ) : (
          <div className={'ListPage__Error'}>
            <ErrorMessageBlock />
          </div>
        )}

        {transactions.data?.length > 0 && (
          <div className={'ListNavigation'}>
            <div className={'ListNavigation__Balance'} />
            <Pagination
              onPageChange={handlePageChange}
              pageCount={pageCount}
              forcePage={currentPage}
            />
            <PageSizeSelector
              PageSizeSelectHandler={handlePageSizeChange}
              value={pageSize}
              items={[10, 20, 50, 100]}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Transactions
