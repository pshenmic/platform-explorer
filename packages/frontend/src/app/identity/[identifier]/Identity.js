'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
// import Link from 'next/link'
import TransactionsList from '../../../components/transactions/TransactionsList'
import DocumentsList from '../../../components/documents/DocumentsList'
import DataContractsList from '../../../components/dataContracts/DataContractsList'
import TransfersList from '../../../components/transfers/TransfersList'
import { fetchHandlerSuccess, fetchHandlerError, findActiveAlias } from '../../../util'
// import { LoadingLine, LoadingList } from '../../../components/loading'
import { LoadingList } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
// import ImageGenerator from '../../../components/imageGenerator'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
// import { Credits, Alias, InfoLine, Identifier, DateBlock, CreditsBlock } from '../../../components/data'
import { Alias, InfoLine, CreditsBlock, Identifier, DateBlock } from '../../../components/data'
import IdentityDigestCard from './IdentityDigestCard'
import AliasesList from './AliasesList'
// import { RateTooltip } from '../../../components/ui/Tooltips'
import {
  // Box,
  // Container,
  // Flex,
  Tabs, TabList, TabPanels, Tab, TabPanel, Button
} from '@chakra-ui/react'
// import BlocksChart from '../../validator/[hash]/BlocksChart'
import { PublicKeysList } from '../../../components/publicKeys'
import { InfoContainer, PageDataContainer, ValueContainer } from '../../../components/ui/containers'
import './Identity.scss'
import './IdentityTotalCard.scss'
import ImageGenerator from '../../../components/imageGenerator'
import { HorisontalSeparator } from '../../../components/ui/separators'

const tabs = [
  'transactions',
  'transfers',
  'documents',
  'datacontracts'
]

const defaultTabName = 'transactions'

