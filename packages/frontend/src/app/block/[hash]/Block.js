'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import TransactionsList from '../../../components/transactions/TransactionsList'
import { ErrorMessageBlock } from '../../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { Container, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react'
import { BlockDigestCard, BlockTotalCard, QuorumMembersList } from '../../../components/blocks'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { networks } from '../../../constants/networks'
import { QuorumInfo } from '../../../components/blocks/quorum'
import './Block.scss'

const tabs = [
  'transactions',
  'quorum-members',
  'quorum-info'
]

const defaultTabName = 'transactions'

function Block ({ hash }) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [block, setBlock] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const activeNetwork = networks.find(network => network.explorerBaseUrl === baseUrl)
  const l1explorerBaseUrl = activeNetwork?.l1explorerBaseUrl || null
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    Api.getStatus()
      .then(res => fetchHandlerSuccess(setStatus, res))
      .catch(err => fetchHandlerError(setStatus, err))
  }, [])

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Blocks', path: '/blocks' },
      { label: hash, icon: 'block' }
    ])
  }, [setBreadcrumbs, hash])

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
  }, [activeTab])

  const fetchData = () => {
    setBlock(state => ({ ...state, loading: true }))

    Api.getBlockByHash(hash)
      .then(res => fetchHandlerSuccess(setBlock, res))
      .catch(err => fetchHandlerError(setBlock, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }

  useEffect(fetchData, [hash])

  return (
    <PageDataContainer
      className={'Block'}
      title={'Block info'}
    >
      <div className={'Block__InfoBlocks'}>
        <BlockTotalCard
          className={'Block__InfoBlock'}
          l1explorerBaseUrl={l1explorerBaseUrl}
          block={block}
        />
        <BlockDigestCard
          className={'Block__InfoBlock'}
          block={block}
          rate={rate}
          l1explorerBaseUrl={l1explorerBaseUrl}
          status={status}
        />
      </div>

      <InfoContainer styles={['tabs']}>
        <Tabs onChange={(index) => setActiveTab(index)} index={activeTab}>
          <TabList>
            <Tab>Transactions {block.data?.txs?.length !== undefined
              ? <span
                className={`Tabs__TabItemsCount ${block.data?.txs?.length === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {block.data?.txs?.length}
                </span>
              : ''}
            </Tab>
            <Tab>Quorum Members {block?.data?.quorum?.members?.length !== undefined
              ? <span
                className={`Tabs__TabItemsCount ${block?.data?.quorum?.members?.length === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {block?.data?.quorum?.members?.length}
                </span>
              : ''}
            </Tab>
            <Tab>Quorum Info</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {!block.error
                ? <TransactionsList
                    transactions={block.data?.txs}
                    rate={rate.data}
                    loading={block.loading}
                  />
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel>
              {!block.error
                ? <QuorumMembersList
                    members={block?.data?.quorum?.members}
                    loading={block.loading}
                  />
                : <Container h={20}><ErrorMessageBlock/></Container>
              }
            </TabPanel>
            <TabPanel>
              <QuorumInfo
                quorum={block?.data?.quorum}
                l1explorerBaseUrl={l1explorerBaseUrl}
                loading={block?.loading}
                showQuorumMembers={() => setActiveTab(tabs.indexOf('quorum-members'))}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default Block
