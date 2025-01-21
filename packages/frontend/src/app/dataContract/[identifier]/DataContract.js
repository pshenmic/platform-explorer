'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as Api from '../../../util/Api'
import DocumentsList from '../../../components/documents/DocumentsList'
import { LoadingLine, LoadingBlock } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import ImageGenerator from '../../../components/imageGenerator'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CodeBlock } from '../../../components/data'
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

const tabs = [
  'documents',
  'schema'
]

const defaultTabName = 'documents'

function DataContract ({ identifier }) {
  const [dataContract, setDataContract] = useState({ data: {}, loading: true, error: false })
  const [documents, setDocuments] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const pageSize = pagintationConfig.itemsOnPage.default
  const [total, setTotal] = useState(1)
  const [currentPage, setCurrentPage] = useState(0)
  const pageCount = Math.ceil(total / pageSize)
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  const tdTitleWidth = 250
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fetchData = () => {
    Promise.all([
      Api.getDataContractByIdentifier(identifier)
        .then(res => fetchHandlerSuccess(setDataContract, res))
        .catch(err => fetchHandlerError(setDataContract, err)),
      Api.getDocumentsByDataContract(
        identifier,
        pagintationConfig.defaultPage,
        pageSize)
        .then(res => {
          fetchHandlerSuccess(setDocuments, res)
          setTotal(res.pagination.total)
        })
        .catch(err => fetchHandlerError(setDocuments, err))
    ])
      .catch(console.error)
  }

  useEffect(fetchData, [identifier])

  useEffect(() => {
    const tab = searchParams.get('tab')

    if (tab && tabs.indexOf(tab.toLowerCase()) !== -1) {
      setActiveTab(tabs.indexOf(tab.toLowerCase()))
      return
    }

    setActiveTab(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  }, [searchParams])

  useEffect(() => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))

    if (activeTab === tabs.indexOf(defaultTabName.toLowerCase()) ||
       (tabs.indexOf(defaultTabName.toLowerCase()) === -1 && activeTab === 0)) {
      urlParameters.delete('tab')
    } else {
      urlParameters.set('tab', tabs[activeTab])
    }

    router.replace(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  }, [activeTab])

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
            borderWidth={'1px'} borderRadius={'block'}
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
                        <Td className={'Table__Cell--BreakWord Table__Cell--Mono'}>
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
                        <Td className={'Table__Cell--BreakWord Table__Cell--Mono'}>
                            <LoadingLine loading={dataContract.loading}>
                              {dataContract.data?.isSystem
                                ? dataContract.data?.owner
                                : <Link href={`/identity/${dataContract.data?.owner}`}>{dataContract.data?.owner}</Link>
                              }
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
                            <Td className={'Table__Cell--BreakWord Table__Cell--Mono'}>
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
            className={'InfoBlock'}
            p={0}
        >
            <Tabs
              onChange={setActiveTab}
              index={activeTab}
            >
                <TabList>
                    <Tab>Documents</Tab>
                    <Tab>Schema</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel p={0}>
                        <Box>
                          {!documents.error
                            ? <Box mt={4}>
                                <DocumentsList
                                  documents={documents.data.resultSet}
                                  loading={documents.loading}
                                  pagination={{
                                    onPageChange: handlePageClick,
                                    pageCount,
                                    forcePage: currentPage
                                  }}
                                />
                              </Box>
                            : <Container h={20}><ErrorMessageBlock/></Container>
                          }
                        </Box>
                    </TabPanel>
                    <TabPanel px={0}>
                        <Box>
                          {!dataContract.error
                            ? <LoadingBlock loading={dataContract.loading}>
                                {dataContract.data?.schema
                                  ? <CodeBlock code={dataContract.data?.schema}/>
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
