'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import TransactionsList from '../../../components/transactions/TransactionsList'
import { toTransactionsApiFilters } from '../../../components/transactions/transactionsApiFilters'
import { useInfiniteQuery } from '@tanstack/react-query'
import { DataListModeSwitch } from '../../../components/ui/lists/DataList/DataListPaging'
import {
  readListScrollMode,
  writeListScrollMode,
  type ListScrollMode
} from '../../../components/ui/lists/DataList/listScrollMode'
import DocumentsList from '../../../components/documents/DocumentsList'
import { useIdentityList } from './useIdentityList'
import DataContractsList from '../../../components/dataContracts/DataContractsList'
import TransfersList from '../../../components/transfers/TransfersList'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { ErrorMessageBlock } from '../../../components/Errors'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '../../../components/ui/Tabs'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { IdentityTotalCard } from '../../../components/identities'
import TokensList from '../../../components/tokens/TokensList'
import type { Identity as IdentityType, LoadableState, Rate } from '../../../types'
import './Identity.css'

const tabs = ['transactions', 'datacontracts', 'documents', 'transfers', 'tokens'] as const

const defaultTabName = 'transactions'

interface IdentityProps {
  identifier: string
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
  const [txFilters, setTxFilters] = useState<Record<string, unknown>>({})
  const [txColumnFilters, setTxColumnFilters] = useState<Record<string, unknown>>({})
  const [txToolbarTarget, setTxToolbarTarget] = useState<HTMLDivElement | null>(null)
  const [txPage, setTxPage] = useState(1)
  const [txPageSize, setTxPageSize] = useState(10)
  const [txMode, setTxMode] = useState<ListScrollMode>('continuous')
  useEffect(() => setTxMode(readListScrollMode('identity-transactions')), [])
  const handleTxMode = (mode: ListScrollMode) => {
    writeListScrollMode('identity-transactions', mode)
    setTxMode(mode)
    setTxPage(1)
  }
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTxFilters(toTransactionsApiFilters(txColumnFilters))
      setTxPage(1)
    }, 400)
    return () => window.clearTimeout(timer)
  }, [txColumnFilters])
  const transactions = useInfiniteQuery({
    queryKey: ['identityTransactions', identifier, txMode, txPage, txPageSize, txFilters],
    initialPageParam: txPage,
    queryFn: ({ pageParam }) =>
      Api.getTransactions(pageParam, txPageSize, 'desc', { ...txFilters, owner: identifier }),
    enabled: !!identifier,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.resultSet.length === txPageSize &&
      lastPageParam * txPageSize < (lastPage.pagination?.total ?? 0)
        ? lastPageParam + 1
        : undefined
  })
  const txTotal = transactions.data?.pages[0]?.pagination?.total
  const txItems = transactions.data?.pages.flatMap(page => page.resultSet)
  const [docColumns, setDocColumns] = useState<Record<string, unknown>>({})
  const [transferColumns, setTransferColumns] = useState<Record<string, unknown>>({})
  const [docFilters, setDocFilters] = useState<Parameters<typeof Api.getDocumentsByIdentity>[4]>({})
  const [transferFilters, setTransferFilters] = useState<
    NonNullable<Parameters<typeof Api.getTransfersByIdentity>[4]>
  >({})
  const [docToolbar, setDocToolbar] = useState<HTMLDivElement | null>(null)
  const [transferToolbar, setTransferToolbar] = useState<HTMLDivElement | null>(null)
  const [rate, setRate] = useState<LoadableState<Rate>>({
    data: {} as Rate,
    loading: true,
    error: false
  })
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

  const dataContracts = useIdentityList(
    'contracts',
    identifier,
    activeTab === 1,
    {},
    (page, size) => Api.getDataContractsByIdentity(identifier, page, size, 'desc')
  )
  const documents = useIdentityList(
    'documents',
    identifier,
    activeTab === 2,
    docFilters ?? {},
    (page, size) => Api.getDocumentsByIdentity(identifier, page, size, 'desc', docFilters)
  )
  const transfers = useIdentityList(
    'transfers',
    identifier,
    activeTab === 3,
    transferFilters,
    (page, size) => Api.getTransfersByIdentity(identifier, page, size, 'desc', transferFilters)
  )
  const tokens = useIdentityList('tokens', identifier, activeTab === 4, {}, (page, size) =>
    Api.getTokensByIdentity(identifier, page, size, 'desc')
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const dates = toTransactionsApiFilters({ timestamp: docColumns.timestamp })
      const status = Array.isArray(docColumns.status) ? docColumns.status[0] : undefined
      setDocFilters({
        document_type_name: typeof docColumns.type === 'string' ? docColumns.type : undefined,
        deleted: status === 'active' ? 'false' : status === 'deleted' ? 'true' : undefined,
        timestamp_start: dates.timestamp_start as string | undefined,
        timestamp_end: dates.timestamp_end as string | undefined
      })
      documents.resetPage()
    }, 400)
    return () => window.clearTimeout(timer)
  }, [docColumns, documents.resetPage])
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTransferFilters({
        hash: toTransactionsApiFilters(transferColumns).hash as string | undefined,
        type:
          Array.isArray(transferColumns.type) && transferColumns.type.length
            ? Number(transferColumns.type[0])
            : undefined
      })
      transfers.resetPage()
    }, 400)
    return () => window.clearTimeout(timer)
  }, [transferColumns, transfers.resetPage])
  const otherLists = [dataContracts, documents, transfers, tokens]
  const otherPaging = otherLists[activeTab - 1]?.paging
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

    const next = urlParameters.toString()
    if (next === searchParams.toString()) return
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [activeTab, router, pathname])

  return (
    <PageDataContainer className={'IdentityPage'} title={'Identity info'}>
      <IdentityTotalCard identity={identity} identifier={identifier} rate={rate.data} />

      <InfoContainer styles={['tabs']} className={'IdentityPage__ListContainer'}>
        <Tabs onChange={setActiveTab} index={activeTab}>
          <div className="Tabs__Toolbar">
            <TabList>
              <Tab>
                Transactions{' '}
                {(txTotal ?? identity.data?.totalTxs) !== undefined ? (
                  <span
                    className={`Tabs__TabItemsCount ${(txTotal ?? identity.data?.totalTxs) === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}
                  >
                    {Math.max(txTotal ?? identity.data?.totalTxs ?? 0, 0)}
                  </span>
                ) : (
                  <span
                    className={'Tabs__TabItemsCount Tabs__TabItemsCount--Loading'}
                    aria-hidden={'true'}
                  >
                    0
                  </span>
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
                  <span
                    className={'Tabs__TabItemsCount Tabs__TabItemsCount--Loading'}
                    aria-hidden={'true'}
                  >
                    0
                  </span>
                )}
              </Tab>
              <Tab>
                Documents{' '}
                {(documents.total ?? identity.data?.totalDocuments) !== undefined ? (
                  <span
                    className={`Tabs__TabItemsCount ${(documents.total ?? identity.data?.totalDocuments) === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}
                  >
                    {Math.max(documents.total ?? identity.data?.totalDocuments ?? 0, 0)}
                  </span>
                ) : (
                  <span
                    className={'Tabs__TabItemsCount Tabs__TabItemsCount--Loading'}
                    aria-hidden={'true'}
                  >
                    0
                  </span>
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
                  <span
                    className={'Tabs__TabItemsCount Tabs__TabItemsCount--Loading'}
                    aria-hidden={'true'}
                  >
                    0
                  </span>
                )}
              </Tab>
              <Tab>
                Tokens{' '}
                {tokens.total !== undefined ? (
                  <span
                    className={`Tabs__TabItemsCount ${tokens.total === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}
                  >
                    {Math.max(tokens.total ?? 0, 0)}
                  </span>
                ) : (
                  <span
                    className={'Tabs__TabItemsCount Tabs__TabItemsCount--Loading'}
                    aria-hidden={'true'}
                  >
                    0
                  </span>
                )}
              </Tab>
            </TabList>
            <div className="Tabs__TableControls" hidden={activeTab !== 0}>
              <div ref={setTxToolbarTarget} className="Tabs__FilterSlot" />
              <DataListModeSwitch mode={txMode} onModeChange={handleTxMode} />
            </div>
            <div className="Tabs__TableControls" hidden={activeTab === 0}>
              <div ref={setDocToolbar} className="Tabs__FilterSlot" hidden={activeTab !== 2} />
              <div ref={setTransferToolbar} className="Tabs__FilterSlot" hidden={activeTab !== 3} />
              {otherPaging && <DataListModeSwitch {...otherPaging} />}
            </div>
          </div>
          <TabPanels>
            <TabPanel>
              {!transactions.isError || transactions.data ? (
                <>
                  <TransactionsList
                    transactions={txItems}
                    loading={transactions.isLoading}
                    rate={rate.data}
                    pinFirst
                    filterValues={txColumnFilters}
                    excludeFilters={['owner']}
                    onFilterChange={(key, value) =>
                      setTxColumnFilters(previous => ({ ...previous, [key]: value }))
                    }
                    toolbarTarget={txToolbarTarget}
                    paging={{
                      mode: txMode,
                      onModeChange: handleTxMode,
                      hideModeSwitch: true,
                      total: txTotal ?? 0,
                      pageSize: txPageSize,
                      page: txPage - 1,
                      onPageChange: page => setTxPage(page + 1),
                      onPageSizeChange: size => {
                        setTxPageSize(size)
                        setTxPage(1)
                      },
                      onLoadMore: () => {
                        if (!transactions.isFetching) void transactions.fetchNextPage()
                      },
                      loadingMore: transactions.isFetching && !transactions.isLoading,
                      hasMore:
                        activeTab === 0 &&
                        transactions.hasNextPage &&
                        !transactions.isFetchNextPageError
                    }}
                  />
                  {transactions.isFetchNextPageError && (
                    <button type="button" onClick={() => void transactions.fetchNextPage()}>
                      Could not load more transactions. Retry
                    </button>
                  )}
                </>
              ) : (
                <ErrorMessageBlock />
              )}
            </TabPanel>
            <TabPanel>
              {!dataContracts.query.isError || dataContracts.query.data ? (
                <>
                  <DataContractsList
                    dataContracts={dataContracts.items}
                    loading={dataContracts.query.isLoading}
                    paging={dataContracts.paging}
                  />
                  {dataContracts.query.isFetchNextPageError && (
                    <button type="button" onClick={() => void dataContracts.query.fetchNextPage()}>
                      Could not load more records. Retry
                    </button>
                  )}
                </>
              ) : (
                <ErrorMessageBlock />
              )}
            </TabPanel>
            <TabPanel>
              {!documents.query.isError || documents.query.data ? (
                <>
                  <DocumentsList
                    documents={documents.items}
                    loading={documents.query.isLoading}
                    paging={documents.paging}
                    showDataContract
                    showAction={false}
                    showGas={false}
                    allowedFilters={['type', 'status', 'timestamp']}
                    filterValues={docColumns}
                    onFilterChange={(key, value) =>
                      setDocColumns(previous => ({ ...previous, [key]: value }))
                    }
                    toolbarTarget={docToolbar}
                  />
                  {documents.query.isFetchNextPageError && (
                    <button type="button" onClick={() => void documents.query.fetchNextPage()}>
                      Could not load more records. Retry
                    </button>
                  )}
                </>
              ) : (
                <ErrorMessageBlock />
              )}
            </TabPanel>
            <TabPanel>
              {!transfers.query.isError || transfers.query.data ? (
                <>
                  <TransfersList
                    transfers={transfers.items}
                    loading={transfers.query.isLoading}
                    paging={transfers.paging}
                    filterValues={transferColumns}
                    onFilterChange={(key, value) =>
                      setTransferColumns(previous => ({ ...previous, [key]: value }))
                    }
                    toolbarTarget={transferToolbar}
                  />
                  {transfers.query.isFetchNextPageError && (
                    <button type="button" onClick={() => void transfers.query.fetchNextPage()}>
                      Could not load more records. Retry
                    </button>
                  )}
                </>
              ) : (
                <ErrorMessageBlock />
              )}
            </TabPanel>
            <TabPanel>
              {!tokens.query.isError || tokens.query.data ? (
                <>
                  <TokensList
                    tokens={tokens.items}
                    loading={tokens.query.isLoading}
                    paging={tokens.paging}
                    variant="balance"
                    rate={rate.data}
                  />
                  {tokens.query.isFetchNextPageError && (
                    <button type="button" onClick={() => void tokens.query.fetchNextPage()}>
                      Could not load more records. Retry
                    </button>
                  )}
                </>
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
