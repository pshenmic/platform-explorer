'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import TransactionsList from '../../../components/transactions/TransactionsList'
import DocumentsList from '../../../components/documents/DocumentsList'
import DataContractsList from '../../../components/dataContracts/DataContractsList'
import TransfersList from '../../../components/transfers/TransfersList'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { LoadingList } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { IdentityTotalCard } from '../../../components/identities'
import './Identity.scss'

const tabs = [
  'transactions',
  'datacontracts',
  'documents',
  'transfers'
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
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1
    ? tabs.indexOf(defaultTabName.toLowerCase())
    : tabs.indexOf(defaultTabName)
  )

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Identities', path: '/identities' },
      { label: identifier, avatar: true }
    ])
  }, [setBreadcrumbs, identifier])

  console.log('identity', identity)

  // mock //

  // if (!identity.error && !identity.data?.lastWithdrawal) identity.data.lastWithdrawal = '6AC5EDA942093A9275A2837CFDF2C18CAAD9D922BA211BD5EA5E6333FE904CE7'
  // if (!identity.error && !identity.data?.lastWithdrawalTime) identity.data.lastWithdrawalTime = '2024-11-21T10:26:04.053Z'

  // if (!identity.data?.publicKeys?.length && identity.data !== null) {
  //   identity.data.publicKeys = [
  //     {
  //       contractBounds: null,
  //       id: 0,
  //       type: 'ECDSA_SECP256K1',
  //       data: '0348a6a633850f3c83a0cb30a9fceebbaa3b9ab3f923f123d92728cef234176dc5',
  //       publicKeyHash: '07630dddc55729c043de7bdeb145ee0d44feae3b',
  //       purpose: 'AUTHENTICATION',
  //       securityLevel: 'MASTER',
  //       readOnly: false,
  //       signature: '2042186a3dec52bfe9a24ee17b98adc5efcbc0a0a6bacbc9627f1405ea5e1bb7ae2bb94a270363400969669e9884ab9967659e9a0d8de7464ee7c47552c8cb0e99'
  //     },
  //     {
  //       contractBounds: null,
  //       id: 1,
  //       type: 'ECDSA_SECP256K1',
  //       data: '034278b0d7f5e6d902ec5a30ae5c656937a0323bdc813e851eb8a2d6a1d23c51cf',
  //       publicKeyHash: 'e2615c5ef3f910ebe5ada7930e7b2c04a7ffbb23',
  //       purpose: 'AUTHENTICATION',
  //       securityLevel: 'HIGH',
  //       readOnly: true,
  //       signature: '1fbb0d0bb63d26c0d5b6e1f4b8c0eebef4d256c4e8aa933a2cb6bd6b2d8aae545215312924c7dd41c963071e2ccfe2187a8684d93c55063cb45fdd03e76344d6a4'
  //     },
  //     {
  //       contractBounds: null,
  //       id: 2,
  //       type: 'ECDSA_SECP256K1',
  //       data: '0245c3b0f0323ddbb9ddf123f939bf37296af4f38fa489aad722c50486575cd8f4',
  //       publicKeyHash: 'd53ee3b3518fee80816ab26af98a34ea60ae9af7',
  //       purpose: 'AUTHENTICATION',
  //       securityLevel: 'CRITICAL',
  //       readOnly: false,
  //       signature: '204013dcca13378b820e40cf1da77abe38662546ef0a304545de3c35845b83a7ad4b42051c2b3539c9181b3f0cb3fb4bc970db89663c6bd6ca1468568a62beaa75'
  //     }
  //   ]
  // }

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

  return (
    <PageDataContainer
      className={'IdentityPage'}
      backLink={'/identities'}
      title={'Identity info'}
    >
      <IdentityTotalCard identity={identity} rate={rate}/>

      <InfoContainer styles={['tabs']} className={'IdentityPage__ListContainer'}>
        <Tabs onChange={setActiveTab} index={activeTab}>
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
            <TabPanel>
              {!transactions.error
                ? !transactions.loading
                    ? <TransactionsList transactions={transactions.data?.resultSet}/>
                    : <LoadingList itemsCount={9}/>
                : <ErrorMessageBlock/>}
            </TabPanel>
            <TabPanel>
              {!dataContracts.error
                ? !dataContracts.loading
                    ? <DataContractsList dataContracts={dataContracts.data.resultSet}/>
                    : <LoadingList itemsCount={9}/>
                : <ErrorMessageBlock/>}
            </TabPanel>
            <TabPanel>
              {!documents.error
                ? !documents.loading
                    ? <DocumentsList documents={documents.data.resultSet} size={'m'}/>
                    : <LoadingList itemsCount={9}/>
                : <ErrorMessageBlock/>
              }
            </TabPanel>
            <TabPanel>
              {!transfers.error
                ? !transfers.loading
                    ? <TransfersList transfers={transfers.data.resultSet} identityId={identity.data?.identifier}/>
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
