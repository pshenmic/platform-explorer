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
import { useDataContractDocumentsFilters } from '../../../components/documents/hooks/useDataContractDocumentsFilters'
import { DocumentsFilter } from '../../../components/documents/DocumentsFilter'
import { useQuery } from '@tanstack/react-query'
import { useQueryState, parseAsStringEnum, parseAsString } from 'nuqs'
import { normalizePagination } from '@utils/table'

import './DataContract.scss'

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
]

const defaultTabName = 'documents'

const pageSize = pagintationConfig.itemsOnPage.default

function DataContract ({ identifier }) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [txPage, setTxPage] = useState(pagintationConfig.defaultPage)
  const [docPage, setDocPage] = useState(pagintationConfig.defaultPage)
  const { filters: docFilters, setFilters: setDocFilters } = useDataContractDocumentsFilters()

  const dataContract = useQuery({
    queryKey: ['dataContract', identifier],
    queryFn: () => Api.getDataContractByIdentifier(identifier)
  })
  const rate = useQuery({
    queryKey: ['rate', identifier],
    queryFn: () => Api.getRate(identifier)
  })
  const transactions = useQuery({
    queryKey: ['transactions', identifier, txPage],
    queryFn: () => Api.getDataContractTransactions(identifier, txPage, pageSize, 'desc'),
    enabled: !!identifier,
    select: ({ pagination, ...data }) => ({
      pagination: normalizePagination({
        page: txPage,
        pageSize,
        ...pagination
      }),
      list: data.resultSet.map((transaction) => ({
        ...transaction,
        batchType: transaction?.action?.[0]?.action
      }))
    })
  })

  const documents = useQuery({
    queryKey: ['documents', identifier, docPage, ...Object.values(docFilters)],
    queryFn: () => Api.getDocumentsByDataContract(identifier, docPage, pageSize, 'desc', docFilters),
    keepPreviousData: true,
    select: ({ pagination, resultSet }) => ({
      pagination: normalizePagination({
        page: docPage,
        pageSize,
        ...pagination
      }),
      resultSet
    })
  })

  const handleDocFiltersChange = (next) => {
    setDocFilters(next)
    setDocPage(pagintationConfig.defaultPage)
  }

  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsStringEnum(tabs)
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

  const handleGroupToggle = (groupId) => {
    if (group && group === groupId) {
      setGroup(null)
    } else {
      setGroup(groupId)
    }
  }

  const handleTab = (index) => setActiveTab(tabs.find((_, idx) => idx === index))

  const txPagination = transactions.data?.pagination
  const docPagination = documents.data?.pagination

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Data Contracts', path: '/dataContracts' },
      { label: dataContract.data?.name || identifier, avatarSource: identifier }
    ])
  }, [setBreadcrumbs, identifier, dataContract.data?.name])

  return (
    <PageDataContainer
      className={'DataContract'}
      title={'Data Contract info'}
    >
      <div className={'DataContract__InfoBlocks'}>
        <DataContractTotalCard className={'DataContract__InfoBlock'} dataContract={dataContract} rate={rate}/>
        <DataContractDigestCard className={'DataContract__InfoBlock'} dataContract={dataContract} rate={rate} txCount={transactions.data?.pagination?.total}/>
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
                      pageCount: txPagination?.pageCount,
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
                  className={'DataContract__DocumentsFilter'}
                />
              </Box>
              {!documents.isError
                ? <DocumentsList
                  documents={documents.data?.resultSet}
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
              {!documents.isError
                ? <TokensList tokens={dataContract.data?.tokens} loading={dataContract.isLoading}/>
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel position={'relative'}>
              {!dataContract.isError
                ? <LoadingBlock h={'250px'} loading={dataContract.isLoading}>
                  {dataContract.data?.schema
                    ? <CodeBlock smoothSize={activeTab === 1} className={'DataContract__Schema'} code={dataContract.data?.schema}/>
                    : <Container h={20}><ErrorMessageBlock/></Container>}
                </LoadingBlock>
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel position={'relative'}>
              {!dataContract.isError
                ? <LoadingBlock h={'250px'} loading={dataContract.isLoading}>
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
