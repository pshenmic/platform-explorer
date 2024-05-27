'use client'

import { useEffect, useState } from 'react'
import * as Api from '../../util/Api'
import DataContractsList from '../../components/dataContracts/DataContractsList'
import Pagination from '../../components/pagination'

import {
  Container,
  Heading
} from '@chakra-ui/react'

function DataContractsLayout () {
  const [loading, setLoading] = useState(true)
  const [dataContracts, setDataContracts] = useState(null)
  const [total, setTotal] = useState(1)
  const pageSize = 25
  const [currentPage, setCurrentPage] = useState(0)
  const pageCount = Math.ceil(total / pageSize)

  const fetchData = () => {
    setLoading(true)

    Api.getDataContracts(1, pageSize, 'desc')
      .then((res) => {
        setDataContracts(res.resultSet)
        setTotal(res.pagination.total)
      })
      .catch(console.log)
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(fetchData, [])

  const handlePageClick = ({ selected }) => {
    Api.getDataContracts(selected + 1, pageSize, 'desc')
      .then((res) => {
        setCurrentPage(selected)
        setDataContracts(res.resultSet)
      })
      .catch(console.log)
  }

  if (!loading) {
    return (
        <div className={'container'}>
            {dataContracts &&
                <Container
                    maxW='container.lg'
                    padding={3}
                    mt={8}
                    mb={4}
                    borderWidth='1px' borderRadius='lg'
                    className={'InfoBlock'}
                >
                    <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Data contracts</Heading>

                    <DataContractsList dataContracts={dataContracts} size='l'/>

                    {pageCount > 1 &&
                        <div className={'ListNavigation'}>
                            <Pagination
                                onPageChange={handlePageClick}
                                pageCount={pageCount}
                                forcePage={currentPage}
                            />
                        </div>
                    }
                </Container>
            }
        </div>
    )
  }
}

export default DataContractsLayout
