'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import TransactionsList from '../../../components/transactions/TransactionsList'
import DocumentsList from '../../../components/documents/DocumentsList'
import DataContractsList from '../../../components/dataContracts/DataContractsList'
import TransfersList from '../../../components/transfers/TransfersList'
import { fetchHandlerSuccess, fetchHandlerError, paginationHandler, setLoadingProp } from '../../../util'
import { ErrorMessageBlock } from '../../../components/Errors'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { IdentityTotalCard } from '../../../components/identities'
import TokensList from '../../../components/tokens/TokensList'
import './Identity.scss'

const tabs = [
  'transactions',
  'datacontracts',
  'documents',
  'transfers',
  'tokens'
]

const defaultTabName = 'transactions'

function Identity ({ identifier }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [identity, setIdentity] = useState({ data: {}, loading: true, error: false })
  const [dataContracts, setDataContracts] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [documents, setDocuments] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [tokens, setTokens] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [transactions, setTransactions] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [transfers, setTransfers] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const pageSize = 10
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

  useEffect(() => {
    Api.getIdentity(identifier)
      .then(paginatedTransactions => fetchHandlerSuccess(setIdentity, paginatedTransactions))
      .catch(err => fetchHandlerError(setIdentity, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }, [identifier])

  useEffect(() => {
    if (!identifier) return
    setLoadingProp(setTransactions)

    Api.getTransactionsByIdentity(identifier, transactions.props.currentPage + 1, pageSize, 'desc')
      .then(paginatedDataContracts => fetchHandlerSuccess(setTransactions, paginatedDataContracts))
      .catch(err => fetchHandlerError(setTransactions, err))
  }, [identifier, transactions.props.currentPage])

  useEffect(() => {
    if (!identifier) return
    setLoadingProp(setDataContracts)

    Api.getDataContractsByIdentity(identifier, dataContracts.props.currentPage + 1, pageSize, 'desc')
      .then(paginatedDataContracts => fetchHandlerSuccess(setDataContracts, paginatedDataContracts))
      .catch(err => fetchHandlerError(setDataContracts, err))
  }, [identifier, dataContracts.props.currentPage])

  useEffect(() => {
    if (!identifier) return
    setLoadingProp(setTransfers)

    Api.getTransfersByIdentity(identifier, transfers.props.currentPage + 1, pageSize, 'desc')
      .then(paginatedDataContracts => fetchHandlerSuccess(setTransfers, paginatedDataContracts))
      .catch(err => fetchHandlerError(setTransfers, err))
  }, [identifier, transfers.props.currentPage])

  useEffect(() => {
    if (!identifier) return
    setLoadingProp(setDocuments)

    Api.getDocumentsByIdentity(identifier, documents.props.currentPage + 1, pageSize, 'desc')
      .then(paginatedDataContracts => fetchHandlerSuccess(setDocuments, paginatedDataContracts))
      .catch(err => fetchHandlerError(setDocuments, err))
  }, [identifier, documents.props.currentPage])

  useEffect(() => {
    if (!identifier) return
    setLoadingProp(setTokens)

    Api.getTokensByIdentity(identifier, tokens.props.currentPage + 1, pageSize, 'desc')
      .then(paginatedDataContracts => fetchHandlerSuccess(setTokens, paginatedDataContracts))
      .catch(err => fetchHandlerError(setTokens, err))
  }, [identifier, tokens.props.currentPage])

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
  }, [activeTab, router, pathname])

  return (
    <PageDataContainer
      className={'IdentityPage'}
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
              ? <span className={`Tabs__TabItemsCount ${identity.data?.totalTransfers === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {identity.data?.totalTransfers}
                </span>
              : ''}
            </Tab>
            <Tab>Tokens {tokens.data?.pagination?.total !== undefined
              ? <span className={`Tabs__TabItemsCount ${tokens.data?.pagination?.total === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {Math.max(tokens.data?.pagination?.total, 0)}
                </span>
              : ''}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {!transactions.error
                ? <TransactionsList
                    transactions={transactions.data?.resultSet}
                    pagination={{
                      onPageChange: pagination => paginationHandler(setTransactions, pagination.selected),
                      pageCount: Math.ceil(transactions.data?.pagination?.total / pageSize) || 1,
                      forcePage: transactions?.props?.currentPage
                    }}
                    loading={transactions.loading}
                    itemsCount={pageSize}
                  />
                : <ErrorMessageBlock/>
              }
            </TabPanel>
            <TabPanel>
              {!dataContracts.error
                ? <DataContractsList
                    dataContracts={dataContracts.data?.resultSet}
                    pagination={{
                      onPageChange: pagination => paginationHandler(setDataContracts, pagination.selected),
                      pageCount: Math.ceil(dataContracts.data?.pagination?.total / pageSize) || 1,
                      forcePage: dataContracts?.props?.currentPage
                    }}
                    loading={dataContracts.loading}
                    itemsCount={pageSize}
                  />
                : <ErrorMessageBlock/>
              }
            </TabPanel>
            <TabPanel>
              {!documents.error
                ? <DocumentsList
                    documents={documents.data?.resultSet}
                    pagination={{
                      onPageChange: pagination => paginationHandler(setDocuments, pagination.selected),
                      pageCount: Math.ceil(documents.data?.pagination?.total / pageSize) || 1,
                      forcePage: documents?.props?.currentPage
                    }}
                    loading={documents.loading}
                    itemsCount={pageSize}
                  />
                : <ErrorMessageBlock/>
              }
            </TabPanel>
            <TabPanel>
              {!transfers.error
                ? <TransfersList
                  transfers={transfers.data?.resultSet}
                  pagination={{
                    onPageChange: pagination => paginationHandler(setTransfers, pagination.selected),
                    pageCount: Math.ceil(transfers.data?.pagination?.total / pageSize) || 1,
                    forcePage: transfers?.props?.currentPage
                  }}
                  loading={transfers.loading}
                  itemsCount={pageSize}
                />
                : <ErrorMessageBlock/>
              }
            </TabPanel>
            <TabPanel>
              {!tokens.error
                ? <TokensList
                  tokens={tokens.data?.resultSet}
                  variant={'balance'}
                  rate={rate}
                  pagination={{
                    onPageChange: pagination => paginationHandler(setTokens, pagination.selected),
                    pageCount: Math.ceil(tokens.data?.pagination?.total / pageSize) || 1,
                    forcePage: tokens?.props?.currentPage
                  }}
                  loading={tokens.loading}
                  itemsCount={pageSize}
                />
                : <ErrorMessageBlock/>
              }
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default Identity
