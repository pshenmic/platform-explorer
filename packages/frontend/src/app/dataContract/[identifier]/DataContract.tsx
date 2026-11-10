'use client'

import { useState, useEffect, useMemo } from 'react'
import * as Api from '../../../util/Api'
import DocumentsList from '../../../components/documents/DocumentsList'
import { LoadingBlock } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import dynamic from 'next/dynamic'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import {
  DataContractDigestCard,
  DataContractTotalCard,
  GroupsList
} from '../../../components/dataContracts'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '../../../components/ui/Tabs'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { TransactionsList } from '../../../components/transactions'
import TokensList from '../../../components/tokens/TokensList'
import type { Token as TokenListItemData } from '../../../types'
import { useDataContractDocumentsFilters } from '../../../components/documents/hooks/useDataContractDocumentsFilters'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useQueryState, parseAsStringEnum, parseAsString } from 'nuqs'
import type {
  DataContract as DataContractModel,
  LoadableState,
  Rate,
  Transaction
} from '../../../types'

import { DataListModeSwitch } from '../../../components/ui/lists/DataList/DataListPaging'
import {
  readListScrollMode,
  writeListScrollMode,
  type ListScrollMode
} from '../../../components/ui/lists/DataList/listScrollMode'
import './DataContract.css'

const JsonViewer = dynamic(() => import('../../../components/data/JsonViewer'), {
  loading: () => <LoadingBlock h="450px" loading />
})

