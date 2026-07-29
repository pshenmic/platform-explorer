'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useQueries } from '@tanstack/react-query'
import * as Api from '../../util/Api'
import HomeHero from './HomeHero.js'
import { MetricChart, EpochsOverview, StatusBar, HeroMeta, MasternodesDonut, TxTypesBar, ShieldedPoolCard, CompactTxList, CompactBlocksList, DataContractsRating } from '../../components/home'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import theme from '../../styles/theme'
import { Box, Container, Flex, SimpleGrid } from '@chakra-ui/react'
import { CardHead } from '../../components/cards'
import './Home.scss'

function epochNumbersOf (current) {
  if (typeof current !== 'number') return []
  return [current - 3, current - 2, current - 1, current].filter(n => n >= 0)
}

function Home () {
  const [contested, setContested] = useState({ data: {}, loading: true, error: false })
  const [activeContested, setActiveContested] = useState({ data: {}, loading: true, error: false })
  const [latestContested, setLatestContested] = useState({ data: {}, loading: true, error: false })
  const [latestVotes, setLatestVotes] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })

  const gap = theme.blockOffset
  const secondaryStarted = useRef(false)

  // wave 0: hero + overview + validator totals (independent; RQ dedupes Strict Mode double-mount)
  const statusQuery = useQuery({ queryKey: ['home', 'status'], queryFn: Api.getStatus, refetchInterval: 60000 })
  const txQuery = useQuery({ queryKey: ['home', 'transactions'], queryFn: () => Api.getTransactions(1, 10, 'desc'), refetchInterval: 30000 })
  const blocksQuery = useQuery({ queryKey: ['home', 'blocks'], queryFn: () => Api.getBlocks(1, 10, 'desc'), refetchInterval: 30000 })
  const avgBlockTimeQuery = useQuery({
    queryKey: ['home', 'avgBlockTime'],
    queryFn: () => {
      const end = new Date()
      const start = new Date(end.getTime() - 3600000)
      return Api.getAvgBlockTimeHistory(start.toISOString(), end.toISOString(), 1)
    },
    refetchInterval: 60000
  })
  const validatorsQuery = useQuery({
    queryKey: ['home', 'validators', 'total'],
    queryFn: () => Api.getValidators(1, 1, 'desc'),
    staleTime: 60_000
  })
  const validatorsActiveQuery = useQuery({
    queryKey: ['home', 'validators', 'active'],
    queryFn: () => Api.getValidators(1, 1, 'desc', { isActive: 'true' }),
    staleTime: 60_000
  })
  const validatorsBannedQuery = useQuery({
    queryKey: ['home', 'validators', 'banned'],
    queryFn: () => Api.getValidators(1, 1, 'desc', { isBanned: 'true' }),
    staleTime: 60_000
  })
  // inactive straight from the backend (not-active AND not-banned) — no client-side arithmetic
  const validatorsInactiveQuery = useQuery({
    queryKey: ['home', 'validators', 'inactive'],
    queryFn: () => Api.getValidators(1, 1, 'desc', { isActive: 'false', isBanned: 'false' }),
    staleTime: 60_000
  })
  // one page for geoIpInfo (#822): full set on testnet, a sample on large networks
  const validatorsGeoQuery = useQuery({
    queryKey: ['home', 'validators', 'geo'],
    queryFn: () => Api.getValidators(1, 100, 'desc'),
    staleTime: 300_000
  })

  // shape expected by MasternodesDonut ({ data, loading })
  const validators = {
    data: validatorsQuery.data ?? {},
    loading: validatorsQuery.isPending || validatorsQuery.isLoading
  }
  const validatorsActive = {
    data: validatorsActiveQuery.data ?? {},
    loading: validatorsActiveQuery.isPending || validatorsActiveQuery.isLoading
  }
  const validatorsBanned = {
    data: validatorsBannedQuery.data ?? {},
    loading: validatorsBannedQuery.isPending || validatorsBannedQuery.isLoading
  }
  const validatorsInactive = {
    data: validatorsInactiveQuery.data ?? {},
    loading: validatorsInactiveQuery.isPending || validatorsInactiveQuery.isLoading
  }

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

  // gov + rate after status (parallel with epochs); keep them off wave 0 so validators keep bandwidth
  useEffect(() => {
    if (secondaryStarted.current) return
    if (!statusQuery.isSuccess) return
    secondaryStarted.current = true

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
  }, [statusQuery.isSuccess])

  // below-fold charts wait until the first epoch paints (or all epoch queries settle empty)
  const epochsSettled = epochNumbers.length > 0 &&
    epochQueries.length === epochNumbers.length &&
    epochQueries.every(q => !q.isPending && !q.isLoading)
  const belowFoldReady = epochsBaseList.length > 0 || epochsSettled

  const lastAvgBlockTime = [...(avgBlockTimeQuery.data || [])].reverse().find(p => typeof p?.data?.avgBlockTime === 'number')?.data?.avgBlockTime
  const avgBlockTimeSec = typeof lastAvgBlockTime === 'number' ? Math.round(lastAvgBlockTime / 1000) : null

  return (
    <Container
      className={'HomePage'}
      maxW={'container.maxPageW'}
      color={'white'}
      // mobile: tight gutter so card border/shadow aren't clipped; md+: standard 12px
      px={{ base: 2, md: 3 }}
      py={0}
      mt={gap}
      mb={gap}
    >
      <Flex direction={'column'} gap={gap}>
        <HomeHero
          status={statusQuery.data ?? {}}
          loading={statusQuery.isLoading}
          avgBlockTimeSec={avgBlockTimeSec}
          epochNumber={currentEpochNumber}
          epochStartTime={currentEpochPayload?.epoch?.startTime}
          epochEndTime={currentEpochPayload?.epoch?.endTime}
        />

        <Box
          className={'InfoBlock InfoBlock--NoBorder HomeOverview'}
          w={'100%'}
          as={'section'}
          aria-label={'Network overview'}
        >
          <div className={'HomeOverview__Grid'}>
            <div className={'HomeOverview__Sys'}>
              <HeroMeta status={statusQuery.data ?? {}} loading={statusQuery.isLoading}/>
            </div>
            <div className={'HomeOverview__Tx'}>
              <CompactTxList
                transactions={txQuery.data?.resultSet}
                limit={6}
                loading={txQuery.isLoading}
                moreHref={'/transactions'}
                moreLabel={'View all transactions'}
              />
            </div>
            <div className={'HomeOverview__Blocks'}>
              <CompactBlocksList
                blocks={blocksQuery.data?.resultSet}
                limit={6}
                loading={blocksQuery.isLoading}
                moreHref={'/blocks'}
                moreLabel={'View all blocks'}
              />
            </div>
          </div>
        </Box>

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

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={gap} w={'100%'}>
          <MetricChart title={'Transactions history'} type={'bar'} fetcher={Api.getTransactionsHistory} field={'txs'} yAbbr={'txs'} enabled={belowFoldReady}/>
          <MetricChart title={'Identities growth'} type={'line'} fetcher={Api.getIdentitiesHistory} field={'registeredIdentities'} yAbbr={'identities'} enabled={belowFoldReady}/>
          <MetricChart title={'Gas usage'} type={'bar'} fetcher={Api.getTransactionsGasHistory} field={'gas'} yAbbr={'gas'} enabled={belowFoldReady}/>
          <TxTypesBar enabled={belowFoldReady}/>
          <DataContractsRating enabled={belowFoldReady}/>
          <ShieldedPoolCard rate={rate} enabled={belowFoldReady}/>
          <MasternodesDonut validators={validators} validatorsActive={validatorsActive} validatorsBanned={validatorsBanned} validatorsInactive={validatorsInactive} validatorsList={validatorsGeoQuery.data?.resultSet}/>
          <Box className={'InfoBlock InfoBlock--NoBorder HomeGovCard'} w={'100%'}>
            <CardHead title={'Governance'}/>
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
