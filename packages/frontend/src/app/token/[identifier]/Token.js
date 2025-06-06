'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, setLoadingProp } from '../../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import './Token.scss'

const tabs = [
  'activity',
  'holders'
]

const defaultTabName = 'transactions'

function Token ({ identifier }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [identity, setIdentity] = useState({ data: {}, loading: true, error: false })
  const [dataContracts, setDataContracts] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [documents, setDocuments] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [transactions, setTransactions] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [transfers, setTransfers] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const pageSize = 10
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1
    ? tabs.indexOf(defaultTabName.toLowerCase())
    : tabs.indexOf(defaultTabName)
  )

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Tokens', path: '/tokens' },
      { label: identifier, avatar: false }
    ])
  }, [setBreadcrumbs, identifier])

  useEffect(() => {
    Api.getIdentity(identifier)
      .then(paginatedTransactions => fetchHandlerSuccess(setIdentity, paginatedTransactions))
      .catch(err => fetchHandlerError(setIdentity, err))

    // Api.getRate()
    //   .then(res => fetchHandlerSuccess(setRate, res))
    //   .catch(err => fetchHandlerError(setRate, err))
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
      title={'Token info'}
    >
      {/* <IdentityTotalCard identity={identity} rate={rate}/> */}

      <InfoContainer styles={['tabs']} className={'IdentityPage__ListContainer'}>
        <Tabs onChange={setActiveTab} index={activeTab}>
          <TabList>
            <Tab>Activity {identity.data?.totalTxs !== undefined
              ? <span className={`Tabs__TabItemsCount ${identity.data?.totalTxs === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {identity.data?.totalTxs}
                </span>
              : ''}
            </Tab>
            <Tab>Holders {identity.data?.totalDataContracts !== undefined
              ? <span className={`Tabs__TabItemsCount ${identity.data?.totalDataContracts === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {identity.data?.totalDataContracts}
                </span>
              : ''}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              Activity
            </TabPanel>
            <TabPanel>
              Holders
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default Token
