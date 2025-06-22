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
import { Container, Heading, Box, useBreakpointValue } from '@chakra-ui/react'
import './Transactions.scss'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function Transactions ({ defaultPage = 1, defaultPageSize }) {
  const [currentPage, setCurrentPage] = useState(defaultPage ? parseInt(defaultPage) - 1 : 0)
  const [pageSize, setPageSize] = useState(defaultPageSize ?? null ? defaultPageSize : paginateConfig.pageSize.default)
  const [total, setTotal] = useState(0)
  const [transactions, setTransactions] = useState({ data: [], loading: true, error: null })
  const [filters, setFilters] = useState({})
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
        setTransactions({ data: [], loading: false, error: error.message })
      }
    }

    fetchTransactions()
  }, [currentPage, pageSize, filters])

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || paginateConfig.defaultPage
    setCurrentPage(Math.max(page - 1, 0))
    setPageSize(parseInt(searchParams.get('page-size')) || paginateConfig.pageSize.default)
  }, [searchParams, pathname])

  useEffect(() => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))

    if (currentPage + 1 === paginateConfig.defaultPage && pageSize === paginateConfig.pageSize.default) {
      urlParameters.delete('page')
      urlParameters.delete('page-size')
    } else {
      urlParameters.set('page', currentPage + 1)
      urlParameters.set('page-size', pageSize)
    }

    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  }, [currentPage, pageSize])

  const filtersChangeHandler = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(0)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(0, newPage?.selected))
  }

  const handlePageSizeChange = (newSize) => {
    const size = typeof newSize === 'object' ? newSize.value : parseInt(newSize)
    setPageSize(Math.max(1, size))
    setCurrentPage(0)
  }

  return (
    <Container
      maxW={'container.maxPageW'}
      mt={8}
      className={'Transactions'}
    >
        <Container maxW={'container.maxPageW'} className={'InfoBlock'}>
          <Heading className={'InfoBlock__Title'} as={'h1'}>Transactions</Heading>

          <TransactionsFilter
            onFilterChange={filtersChangeHandler}
            isMobile={isMobile}
            className={'Transactions__Filters'}
          />

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
