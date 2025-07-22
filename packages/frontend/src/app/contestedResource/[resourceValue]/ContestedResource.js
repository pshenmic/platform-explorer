'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, paginationHandler, setLoadingProp } from '../../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { ContestedResourceTotalCard } from '../../../components/contestedResources'
import { VotesList } from '../../../components/contestedResources/votes'
import contestedResources from '../../../util/contestedResources'

const pagintationConfig = {
  itemsOnPage: {
    default: 10,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

const tabs = [
  'all_votes',
  'towards_identity',
  'abstain',
  'locked'
]

const defaultTabName = 'all_votes'

function ContestedResource ({ resourceValue }) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [contestedResource, setContestedResource] = useState({ data: {}, loading: true, error: false })
  const [votes, setVotes] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [towardsIdentityVotes, setTowardsIdentityVotes] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [abstainVotes, setAbstainVotes] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [lockedVotes, setLockedVotes] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const pageSize = pagintationConfig.itemsOnPage.default
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const decodedValue = contestedResources.decodeValue(decodeURIComponent(resourceValue))

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Contested Resources', path: '/contestedResources' },
      { label: contestedResources.getResourceValue(decodedValue) || resourceValue }
    ])
  }, [setBreadcrumbs, resourceValue, contestedResource])

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

  useEffect(() => {
    Api.getContestedResourceByValue(resourceValue)
      .then(res => fetchHandlerSuccess(setContestedResource, res))
      .catch(err => fetchHandlerError(setContestedResource, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }, [resourceValue])

  useEffect(() => {
    if (!resourceValue) return
    setLoadingProp(setVotes)

    Api.getContestedResourceVotes(resourceValue, votes.props.currentPage + 1, pageSize, 'desc')
      .then(res => fetchHandlerSuccess(setVotes, res))
      .catch(err => fetchHandlerError(setVotes, err))
  }, [resourceValue, votes.props.currentPage])

  useEffect(() => {
    if (!resourceValue) return
    setLoadingProp(setTowardsIdentityVotes)

    Api.getContestedResourceVotes(resourceValue, towardsIdentityVotes.props.currentPage + 1, pageSize, 'desc', { choice: 0 })
      .then(res => fetchHandlerSuccess(setTowardsIdentityVotes, res))
      .catch(err => fetchHandlerError(setTowardsIdentityVotes, err))
  }, [resourceValue, towardsIdentityVotes.props.currentPage])

  useEffect(() => {
    if (!resourceValue) return
    setLoadingProp(setAbstainVotes)

    Api.getContestedResourceVotes(resourceValue, abstainVotes.props.currentPage + 1, pageSize, 'desc', { choice: 1 })
      .then(res => fetchHandlerSuccess(setAbstainVotes, res))
      .catch(err => fetchHandlerError(setAbstainVotes, err))
  }, [resourceValue, abstainVotes.props.currentPage])

  useEffect(() => {
    if (!resourceValue) return
    setLoadingProp(setLockedVotes)

    Api.getContestedResourceVotes(resourceValue, lockedVotes.props.currentPage + 1, pageSize, 'desc', { choice: 2 })
      .then(res => fetchHandlerSuccess(setLockedVotes, res))
      .catch(err => fetchHandlerError(setLockedVotes, err))
  }, [resourceValue, lockedVotes.props.currentPage])

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
      <ContestedResourceTotalCard contestedResource={contestedResource} rate={rate}/>

      <InfoContainer styles={['tabs']}>
        <Tabs onChange={(index) => setActiveTab(index)} index={activeTab}>
          <TabList>
            <Tab>
              All votes
              {votes.data?.resultSet &&
                <span className={`Tabs__TabItemsCount ${votes.data?.resultSet?.length === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {votes.data?.resultSet?.length}
                </span>
              }
            </Tab>
            <Tab>
              Towards Identity
              {towardsIdentityVotes.data?.resultSet &&
                <span className={`Tabs__TabItemsCount ${towardsIdentityVotes.data?.resultSet?.length === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {towardsIdentityVotes.data?.resultSet?.length}
                </span>
              }
            </Tab>
            <Tab>
              Abstain
              {abstainVotes.data?.resultSet &&
                <span className={`Tabs__TabItemsCount ${abstainVotes.data?.resultSet?.length === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {abstainVotes.data?.resultSet?.length}
                </span>
              }
            </Tab>
            <Tab>
              Locked
              {towardsIdentityVotes.data?.resultSet &&
                <span className={`Tabs__TabItemsCount ${lockedVotes.data?.resultSet?.length === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {lockedVotes.data?.resultSet?.length}
                </span>
              }
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel position={'relative'}>
              <VotesList
                votes={votes.data?.resultSet}
                showDataContract={false}
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
              <VotesList
                votes={towardsIdentityVotes.data?.resultSet}
                showDataContract={false}
                pagination={{
                  onPageChange: pagination => paginationHandler(setTowardsIdentityVotes, pagination.selected),
                  pageCount: Math.ceil(towardsIdentityVotes.data?.pagination?.total / pageSize) || 1,
                  forcePage: towardsIdentityVotes.props.currentPage
                }}
                itemsCount={10}
                loading={towardsIdentityVotes.loading}
                error={towardsIdentityVotes.error}
              />
            </TabPanel>
            <TabPanel position={'relative'}>
              <VotesList
                votes={abstainVotes.data?.resultSet}
                showDataContract={false}
                pagination={{
                  onPageChange: pagination => paginationHandler(setAbstainVotes, pagination.selected),
                  pageCount: Math.ceil(abstainVotes.data?.pagination?.total / pageSize) || 1,
                  forcePage: abstainVotes.props.currentPage
                }}
                itemsCount={10}
                loading={abstainVotes.loading}
                error={abstainVotes.error}
              />
            </TabPanel>
            <TabPanel position={'relative'}>
              <VotesList
                votes={lockedVotes.data?.resultSet}
                showDataContract={false}
                pagination={{
                  onPageChange: pagination => paginationHandler(setLockedVotes, pagination.selected),
                  pageCount: Math.ceil(lockedVotes.data?.pagination?.total / pageSize) || 1,
                  forcePage: lockedVotes.props.currentPage
                }}
                itemsCount={10}
                loading={lockedVotes.loading}
                error={lockedVotes.error}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default ContestedResource
