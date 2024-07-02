'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import Link from 'next/link'
import TransactionsList from '../../../components/transactions/TransactionsList'
import DocumentsList from '../../../components/documents/DocumentsList'
import DataContractsList from '../../../components/dataContracts/DataContractsList'
import TransfersList from '../../../components/transfers/TransfersList'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { LoadingLine, LoadingList } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import ImageGenerator from '../../../components/imageGenerator'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import './Identity.scss'

import {
  Box,
  Container,
  TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Flex
} from '@chakra-ui/react'

const tabs = [
  'transactions',
  'transfers',
  'documents',
  'datacontracts'
]

function Identity ({ identifier, defaultTabName }) {
  const [identity, setIdentity] = useState({ data: {}, loading: true, error: false })
  const [dataContracts, setDataContracts] = useState({ data: {}, loading: true, error: false })
  const [documents, setDocuments] = useState({ data: {}, loading: true, error: false })
  const [transactions, setTransactions] = useState({ data: {}, loading: true, error: false })
  const [transfers, setTransfers] = useState({ data: {}, loading: true, error: false })
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  const tdTitleWidth = 100
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))
    urlParameters.set('tab', tabs[activeTab])
    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  }, [activeTab, router, pathname, searchParams])

  const fetchData = () => {
    Promise.all([
      Api.getIdentity(identifier)
        .then(paginatedTransactions => fetchHandlerSuccess(setIdentity, paginatedTransactions))
        .catch(err => fetchHandlerError(setIdentity, err)),
      Api.getDataContractsByIdentity(identifier)
        .then(paginatedDataContracts => fetchHandlerSuccess(setDataContracts, paginatedDataContracts))
        .catch(err => fetchHandlerError(setDataContracts, err)),
      Api.getDocumentsByIdentity(identifier)
        .then(paginatedTransactions => fetchHandlerSuccess(setDocuments, paginatedTransactions))
        .catch(err => fetchHandlerError(setDocuments, err)),
      Api.getTransactionsByIdentity(identifier)
        .then(paginatedTransactions => fetchHandlerSuccess(setTransactions, paginatedTransactions))
        .catch(err => fetchHandlerError(setTransactions, err)),
      Api.getTransfersByIdentity(identifier)
        .then(paginatedTransactions => fetchHandlerSuccess(setTransfers, paginatedTransactions))
        .catch(err => fetchHandlerError(setTransfers, err))
    ])
      .catch(console.error)
  }

  useEffect(fetchData, [identifier])

  return (
    <div className={'identity'}>
        <Container
            maxW='container.xl'
            padding={3}
            mt={8}
        >
            <Flex
                w='100%'
                justifyContent='space-between'
                wrap={['wrap', 'wrap', 'wrap', 'nowrap']}
            >
                <TableContainer
                    width={['100%', '100%', '100%', 'calc(50% - 10px)']}
                    maxW='none'
                    borderWidth='1px' borderRadius='lg'
                    m={0}
                    className={'IdentityInfo'}
                  >
                    {!identity.error
                      ? <Table variant='simple' className={'Table'}>
                            <Thead>
                                <Tr>
                                    <Th pr={0}>Identity info</Th>
                                    <Th className={'TableHeader TableHeader--Name'}>
                                        {identifier
                                          ? <div className={'TableHeader__Content'}>
                                                <ImageGenerator className={'TableHeader__Avatar'} username={identifier} lightness={50} saturation={50} width={32} height={32}/>
                                            </div>
                                          : <Box w={'32px'} h={'32px'} />
                                        }
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td w={tdTitleWidth}>Identifier</Td>
                                    <Td isNumeric>
                                        <LoadingLine loading={identity.loading}>
                                            {identity.data?.identifier}
                                        </LoadingLine>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td w={tdTitleWidth}>Balance</Td>
                                    <Td isNumeric>
                                        <LoadingLine loading={identity.loading}>{identity.data?.balance} Credits</LoadingLine>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td w={tdTitleWidth}>System</Td>
                                    <Td isNumeric>
                                        <LoadingLine loading={identity.loading}>{identity.data?.isSystem ? 'true' : 'false'}</LoadingLine>
                                    </Td>
                                </Tr>

                                {!identity.data.isSystem &&
                                    <Tr>
                                        <Td w={tdTitleWidth}>Created</Td>
                                        <Td isNumeric>
                                            <LoadingLine loading={identity.loading}>
                                                <Link href={`/transaction/${identity.data?.txHash}`}>
                                                    {identity.data?.timestamp && new Date(identity.data?.timestamp).toLocaleString()}
                                                </Link>
                                            </LoadingLine>
                                        </Td>
                                    </Tr>
                                }

                                <Tr>
                                    <Td w={tdTitleWidth}>Revision</Td>
                                    <Td isNumeric>
                                        <LoadingLine loading={identity.loading}>{identity.data?.revision}</LoadingLine>
                                    </Td>
                                </Tr>

                                {!identity.data?.isSystem &&
                                    <Tr>
                                        <Td w={tdTitleWidth}>Transactions</Td>
                                        <Td isNumeric>
                                            <LoadingLine loading={identity.loading}>{identity.data?.totalTxs}</LoadingLine>
                                        </Td>
                                    </Tr>
                                }

                                <Tr>
                                    <Td w={tdTitleWidth}>Transfers</Td>
                                    <Td isNumeric>
                                        <LoadingLine loading={identity.loading}>{identity.data?.totalTransfers}</LoadingLine>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td w={tdTitleWidth}>Documents</Td>
                                    <Td isNumeric>
                                        <LoadingLine loading={identity.loading}>{identity.data?.totalDocuments}</LoadingLine>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td w={tdTitleWidth}>Data contracts</Td>
                                    <Td isNumeric>
                                        <LoadingLine loading={identity.loading}>{identity.data?.totalDataContracts}</LoadingLine>
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
                      : <Container h={60}><ErrorMessageBlock/></Container>}
                </TableContainer>

                <Box w={5} h={5} />

                <Container
                  width={['100%', '100%', '100%', 'calc(50% - 10px)']}
                  maxW='none'
                  m={0}
                  borderWidth='1px' borderRadius='lg'
                  className={'InfoBlock'}
                >
                    <Tabs
                      className={'IdentityData'}
                      h={'100%'}
                      display={'flex'}
                      flexDirection={'column'}
                      defaultIndex={activeTab}
                      onChange={setActiveTab}
                    >
                        <TabList className={'IdentityData__Tabs'}>
                            <Tab className={'IdentityData__Tab'}>Transactions</Tab>
                            <Tab className={'IdentityData__Tab'}>Transfers</Tab>
                            <Tab className={'IdentityData__Tab'}>Documents</Tab>
                            <Tab className={'IdentityData__Tab'}>Data contracts</Tab>
                        </TabList>

                        <TabPanels flexGrow={1}>
                            <TabPanel px={0} h={'100%'}>
                              {!transactions.error
                                ? !transactions.loading
                                    ? <TransactionsList transactions={transactions.data.resultSet} size='m'/>
                                    : <LoadingList itemsCount={9}/>
                                : <ErrorMessageBlock/>}
                            </TabPanel>

                            <TabPanel px={0} h={'100%'}>
                              {!transfers.error
                                ? !transfers.loading
                                    ? <TransfersList transfers={transfers.data.resultSet} identityId={identity.identifier}/>
                                    : <LoadingList itemsCount={9}/>
                                : <ErrorMessageBlock/>}
                            </TabPanel>

                            <TabPanel px={0} h={'100%'}>
                              {!documents.error
                                ? !documents.loading
                                    ? <DocumentsList documents={documents.data.resultSet} size='m'/>
                                    : <LoadingList itemsCount={9}/>
                                : <ErrorMessageBlock/>}
                            </TabPanel>

                            <TabPanel px={0} h={'100%'}>
                              {!dataContracts.error
                                ? !dataContracts.loading
                                    ? <DataContractsList dataContracts={dataContracts.data.resultSet} size='m'/>
                                    : <LoadingList itemsCount={9}/>
                                : <ErrorMessageBlock/>}
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Container>
            </Flex>
        </Container>
    </div>
  )
}

export default Identity
