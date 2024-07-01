'use client'

import { useState, useEffect, useCallback } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { LoadingLine, LoadingList } from '../../../components/loading'
import Pagination from '../../../components/pagination'
import PageSizeSelector from '../../../components/pageSizeSelector/PageSizeSelector'
import { ErrorMessageBlock } from '../../../components/Errors'
import BlocksList from '../../../components/blocks/BlocksList'
import {
  Container,
  TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  Heading,
  Flex,
  Box
} from '@chakra-ui/react'
import ProposedBlocksChart from './ProposedBlocksChart'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function Validator ({ hash }) {
  const [validator, setValidator] = useState({ data: {}, loading: true, error: false })
  const [proposedBlocks, setProposedBlocks] = useState({ data: {}, loading: true, error: false })
  const [totalBlocks, setTotalBlocks] = useState(1)
  const tdTitleWidth = 250
  const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(1)
  const pageCount = Math.ceil(totalBlocks / pageSize) ? Math.ceil(totalBlocks / pageSize) : 1

  const fetchData = (page, count) => {
    setProposedBlocks(state => ({ ...state, loading: true }))

    Api.getValidatorByProTxHash(hash)
      .then((res) => fetchHandlerSuccess(setValidator, res))
      .catch(err => fetchHandlerError(setValidator, err))

    Api.getBlocksByValidator(hash, page, count)
      .then((res) => {
        fetchHandlerSuccess(setProposedBlocks, res)
        setTotalBlocks(res?.pagination?.total)
      })
      .catch(err => fetchHandlerError(setProposedBlocks, err))
  }

  useEffect(() => fetchData(paginateConfig.defaultPage, paginateConfig.pageSize.default), [hash])

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
        maxW={'container.xl'}
        p={3}
        mt={8}
    >
      <Flex
          w={'100%'}
          justifyContent={'space-between'}
          wrap={['wrap', 'wrap', 'wrap', 'nowrap']}
          mb={5}
      >
          <TableContainer
              width={['100%', '100%', '100%', 'calc(50% - 10px)']}
              maxW={'none'}
              borderWidth={'1px'} borderRadius={'lg'}
              m={0}
              flexShrink={0}
            >
              {!validator.error
                ? <Table variant='simple' className={'Table'}>
                      <Thead>
                          <Tr>
                              <Th pr={0}>validator info</Th>
                              <Th></Th>
                          </Tr>
                      </Thead>
                      <Tbody>
                          <Tr>
                              <Td w={tdTitleWidth}>TX Hash</Td>
                              <Td isNumeric className={'Table__Cell--BreakWord'}>
                                  <LoadingLine loading={validator.loading}>{hash}</LoadingLine>
                              </Td>
                          </Tr>
                          <Tr>
                              <Td w={tdTitleWidth}>Status</Td>
                              <Td >
                                  <LoadingLine loading={validator.loading}>active</LoadingLine>
                              </Td>
                          </Tr>
                          <Tr>
                              <Td w={tdTitleWidth}>Proposed blocks</Td>
                              <Td >
                                  <LoadingLine loading={validator.loading}>{validator?.data?.proposedBlocksAmount || '-'}</LoadingLine>
                              </Td>
                          </Tr>
                      </Tbody>
                  </Table>
                : <Container h={60}><ErrorMessageBlock/></Container>}
          </TableContainer>

          <Box w={5} h={5} flexShrink={0}/>

          <ProposedBlocksChart/>
      </Flex>

      <Container
        width='100%'
        maxW='none'
        mt={5}
        borderWidth='1px' borderRadius='lg'
        className={'InfoBlock'}
      >
          <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Proposed blocks</Heading>

          {!proposedBlocks.error
            ? <>
                {!proposedBlocks.loading
                  ? <BlocksList blocks={proposedBlocks?.data?.resultSet}/>
                  : <LoadingList itemsCount={pageSize}/>
                }
              </>
            : <Container h={20}><ErrorMessageBlock/></Container>
          }

          {proposedBlocks.data?.resultSet?.length > 0 &&
            <div className={'ListNavigation'}>
                <Box/>
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

export default Validator
