'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import DocumentsList from '../../../components/documents/DocumentsList'
import { LoadingBlock } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import { CodeBlock } from '../../../components/data'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { DataContractDigestCard, DataContractTotalCard, GroupsList } from '../../../components/dataContracts'
import { Container, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { TransactionsList } from '../../../components/transactions'
import TokensList from '../../../components/tokens/TokensList'
import { useQuery } from '@tanstack/react-query'
import { useQueryState, parseAsStringEnum, parseAsString } from 'nuqs'

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
  const [txPage, setTxPage] = useState(pagintationConfig.defaultPage)
  const [docPage, setDocPage] = useState(pagintationConfig.defaultPage)

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
    select: data => ({
      pagination: data.pagination,
      list: data.resultSet.map((transaction) => ({
        ...transaction,
        batchType: transaction?.action?.[0]?.action
      }))
    })
  })
  const documents = useQuery({
    queryKey: ['documents', identifier, docPage],
    queryFn: () => Api.getDocumentsByDataContract(identifier, docPage, pageSize, 'desc')
  })

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
                      onPageChange: pagination => setTxPage(pagination.selected),
                      pageCount: Math.ceil(transactions.data?.pagination?.total / pageSize) || 1,
                      forcePage: txPage
                    }}
                  />
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel position={'relative'}>
              {!documents.isError
                ? <DocumentsList
                  documents={documents.data?.resultSet}
                  loading={documents.isLoading}
                  pagination={{
                    onPageChange: pagination => setDocPage(pagination.selected),
                    pageCount: Math.ceil(documents.data?.pagination?.total / pageSize) || 1,
                    forcePage: docPage
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