const pagintationConfig = {
  itemsOnPage: {
    default: 10,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

const tabs = ['transactions', 'documents', 'tokens', 'schema', 'groups'] as const

type TabName = (typeof tabs)[number]

const defaultTabName: TabName = 'documents'

const pageSize = pagintationConfig.itemsOnPage.default

interface DataContractProps {
  identifier: string
}

function DataContract({ identifier }: DataContractProps) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [txPage, setTxPage] = useState(pagintationConfig.defaultPage)
  const [txPageSize, setTxPageSize] = useState(pageSize)
  const [txMode, setTxMode] = useState<ListScrollMode>('continuous')
  useEffect(() => setTxMode(readListScrollMode('data-contract-transactions')), [])
  const handleTxMode = (mode: ListScrollMode) => {
    writeListScrollMode('data-contract-transactions', mode)
    setTxMode(mode)
    setTxPage(1)
  }
  const [docToolbarTarget, setDocToolbarTarget] = useState<HTMLDivElement | null>(null)
  const [docPage, setDocPage] = useState(pagintationConfig.defaultPage)
  const [docPageSize, setDocPageSize] = useState(pageSize)
  const [docMode, setDocMode] = useState<ListScrollMode>('continuous')
  useEffect(() => setDocMode(readListScrollMode('data-contract-documents')), [])
  const handleDocMode = (mode: ListScrollMode) => {
    writeListScrollMode('data-contract-documents', mode)
    setDocMode(mode)
    setDocPage(1)
  }
  const { filters: docFilters, setFilters: setDocFilters } = useDataContractDocumentsFilters()

  const dataContractQuery = useQuery({
    queryKey: ['dataContract', identifier],
    queryFn: () => Api.getDataContractByIdentifier(identifier)
  })
  const rateQuery = useQuery({
    queryKey: ['rate'],
    queryFn: () => Api.getRate()
  })
  const transactions = useInfiniteQuery({
    queryKey: ['contractTransactions', identifier, txMode, txPage, txPageSize],
    initialPageParam: txPage,
    queryFn: ({ pageParam }) =>
      Api.getDataContractTransactions(identifier, pageParam, txPageSize, 'desc'),
    enabled: !!identifier,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.resultSet.length === txPageSize &&
      lastPageParam * txPageSize < (lastPage.pagination?.total ?? 0)
        ? lastPageParam + 1
        : undefined
  })
  const txTotal = transactions.data?.pages[0]?.pagination?.total
  const txItems = transactions.data?.pages
    .flatMap(page => page.resultSet)
    .map((transaction: Transaction & { action?: Array<{ action?: string }> }) => ({
      ...transaction,
      batchType:
        transaction.action?.[0]?.action != null
          ? String(transaction.action[0].action)
          : transaction.batchType
    }))

  const documents = useInfiniteQuery({
    queryKey: ['contractDocuments', identifier, docMode, docPage, docPageSize, docFilters],
    initialPageParam: docPage,
    queryFn: ({ pageParam }) =>
      Api.getDocumentsByDataContract(identifier, pageParam, docPageSize, 'desc', docFilters),
    enabled: !!identifier,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.resultSet.length === docPageSize &&
      lastPageParam * docPageSize < (lastPage.pagination?.total ?? 0)
        ? lastPageParam + 1
        : undefined
  })
  const docTotal = documents.data?.pages[0]?.pagination?.total
  const docItems = documents.data?.pages.flatMap(page => page.resultSet)

  // Cards expect LoadableState shape (loading/error booleans), not raw UseQueryResult.
  const dataContract: LoadableState<DataContractModel> = {
    data: dataContractQuery.data ?? null,
    loading: dataContractQuery.isLoading,
    error: dataContractQuery.isError
  }
  const rate: LoadableState<Rate> = {
    data: rateQuery.data ?? null,
    loading: rateQuery.isLoading,
    error: rateQuery.isError
  }

  const documentTypes = useMemo(() => {
    try {
      const schema =
        typeof dataContract.data?.schema === 'string'
          ? JSON.parse(dataContract.data.schema)
          : dataContract.data?.schema
      if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return []
      return Object.keys(schema).sort((a, b) => a.localeCompare(b))
    } catch {
      return []
    }
  }, [dataContract.data?.schema])

  useEffect(() => {
    if (documentTypes.length === 1 && docFilters.document_type_name === documentTypes[0]) {
      setDocFilters({ document_type_name: undefined })
      setDocPage(1)
    }
  }, [documentTypes, docFilters.document_type_name, setDocFilters])

  const docColumnFilters = {
    type: documentTypes.length
      ? docFilters.document_type_name
        ? [docFilters.document_type_name]
        : []
      : docFilters.document_type_name,
    owner: docFilters.owner,
    revision: { min: docFilters.revision_min ?? '', max: docFilters.revision_max ?? '' },
    timestamp: {
      start: docFilters.timestamp_start ? new Date(docFilters.timestamp_start) : null,
      end: docFilters.timestamp_end ? new Date(docFilters.timestamp_end) : null
    }
  }
  const handleDocFilterChange = (key: string, value: unknown) => {
    if (key === 'type') {
      setDocFilters({ document_type_name: Array.isArray(value) ? value[0] : value })
    } else if (key === 'revision') {
      const range = value as { min?: string | number; max?: string | number }
      setDocFilters({ revision_min: range?.min, revision_max: range?.max })
    } else if (key === 'timestamp') {
      const range = value as { start?: Date | null; end?: Date | null }
      setDocFilters({ timestamp_start: range?.start, timestamp_end: range?.end })
    } else {
      setDocFilters({ [key === 'type' ? 'document_type_name' : key]: value })
    }
    setDocPage(pagintationConfig.defaultPage)
  }

  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsStringEnum<TabName>([...tabs])
      .withDefault(defaultTabName)
      .withOptions({
        scroll: false,
        shallow: false
      })
  )

  const [group, setGroup] = useQueryState(
    'group',
    parseAsString.withOptions({
      scroll: false,
      shallow: true
    })
  )

  const handleGroupToggle = (groupId: string) => {
    if (group && group === groupId) {
      setGroup(null)
    } else {
      setGroup(groupId)
    }
  }

  const handleTab = (index: number) => {
    const next = tabs.find((_, idx) => idx === index)
    if (next) setActiveTab(next)
  }

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Data Contracts', path: '/dataContracts' },
      // Breadcrumbs UI also reads avatarSource (see Breadcrumbs.tsx); context type is narrower.
      { label: dataContract.data?.name || identifier, avatarSource: identifier } as {
        label: string
        path?: string
      }
    ])
  }, [setBreadcrumbs, identifier, dataContract.data?.name])

  const tokens = (dataContract.data?.tokens ?? undefined) as TokenListItemData[] | undefined

  return (
    <PageDataContainer className={'DataContract'} title={'Data Contract info'}>
      <div className={'DataContract__InfoBlocks'}>
        <DataContractTotalCard className={'DataContract__InfoBlock'} dataContract={dataContract} />
        <DataContractDigestCard dataContract={dataContract} rate={rate} txCount={txTotal} />
      </div>

      <InfoContainer styles={['tabs']} id={'tabs'}>
        <Tabs onChange={handleTab} index={tabs.indexOf(activeTab)}>
          <div className="Tabs__Toolbar">
            <TabList aria-label="Data contract sections">
              <Tab>
                Transactions{' '}
                {txTotal != null ? (
                  <span
                    className={`Tabs__TabItemsCount ${txTotal === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}
                  >
                    {txTotal?.toLocaleString('en-US')}
                  </span>
                ) : (
                  ''
                )}
              </Tab>
              <Tab>
                Documents{' '}
                {dataContract.data?.documentsCount != null ? (
                  <span
                    className={`Tabs__TabItemsCount ${dataContract.data?.documentsCount === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}
                  >
                    {dataContract.data?.documentsCount.toLocaleString('en-US')}
                  </span>
                ) : (
                  ''
                )}
              </Tab>
              <Tab>
                Tokens{' '}
                {dataContract.data?.tokens?.length != null ? (
                  <span
                    className={`Tabs__TabItemsCount ${dataContract.data?.tokens?.length === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}
                  >
                    {dataContract.data?.tokens?.length}
                  </span>
                ) : (
                  ''
                )}
              </Tab>
              <Tab>Schema</Tab>
              <Tab>Groups</Tab>
            </TabList>
            {activeTab === 'transactions' && (
              <DataListModeSwitch mode={txMode} onModeChange={handleTxMode} />
            )}
            <div className="Tabs__TableControls" hidden={activeTab !== 'documents'}>
              <div ref={setDocToolbarTarget} className="Tabs__FilterSlot" />
              <DataListModeSwitch mode={docMode} onModeChange={handleDocMode} />
            </div>
          </div>
          <TabPanels>
            <TabPanel position={'relative'}>
              {!transactions.isError || transactions.data ? (
                <>
                  <TransactionsList
                    transactions={txItems}
                    rate={rate.data}
                    hiddenColumns={['status', 'block']}
                    pinFirst
                    loading={transactions.isLoading}
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
                        activeTab === 'transactions' &&
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
                <div className={'Tabs__PanelSpacer'}>
                  <ErrorMessageBlock />
                </div>
              )}
            </TabPanel>
            <TabPanel position={'relative'}>
              {!documents.isError || documents.data ? (
                <>
                  <DocumentsList
                    documents={docItems}
                    documentTypes={documentTypes}
                    toolbarTarget={docToolbarTarget}
                    filterValues={docColumnFilters}
                    onFilterChange={handleDocFilterChange}
                    loading={documents.isLoading}
                    paging={{
                      mode: docMode,
                      onModeChange: handleDocMode,
                      hideModeSwitch: true,
                      total: docTotal ?? 0,
                      pageSize: docPageSize,
                      page: docPage - 1,
                      onPageChange: page => setDocPage(page + 1),
                      onPageSizeChange: size => {
                        setDocPageSize(size)
                        setDocPage(1)
                      },
                      onLoadMore: () => {
                        if (!documents.isFetching) void documents.fetchNextPage()
                      },
                      loadingMore: documents.isFetching && !documents.isLoading,
                      hasMore:
                        activeTab === 'documents' &&
                        documents.hasNextPage &&
                        !documents.isFetchNextPageError
                    }}
                  />
                  {documents.isFetchNextPageError && (
                    <button type="button" onClick={() => void documents.fetchNextPage()}>
                      Could not load more documents. Retry
                    </button>
                  )}
                </>
              ) : (
                <div className={'Tabs__PanelSpacer'}>
                  <ErrorMessageBlock />
                </div>
              )}
            </TabPanel>
            <TabPanel position={'relative'}>
              {!dataContractQuery.isError ? (
                <TokensList tokens={tokens} loading={dataContractQuery.isLoading} />
              ) : (
                <div className={'Tabs__PanelSpacer'}>
                  <ErrorMessageBlock />
                </div>
              )}
            </TabPanel>
            <TabPanel position={'relative'}>
              {!dataContractQuery.isError ? (
                <LoadingBlock
                  h={dataContractQuery.isLoading ? '250px' : 'auto'}
                  loading={dataContractQuery.isLoading}
                >
                  {dataContract.data?.schema ? (
                    activeTab === 'schema' && (
                      <JsonViewer
                        maxHeight="min(65vh, 600px)"
                        label="Data contract schema"
                        className={'DataContract__Schema'}
                        value={dataContract.data?.schema}
                      />
                    )
                  ) : (
                    <div className={'Tabs__PanelSpacer'}>
                      <ErrorMessageBlock />
                    </div>
                  )}
                </LoadingBlock>
              ) : (
                <div className={'Tabs__PanelSpacer'}>
                  <ErrorMessageBlock />
                </div>
              )}
            </TabPanel>
            <TabPanel position={'relative'}>
              {!dataContractQuery.isError ? (
                <LoadingBlock
                  h={dataContractQuery.isLoading ? '250px' : 'auto'}
                  loading={dataContractQuery.isLoading}
                >
                  <GroupsList
                    groups={dataContract.data?.groups || {}}
                    expandedGroup={group}
                    onGroupToggle={handleGroupToggle}
                  />
                </LoadingBlock>
              ) : (
                <div className={'Tabs__PanelSpacer'}>
                  <ErrorMessageBlock />
                </div>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default DataContract
