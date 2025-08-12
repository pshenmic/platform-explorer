'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import DocumentsList from '../../../components/documents/DocumentsList'
import { LoadingBlock } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError, setLoadingProp, paginationHandler } from '../../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CodeBlock } from '../../../components/data'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { DataContractDigestCard, DataContractTotalCard, GroupsList } from '../../../components/dataContracts'
import { Container, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { TransactionsList } from '../../../components/transactions'
import TokensList from '../../../components/tokens/TokensList'
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

function DataContract ({ identifier }) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [dataContract, setDataContract] = useState({ data: {}, loading: true, error: false })
  const [documents, setDocuments] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [transactions, setTransactions] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const pageSize = pagintationConfig.itemsOnPage.default
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  const [expandedGroups, setExpandedGroups] = useState({})
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Data Contracts', path: '/dataContracts' },
      { label: dataContract.data?.name || identifier, avatarSource: identifier }
    ])
  }, [setBreadcrumbs, identifier, dataContract])

  useEffect(() => {
    Api.getDataContractByIdentifier(identifier)
      .then(res => fetchHandlerSuccess(setDataContract, res))
      .catch(err => fetchHandlerError(setDataContract, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }, [identifier])

  useEffect(() => {
    const tab = searchParams.get('tab')
    const group = searchParams.get('group')

    if (tab && tabs.indexOf(tab.toLowerCase()) !== -1) {
      setActiveTab(tabs.indexOf(tab.toLowerCase()))
    } else {
      setActiveTab(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
    }

    if (group) {
      setExpandedGroups({ [group]: true })
    }
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
  }, [activeTab])

  const handleExpandedGroupsChange = (newExpandedGroups) => {
    setExpandedGroups(newExpandedGroups)

    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))
    const expandedGroupIds = Object.keys(newExpandedGroups).filter(id => newExpandedGroups[id])

    if (expandedGroupIds.length > 0) {
      urlParameters.set('group', expandedGroupIds[0])
    } else {
      urlParameters.delete('group')
    }

    router.replace(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  }

  useEffect(() => {
    if (!identifier) return
    setLoadingProp(setDocuments)

    Api.getDocumentsByDataContract(identifier, documents.props.currentPage + 1, pageSize, 'desc')
      .then(res => fetchHandlerSuccess(setDocuments, res))
      .catch(err => fetchHandlerError(setDocuments, err))
  }, [identifier, documents.props.currentPage])

  useEffect(() => {
    if (!identifier) return
    setLoadingProp(setTransactions)

    Api.getDataContractTransactions(identifier, transactions.props.currentPage + 1, pageSize, 'desc')
      .then(res => {
        fetchHandlerSuccess(setDataContract, { transactionsCount: res?.pagination?.total })
        fetchHandlerSuccess(setTransactions, res)
      })
      .catch(err => fetchHandlerError(setTransactions, err))
  }, [identifier, transactions.props.currentPage])

  return (
    <PageDataContainer
      className={'DataContract'}
      title={'Data Contract info'}
    >
      <div className={'DataContract__InfoBlocks'}>
        <DataContractTotalCard className={'DataContract__InfoBlock'} dataContract={dataContract} rate={rate}/>
        <DataContractDigestCard className={'DataContract__InfoBlock'} dataContract={dataContract} rate={rate}/>
      </div>

      <InfoContainer styles={['tabs']} id={'tabs'}>
        <Tabs onChange={(index) => setActiveTab(index)} index={activeTab}>
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
              {!transactions.error
                ? <TransactionsList
                    transactions={transactions.data?.resultSet?.map((transaction) => ({
                      ...transaction,
                      batchType: transaction?.action?.[0]?.action
                    }))}
                    loading={transactions.loading}
                    pagination={{
                      onPageChange: pagination => paginationHandler(setTransactions, pagination.selected),
                      pageCount: Math.ceil(transactions.data?.pagination?.total / pageSize) || 1,
                      forcePage: transactions.props.currentPage
                    }}
                  />
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel position={'relative'}>
              {!documents.error
                ? <DocumentsList
                  documents={documents.data?.resultSet}
                  loading={documents.loading}
                  pagination={{
                    onPageChange: pagination => paginationHandler(setDocuments, pagination.selected),
                    pageCount: Math.ceil(documents.data?.pagination?.total / pageSize) || 1,
                    forcePage: documents.props.currentPage
                  }}
                />
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel position={'relative'}>
              {!documents.error
                ? <TokensList tokens={dataContract.data?.tokens} loading={dataContract.loading}/>
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel position={'relative'}>
              {!dataContract.error
                ? <LoadingBlock h={'250px'} loading={dataContract.loading}>
                  {dataContract.data?.schema
                    ? <CodeBlock smoothSize={activeTab === 1} className={'DataContract__Schema'} code={dataContract.data?.schema}/>
                    : <Container h={20}><ErrorMessageBlock/></Container>}
                </LoadingBlock>
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel position={'relative'}>
              {!dataContract.error
                ? <LoadingBlock h={'250px'} loading={dataContract.loading}>
                  <GroupsList
                    groups={dataContract.data?.groups || {}}
                    expandedGroups={expandedGroups}
                    onExpandedGroupsChange={handleExpandedGroupsChange}
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
