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
import type { LoadableState, PaginatedResultSet, Rate, Token as TokenType, TokenTransition } from '../../../types'

const tabs = [
  'activity',
  'holders'
] as const

const defaultTabName = 'transactions'

type PaginatedProps = { currentPage: number }

interface TokenProps {
  identifier: string
}

function Token ({ identifier }: TokenProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setBreadcrumbs } = useBreadcrumbs()
  type TokenDetail = TokenType & { totalTxs?: number, totalDataContracts?: number, decimals?: number }
  const [token, setToken] = useState<LoadableState<TokenDetail>>({
    data: {} as TokenDetail,
    loading: true,
    error: false
  })
  const [tokenTransactions, setTokenTransactions] = useState<LoadableState<PaginatedResultSet<TokenTransition>>>({
    data: {} as PaginatedResultSet<TokenTransition>,
    props: { currentPage: 0 },
    loading: true,
    error: false
  })
  const pageSize = 10
  const [rate, setRate] = useState<LoadableState<Rate>>({ data: {} as Rate, loading: true, error: false })
  const [activeTab, setActiveTab] = useState(
    tabs.indexOf(defaultTabName.toLowerCase() as typeof tabs[number]) !== -1
      ? tabs.indexOf(defaultTabName.toLowerCase() as typeof tabs[number])
      : -1
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
      .then(res => fetchHandlerSuccess(setToken, res as never))
      .catch(err => fetchHandlerError(setToken, err))

    Api.getTokenTransitions(identifier, Number((tokenTransactions.props as PaginatedProps).currentPage) + 1, pageSize, 'desc')
      .then(res => fetchHandlerSuccess(setTokenTransactions, res))
      .catch(err => fetchHandlerError(setTokenTransactions, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier])

  useEffect(() => {
    const tab = searchParams.get('tab')

    if (tab && tabs.indexOf(tab.toLowerCase() as typeof tabs[number]) !== -1) {
      setActiveTab(tabs.indexOf(tab.toLowerCase() as typeof tabs[number]))
      return
    }

    setActiveTab(tabs.indexOf(defaultTabName.toLowerCase() as typeof tabs[number]) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase() as typeof tabs[number]) : 0)
  }, [searchParams])

  useEffect(() => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))

    if (activeTab === tabs.indexOf(defaultTabName.toLowerCase() as typeof tabs[number]) ||
        (tabs.indexOf(defaultTabName.toLowerCase() as typeof tabs[number]) === -1 && activeTab === 0)) {
      urlParameters.delete('tab')
    } else if (activeTab >= 0 && activeTab < tabs.length) {
      urlParameters.set('tab', tabs[activeTab])
    }

    router.replace(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, router, pathname])

  return (
    <PageDataContainer
      className={'TokenPage'}
      title={'Token Info'}
    >
      <TokenTotalCard token={token as never} loading={token.loading} rate={rate.data}/>

      <InfoContainer styles={['tabs']} className={'TokenPage__ListContainer'}>
        <Tabs onChange={setActiveTab} index={activeTab < 0 ? 0 : activeTab}>
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
              <ActivityList decimals={token?.data?.decimals} activities={tokenTransactions.data?.resultSet as never} loading={false}/>
            </TabPanel>
            <TabPanel>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default Token
