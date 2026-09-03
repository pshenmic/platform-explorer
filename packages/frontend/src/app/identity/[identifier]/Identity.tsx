'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import TransactionsList from '../../../components/transactions/TransactionsList'
import TransactionsFilter from '../../../components/transactions/TransactionsFilter'
import DocumentsList from '../../../components/documents/DocumentsList'
import { DocumentsFilter } from '../../../components/documents/DocumentsFilter'
import DataContractsList from '../../../components/dataContracts/DataContractsList'
import TransfersList from '../../../components/transfers/TransfersList'
import {
  fetchHandlerSuccess,
  fetchHandlerError,
  paginationHandler,
  setLoadingProp
} from '../../../util'
import { ErrorMessageBlock } from '../../../components/Errors'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { IdentityTotalCard } from '../../../components/identities'
import TokensList from '../../../components/tokens/TokensList'
import type {
  DataContract,
  Document,
  Identity as IdentityType,
  LoadableState,
  PaginatedResultSet,
  Rate,
  Token,
  Transaction,
  Transfer
} from '../../../types'
import './Identity.css'

const tabs = ['transactions', 'datacontracts', 'documents', 'transfers', 'tokens'] as const

const defaultTabName = 'transactions'

type PaginatedProps = { currentPage: number }

interface IdentityProps {
  identifier: string
}

function emptyPaginated<T>(): LoadableState<PaginatedResultSet<T>> {
  return {
    data: {} as PaginatedResultSet<T>,
    props: { currentPage: 0 },
    loading: true,
    error: false
  }
}

