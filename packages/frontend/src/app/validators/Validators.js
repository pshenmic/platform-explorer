'use client'

import { useEffect, useState, useCallback } from 'react'
import * as Api from '../../util/Api'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { Switcher } from '../../components/ui'

import {
  Container,
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function ValidatorsList () {
  return (
    <div className={'ValidatorsList'}>
      <Switcher
        options={[
          {
            title: 'Active'
          },
          {
            title: 'Inactive'
          }
        ]}
        onChange={(e) => console.log(e)}
      />

      <TableContainer>
        <Table size='md' className='Table'>
          <Thead>
            <Tr>
              <Th>proTxHash</Th>
              <Th isNumeric>Last block height</Th>
              <Th isNumeric>Blocks proposed</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>f92e66edc9c8da41de71073ef08d62c56f8752a3f4e29ced6c515e0b1c074a38</Td>
              <Td isNumeric>13619</Td>
              <Td isNumeric>1024</Td>
            </Tr>
            <Tr>
              <Td>f92e66edc9c8da41de71073ef08d62c56f8752a3f4e29ced6c515e0b1c074a38</Td>
              <Td isNumeric>13619</Td>
              <Td isNumeric>1024</Td>
            </Tr>
            <Tr>
              <Td>f92e66edc9c8da41de71073ef08d62c56f8752a3f4e29ced6c515e0b1c074a38</Td>
              <Td isNumeric>13619</Td>
              <Td isNumeric>1024</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  )
}

function Validators () {
  const [validators, setValidators] = useState({ data: {}, loading: true, error: false })
  const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(0)
  const [total, setTotal] = useState(1)
  const pageCount = Math.ceil(total / pageSize)

  const fetchData = (page, count) => {
    Api.getTransactions(page, count, 'desc')
      .then((res) => {
        fetchHandlerSuccess(setValidators, res)
        setTotal(res.pagination.total)
      })
      .catch(err => fetchHandlerError(setValidators, err))
  }

  useEffect(() => fetchData(paginateConfig.defaultPage, pageSize), [pageSize])

  const handlePageClick = useCallback(({ selected }) => {
    setCurrentPage(selected)
    fetchData(selected + 1, pageSize)
  }, [pageSize])

  useEffect(() => {
    setCurrentPage(0)
    handlePageClick({ selected: 0 })
  }, [pageSize, handlePageClick])

  return (
    <Container
        maxW='container.xl'
        mt={8}
        className={'Transactions'}
    >
        <Container
            maxW='container.xl'
            borderWidth='1px' borderRadius='lg'
            className={'InfoBlock'}
        >
            <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Validators</Heading>

            {!validators.error
              ? !validators.loading
                  ? <ValidatorsList transactions={validators.data.resultSet}/>
                  : <LoadingList itemsCount={pageSize}/>
              : <Container h={20}><ErrorMessageBlock/></Container>
            }

            {validators.data?.resultSet?.length > 0 &&
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

export default Validators
