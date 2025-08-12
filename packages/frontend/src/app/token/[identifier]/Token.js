'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { TokenTotalCard } from '../../../components/tokens'
import { ActivityList } from '../../../components/tokens/activity'
// import { HoldersList } from '../../../components/tokens/holders'

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
  const [token, setToken] = useState({ data: {}, loading: true, error: false })
  const [tokenTransactions, setTokenTransactions] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const pageSize = 10
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
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
    Api.getToken(identifier)
      .then(res => fetchHandlerSuccess(setToken, res))
      .catch(err => fetchHandlerError(setToken, err))

    Api.getTokenTransitions(identifier, tokenTransactions.props.currentPage + 1, pageSize, 'desc')
      .then(res => fetchHandlerSuccess(setTokenTransactions, res))
      .catch(err => fetchHandlerError(setTokenTransactions, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }, [identifier])

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
      className={'TokenPage'}
      title={'Token Info'}
    >
      <TokenTotalCard token={token} loading={token.loading} rate={rate}/>

      <InfoContainer styles={['tabs']} className={'TokenPage__ListContainer'}>
        <Tabs onChange={setActiveTab} index={activeTab}>
          <TabList>
            <Tab>Activity {token.data?.totalTxs !== undefined
              ? <span className={`Tabs__TabItemsCount ${token.data?.totalTxs === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {token.data?.totalTxs}
                </span>
              : ''}
            </Tab>
            <Tab isDisabled>Holders {token.data?.totalDataContracts !== undefined
              ? <span className={`Tabs__TabItemsCount ${token.data?.totalDataContracts === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {token.data?.totalDataContracts}
                </span>
              : ''}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <ActivityList activities={tokenTransactions.data?.resultSet} loading={false} error={false}/>
            </TabPanel>
            <TabPanel>
              {/* <HoldersList holders={} loading={false} error={false}/> */}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default Token
