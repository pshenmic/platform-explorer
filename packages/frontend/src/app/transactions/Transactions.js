'use client'

import {useEffect, useState} from 'react'
import * as Api from '../../util/Api'
import TransactionsList from '../../components/transactions/TransactionsList'
import Pagination from '../../components/pagination'

import { 
    Container,
    Heading, 
} from '@chakra-ui/react'


function Transactions() {
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState([])
    const [total, setTotal] = useState(1)
    const pageSize = 25
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

    useEffect(fetchData, [])

    const handlePageClick = ({selected}) => {
        Api.getTransactions(selected+1, pageSize, 'desc')
            .then((res) => {
                setCurrentPage(selected)
                setTransactions(res.resultSet)
            })
    }

    return (
        <Container 
            maxW='container.lg' 
            mt={8}
            className={'IdentitiesPage'}
        >
            <Container 
                maxW='container.lg' 
                borderWidth='1px' borderRadius='lg'
                className={'InfoBlock'}
            >
                <Heading className={'InfoBlock__Title'} as='h1' size='sm' >Transactions</Heading>

                {!loading && <>
                    <TransactionsList transactions={transactions}/>

                    {pageCount > 1 && 
                        <div className={'ListNavigation'}>
                            <Pagination 
                                onPageChange={handlePageClick}
                                pageCount={pageCount}
                                forcePage={currentPage} 
                            />
                        </div>
                    }
                </>}

            </Container>
        </Container>
    )
}

export default Transactions
