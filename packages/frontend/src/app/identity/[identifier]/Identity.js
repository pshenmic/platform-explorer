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
