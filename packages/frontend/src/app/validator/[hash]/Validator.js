'use client'

import { useState, useEffect, useCallback } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { LoadingLine, LoadingList } from '../../../components/loading'
import Pagination from '../../../components/pagination'
import PageSizeSelector from '../../../components/pageSizeSelector/PageSizeSelector'
import { ErrorMessageBlock } from '../../../components/Errors'
import BlocksList from '../../../components/blocks/BlocksList'
import ImageGenerator from '../../../components/imageGenerator'
import BlocksChart from './BlocksChart'
import Link from 'next/link'
import {
  Container,
  TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  Grid, GridItem,
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
      .then(res => fetchHandlerSuccess(setValidator, res))
      .catch(err => fetchHandlerError(setValidator, err))

    Api.getBlocksByValidator(hash, page, count, 'desc')
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
      maxW={'container.lg'}
      p={3}
      mt={8}
    >
      <Grid
        w={'100%'}
        mb={5}
        gap={5}
        templateColumns={['1fr', '1fr', '1fr', '1fr 1fr']}
      >
        <GridItem p={0} height={'100%'}>
          <TableContainer
            width={'100%'}
            height={'100%'}
            maxW={'none'}
            borderWidth={'1px'} borderRadius={'block'}
            m={0}
            display={'block'}
          >
            {!validator.error
              ? <Table variant={'simple'} className={'Table'}>
                  <Thead>
                    <Tr>
                      <Th pr={0}>validator info</Th>
                      <Th className={'TableHeader TableHeader--Name'}>
                        {hash
                          ? <div className={'TableHeader__Content'}>
                              <ImageGenerator className={'TableHeader__Avatar'} username={hash} lightness={50} saturation={50} width={32} height={32}/>
                            </div>
                          : <Box w={'32px'} h={'32px'} />
                        }
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                  <Tr>
                      <Td w={tdTitleWidth}>ProTxHash</Td>
                      <Td isNumeric className={'Table__Cell--BreakWord Table__Cell--Mono'}>
                        <LoadingLine loading={validator.loading}>
                          <div>{hash}</div>
                        </LoadingLine>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td w={tdTitleWidth}>Identity</Td>
                      <Td isNumeric className={'Table__Cell--BreakWord Table__Cell--Mono'}>
                        <LoadingLine loading={validator.loading}>
                          {validator?.data?.identity
                            ? <Link href={`/identity/${validator.data.identity}`}>{validator.data.identity}</Link>
                            : '-'}
                        </LoadingLine>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td w={tdTitleWidth}>Status</Td>
                      <Td isNumeric>
                        <LoadingLine loading={validator.loading}>{validator?.data?.isActive ? 'Active' : 'Inactive'}</LoadingLine>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td w={tdTitleWidth}>Proposed blocks</Td>
                      <Td isNumeric>
                        <LoadingLine loading={validator.loading}>{validator?.data?.proposedBlocksAmount || '-'}</LoadingLine>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              : <Container h={60}><ErrorMessageBlock/></Container>}
          </TableContainer>
        </GridItem>

        <GridItem height={'100%'} p={0}>
          <BlocksChart hash={hash}/>
        </GridItem>
      </Grid>

      <Container
        width={'100%'}
        maxW={'none'}
        mt={5}
        className={'InfoBlock'}
      >
        <Heading className={'InfoBlock__Title'} as={'h1'}>Proposed blocks</Heading>

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
