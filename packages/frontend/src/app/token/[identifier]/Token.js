'use client'

import { useState, useEffect } from 'react'
// import * as Api from '../../../util/Api'
// import { fetchHandlerSuccess, fetchHandlerError, setLoadingProp } from '../../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { TokenTotalCard } from '../../../components/tokens'
import { IdentitiesList } from '../../../components/identities'
import './Token.scss'

const mockIdentities = {
  resultSet: [
    {
      identifier: '8jRiSLHXeRnmtc8F9iEeoxVZorAywG4apurjS2BHUgQM',
      revision: 0,
      balance: 783312679,
      timestamp: '2024-09-03T18:46:26.452Z',
      txHash: '64CAD045D424344C6251947F452283BD1EB0CFA863A84A6A1B0B02FEA22794AD',
      totalTxs: 4,
      totalTransfers: 2,
      totalDocuments: 2,
      totalDataContracts: 0,
      isSystem: false,
      aliases: [
        {
          alias: '2x2.dash',
          status: 'ok',
          contested: false,
          timestamp: '2024-09-03T21:47:12.253+03:00',
          txHash: '996161AFE95D7D0E12E35A6519E76C5FAA00FAA59FAF8CF998ACB1741E3C1834'
        }
      ],
      totalGasSpent: null,
      averageGasSpent: null,
      totalTopUpsAmount: null,
      totalWithdrawalsAmount: null,
      lastWithdrawalHash: null,
      publicKeys: [],
      fundingCoreTx: null,
      totalTopUps: null,
      totalWithdrawals: null,
      lastWithdrawalTimestamp: null,
      owner: '8jRiSLHXeRnmtc8F9iEeoxVZorAywG4apurjS2BHUgQM'
    },
    {
      identifier: '6Lar6YD3ZBWhV6kmstSPmDpsgJ9BT3DGA7cV2yp251Jf',
      revision: 0,
      balance: 782183263,
      timestamp: '2024-09-03T18:46:42.400Z',
      txHash: '4573477297AE942AB64E689C3CD3A62B46DF7FBBF8460A9F86CD8DA8FAE2FCFD',
      totalTxs: 4,
      totalTransfers: 2,
      totalDocuments: 2,
      totalDataContracts: 0,
      isSystem: false,
      aliases: [
        {
          alias: 'Dash-007.dash',
          status: 'ok',
          contested: false,
          timestamp: '2024-09-03T21:48:29.074+03:00',
          txHash: '90BFFF2B9C3BED44336A6F29EE95F09DF596AD3A3FF11FEFFB724BAC5C7C2C06'
        }
      ],
      totalGasSpent: null,
      averageGasSpent: null,
      totalTopUpsAmount: null,
      totalWithdrawalsAmount: null,
      lastWithdrawalHash: null,
      publicKeys: [],
      fundingCoreTx: null,
      totalTopUps: null,
      totalWithdrawals: null,
      lastWithdrawalTimestamp: null,
      owner: '6Lar6YD3ZBWhV6kmstSPmDpsgJ9BT3DGA7cV2yp251Jf'
    },
    {
      identifier: '96C5EqyAZh3eDsPpFTrFXrMefWnMegxZLq9wUYUUkosX',
      revision: 0,
      balance: 782907318,
      timestamp: '2024-09-03T18:46:56.812Z',
      txHash: '65025CDD150D3B18B0D6D75D9B0BBB1CC86F38840D074DA3A0D3298D3B41D9E6',
      totalTxs: 4,
      totalTransfers: 2,
      totalDocuments: 2,
      totalDataContracts: 0,
      isSystem: false,
      aliases: [
        {
          alias: 'Aaron2.dash',
          status: 'ok',
          contested: false,
          timestamp: '2024-09-03T21:52:17.562+03:00',
          txHash: '1A98D47561ACF4E5451AE50A7A6D06517B5BD511A113C231622CCC8FB4EA537A'
        }
      ],
      totalGasSpent: null,
      averageGasSpent: null,
      totalTopUpsAmount: null,
      totalWithdrawalsAmount: null,
      lastWithdrawalHash: null,
      publicKeys: [],
      fundingCoreTx: null,
      totalTopUps: null,
      totalWithdrawals: null,
      lastWithdrawalTimestamp: null,
      owner: '96C5EqyAZh3eDsPpFTrFXrMefWnMegxZLq9wUYUUkosX'
    }
  ],
  pagination: {
    page: 105,
    limit: 3,
    total: 1761
  }
}

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
  const [token] = useState({ data: {}, loading: true, error: false })
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
      title={'Token Info'}
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
              <IdentitiesList identities={mockIdentities.resultSet} loading={false} error={false}/>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default Token