function Identity ({ identifier }) {
  const [identity, setIdentity] = useState({ data: {}, loading: true, error: false })
  const [dataContracts, setDataContracts] = useState({ data: {}, loading: true, error: false })
  const [documents, setDocuments] = useState({ data: {}, loading: true, error: false })
  const [transactions, setTransactions] = useState({ data: {}, loading: true, error: false })
  const [transfers, setTransfers] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeAlias = findActiveAlias(identity.data.aliases)

  console.log('identity', identity)

  if (!identity.data?.publicKeys) {
    identity.data.publicKeys = [
      {
        contractBounds: {
          type: 'documentType',
          id: '3Fq4GuFDSaPm7qN2rG8chtif6jgZnqyY48rw9caUMGo6',
          typeName: 'contact'
        },
        id: 5,
        type: 'ECDSA_SECP256K1',
        data: '023b63a7e2321db63f5dbd26e08e3aa1da974404fd6b9303903195be10fe12e2b0',
        publicKeyHash: 'aefbbefbbf99eee9e134c0657a13651a5692e98d',
        purpose: 'ENCRYPTION',
        securityLevel: 'MEDIUM',
        readOnly: false,
        signature: '1f58d5c8ee4e87e6d6fffcfebcaadc030599cc4e18e41f3d7f78bd993666e146973beb1ca57e0366eceef0510e3b55a97db765110d4ff07b9653db237d8a021d51'
      },
      {
        contractBounds: {
          type: 'documentType',
          id: '3Fq4GuFDSaPm7qN2rG8chtif6jgZnqyY48rw9caUMGo6',
          typeName: 'contact'
        },
        id: 6,
        type: 'ECDSA_SECP256K1',
        data: '026e9189c76f667c774da971d5eacee575acfd747c3ea6ca8af3636f93ac871f73',
        publicKeyHash: '56db223d9e394d9a15db5064f9e19be3c40d20ff',
        purpose: 'DECRYPTION',
        securityLevel: 'MEDIUM',
        readOnly: false,
        signature: '1fd753dbf431f8be55fe5545678c05ca81a1b3cfb676ff85fe22caf0042b2ad84b437c203bf16ead8d3f62f74d832d6ca8a492804340d356f1d003856ca50f170a'
      }
    ]
  }

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

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
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

    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  }, [activeTab, router, pathname])

  console.log('identity', identity)

  return (
    <PageDataContainer
      className={'IdentityPage'}
      backLink={'/validators'}
      title={'Identity info'}
    >
      <div className={`InfoBlock InfoBlock--Gradient IdentityPage__CommonInfo IdentityTotalCard ${identity.loading ? 'IdentityTotalCard--Loading' : ''} `}>
        {activeAlias &&
          <div className={'IdentityTotalCard__Title'}>
            <Alias>{activeAlias.alias}</Alias>
          </div>
        }

        <div className={'IdentityTotalCard__ContentContainer'}>
          <div className={'IdentityTotalCard__Column'}>
            <div className={'IdentityTotalCard__Header'}>
              <div className={'IdentityTotalCard__Avatar'}>
                {!identity.error
                  ? <ImageGenerator
                    username={identity.data.identifier}
                    lightness={50}
                    saturation={50}
                    width={88}
                    height={88}/>
                  : 'n/a'
                }
              </div>
              <div className={'IdentityTotalCard__HeaderLines'}>
                <InfoLine
                  title={'Identifier'}
                  loading={identity.loading}
                  error={identity.error || (!identity.loading && !identity.data?.identifier)}
                  value={(
                    <Identifier
                      copyButton={true}
                      styles={['highlight-both']}
                      ellipsis={false}
                    >
                      {identity.data?.identifier}
                    </Identifier>
                  )}
                />
                <InfoLine
                  title={'Balance'}
                  value={<CreditsBlock credits={identity.data?.balance} rate={rate}/>}
                  loading={identity.loading}
                  error={identity.error || !identity.data?.balance}
                />
              </div>
            </div>

            <HorisontalSeparator className={'ValidatorCard__Separator'}/>

            <div>
              <InfoLine
                title={'Revision'}
                loading={identity.loading}
                error={identity.error || (!identity.loading && !identity.data?.revision)}
                value={identity.data?.revision}
              />
              <InfoLine
                title={'Creation date'}
                loading={identity.loading}
                error={identity.error || (!identity.loading && !identity.data?.timestamp)}
                value={<DateBlock timestamp={identity.data?.timestamp}/>}
              />
              <InfoLine
                title={'Identities names'}
                loading={identity.loading}
                error={identity.error || (!identity.loading && identity.data?.aliases === undefined)}
                value={identity.data?.aliases?.length
                  ? <AliasesList aliases={identity.data?.aliases}/>
                  : <ValueContainer className={'ValidatorCard__ZeroListBadge'}>none</ValueContainer>
                }
              />

              <InfoLine
                title={'Public Keys'}
                loading={identity.loading}
                error={identity.error}
                value={<Button>Show Public keys</Button>}
              />
            </div>

          </div>

          <div className={'IdentityTotalCard__Column'}>
            <IdentityDigestCard identity={identity} rate={rate} className={'IdentityTotalCard__Digest'}/>
          </div>
        </div>

        <PublicKeysList publicKeys={identity.data?.publicKeys}/>
      </div>

        <InfoContainer styles={['tabs']} className={'IdentityPage__ListContainer'}>
          <Tabs onChange={(index) => setActiveTab(index)} index={activeTab}>
            <TabList>
              <Tab>Transactions {identity.data?.totalTxs !== undefined ? `(${identity.data.totalTxs})` : ''}</Tab>
              <Tab>Data contracts {identity.data?.totalDataContracts !== undefined ? `(${identity.data.totalDataContracts})` : ''}</Tab>
              <Tab>Documents {identity.data?.totalDocuments !== undefined ? `(${identity.data.totalDocuments})` : ''}</Tab>
              <Tab>Credit Transfers {identity.data?.totalTransfers !== undefined ? `(${identity.data.totalTransfers})` : ''}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0} h={'100%'}>
                {!transactions.error
                  ? !transactions.loading
                      ? <TransactionsList transactions={transactions.data.resultSet}/>
                      : <LoadingList itemsCount={9}/>
                  : <ErrorMessageBlock/>}
              </TabPanel>

              <TabPanel px={0} h={'100%'}>
                {!dataContracts.error
                  ? !dataContracts.loading
                      ? <DataContractsList dataContracts={dataContracts.data.resultSet}/>
                      : <LoadingList itemsCount={9}/>
                  : <ErrorMessageBlock/>}
              </TabPanel>

              <TabPanel px={0} h={'100%'}>
                {!documents.error
                  ? !documents.loading
                      ? <DocumentsList documents={documents.data.resultSet} size={'m'}/>
                      : <LoadingList itemsCount={9}/>
                  : <ErrorMessageBlock/>
                }
              </TabPanel>

              <TabPanel px={0} h={'100%'}>
                {!transfers.error
                  ? !transfers.loading
                      ? <TransfersList transfers={transfers.data.resultSet} identityId={identity.identifier}/>
                      : <LoadingList itemsCount={9}/>
                  : <ErrorMessageBlock/>}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </InfoContainer>
    </PageDataContainer>
  )

  // return (
  //   <div className={'Identity'}>
  //       <Container
  //         maxW={'container.xl'}
  //         padding={3}
  //         mt={8}
  //       >
  //           <Flex
  //             w={'100%'}
  //             justifyContent={'space-between'}
  //             wrap={['wrap', 'wrap', 'wrap', 'nowrap']}
  //           >
  //               <TableContainer
  //                 width={['100%', '100%', '100%', 'calc(50% - 10px)']}
  //                 maxW={'none'}
  //                 borderWidth={'1px'} borderRadius={'block'}
  //                 m={0}
  //                 className={'IdentityInfo'}
  //               >
  //                   {!identity.error
  //                     ? <Table variant={'simple'} className={'Table'}>
  //                           <Thead>
  //                               <Tr>
  //                                   <Th pr={0}>Identity info</Th>
  //                                   <Th className={'TableHeader TableHeader--Name'}>
  //                                       {identifier
  //                                         ? <div className={'TableHeader__Content'}>
  //                                               <ImageGenerator className={'TableHeader__Avatar'} username={identifier} lightness={50} saturation={50} width={32} height={32}/>
  //                                           </div>
  //                                         : <Box w={'32px'} h={'32px'} />
  //                                       }
  //                                   </Th>
  //                               </Tr>
  //                           </Thead>
  //                           <Tbody>
  //                               <Tr>
  //                                   <Td w={tdTitleWidth}>Identifier</Td>
  //                                   <Td isNumeric className={'Table__Cell--BreakWord'}>
  //                                       <LoadingLine loading={identity.loading}>
  //                                         {identity.data?.identifier}
  //                                       </LoadingLine>
  //                                   </Td>
  //                               </Tr>
  //                               {identity?.data?.aliases?.length > 0 &&
  //                                 <Tr>
  //                                   <Td w={tdTitleWidth}>Names</Td>
  //                                   <Td isNumeric className={'Table__Cell--BreakWord'}>
  //                                     <LoadingLine loading={identity.loading}>
  //                                       <div className={'IdentityInfo__AliasesContainer'}>
  //                                       {identity?.data.aliases.map((alias, i) => (
  //                                         <Alias alias={alias.alias || alias} key={i}/>
  //                                       ))}
  //                                       </div>
  //                                     </LoadingLine>
  //                                   </Td>
  //                                 </Tr>
  //                               }
  //                               <Tr>
  //                                   <Td w={tdTitleWidth}>Balance</Td>
  //                                   <Td isNumeric>
  //                                     <LoadingLine loading={identity.loading}>
  //                                       <RateTooltip
  //                                         credits={identity.data?.balance}
  //                                         rate={rate.data}
  //                                       >
  //                                         <span><Credits>{identity.data?.balance}</Credits> Credits</span>
  //                                       </RateTooltip>
  //                                     </LoadingLine>
  //                                   </Td>
  //                               </Tr>
  //                               <Tr>
  //                                   <Td w={tdTitleWidth}>System</Td>
  //                                   <Td isNumeric>
  //                                       <LoadingLine loading={identity.loading}>{identity.data?.isSystem ? 'true' : 'false'}</LoadingLine>
  //                                   </Td>
  //                               </Tr>
  //
  //                               {!identity.data.isSystem &&
  //                                   <Tr>
  //                                       <Td w={tdTitleWidth}>Created</Td>
  //                                       <Td isNumeric>
  //                                           <LoadingLine loading={identity.loading}>
  //                                               <Link href={`/transaction/${identity.data?.txHash}`}>
  //                                                   {identity.data?.timestamp && new Date(identity.data?.timestamp).toLocaleString()}
  //                                               </Link>
  //                                           </LoadingLine>
  //                                       </Td>
  //                                   </Tr>
  //                               }
  //
  //                               <Tr>
  //                                   <Td w={tdTitleWidth}>Revision</Td>
  //                                   <Td isNumeric>
  //                                       <LoadingLine loading={identity.loading}>{identity.data?.revision}</LoadingLine>
  //                                   </Td>
  //                               </Tr>
  //
  //                               {!identity.data?.isSystem &&
  //                                   <Tr>
  //                                       <Td w={tdTitleWidth}>Transactions</Td>
  //                                       <Td isNumeric>
  //                                           <LoadingLine loading={identity.loading}>{identity.data?.totalTxs}</LoadingLine>
  //                                       </Td>
  //                                   </Tr>
  //                               }
  //
  //                               <Tr>
  //                                   <Td w={tdTitleWidth}>Transfers</Td>
  //                                   <Td isNumeric>
  //                                       <LoadingLine loading={identity.loading}>{identity.data?.totalTransfers}</LoadingLine>
  //                                   </Td>
  //                               </Tr>
  //                               <Tr>
  //                                   <Td w={tdTitleWidth}>Documents</Td>
  //                                   <Td isNumeric>
  //                                       <LoadingLine loading={identity.loading}>{identity.data?.totalDocuments}</LoadingLine>
  //                                   </Td>
  //                               </Tr>
  //                               <Tr>
  //                                   <Td w={tdTitleWidth}>Data contracts</Td>
  //                                   <Td isNumeric>
  //                                       <LoadingLine loading={identity.loading}>{identity.data?.totalDataContracts}</LoadingLine>
  //                                   </Td>
  //                               </Tr>
  //                           </Tbody>
  //                       </Table>
  //                     : <Container h={60}><ErrorMessageBlock/></Container>}
  //               </TableContainer>
  //
  //               <Box w={5} h={5} />
  //
  //               <Container
  //                 width={['100%', '100%', '100%', 'calc(50% - 10px)']}
  //                 maxW={'none'}
  //                 m={0}
  //                 className={'InfoBlock'}
  //               >
  //                   <Tabs
  //                     className={'IdentityData'}
  //                     h={'100%'}
  //                     display={'flex'}
  //                     flexDirection={'column'}
  //                     index={activeTab}
  //                     onChange={setActiveTab}
  //                   >
  //                       <TabList className={'IdentityData__Tabs'}>
  //                           <Tab className={'IdentityData__Tab'}>Transactions</Tab>
  //                           <Tab className={'IdentityData__Tab'}>Transfers</Tab>
  //                           <Tab className={'IdentityData__Tab'}>Documents</Tab>
  //                           <Tab className={'IdentityData__Tab'}>Data contracts</Tab>
  //                       </TabList>
  //
  //                       <TabPanels flexGrow={1}>
  //                           <TabPanel px={0} h={'100%'}>
  //                             {!transactions.error
  //                               ? !transactions.loading
  //                                   ? <TransactionsList transactions={transactions.data.resultSet}/>
  //                                   : <LoadingList itemsCount={9}/>
  //                               : <ErrorMessageBlock/>}
  //                           </TabPanel>
  //
  //                           <TabPanel px={0} h={'100%'}>
  //                             {!transfers.error
  //                               ? !transfers.loading
  //                                   ? <TransfersList transfers={transfers.data.resultSet} identityId={identity.identifier}/>
  //                                   : <LoadingList itemsCount={9}/>
  //                               : <ErrorMessageBlock/>}
  //                           </TabPanel>
  //
  //                           <TabPanel px={0} h={'100%'}>
  //                             {!documents.error
  //                               ? !documents.loading
  //                                   ? <DocumentsList documents={documents.data.resultSet} size={'m'}/>
  //                                   : <LoadingList itemsCount={9}/>
  //                               : <ErrorMessageBlock/>}
  //                           </TabPanel>
  //
  //                           <TabPanel px={0} h={'100%'}>
  //                             {!dataContracts.error
  //                               ? !dataContracts.loading
  //                                   ? <DataContractsList dataContracts={dataContracts.data.resultSet} size={'m'}/>
  //                                   : <LoadingList itemsCount={9}/>
  //                               : <ErrorMessageBlock/>}
  //                           </TabPanel>
  //                       </TabPanels>
  //                   </Tabs>
  //               </Container>
  //           </Flex>
  //       </Container>
  //   </div>
  // )
}

export default Identity
