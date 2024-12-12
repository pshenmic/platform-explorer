'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import TransactionsList from '../../../components/transactions/TransactionsList'
import DocumentsList from '../../../components/documents/DocumentsList'
import DataContractsList from '../../../components/dataContracts/DataContractsList'
import TransfersList from '../../../components/transfers/TransfersList'
import { fetchHandlerSuccess, fetchHandlerError, findActiveAlias } from '../../../util'
import { LoadingList } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import './Identity.scss'
import { IdentityTotalCard } from '../../../components/identities'

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
  const { setBreadcrumbs } = useBreadcrumbs()
  const [identity, setIdentity] = useState({ data: {}, loading: true, error: false })
  const [dataContracts, setDataContracts] = useState({ data: {}, loading: true, error: false })
  const [documents, setDocuments] = useState({ data: {}, loading: true, error: false })
  const [transactions, setTransactions] = useState({ data: {}, loading: true, error: false })
  const [transfers, setTransfers] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Identities', path: '/identities' },
      { label: identifier, avatar: true }
    ])
  }, [setBreadcrumbs, identifier])

  console.log('identity', identity)
  console.log('documents', documents)
  console.log('dataContracts', dataContracts)

  // mock //

  if (!identity.error && !identity.data?.lastWithdrawal) identity.data.lastWithdrawal = '6AC5EDA942093A9275A2837CFDF2C18CAAD9D922BA211BD5EA5E6333FE904CE7'
  if (!identity.error && !identity.data?.lastWithdrawalTime) identity.data.lastWithdrawalTime = '2024-11-21T10:26:04.053Z'
  if (!identity.error && !identity.data?.fundingAddress) identity.data.fundingAddress = '=yS9GnnRdzX9W9G9kxihdgB5VovKWbPGjS1'
  if (!identity.error && !identity.data?.totalGasSpent) identity.data.totalGasSpent = 1000000
  if (!identity.error && !identity.data?.averageGasSpent) identity.data.averageGasSpent = 500000

  if (!identity.data?.publicKeys && identity.data !== null) {
    console.log('identity.data', identity.data)
    console.log('identity.data.publicKeys', identity.data.publicKeys)

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
      backLink={'/identities'}
      title={'Identity info'}
    >
      <IdentityTotalCard identity={identity} rate={rate}/>

      <InfoContainer styles={['tabs']} className={'IdentityPage__ListContainer'}>
        <Tabs onChange={(index) => setActiveTab(index)} index={activeTab}>
          <TabList>
            <Tab>Transactions {identity.data?.totalTxs !== undefined
              ? <span className={`Tabs__TabItemsCount ${identity.data?.totalTxs === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {identity.data?.totalTxs}
                </span>
              : ''}
            </Tab>
            <Tab>Data contracts {identity.data?.totalDataContracts !== undefined
              ? <span className={`Tabs__TabItemsCount ${identity.data?.totalDataContracts === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {identity.data?.totalDataContracts}
                </span>
              : ''}
            </Tab>
            <Tab>Documents {identity.data?.totalDocuments !== undefined
              ? <span className={`Tabs__TabItemsCount ${identity.data?.totalDocuments === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {identity.data?.totalDocuments}
                </span>
              : ''}
            </Tab>
            <Tab>Credit Transfers {identity.data?.totalTransfers !== undefined
              ? <span className={`Tabs__TabItemsCount ${identity.data?.totalTransfers === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>{identity.data?.totalTransfers}</span>
              : ''}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0} h={'100%'}>
              {!transactions.error
                ? !transactions.loading
                    ? <TransactionsList transactions={transactions.data?.resultSet}/>
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
