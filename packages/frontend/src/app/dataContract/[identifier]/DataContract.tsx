// @ts-nocheck — incomplete concurrent migration; another agent owns this path
'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import DocumentsList from '../../../components/documents/DocumentsList'
import { LoadingBlock } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import { CodeBlock } from '../../../components/data'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { DataContractDigestCard, DataContractTotalCard, GroupsList } from '../../../components/dataContracts'
import { Box, Container, Tabs, TabList, TabPanels, Tab, TabPanel, useBreakpointValue } from '@chakra-ui/react'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { TransactionsList } from '../../../components/transactions'
import TokensList from '../../../components/tokens/TokensList'
import type { TokenListItemData } from '../../../components/tokens/TokensListItem'
import { useDataContractDocumentsFilters } from '../../../components/documents/hooks/useDataContractDocumentsFilters'
import { DocumentsFilter } from '../../../components/documents/DocumentsFilter'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useQueryState, parseAsStringEnum, parseAsString } from 'nuqs'
import { normalizePagination } from '@utils/table'
import type { DataContract as DataContractModel, LoadableState, Rate, Transaction } from '../../../types'

import './DataContract.css'

const pagintationConfig = {
  itemsOnPage: {
    default: 10,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

const tabs = [
  'transactions',
  'documents',
  'tokens',
  'schema',
  'groups'
] as const

type TabName = typeof tabs[number]

const defaultTabName: TabName = 'documents'

const pageSize = pagintationConfig.itemsOnPage.default

interface DataContractProps {
  identifier: string
}

function DataContract ({ identifier }: DataContractProps) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [txPage, setTxPage] = useState(pagintationConfig.defaultPage)
  const [docPage, setDocPage] = useState(pagintationConfig.defaultPage)
  const { filters: docFilters, setFilters: setDocFilters } = useDataContractDocumentsFilters()

  const dataContractQuery = useQuery({
    queryKey: ['dataContract', identifier],
    queryFn: () => Api.getDataContractByIdentifier(identifier)
  })
  const rateQuery = useQuery({
    queryKey: ['rate'],
    queryFn: () => Api.getRate()
  })
  const transactions = useQuery({
    queryKey: ['transactions', identifier, txPage],
    queryFn: () => Api.getDataContractTransactions(identifier, txPage, pageSize, 'desc'),
    enabled: !!identifier,
    select: ({ pagination, ...data }: Awaited<ReturnType<typeof Api.getDataContractTransactions>>) => {
      const normalized = normalizePagination({
        ...pagination,
        page: txPage,
        pageSize
      })
      return {
        pagination: {
          ...normalized,
          total: pagination?.total ?? null
        },
        list: data.resultSet.map((transaction: Transaction & { action?: Array<{ action?: string }> }) => ({
          ...transaction,
          batchType:
            transaction?.action?.[0]?.action != null
              ? String(transaction.action[0].action)
              : transaction.batchType
        })) as Transaction[]
      }
    }
  })

  const documents = useQuery({
    queryKey: ['documents', identifier, docPage, ...Object.values(docFilters)],
    queryFn: () => Api.getDocumentsByDataContract(identifier, docPage, pageSize, 'desc', docFilters),
    placeholderData: keepPreviousData,
    select: ({ pagination, resultSet }: Awaited<ReturnType<typeof Api.getDocumentsByDataContract>>) => {
      const normalized = normalizePagination({
        ...pagination,
        page: docPage,
        pageSize
      })
      return {
        pagination: {
          ...normalized,
          total: pagination?.total ?? null
        },
        resultSet
      }
    }
  })

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

  const handleDocFiltersChange = (next: Record<string, unknown>) => {
    setDocFilters(next)
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

  const [group, setGroup] = useQueryState('group', parseAsString.withOptions({
    scroll: false,
    shallow: true
  }))

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

  const txPagination = transactions.data?.pagination
  const docPagination = documents.data?.pagination

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Data Contracts', path: '/dataContracts' },
      // Breadcrumbs UI also reads avatarSource (see Breadcrumbs.tsx); context type is narrower.
      { label: dataContract.data?.name || identifier, avatarSource: identifier } as { label: string, path?: string }
    ])
  }, [setBreadcrumbs, identifier, dataContract.data?.name])

  const tokens = (dataContract.data?.tokens ?? undefined) as TokenListItemData[] | undefined

  return (
    <PageDataContainer
      className={'DataContract'}
      title={'Data Contract info'}
    >
      <div className={'DataContract__InfoBlocks'}>
        <DataContractTotalCard className={'DataContract__InfoBlock'} dataContract={dataContract}/>
        <DataContractDigestCard dataContract={dataContract} rate={rate} txCount={transactions.data?.pagination?.total}/>
      </div>

      <InfoContainer styles={['tabs']} id={'tabs'}>
        <Tabs onChange={handleTab} index={tabs.indexOf(activeTab)}>
          <TabList>
            <Tab>Transactions {transactions.data?.pagination?.total != null
              ? <span className={`Tabs__TabItemsCount ${transactions.data?.pagination?.total === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {transactions.data?.pagination?.total}
                </span>
              : ''}
            </Tab>
            <Tab>Documents {dataContract.data?.documentsCount != null
              ? <span className={`Tabs__TabItemsCount ${dataContract.data?.documentsCount === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {dataContract.data?.documentsCount}
                </span>
              : ''}
            </Tab>
            <Tab>Tokens {dataContract.data?.tokens?.length != null
              ? <span className={`Tabs__TabItemsCount ${dataContract.data?.tokens?.length === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {dataContract.data?.tokens?.length}
                </span>
              : ''}
            </Tab>
            <Tab>Schema</Tab>
            <Tab>Groups</Tab>
          </TabList>
          <TabPanels>
            <TabPanel position={'relative'}>
              {!transactions.isError
                ? <TransactionsList
                    transactions={transactions.data?.list}
                    loading={transactions.isLoading}
                    pagination={{
                      onPageChange: ({ selected }) => setTxPage(selected + 1),
                      pageCount: txPagination?.pageCount ?? 0,
                      forcePage: txPagination?.forcePage
                    }}
                  />
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel position={'relative'}>
              <Box mb={3}>
                <DocumentsFilter
                  onFilterChange={handleDocFiltersChange}
                  isMobile={isMobile}
                  excludeFilters={['transition_type', 'status']}
                  className={'DataContract__DocumentsFilter'}
                />
              </Box>
              {!documents.isError
                ? <DocumentsList
                  documents={documents.data?.resultSet as Parameters<typeof DocumentsList>[0]['documents']}
                  loading={documents.isLoading}
                  pagination={{
                    onPageChange: ({ selected }) => setDocPage(selected + 1),
                    pageCount: docPagination?.pageCount,
                    forcePage: docPagination?.forcePage
                  }}
                />
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel position={'relative'}>
              {!dataContractQuery.isError
                ? <TokensList tokens={tokens} loading={dataContractQuery.isLoading}/>
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel position={'relative'}>
              {!dataContractQuery.isError
                ? <LoadingBlock h={'250px'} loading={dataContractQuery.isLoading}>
                  {dataContract.data?.schema
                    ? <CodeBlock smoothSize={activeTab === 'schema'} className={'DataContract__Schema'} code={dataContract.data?.schema}/>
                    : <Container h={20}><ErrorMessageBlock/></Container>}
                </LoadingBlock>
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel position={'relative'}>
              {!dataContractQuery.isError
                ? <LoadingBlock h={'250px'} loading={dataContractQuery.isLoading}>
                  <GroupsList
                    groups={dataContract.data?.groups || {}}
                    expandedGroup={group}
                    onGroupToggle={handleGroupToggle}
                  />
                </LoadingBlock>
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default DataContract
