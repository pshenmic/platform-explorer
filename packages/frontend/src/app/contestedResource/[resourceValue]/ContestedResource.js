'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, paginationHandler, setLoadingProp } from '../../../util'
import {
  // usePathname, useRouter,
  useSearchParams
} from 'next/navigation'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { Tabs, TabList, TabPanels, Tab, TabPanel, Code, Box } from '@chakra-ui/react'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { ContestedResourceTotalCard } from '../../../components/contestedResources'
import { VotesList } from '../../../components/contestedResources/votes'

const pagintationConfig = {
  itemsOnPage: {
    default: 10,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

const tabs = [
  'All votes',
  'Towards Identity',
  'Abstain',
  'Locked'
]

const defaultTabName = 'All votes'

function ContestedResource ({ resourceValue }) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [contestedResource, setContestedResource] = useState({ data: {}, loading: true, error: false })
  const [votes, setVotes] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  // const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  // const router = useRouter()
  // const pathname = usePathname()
  const searchParams = useSearchParams()
  const pageSize = pagintationConfig.itemsOnPage.default

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Contested Resources', path: '/contestedResources' },
      { label: resourceValue }
    ])
  }, [setBreadcrumbs, resourceValue, contestedResource])

  useEffect(() => {
    Api.getContestedResourceByValue(resourceValue)
      .then(res => fetchHandlerSuccess(setContestedResource, res))
      .catch(err => fetchHandlerError(setContestedResource, err))
  }, [resourceValue])

  useEffect(() => {
    if (!resourceValue) return
    setLoadingProp(setVotes)

    // value, page = 1, limit = 30, order = 'asc', filters = {}

    Api.getContestedResourceVotes(resourceValue, votes.props.currentPage + 1, pageSize, 'desc')
      .then(res => fetchHandlerSuccess(setVotes, res))
      .catch(err => fetchHandlerError(setVotes, err))
  }, [resourceValue, votes.props.currentPage])

  console.log('votes', votes)

  useEffect(() => {
    const tab = searchParams.get('tab')

    if (tab && tabs.indexOf(tab.toLowerCase()) !== -1) {
      setActiveTab(tabs.indexOf(tab.toLowerCase()))
      return
    }

    setActiveTab(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  }, [searchParams])

  return (
    <PageDataContainer
      className={'ContestedResource'}
      title={'Contested Resource info'}
    >
      <ContestedResourceTotalCard contestedResource={contestedResource}/>

      <Box boxSize={'2rem'}/>

      <InfoContainer styles={['tabs']}>
        <Tabs onChange={(index) => setActiveTab(index)} index={activeTab}>
          <TabList>
            <Tab>
              All votes
              <span className={'Tabs__TabItemsCount'}>
                111
              </span>
            </Tab>
            <Tab>
              Towards Identity
              <span className={'Tabs__TabItemsCount'}>
                111
              </span>
            </Tab>
            <Tab>
              ABSTAIN
              <span className={'Tabs__TabItemsCount Tabs__TabItemsCount--Empty'}>
                0
              </span>
            </Tab>
            <Tab>
              Locked
              <span className={'Tabs__TabItemsCount'}>
                111
              </span>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel position={'relative'}>
              <VotesList
                votes={votes.data?.resultSet}
                pagination={{
                  onPageChange: pagination => paginationHandler(setVotes, pagination.selected),
                  pageCount: Math.ceil(votes.data?.pagination?.total / pageSize) || 1,
                  forcePage: votes.props.currentPage
                }}
                itemsCount={10}
                loading={votes.loading}
                error={votes.error}
              />
            </TabPanel>
            <TabPanel position={'relative'}>
              Towards Identity
            </TabPanel>
            <TabPanel position={'relative'}>
              ABSTAIN
            </TabPanel>
            <TabPanel position={'relative'}>
              Locked
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>

      <Code
        borderRadius={'lg'}
        px={5}
        py={4}
        mt={10}
      >
        {JSON.stringify(contestedResource.data, null, 2)}
      </Code>
    </PageDataContainer>
  )
}

export default ContestedResource
