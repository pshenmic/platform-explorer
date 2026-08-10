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
import type { ContestedResource as ContestedResourceType, LoadableState, PaginatedResultSet, Rate, Vote } from '../../../types'

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
] as const

const defaultTabName = 'all_votes'

type Refreshable<T> = LoadableState<T> & { refreshing?: boolean }
type PaginatedProps = { currentPage: number }

function emptyVotes (): Refreshable<PaginatedResultSet<Vote>> {
  return {
    data: {} as PaginatedResultSet<Vote>,
    props: { currentPage: 0 },
    loading: true,
    error: false,
    refreshing: true
  }
}

interface ContestedResourceProps {
  resourceValue: string
}

function ContestedResource ({ resourceValue }: ContestedResourceProps) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [contestedResource, setContestedResource] = useState<Refreshable<ContestedResourceType>>({ data: {} as ContestedResourceType, loading: true, error: false, refreshing: true })
  const [votes, setVotes] = useState(emptyVotes())
  const [towardsIdentityVotes, setTowardsIdentityVotes] = useState(emptyVotes())
  const [abstainVotes, setAbstainVotes] = useState(emptyVotes())
  const [lockedVotes, setLockedVotes] = useState(emptyVotes())
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName as typeof tabs[number]) !== -1 ? tabs.indexOf(defaultTabName as typeof tabs[number]) : 0)
  const [rate, setRate] = useState<Refreshable<Rate>>({ data: {} as Rate, loading: true, error: false, refreshing: true })
  const pageSize = pagintationConfig.itemsOnPage.default
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const decodedValue = contestedResources.decodeValue(decodeURIComponent(resourceValue))

  const [isPollingAfterVote, setIsPollingAfterVote] = useState(false)
  const initialVoteCountRef = useRef<number | null>(null)

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
      { label: contestedResources.getResourceValue(decodedValue as never) || resourceValue }
    ])
  }, [setBreadcrumbs, resourceValue, contestedResource])

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

    Api.getContestedResourceVotes(resourceValue, (votes.props as PaginatedProps).currentPage + 1, pageSize, 'desc')
      .then(res => fetchHandlerSuccess(setVotes, res))
      .catch(err => fetchHandlerError(setVotes, err))
      .finally(() => setVotes(state => ({ ...state, refreshing: false })))
  }, [resourceValue, (votes.props as PaginatedProps).currentPage, votes.refreshing])

  useEffect(() => {
    if (!resourceValue || !towardsIdentityVotes.refreshing) return

    setLoadingProp(setTowardsIdentityVotes)
    Api.getContestedResourceVotes(resourceValue, (towardsIdentityVotes.props as PaginatedProps).currentPage + 1, pageSize, 'desc', { choice: 0 })
      .then(res => fetchHandlerSuccess(setTowardsIdentityVotes, res))
      .catch(err => fetchHandlerError(setTowardsIdentityVotes, err))
      .finally(() => setTowardsIdentityVotes(state => ({ ...state, refreshing: false })))
  }, [resourceValue, (towardsIdentityVotes.props as PaginatedProps).currentPage, towardsIdentityVotes.refreshing])

  useEffect(() => {
    if (!resourceValue || !abstainVotes.refreshing) return

    setLoadingProp(setAbstainVotes)
    Api.getContestedResourceVotes(resourceValue, (abstainVotes.props as PaginatedProps).currentPage + 1, pageSize, 'desc', { choice: 1 })
      .then(res => fetchHandlerSuccess(setAbstainVotes, res))
      .catch(err => fetchHandlerError(setAbstainVotes, err))
      .finally(() => setAbstainVotes(state => ({ ...state, refreshing: false })))
  }, [resourceValue, (abstainVotes.props as PaginatedProps).currentPage, abstainVotes.refreshing])

  useEffect(() => {
    if (!resourceValue || !lockedVotes.refreshing) return

    setLoadingProp(setLockedVotes)
    Api.getContestedResourceVotes(resourceValue, (lockedVotes.props as PaginatedProps).currentPage + 1, pageSize, 'desc', { choice: 2 })
      .then(res => fetchHandlerSuccess(setLockedVotes, res))
      .catch(err => fetchHandlerError(setLockedVotes, err))
      .finally(() => setLockedVotes(state => ({ ...state, refreshing: false })))
  }, [resourceValue, (lockedVotes.props as PaginatedProps).currentPage, lockedVotes.refreshing])

  useEffect(() => {
    const tab = searchParams.get('tab')

    if (tab && tabs.indexOf(tab.toLowerCase() as typeof tabs[number]) !== -1) {
      setActiveTab(tabs.indexOf(tab.toLowerCase() as typeof tabs[number]))
      return
    }

    setActiveTab(tabs.indexOf(defaultTabName.toLowerCase() as typeof tabs[number]) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase() as typeof tabs[number]) : 0)
  }, [searchParams])

  return (
    <PageDataContainer
      className={'ContestedResource'}
      title={'Contested Resource info'}
    >
      <ContestedResourceTotalCard refresh={refreshAfterVote} isPollingAfterVote={isPollingAfterVote} contestedResource={contestedResource as never} rate={rate as never}/>

      <InfoContainer styles={['tabs']}>
        <Tabs onChange={(index: number) => setActiveTab(index)} index={activeTab}>
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
                votes={votes.data?.resultSet as never}
                pagination={{
                  onPageChange: pagination => paginationHandler(setVotes, pagination.selected),
                  pageCount: Math.ceil((votes.data?.pagination?.total ?? 0) / pageSize) || 1,
                  forcePage: (votes.props as PaginatedProps).currentPage
                }}
                itemsCount={10}
                loading={votes.loading}
              />
            </TabPanel>
            <TabPanel position={'relative'}>
              <VotesList
                votes={towardsIdentityVotes.data?.resultSet as never}
                pagination={{
                  onPageChange: pagination => paginationHandler(setTowardsIdentityVotes, pagination.selected),
                  pageCount: Math.ceil((towardsIdentityVotes.data?.pagination?.total ?? 0) / pageSize) || 1,
                  forcePage: (towardsIdentityVotes.props as PaginatedProps).currentPage
                }}
                itemsCount={10}
                loading={towardsIdentityVotes.loading}
              />
            </TabPanel>
            <TabPanel position={'relative'}>
              <VotesList
                votes={abstainVotes.data?.resultSet as never}
                pagination={{
                  onPageChange: pagination => paginationHandler(setAbstainVotes, pagination.selected),
                  pageCount: Math.ceil((abstainVotes.data?.pagination?.total ?? 0) / pageSize) || 1,
                  forcePage: (abstainVotes.props as PaginatedProps).currentPage
                }}
                itemsCount={10}
                loading={abstainVotes.loading}
              />
            </TabPanel>
            <TabPanel position={'relative'}>
              <VotesList
                votes={lockedVotes.data?.resultSet as never}
                pagination={{
                  onPageChange: pagination => paginationHandler(setLockedVotes, pagination.selected),
                  pageCount: Math.ceil((lockedVotes.data?.pagination?.total ?? 0) / pageSize) || 1,
                  forcePage: (lockedVotes.props as PaginatedProps).currentPage
                }}
                itemsCount={10}
                loading={lockedVotes.loading}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default ContestedResource
