'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as Api from '../../../util/Api'
import Pagination from '../../../components/pagination'
import DocumentsList from '../../../components/documents/DocumentsList'
import { LoadingLine, LoadingBlock, LoadingList } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import ImageGenerator from '../../../components/imageGenerator'
import { DataContractSchema } from '../../../components/dataContracts'

import {
  Box,
  Container,
  TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  Tabs, TabList, TabPanels, Tab, TabPanel
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
        .then(res => fetchHandlerSuccess(setDataContract, res))
        .catch(err => fetchHandlerError(setDataContract, err)),
      Api.getDocumentsByDataContract(
        identifier,
        pagintationConfig.defaultPage,
        pagintationConfig.itemsOnPage.default)
        .then(res => {
          fetchHandlerSuccess(setDocuments, res)
          setTotal(res.pagination.total)
        })
        .catch(err => fetchHandlerError(setDocuments, err))
    ])
      .catch(console.error)
  }

  useEffect(fetchData, [identifier])

  const handlePageClick = ({ selected }) => {
    setDocuments(state => ({ ...state, loading: true }))
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
                        <Th isNumeric className={'TableHeader TableHeader--Name'}>
                            <div className={'TableHeader__Content'}>
                                {dataContract?.data?.name || ''}
                                {dataContract.data?.identifier
                                  ? <ImageGenerator className={'TableHeader__Avatar'} username={dataContract.data?.identifier} lightness={50} saturation={50} width={32} height={32}/>
                                  : <Box w={'32px'} h={'32px'} />
                                }
                            </div>
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td w={tdTitleWidth}>Identifier</Td>
                        <Td>
                            <LoadingLine loading={dataContract.loading}>{dataContract.data?.identifier}</LoadingLine>
                        </Td>
                    </Tr>
                    {dataContract.data?.name &&
                        <Tr>
                            <Td w={tdTitleWidth}>Name</Td>
                            <Td>
                                <LoadingLine loading={dataContract.loading}>{dataContract.data?.name}</LoadingLine>
                            </Td>
                        </Tr>
                    }
                    <Tr>
                        <Td w={tdTitleWidth}>Owner</Td>
                        <Td>
                            <LoadingLine loading={dataContract.loading}>
                              <Link href={`/identity/${dataContract.data?.owner}`}>{dataContract.data?.owner}</Link>
                            </LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>System</Td>
                        <Td>
                            <LoadingLine loading={dataContract.loading}>{dataContract.data?.isSystem ? 'true' : 'false'}</LoadingLine>
                        </Td>
                    </Tr>
                    {!dataContract.data?.isSystem &&
                        <Tr>
                            <Td w={tdTitleWidth}>Created</Td>
                            <Td>
                                <LoadingLine loading={dataContract.loading}>{new Date(dataContract.data?.timestamp).toLocaleString()}</LoadingLine>
                            </Td>
                        </Tr>
                    }
                    <Tr>
                        <Td w={tdTitleWidth}>Documents Count</Td>
                        <Td>
                            <LoadingLine loading={dataContract.loading}>{dataContract.data?.documentsCount}</LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Revision</Td>
                        <Td>
                            <LoadingLine loading={dataContract.loading}>{dataContract.data?.version}</LoadingLine>
                        </Td>
                    </Tr>
                    {!dataContract.data?.isSystem &&
                        <Tr w={tdTitleWidth}>
                            <Td>Transaction</Td>
                            <Td>
                                <LoadingLine loading={dataContract.loading}>
                                    <Link href={`/transaction/${dataContract.data?.txHash}`}>{dataContract.data?.txHash}</Link>
                                </LoadingLine>
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
                                : <LoadingList itemsCount={9}/>
                            : <Container h={20}><ErrorMessageBlock/></Container>
                            }
                            {documents.data?.resultSet?.length > 0 &&
                                <div className={'ListNavigation ListNavigation--Center'}>
                                    <Pagination
                                        onPageChange={handlePageClick}
                                        pageCount={pageCount}
                                        forcePage={currentPage}
                                    />
                                </div>
                            }
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box>
                          {!dataContract.error
                            ? <LoadingBlock loading={dataContract.loading}>
                                {dataContract.data?.schema
                                  ? <DataContractSchema schema={dataContract.data?.schema}/>
                                  : <Container h={20}><ErrorMessageBlock/></Container>}
                              </LoadingBlock>
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
