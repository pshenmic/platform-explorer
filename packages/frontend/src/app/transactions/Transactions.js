'use client'

import { useEffect, useState, useCallback } from 'react'
import * as Api from '../../util/Api'
import TransactionsList from '../../components/transactions/TransactionsList'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { ListLoadingPreview } from '../../components/lists'
import { ErrorMessageBlock } from '../../components/Errors'
import './Transactions.scss'

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

function Transactions () {
  const [transactions, setTransactions] = useState({ data: {}, loading: true, error: false })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(0)
  const pageCount = Math.ceil(total / pageSize)

  const fetchData = (page, count) => {
    setTransactions(state => ({ ...state, loading: true }))

    Api.getTransactions(page, count, 'desc')
      .then((res) => {
        setTransactions({ data: res, loading: false, error: false })
        setTotal(res.pagination.total)
      })
      .catch(err => {
        console.error(err)
        setTransactions({ data: null, loading: false, error: true })
      })
  }

  useEffect(() => fetchData(paginateConfig.defaultPage, paginateConfig.pageSize.default), [pageSize])

  const handlePageClick = useCallback(({ selected }) => fetchData(selected + 1, pageSize), [pageSize])

  useEffect(() => {
    setCurrentPage(0)
    handlePageClick({ selected: 0 })
  }, [pageSize, handlePageClick])

  return (
    <Container
        maxW='container.lg'
        mt={8}
        className={'Transactions'}
    >
        <Container
            maxW='container.lg'
            borderWidth='1px' borderRadius='lg'
            className={'InfoBlock'}
        >
            <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Transactions</Heading>

            {!transactions.error
              ? !transactions.loading
                  ? <TransactionsList transactions={transactions.data.resultSet}/>
                  : <ListLoadingPreview itemsCount={pageSize}/>
              : <Container h={20}><ErrorMessageBlock/></Container>
            }

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
        </Container>
    </Container>
  )
}

export default Transactions
