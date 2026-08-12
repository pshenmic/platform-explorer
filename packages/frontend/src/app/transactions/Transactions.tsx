'use client'

import { useEffect, useState } from 'react'
import * as Api from '../../util/Api'
import TransactionsList from '../../components/transactions/TransactionsList'
import TransactionsFilter from '../../components/transactions/TransactionsFilter'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Container, Box, useBreakpointValue } from '@chakra-ui/react'
import NetworkStatsInline from '../../components/stats/NetworkStatsInline'
import PageTitle from '../../components/intro/PageTitle'
import TransactionsChartCompact from '../../components/charts/TransactionsChartCompact'
import type { Transaction } from '../../types'
import introContent from './intro.md'
import './Transactions.scss'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

interface TransactionsState {
  data: Transaction[]
  loading: boolean
  error: string | null
}

interface TransactionsProps {
  defaultPage?: number
  defaultPageSize?: number
}

function Transactions ({ defaultPage = 1, defaultPageSize }: TransactionsProps) {
  const [currentPage, setCurrentPage] = useState(defaultPage ? parseInt(String(defaultPage), 10) - 1 : 0)
  // Number(undefined) from page.tsx is NaN — treat as missing (NaN != null is true!)
  const initialPageSize =
    typeof defaultPageSize === 'number' && Number.isFinite(defaultPageSize) && defaultPageSize > 0
      ? defaultPageSize
      : paginateConfig.pageSize.default
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [total, setTotal] = useState(0)
  const [transactions, setTransactions] = useState<TransactionsState>({ data: [], loading: true, error: null })
  type QueryFilters = Record<string, string | number | boolean | string[] | null | undefined>
  const [filters, setFilters] = useState<QueryFilters>({})
  const pageCount = Math.ceil(total / pageSize)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setTransactions(prev => ({ ...prev, loading: true, error: null }))

        const response = await Api.getTransactions(
          Math.max(1, currentPage + 1),
          Math.max(1, pageSize),
          'desc',
          filters
        )

        setTotal(response.pagination.total)
        setTransactions({ data: response.resultSet, loading: false, error: null })
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setTotal(0)
        const message = error instanceof Error ? error.message : String(error)
        setTransactions({ data: [], loading: false, error: message })
      }
    }

    fetchTransactions()
  }, [currentPage, pageSize, filters])

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '', 10) || paginateConfig.defaultPage
    setCurrentPage(Math.max(page - 1, 0))
    setPageSize(parseInt(searchParams.get('page-size') || '', 10) || paginateConfig.pageSize.default)
  }, [searchParams, pathname])

  useEffect(() => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))

    if (currentPage + 1 === paginateConfig.defaultPage && pageSize === paginateConfig.pageSize.default) {
      urlParameters.delete('page')
      urlParameters.delete('page-size')
    } else {
      urlParameters.set('page', String(currentPage + 1))
      urlParameters.set('page-size', String(pageSize))
    }

    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mirror original deps
  }, [currentPage, pageSize])

  const filtersChangeHandler = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters as QueryFilters)
    setCurrentPage(0)
  }

  const handlePageChange = (newPage: { selected?: number }) => {
    setCurrentPage(Math.max(0, newPage?.selected ?? 0))
  }

  const handlePageSizeChange = (newSize: { value?: string | number } | string | number | null) => {
    const raw = typeof newSize === 'object' && newSize !== null
      ? Number(newSize.value)
      : parseInt(String(newSize), 10)
    const size = Number.isFinite(raw) && raw > 0 ? raw : paginateConfig.pageSize.default
    setPageSize(size)
    setCurrentPage(0)
  }

  return (
    <Container
      maxW={'container.maxPageW'}
      mt={8}
      className={'Transactions'}
    >
        <Container maxW={'container.maxPageW'} className={'InfoBlock'}>
          <div className={'Transactions__Controls'}>
            <PageTitle title={'Transactions'} description={introContent} className={'Transactions__Title'}/>

            <NetworkStatsInline className={'Transactions__Stats'}/>

            <TransactionsFilter
              onFilterChange={filtersChangeHandler}
              isMobile={isMobile}
              className={'Transactions__Filters'}
            />
          </div>

          <TransactionsChartCompact className={'Transactions__Chart'}/>

          {!transactions.error
            ? !transactions.loading
                ? <TransactionsList transactions={transactions.data}/>
                : <LoadingList itemsCount={pageSize}/>
            : <Container h={20}><ErrorMessageBlock/></Container>
          }

          {transactions.data?.length > 0 &&
            <div className={'ListNavigation'}>
              <Box display={['none', 'none', 'block']} width={'155px'}/>
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
          }
        </Container>
    </Container>
  )
}

export default Transactions
