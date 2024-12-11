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
import { InfoContainer, PageDataContainer, ValueContainer, SmoothSize } from '../../../components/ui/containers'
import './Identity.scss'
import './IdentityTotalCard.scss'
import ImageGenerator from '../../../components/imageGenerator'
import { HorisontalSeparator } from '../../../components/ui/separators'
import { ChevronIcon } from '../../../components/ui/icons'

const tabs = [
  'transactions',
  'transfers',
  'documents',
  'datacontracts'
]

const defaultTabName = 'transactions'

function Identity ({ identifier }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [identity, setIdentity] = useState({ data: {}, loading: true, error: false })
  const [dataContracts, setDataContracts] = useState({ data: {}, loading: true, error: false })
  const [documents, setDocuments] = useState({ data: {}, loading: true, error: false })
  const [transactions, setTransactions] = useState({ data: {}, loading: true, error: false })
  const [transfers, setTransfers] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const activeAlias = findActiveAlias(identity.data.aliases)
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  const [showPublicKeys, setShowPublicKeys] = useState(false)

  console.log('identity', identity)

  if (!identity.data?.publicKeys) {
    identity.data.publicKeys = [
      {
        contractBounds: {
          type: 'documentType',
          id: '3LSLuooomkZVVUgT8oDejK92jzcgroqyrMemVC5NX5P5',
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
          id: '3LSLuooomkZVVUgT8oDejK92jzcgroqyrMemVC5NX5P5',
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

  // identity.data.publicKeys = []

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
  }, [activeTab, router, pathname, searchParams])

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
                  className={'IdentityTotalCard__InfoLine IdentityTotalCard__InfoLine--Identifier'}
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
                  className={'IdentityTotalCard__InfoLine IdentityTotalCard__InfoLine--Balance'}
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
                className={'IdentityTotalCard__InfoLine'}
                title={'Revision'}
                value={identity.data?.revision}
                loading={identity.loading}
                error={identity.error || (!identity.loading && !identity.data?.revision)}
              />
              <InfoLine
                className={'IdentityTotalCard__InfoLine'}
                title={'Creation date'}
                value={<DateBlock timestamp={identity.data?.timestamp}/>}
                loading={identity.loading}
                error={identity.error || (!identity.loading && !identity.data?.timestamp)}
              />
              <InfoLine
                className={'IdentityTotalCard__InfoLine IdentityTotalCard__InfoLine--Names'}
                title={'Identities names'}
                value={identity.data?.aliases?.length
                  ? <AliasesList aliases={identity.data?.aliases}/>
                  : <ValueContainer className={'ValidatorCard__ZeroListBadge'}>none</ValueContainer>
                }
                loading={identity.loading}
                error={identity.error || (!identity.loading && identity.data?.aliases === undefined)}
              />
              <InfoLine
                className={'IdentityTotalCard__InfoLine'}
                title={'Public Keys'}
                value={(
                  <Button
                    className={'IdentityTotalCard__PublicKeysShowButton'}
                    size={'sm'}
                    variant={showPublicKeys && identity.data?.publicKeys?.length > 0 ? 'gray' : 'blue'}
                    onClick={() => setShowPublicKeys(prev => !prev)}
                  >
                    {identity.data?.publicKeys?.length !== undefined ? identity.data?.publicKeys?.length : ''} public keys
                    <ChevronIcon ml={'4px'} h={'10px'} w={'10px'} transform={`rotate(${showPublicKeys ? '-90deg' : '90deg'})`}/>
                  </Button>
                )}
                loading={identity.loading}
                error={identity.error || (!identity.loading && identity.data?.publicKeys === undefined)}
              />
            </div>
          </div>

          <div className={'IdentityTotalCard__Column'}>
            <IdentityDigestCard identity={identity} rate={rate} className={'IdentityTotalCard__Digest'}/>
          </div>
        </div>
        <SmoothSize className={'IdentityTotalCard__PublicKeysListContainer'}>
          {identity.data?.publicKeys?.length > 0 &&
            <PublicKeysList
              className={`IdentityTotalCard__PublicKeysList ${showPublicKeys ? 'IdentityTotalCard__PublicKeysList--Show' : ''}`}
              publicKeys={identity.data?.publicKeys}
            />
          }
        </SmoothSize>
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
}

export default Identity