function Identity({ identifier }: IdentityProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [identity, setIdentity] = useState<LoadableState<IdentityType>>({
    data: {} as IdentityType,
    loading: true,
    error: false
  })
  const [dataContracts, setDataContracts] = useState(emptyPaginated<DataContract>())
  const [documents, setDocuments] = useState(emptyPaginated<Document>())
  const [tokens, setTokens] = useState(emptyPaginated<Token>())
  const [transactions, setTransactions] = useState(emptyPaginated<Transaction>())
  const [transfers, setTransfers] = useState(emptyPaginated<Transfer>())
  const [txFilters, setTxFilters] = useState<Record<string, unknown>>({})
  const [docFilters, setDocFilters] = useState<Record<string, unknown>>({})
  const [rate, setRate] = useState<LoadableState<Rate>>({
    data: {} as Rate,
    loading: true,
    error: false
  })
  const pageSize = 10
  const [activeTab, setActiveTab] = useState(
    tabs.indexOf(defaultTabName.toLowerCase() as (typeof tabs)[number]) !== -1
      ? tabs.indexOf(defaultTabName.toLowerCase() as (typeof tabs)[number])
      : tabs.indexOf(defaultTabName as (typeof tabs)[number])
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

    Api.getTransactions(
      Number((transactions.props as PaginatedProps).currentPage) + 1,
      pageSize,
      'desc',
      { owner: identifier, ...txFilters }
    )
      .then(paginatedTransactions => fetchHandlerSuccess(setTransactions, paginatedTransactions))
      .catch(err => fetchHandlerError(setTransactions, err))
  }, [identifier, (transactions.props as PaginatedProps).currentPage, txFilters])

  const txFiltersChangeHandler = (newFilters: Record<string, unknown>) => {
    if (JSON.stringify(newFilters) === JSON.stringify(txFilters)) return
    setTxFilters(newFilters)
    setTransactions(prev => ({ ...prev, props: { ...prev.props, currentPage: 0 } }))
  }

  useEffect(() => {
    if (!identifier) return
    setLoadingProp(setDataContracts)

    Api.getDataContractsByIdentity(
      identifier,
      Number((dataContracts.props as PaginatedProps).currentPage) + 1,
      pageSize,
      'desc'
    )
      .then(paginatedDataContracts => fetchHandlerSuccess(setDataContracts, paginatedDataContracts))
      .catch(err => fetchHandlerError(setDataContracts, err))
  }, [identifier, (dataContracts.props as PaginatedProps).currentPage])

  useEffect(() => {
    if (!identifier) return
    setLoadingProp(setTransfers)

    Api.getTransfersByIdentity(
      identifier,
      Number((transfers.props as PaginatedProps).currentPage) + 1,
      pageSize,
      'desc'
    )
      .then(paginatedDataContracts => fetchHandlerSuccess(setTransfers, paginatedDataContracts))
      .catch(err => fetchHandlerError(setTransfers, err))
  }, [identifier, (transfers.props as PaginatedProps).currentPage])

  useEffect(() => {
    if (!identifier) return
    setLoadingProp(setDocuments)

    Api.getDocumentsByIdentity(
      identifier,
      Number((documents.props as PaginatedProps).currentPage) + 1,
      pageSize,
      'desc',
      docFilters
    )
      .then(paginatedDataContracts => fetchHandlerSuccess(setDocuments, paginatedDataContracts))
      .catch(err => fetchHandlerError(setDocuments, err))
  }, [identifier, (documents.props as PaginatedProps).currentPage, docFilters])

  const docFiltersChangeHandler = (newFilters: Record<string, unknown>) => {
    if (JSON.stringify(newFilters) === JSON.stringify(docFilters)) return
    setDocFilters(newFilters)
    setDocuments(prev => ({ ...prev, props: { ...prev.props, currentPage: 0 } }))
  }

  useEffect(() => {
    if (!identifier) return
    setLoadingProp(setTokens)

    Api.getTokensByIdentity(
      identifier,
      Number((tokens.props as PaginatedProps).currentPage) + 1,
      pageSize,
      'desc'
    )
      .then(paginatedDataContracts => fetchHandlerSuccess(setTokens, paginatedDataContracts))
      .catch(err => fetchHandlerError(setTokens, err))
  }, [identifier, (tokens.props as PaginatedProps).currentPage])

  useEffect(() => {
    const tab = searchParams.get('tab')

    if (tab && tabs.indexOf(tab.toLowerCase() as (typeof tabs)[number]) !== -1) {
      setActiveTab(tabs.indexOf(tab.toLowerCase() as (typeof tabs)[number]))
      return
    }

    setActiveTab(
      tabs.indexOf(defaultTabName.toLowerCase() as (typeof tabs)[number]) !== -1
        ? tabs.indexOf(defaultTabName.toLowerCase() as (typeof tabs)[number])
        : 0
    )
  }, [searchParams])

  useEffect(() => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))

    if (
      activeTab === tabs.indexOf(defaultTabName.toLowerCase() as (typeof tabs)[number]) ||
      (tabs.indexOf(defaultTabName.toLowerCase() as (typeof tabs)[number]) === -1 &&
        activeTab === 0)
    ) {
      urlParameters.delete('tab')
    } else {
      urlParameters.set('tab', tabs[activeTab])
    }

    router.replace(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  }, [activeTab, router, pathname])

  return (
    <PageDataContainer className={'IdentityPage'} title={'Identity info'}>
      <IdentityTotalCard identity={identity} rate={rate.data} />

      <InfoContainer styles={['tabs']} className={'IdentityPage__ListContainer'}>
        <Tabs onChange={setActiveTab} index={activeTab}>
          <TabList>
            <Tab>
              Transactions{' '}
              {(transactions.data?.pagination?.total ?? identity.data?.totalTxs) !== undefined ? (
                <span
                  className={`Tabs__TabItemsCount ${(transactions.data?.pagination?.total ?? identity.data?.totalTxs) === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}
                >
                  {Math.max(
                    transactions.data?.pagination?.total ?? identity.data?.totalTxs ?? 0,
                    0
                  )}
                </span>
              ) : (
                ''
              )}
            </Tab>
            <Tab>
              Data contracts{' '}
              {identity.data?.totalDataContracts !== undefined ? (
                <span
                  className={`Tabs__TabItemsCount ${identity.data?.totalDataContracts === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}
                >
                  {identity.data?.totalDataContracts}
                </span>
              ) : (
                ''
              )}
            </Tab>
            <Tab>
              Documents{' '}
              {(documents.data?.pagination?.total ?? identity.data?.totalDocuments) !==
              undefined ? (
                <span
                  className={`Tabs__TabItemsCount ${(documents.data?.pagination?.total ?? identity.data?.totalDocuments) === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}
                >
                  {Math.max(
                    documents.data?.pagination?.total ?? identity.data?.totalDocuments ?? 0,
                    0
                  )}
                </span>
              ) : (
                ''
              )}
            </Tab>
            <Tab>
              Credit Transfers{' '}
              {identity.data?.totalTransfers !== undefined ? (
                <span
                  className={`Tabs__TabItemsCount ${identity.data?.totalTransfers === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}
                >
                  {identity.data?.totalTransfers}
                </span>
              ) : (
                ''
              )}
            </Tab>
            <Tab>
              Tokens{' '}
              {tokens.data?.pagination?.total !== undefined ? (
                <span
                  className={`Tabs__TabItemsCount ${tokens.data?.pagination?.total === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}
                >
                  {Math.max(tokens.data?.pagination?.total ?? 0, 0)}
                </span>
              ) : (
                ''
              )}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <TransactionsFilter
                onFilterChange={txFiltersChangeHandler}
                excludeFilters={['owner']}
                className={'IdentityPage__TransactionsFilter'}
              />
              {!transactions.error ? (
                <TransactionsList
                  transactions={transactions.data?.resultSet}
                  pagination={{
                    onPageChange: (pagination: { selected: number }) =>
                      paginationHandler(setTransactions, pagination.selected),
                    pageCount:
                      Math.ceil((transactions.data?.pagination?.total ?? 0) / pageSize) || 1,
                    forcePage: (transactions?.props as PaginatedProps)?.currentPage
                  }}
                  loading={transactions.loading}
                  itemsCount={pageSize}
                />
              ) : (
                <ErrorMessageBlock />
              )}
            </TabPanel>
            <TabPanel>
              {!dataContracts.error ? (
                <DataContractsList
                  dataContracts={dataContracts.data?.resultSet}
                  pagination={{
                    onPageChange: pagination =>
                      paginationHandler(setDataContracts, pagination.selected),
                    pageCount:
                      Math.ceil((dataContracts.data?.pagination?.total ?? 0) / pageSize) || 1,
                    forcePage: (dataContracts?.props as PaginatedProps)?.currentPage
                  }}
                  loading={dataContracts.loading}
                  itemsCount={pageSize}
                />
              ) : (
                <ErrorMessageBlock />
              )}
            </TabPanel>
            <TabPanel>
              <DocumentsFilter
                onFilterChange={docFiltersChangeHandler}
                excludeFilters={['owner', 'revision', 'transition_type']}
                className={'IdentityPage__DocumentsFilter'}
              />
              {!documents.error ? (
                <DocumentsList
                  documents={
                    documents.data?.resultSet as Array<Document & { gasUsed?: number }> | undefined
                  }
                  showDataContract={true}
                  showAction={false}
                  showGas={false}
                  pagination={{
                    onPageChange: pagination =>
                      paginationHandler(setDocuments, pagination.selected),
                    pageCount: Math.ceil((documents.data?.pagination?.total ?? 0) / pageSize) || 1,
                    forcePage: (documents?.props as PaginatedProps)?.currentPage
                  }}
                  loading={documents.loading}
                  itemsCount={pageSize}
                />
              ) : (
                <ErrorMessageBlock />
              )}
            </TabPanel>
            <TabPanel>
              {!transfers.error ? (
                <TransfersList
                  transfers={transfers.data?.resultSet}
                  pagination={{
                    onPageChange: pagination =>
                      paginationHandler(setTransfers, pagination.selected),
                    pageCount: Math.ceil((transfers.data?.pagination?.total ?? 0) / pageSize) || 1,
                    forcePage: (transfers?.props as PaginatedProps)?.currentPage
                  }}
                  loading={transfers.loading}
                  itemsCount={pageSize}
                />
              ) : (
                <ErrorMessageBlock />
              )}
            </TabPanel>
            <TabPanel>
              {!tokens.error ? (
                <TokensList
                  tokens={tokens.data?.resultSet as never}
                  variant={'balance'}
                  rate={rate.data}
                  pagination={{
                    onPageChange: (pagination: { selected: number }) =>
                      paginationHandler(setTokens, pagination.selected),
                    pageCount: Math.ceil((tokens.data?.pagination?.total ?? 0) / pageSize) || 1,
                    forcePage: (tokens?.props as PaginatedProps)?.currentPage
                  }}
                  loading={tokens.loading}
                  itemsCount={pageSize}
                />
              ) : (
                <ErrorMessageBlock />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default Identity
