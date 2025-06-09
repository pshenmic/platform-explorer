'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, setLoadingProp } from '../../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import './Token.scss'
import {TokenTotalCard} from "../../../components/tokens";

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
  // const pageSize = 10
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
    // Api.getToken(identifier)
    //   .then(paginatedTransactions => fetchHandlerSuccess(setTdentity, paginatedTransactions))
    //   .catch(err => fetchHandlerError(setTdentity, err))

    // Api.getRate()
    //   .then(res => fetchHandlerSuccess(setRate, res))
    //   .catch(err => fetchHandlerError(setRate, err))
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
      title={'Token info'}
    >
       <TokenTotalCard token={token} />

      <InfoContainer styles={['tabs']} className={'tokenPage__ListContainer'}>
        <Tabs onChange={setActiveTab} index={activeTab}>
          <TabList>
            <Tab>Activity {token.data?.totalTxs !== undefined
              ? <span className={`Tabs__TabItemsCount ${token.data?.totalTxs === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {token.data?.totalTxs}
                </span>
              : ''}
            </Tab>
            <Tab>Holders {token.data?.totalDataContracts !== undefined
              ? <span className={`Tabs__TabItemsCount ${token.data?.totalDataContracts === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {token.data?.totalDataContracts}
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
