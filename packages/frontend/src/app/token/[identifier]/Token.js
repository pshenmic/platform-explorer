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
import { HoldersList } from '../../../components/tokens/holders'
import './Token.scss'

const mockHolders = [
  {
    identifier: '8jRiSLHXeRnmtc8F9iEeoxVZorAywG4apurjS2BHUgQM',
    aliases: [
      {
        alias: '2x2.dash',
        status: 'ok',
        contested: false,
        timestamp: '2024-09-03T21:47:12.253+03:00',
        txHash: '996161AFE95D7D0E12E35A6519E76C5FAA00FAA59FAF8CF998ACB1741E3C1834'
      }
    ],
    tokensAmount: 150000,
    dashAmount: 783.31,
    lastActivity: '2024-09-03T18:46:26.452Z'
  },
  {
    identifier: '6Lar6YD3ZBWhV6kmstSPmDpsgJ9BT3DGA7cV2yp251Jf',
    aliases: [
      {
        alias: 'Dash-007.dash',
        status: 'ok',
        contested: false,
        timestamp: '2024-09-03T21:48:29.074+03:00',
        txHash: '90BFFF2B9C3BED44336A6F29EE95F09DF596AD3A3FF11FEFFB724BAC5C7C2C06'
      }
    ],
    tokensAmount: 125000,
    dashAmount: 782.18,
    lastActivity: '2024-09-03T18:46:42.400Z'
  },
  {
    identifier: '96C5EqyAZh3eDsPpFTrFXrMefWnMegxZLq9wUYUUkosX',
    aliases: [
      {
        alias: 'Aaron2.dash',
        status: 'ok',
        contested: false,
        timestamp: '2024-09-03T21:52:17.562+03:00',
        txHash: '1A98D47561ACF4E5451AE50A7A6D06517B5BD511A113C231622CCC8FB4EA537A'
      }
    ],
    tokensAmount: 100000,
    dashAmount: 782.91,
    lastActivity: '2024-09-03T18:46:56.812Z'
  },
  {
    identifier: 'ABC123def456GHI789jklMNO012pqrSTU345vwxYZ678',
    aliases: [],
    tokensAmount: 75000,
    dashAmount: 650.45,
    lastActivity: '2024-09-02T14:30:15.123Z'
  },
  {
    identifier: 'XYZ987wvu654TSR321onmLKJ098ihgFED765cbAZYX432',
    aliases: [],
    tokensAmount: 50000,
    dashAmount: 423.67,
    lastActivity: '2024-09-01T09:15:42.789Z'
  }
]

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

      <InfoContainer styles={['tabs']} className={'tokenPage__ListContainer'}>
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
              <HoldersList holders={mockHolders} loading={false} error={false}/>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default Token
