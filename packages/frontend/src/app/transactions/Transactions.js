'use client'

import { useEffect, useState, useCallback } from 'react'
import * as Api from '../../util/Api'
import TransactionsList from '../../components/transactions/TransactionsList'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  Container,
  Heading,
  Box
} from '@chakra-ui/react'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function Transactions ({ defaultPage = 1 }) {
  const [transactions, setTransactions] = useState({ data: {}, loading: true, error: false })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage || 0)
  const pageCount = Math.ceil(total / pageSize)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fetchData = (page, count) => {
    setTransactions(state => ({ ...state, loading: true }))

    Api.getTransactions(page, count, 'desc')
      .then((res) => {
        fetchHandlerSuccess(setTransactions, res)
        setTotal(res.pagination.total)
      })
      .catch(err => fetchHandlerError(setTransactions, err))
  }

  useEffect(() => fetchData(defaultPage, pageSize), [pageSize])

  const handlePageClick = useCallback(({ selected }) => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))
    urlParameters.set('page', selected + 1)
    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })

    setCurrentPage(selected)
    fetchData(selected + 1, pageSize)
  }, [pageSize])

  useEffect(() => {
    setCurrentPage(defaultPage - 1)
    handlePageClick({ selected: defaultPage - 1 })
  }, [pageSize, handlePageClick])

  return (
    <Container
        maxW={'container.xl'}
        mt={8}
        className={'Transactions'}
    >
        <Container
            maxW={'container.xl'}
            borderWidth={'1px'} borderRadius={'lg'}
            className={'InfoBlock'}
        >
            <Heading className={'InfoBlock__Title'} as={'h1'} size={'sm'}>Transactions</Heading>

            {!transactions.error
              ? !transactions.loading
                  ? <TransactionsList transactions={transactions.data.resultSet}/>
                  : <LoadingList itemsCount={pageSize}/>
              : <Container h={20}><ErrorMessageBlock/></Container>
            }

            {transactions.data?.resultSet?.length > 0 &&
              <div className={'ListNavigation'}>
                <Box display={['none', 'none', 'block']} width={'100px'}/>
                <Pagination
                    onPageChange={handlePageClick}
                    pageCount={pageCount}
                    forcePage={currentPage}
                />
                <PageSizeSelector
                    PageSizeSelectHandler={(e) => setPageSize(Number(e.target.value))}
                    defaultValue={paginateConfig.pageSize.default}
                    items={paginateConfig.pageSize.values}
                />
              </div>
            }
        </Container>
    </Container>
  )
}

export default Transactions
