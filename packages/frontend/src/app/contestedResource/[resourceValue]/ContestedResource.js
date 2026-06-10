'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [contestedResource, setContestedResource] = useState({ data: {}, loading: true, error: false, refreshing: true })
  const [votes, setVotes] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false, refreshing: true })
  const [towardsIdentityVotes, setTowardsIdentityVotes] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false, refreshing: true })
  const [abstainVotes, setAbstainVotes] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false, refreshing: true })
  const [lockedVotes, setLockedVotes] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false, refreshing: true })
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  const [rate, setRate] = useState({ data: {}, loading: true, error: false, refreshing: true })
  const pageSize = pagintationConfig.itemsOnPage.default
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const decodedValue = contestedResources.decodeValue(decodeURIComponent(resourceValue))

  const [isPollingAfterVote, setIsPollingAfterVote] = useState(false)
  const initialVoteCountRef = useRef(null)

  const refreshAfterVote = () => {
    initialVoteCountRef.current = contestedResource.data?.totalCountVotes ?? 0
    setIsPollingAfterVote(true)
  }

  useEffect(() => {
    if (!isPollingAfterVote) return

    const POLL_INTERVAL = 2000
    const MAX_ATTEMPTS = 5
    let attempts = 0

    const poll = () => {
      attempts++
      setContestedResource(state => ({ ...state, refreshing: true }))
      setVotes(state => ({ ...state, refreshing: true }))

      if (attempts >= MAX_ATTEMPTS) {
        setIsPollingAfterVote(false)
      }
    }

    poll()
    const timer = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [isPollingAfterVote])

  useEffect(() => {
    if (!isPollingAfterVote) return
    const latest = contestedResource.data?.totalCountVotes ?? 0
    if (initialVoteCountRef.current != null && latest > initialVoteCountRef.current) {
      setIsPollingAfterVote(false)
    }
  }, [contestedResource.data?.totalCountVotes, isPollingAfterVote])

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
    if (!resourceValue || !contestedResource.refreshing) return

    const isInitialLoad = contestedResource.data == null || Object.keys(contestedResource.data).length === 0
    if (isInitialLoad) setContestedResource(state => ({ ...state, loading: true }))

    Api.getContestedResourceByValue(resourceValue)
      .then(res => fetchHandlerSuccess(setContestedResource, res))
      .catch(err => fetchHandlerError(setContestedResource, err))
      .finally(() => setContestedResource(state => ({ ...state, refreshing: false })))
  }, [resourceValue, contestedResource.refreshing])

  useEffect(() => {
    if (!rate.refreshing) return

    setRate(state => ({ ...state, loading: true }))
    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
      .finally(() => setRate(state => ({ ...state, refreshing: false })))
  }, [rate.refreshing])

  useEffect(() => {
    if (!resourceValue || !votes.refreshing) return

    const isInitialLoad = votes.data == null || Object.keys(votes.data).length === 0
    if (isInitialLoad) setLoadingProp(setVotes)

    Api.getContestedResourceVotes(resourceValue, votes.props.currentPage + 1, pageSize, 'desc')
      .then(res => fetchHandlerSuccess(setVotes, res))
      .catch(err => fetchHandlerError(setVotes, err))
      .finally(() => setVotes(state => ({ ...state, refreshing: false })))
  }, [resourceValue, votes.props.currentPage, votes.refreshing])

  useEffect(() => {
    if (!resourceValue || !towardsIdentityVotes.refreshing) return

    setLoadingProp(setTowardsIdentityVotes)
    Api.getContestedResourceVotes(resourceValue, towardsIdentityVotes.props.currentPage + 1, pageSize, 'desc', { choice: 0 })
      .then(res => fetchHandlerSuccess(setTowardsIdentityVotes, res))
      .catch(err => fetchHandlerError(setTowardsIdentityVotes, err))
      .finally(() => setTowardsIdentityVotes(state => ({ ...state, refreshing: false })))
  }, [resourceValue, towardsIdentityVotes.props.currentPage, towardsIdentityVotes.refreshing])

  useEffect(() => {
    if (!resourceValue || !abstainVotes.refreshing) return

    setLoadingProp(setAbstainVotes)
    Api.getContestedResourceVotes(resourceValue, abstainVotes.props.currentPage + 1, pageSize, 'desc', { choice: 1 })
      .then(res => fetchHandlerSuccess(setAbstainVotes, res))
      .catch(err => fetchHandlerError(setAbstainVotes, err))
      .finally(() => setAbstainVotes(state => ({ ...state, refreshing: false })))
  }, [resourceValue, abstainVotes.props.currentPage, abstainVotes.refreshing])

  useEffect(() => {
    if (!resourceValue || !lockedVotes.refreshing) return

    setLoadingProp(setLockedVotes)
    Api.getContestedResourceVotes(resourceValue, lockedVotes.props.currentPage + 1, pageSize, 'desc', { choice: 2 })
      .then(res => fetchHandlerSuccess(setLockedVotes, res))
      .catch(err => fetchHandlerError(setLockedVotes, err))
      .finally(() => setLockedVotes(state => ({ ...state, refreshing: false })))
  }, [resourceValue, lockedVotes.props.currentPage, lockedVotes.refreshing])

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
      <ContestedResourceTotalCard refresh={refreshAfterVote} isPollingAfterVote={isPollingAfterVote} contestedResource={contestedResource} rate={rate}/>

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
