'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useQuery, useQueries } from '@tanstack/react-query'
import * as Api from '../../util/Api'
import HomeHero from './HomeHero.js'
import { MetricChart, EpochsOverview, StatusBar, HeroMeta, MasternodesDonut, TxTypesBar, ShieldedPoolCard, CompactTxList, CompactBlocksList } from '../../components/home'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import theme from '../../styles/theme'
import { Box, Container, Flex, Heading, SimpleGrid } from '@chakra-ui/react'
import { ChevronIcon } from '../../components/ui/icons'
import './Home.scss'

function computeAvgBlockTime (blocks) {
  const stamps = (blocks || [])
    .map(b => new Date(b?.header?.timestamp).getTime())
    .filter(t => !Number.isNaN(t))
    .sort((a, b) => b - a)
  if (stamps.length < 2) return null
  let total = 0
  for (let i = 0; i < stamps.length - 1; i++) total += stamps[i] - stamps[i + 1]
  return Math.round(total / (stamps.length - 1) / 1000)
}

function epochNumbersOf (current) {
  if (typeof current !== 'number') return []
  return [current - 3, current - 2, current - 1, current].filter(n => n >= 0)
}

function Home () {
  const [validators, setValidators] = useState({ data: {}, loading: true, error: false })
  const [validatorsActive, setValidatorsActive] = useState({ data: {}, loading: true, error: false })
  const [validatorsBanned, setValidatorsBanned] = useState({ data: {}, loading: true, error: false })
  const [contested, setContested] = useState({ data: {}, loading: true, error: false })
  const [activeContested, setActiveContested] = useState({ data: {}, loading: true, error: false })
  const [latestContested, setLatestContested] = useState({ data: {}, loading: true, error: false })
  const [latestVotes, setLatestVotes] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })

  const gap = theme.blockOffset
  const secondaryStarted = useRef(false)

  // refetchInterval keeps the hero and both lists live; focus revalidation is the v5 default
  const statusQuery = useQuery({ queryKey: ['home', 'status'], queryFn: Api.getStatus, refetchInterval: 60000 })
  const txQuery = useQuery({ queryKey: ['home', 'transactions'], queryFn: () => Api.getTransactions(1, 10, 'desc'), refetchInterval: 30000 })
  const blocksQuery = useQuery({ queryKey: ['home', 'blocks'], queryFn: () => Api.getBlocks(1, 10, 'desc'), refetchInterval: 30000 })

  const currentEpochNumber = statusQuery.data?.epoch?.number
  const epochNumbers = useMemo(() => epochNumbersOf(currentEpochNumber), [currentEpochNumber])

  // one query per epoch — results stream in independently (no Promise.all gate on the skeleton)
  const epochQueries = useQueries({
    queries: epochNumbers.map(n => ({
      queryKey: ['home', 'epoch', n],
      queryFn: () => Api.getEpoch(n),
      staleTime: 30_000,
      // live epoch refreshes with the status cadence; finalized epochs stay cached
      refetchInterval: n === currentEpochNumber ? 60_000 : false
    }))
  })

  // progressive list: whatever has arrived, in epoch order (partial wave is OK)
  const epochDataStamp = epochQueries.map(q => `${q.dataUpdatedAt}:${q.fetchStatus}`).join('|')
  const epochsBaseList = useMemo(() => (
    epochNumbers
      .map((n, i) => epochQueries[i]?.data)
      .filter(Boolean)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- stamp tracks per-query arrivals
  ), [epochNumbers, epochDataStamp])

  const epochsLoading = typeof currentEpochNumber !== 'number' ||
    (epochsBaseList.length === 0 && epochQueries.some(q => q.isPending || q.isLoading))

  // phase B: first-block meta only after an epoch exists (does not block the wave)
  const blockQueries = useQueries({
    queries: epochsBaseList.map(ep => {
      const height = ep?.epoch?.firstBlockHeight
      return {
        queryKey: ['home', 'epoch-block', height],
        queryFn: () => Api.getBlocks(1, 1, 'asc', { height_min: height, height_max: height }),
        enabled: height != null,
        staleTime: 60_000
      }
    })
  })

  const blockDataStamp = blockQueries.map(q => q.dataUpdatedAt).join('|')
  const epochsList = useMemo(() => (
    epochsBaseList.map((ep, i) => {
      const blockRes = blockQueries[i]?.data
      if (!blockRes) return ep
      return {
        ...ep,
        protocolVersion: blockRes?.resultSet?.[0]?.header?.appVersion ?? null,
        firstBlockHash: blockRes?.resultSet?.[0]?.header?.hash ?? null
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- stamp tracks block enrich arrivals
  ), [epochsBaseList, blockDataStamp])

  const currentEpochPayload = epochsList.find(e => e?.epoch?.number === currentEpochNumber) || null
  const epochData = {
    data: currentEpochPayload || {},
    loading: typeof currentEpochNumber === 'number' && !currentEpochPayload && epochsLoading,
    error: false
  }

  // secondary cards wait until the first epoch has painted (or all epoch queries settled empty)
  useEffect(() => {
    if (secondaryStarted.current) return
    if (typeof currentEpochNumber !== 'number') return

    const epochsSettled = epochNumbers.length > 0 &&
      epochQueries.length === epochNumbers.length &&
      epochQueries.every(q => !q.isPending && !q.isLoading)
    const canStartSecondary = epochsBaseList.length > 0 || epochsSettled
    if (!canStartSecondary) return

    secondaryStarted.current = true

    Api.getValidators(1, 100, 'desc')
      .then(res => fetchHandlerSuccess(setValidators, res))
      .catch(err => fetchHandlerError(setValidators, err))

    Api.getValidators(1, 1, 'desc', { isActive: 'true' })
      .then(res => fetchHandlerSuccess(setValidatorsActive, res))
      .catch(err => fetchHandlerError(setValidatorsActive, err))

    Api.getValidators(1, 1, 'desc', { isBanned: 'true' })
      .then(res => fetchHandlerSuccess(setValidatorsBanned, res))
      .catch(err => fetchHandlerError(setValidatorsBanned, err))

    Api.getContestedResourcesStats()
      .then(res => fetchHandlerSuccess(setContested, res))
      .catch(err => fetchHandlerError(setContested, err))

    Api.getContestedResources(1, 10, 'desc', undefined, { voting_finished: false })
      .then(res => fetchHandlerSuccess(setActiveContested, res))
      .catch(err => fetchHandlerError(setActiveContested, err))

    Api.getContestedResources(1, 5, 'desc')
      .then(res => fetchHandlerSuccess(setLatestContested, res))
      .catch(err => fetchHandlerError(setLatestContested, err))

    Api.getMasternodeVotes(1, 10, 'desc')
      .then(res => fetchHandlerSuccess(setLatestVotes, res))
      .catch(err => fetchHandlerError(setLatestVotes, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }, [currentEpochNumber, epochNumbers.length, epochsBaseList.length, epochQueries])

  const avgBlockTimeSec = computeAvgBlockTime(blocksQuery.data?.resultSet)

  return (
    <Container className={'HomePage'} maxW={'container.maxPageW'} color={'white'} px={3} py={0} mt={gap} mb={gap}>
      <Flex direction={'column'} gap={gap}>
        <HomeHero status={statusQuery.data ?? {}} loading={statusQuery.isLoading} avgBlockTimeSec={avgBlockTimeSec}/>

        <Box className={'InfoBlock InfoBlock--NoBorder HomeOverview'} w={'100%'}>
          <Heading className={'InfoBlock__Title'} as={'h2'}>Network overview</Heading>
          <div className={'HomeOverview__Grid'}>
            <div className={'HomeOverview__Sys'}>
              <HeroMeta status={statusQuery.data ?? {}} loading={statusQuery.isLoading}/>
            </div>
            <div className={'HomeOverview__Tx'}>
              <div className={'HomeOverview__TxHead'}>
                <span className={'HomeOverview__TxTitle'}>Latest Transactions</span>
                <Link href={'/transactions'} className={'HomeOverview__More'}>Show more <ChevronIcon w={'5px'} h={'8px'}/></Link>
              </div>
              <CompactTxList transactions={txQuery.data?.resultSet} limit={7} loading={txQuery.isLoading}/>
            </div>
            <div className={'HomeOverview__Blocks'}>
              <div className={'HomeOverview__TxHead'}>
                <span className={'HomeOverview__TxTitle'}>Latest Blocks</span>
                <Link href={'/blocks'} className={'HomeOverview__More'}>Show more <ChevronIcon w={'5px'} h={'8px'}/></Link>
              </div>
              <CompactBlocksList blocks={blocksQuery.data?.resultSet} limit={7} loading={blocksQuery.isLoading}/>
            </div>
          </div>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={gap} w={'100%'}>
          <MetricChart title={'Transactions history'} type={'bar'} fetcher={Api.getTransactionsHistory} field={'txs'} yAbbr={'txs'}/>
          <MetricChart title={'Identities growth'} type={'line'} fetcher={Api.getIdentitiesHistory} field={'registeredIdentities'} yAbbr={'identities'}/>
          <ShieldedPoolCard rate={rate}/>
        </SimpleGrid>

        <Box className={'InfoBlock InfoBlock--NoBorder HomeEpochs'} w={'100%'}>
          <EpochsOverview
            title={'Epochs'}
            epochs={epochsList}
            currentEpoch={epochData}
            rate={rate}
            loading={epochsLoading}
            slotNumbers={epochNumbers}
          />
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={gap} w={'100%'}>
          <TxTypesBar/>
          <MasternodesDonut validators={validators} validatorsActive={validatorsActive} validatorsBanned={validatorsBanned}/>
          <Box className={'InfoBlock InfoBlock--NoBorder HomeGovCard'} w={'100%'}>
            <Heading className={'InfoBlock__Title'} as={'h2'}>Governance</Heading>
            <StatusBar
              contested={contested}
              activeContested={activeContested}
              latestContested={latestContested}
              latestVotes={latestVotes}
              epochData={epochData}
            />
          </Box>
        </SimpleGrid>
      </Flex>
    </Container>
  )
}

export default Home
