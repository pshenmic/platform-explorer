'use client'

import { useEffect, useState, useCallback } from 'react'
import * as Api from '../../util/Api'
import TransactionsList from '../../components/transactions/TransactionsList'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
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
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(0)
  const pageCount = Math.ceil(total / pageSize)

  const fetchData = () => {
    setLoading(true)

    Api.getTransactions(1, pageSize, 'desc')
      .then((res) => {
        setTransactions(res.resultSet)
        setTotal(res.pagination.total)
      })
      .catch(console.log)
      .finally(() => setLoading(false))
  }

  useEffect(fetchData, [pageSize])

  const handlePageClick = useCallback(({ selected }) => {
    Api.getTransactions(selected + 1, pageSize, 'desc')
      .then((res) => {
        setCurrentPage(selected)
        setTransactions(res.resultSet)
      })
  }, [pageSize])

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
            <Heading className={'InfoBlock__Title'} as='h1' size='sm' >Transactions</Heading>

            {!loading && <>
                <TransactionsList transactions={transactions}/>

                <div className={'ListNavigation'}>
                    <Box display={['none', , 'block']} width={'100px'}/>

                    {pageCount > 1 &&
                        <Pagination
                            onPageChange={handlePageClick}
                            pageCount={pageCount}
                            forcePage={currentPage}
                        />
                    }

                    <PageSizeSelector
                        PageSizeSelectHandler={(e) => setPageSize(Number(e.target.value))}
                        defaultValue={paginateConfig.pageSize.default}
                        items={paginateConfig.pageSize.values}
                    />

                </div>
            </>}
        </Container>
    </Container>
  )
}

export default Transactions
