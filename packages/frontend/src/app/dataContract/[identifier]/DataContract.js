'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as Api from '../../../util/Api'
import Pagination from '../../../components/pagination'
import DocumentsList from '../../../components/documents/DocumentsList'
import { LoadingLine, LoadingBlock } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import { ListLoadingPreview } from '../../../components/lists'
import './DataContract.scss'

import {
  Box,
  Container,
  TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Code
} from '@chakra-ui/react'

const pagintationConfig = {
  itemsOnPage: {
    default: 10,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function DataContract ({ identifier }) {
  const [dataContract, setDataContract] = useState({ data: {}, loading: true, error: false })
  const [documents, setDocuments] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const pageSize = pagintationConfig.itemsOnPage.default
  const [total, setTotal] = useState(1)
  const [currentPage, setCurrentPage] = useState(0)
  const pageCount = Math.ceil(total / pageSize)
  const tdTitleWidth = 250

  const fetchData = () => {
    Promise.all([
      Api.getDataContractByIdentifier(identifier)
        .then(res => setDataContract({ data: res, loading: false, error: false }))
        .catch(err => {
          console.error(err)
          setDataContract({ data: null, loading: false, error: true })
        }),
      Api.getDocumentsByDataContract(
        identifier,
        pagintationConfig.defaultPage,
        pagintationConfig.itemsOnPage.default)
        .then(res => {
          setDocuments({ data: res, loading: false, error: false })
          setTotal(res.pagination.total)
        })
        .catch(err => {
          console.error(err)
          setDocuments({ data: null, loading: false, error: true })
        })
    ])
      .catch(console.error)
  }

  useEffect(fetchData, [identifier])

  const handlePageClick = ({ selected }) => {
    setDataContract(state => ({ ...state, loading: true }))
    setCurrentPage(selected)

    Api.getDocumentsByDataContract(
      identifier,
      selected + 1,
      pagintationConfig.itemsOnPage.default)
      .then(res => setDocuments({ data: res, loading: false, error: false }))
      .catch(err => {
        console.error(err)
        setDocuments({ data: null, loading: false, error: true })
      })
  }

  return (
    <Container
        maxW={'container.lg'}
        padding={3}
        mt={8}
        className={'DataContract'}
    >
        <TableContainer
            maxW={'none'}
            borderWidth={'1px'} borderRadius={'lg'}
        >
          {!dataContract.error
            ? <Table variant={'simple'}>
                <Thead>
                    <Tr>
                        <Th>Data contract info</Th>
                        <Th></Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td w={tdTitleWidth}>Identifier</Td>
                        <Td>
                            {!dataContract.loading
                              ? dataContract.data.identifier
                              : <LoadingLine/>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Owner</Td>
                        <Td>
                            {!dataContract.loading
                              ? <Link href={`/identity/${dataContract.data.owner}`}>{dataContract.data.owner}</Link>
                              : <LoadingLine/>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>System</Td>
                        <Td>
                          {!dataContract.loading
                            ? dataContract.data.isSystem ? 'true' : 'false'
                            : <LoadingLine/>}
                        </Td>
                    </Tr>
                    {!dataContract.data.isSystem &&
                        <Tr>
                            <Td w={tdTitleWidth}>Created</Td>
                            <Td>
                              {!dataContract.loading
                                ? new Date(dataContract.data.timestamp).toLocaleString()
                                : <LoadingLine/>}
                            </Td>
                        </Tr>
                    }
                    <Tr>
                        <Td w={tdTitleWidth}>Documents Count</Td>
                        <Td>
                          {!dataContract.loading
                            ? dataContract.data.documentsCount
                            : <LoadingLine/>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Revision</Td>
                        <Td>
                          {!dataContract.loading
                            ? dataContract.data.version
                            : <LoadingLine/>}
                        </Td>
                    </Tr>
                    {!dataContract.data.isSystem &&
                        <Tr w={tdTitleWidth}>
                            <Td>Transaction</Td>
                            <Td>
                              {!dataContract.loading
                                ? <Link href={`/transaction/${dataContract.data.txHash}`}>{dataContract.data.txHash}</Link>
                                : <LoadingLine/>}
                            </Td>
                        </Tr>
                    }
                </Tbody>
              </Table>
            : <Container h={60}><ErrorMessageBlock/></Container>}
        </TableContainer>

        <Container
            width={'100%'}
            maxW={'none'}
            mt={5}
            borderWidth={'1px'} borderRadius={'lg'}
            className={'InfoBlock'}
        >
            <Tabs>
                <TabList>
                    <Tab>Documents</Tab>
                    <Tab>Schema</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <Box>
                          {!documents.error
                            ? !documents.loading
                                ? <Box m={4}>
                                    <DocumentsList
                                        documents={documents.data.resultSet}
                                        columnsCount={2}
                                    />
                                </Box>
                                : <ListLoadingPreview itemsCount={5}/>
                            : <Container h={20}><ErrorMessageBlock/></Container>
                            }
                            <div className={'ListNavigation ListNavigation--Center'}>
                                <Pagination
                                    onPageChange={handlePageClick}
                                    pageCount={pageCount}
                                    forcePage={currentPage}
                                />
                            </div>
                        </Box>
                    </TabPanel>

                    <TabPanel>
                        <Box>
                          {!dataContract.error
                            ? !dataContract.loading
                                ? <div className={'DataContractSchema'}>
                                    <Code
                                        className={'DataContractSchema__Code'}
                                        borderRadius={'lg'}
                                        p={4}
                                        w={'100%'}
                                    >
                                        {JSON.stringify(JSON.parse(dataContract.data.schema), null, 2)}
                                    </Code>
                                  </div>
                                : <LoadingBlock h={'250px'}/>
                            : <Container h={20}><ErrorMessageBlock/></Container>
                          }
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Container>
    </Container>
  )
}

export default DataContract
