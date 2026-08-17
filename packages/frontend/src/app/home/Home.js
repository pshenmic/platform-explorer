'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useQueries } from '@tanstack/react-query'
import * as Api from '../../util/Api'
import HomeHero from './HomeHero.js'
import {
  EpochsOverview,
  MasternodesDonut,
  TxTypesBar,
  TxActivityChart,
  IdentityGrowthChart,
  ShieldedPoolCard,
  GovernanceCard,
  HomeLeaders
} from '../../components/home'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import theme from '../../styles/theme'
import { Box, Container, Flex } from '@chakra-ui/react'
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
  // API max limit 100; enough for full testnet pool, sample on larger networks
  const validatorsGeoQuery = useQuery({
    queryKey: ['home', 'validators', 'pool'],
    queryFn: () => Api.getValidators(1, 100, 'desc'),
    staleTime: 60_000,
    refetchInterval: 120_000
  })
  // API isBanned set for matrix coloring (broader than PoSeBanHeight alone)
  const validatorsBannedListQuery = useQuery({
    queryKey: ['home', 'validators', 'banned-list'],
    queryFn: () => Api.getValidators(1, 100, 'desc', { isBanned: 'true' }),
    staleTime: 60_000,
    refetchInterval: 120_000
  })

  const currentQuorumQuery = useQuery({
    queryKey: ['home', 'quorums', 'current'],
    queryFn: () => Api.getCurrentQuorum(),
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1
  })
  const quorumsListQuery = useQuery({
    queryKey: ['home', 'quorums', 'list'],
    queryFn: () => Api.getQuorums(),
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1
  })

  // next formed quorum: lowest blockHeight above current (list omits members)
  const nextQuorumMeta = useMemo(() => {
    const list = quorumsListQuery.data
    const current = currentQuorumQuery.data
    if (!Array.isArray(list) || !current) return null
    const curH = typeof current.blockHeight === 'number' ? current.blockHeight : null
    if (curH == null) return null
    const ahead = list
      .filter(q => typeof q?.blockHeight === 'number' && q.blockHeight > curH)
      .sort((a, b) => a.blockHeight - b.blockHeight)
    return ahead[0] ?? null
  }, [quorumsListQuery.data, currentQuorumQuery.data])

  const nextQuorumQuery = useQuery({
    queryKey: ['home', 'quorums', 'next', nextQuorumMeta?.quorumHash],
    queryFn: () => Api.getQuorumByHash(nextQuorumMeta.quorumHash),
    enabled: Boolean(nextQuorumMeta?.quorumHash),
    staleTime: 60_000,
    retry: 1
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

  // rate early — leaders / shielded cards shouldn't wait on gov/secondary
  useEffect(() => {
    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }, [])

  // gov after status (parallel with epochs); keep them off wave 0 so validators keep bandwidth
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
  }, [statusQuery.isSuccess])

  // below-fold charts wait until the first epoch paints (or all epoch queries settle empty)
  const epochsSettled = epochNumbers.length > 0 &&
    epochQueries.length === epochNumbers.length &&
    epochQueries.every(q => !q.isPending && !q.isLoading)
  const belowFoldReady = epochsBaseList.length > 0 || epochsSettled

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
          rate={rate?.data}
          rateLoading={rate?.loading}
          epochNumber={currentEpochNumber}
          epochEndTime={currentEpochPayload?.epoch?.endTime}
          transactions={txQuery.data?.resultSet}
          transactionsLoading={txQuery.isLoading}
          blocks={blocksQuery.data?.resultSet}
          blocksLoading={blocksQuery.isLoading}
        />

        <Box
          className={'InfoBlock InfoBlock--NoBorder HomeActivity'}
          w={'100%'}
          as={'section'}
          aria-label={'Network charts'}
        >
          <div className={'HomeActivity__Grid'}>
            <div className={'HomeActivity__Types'}>
              <TxTypesBar enabled={belowFoldReady}/>
            </div>
            <div className={'HomeActivity__Charts'}>
              <div className={'HomeActivity__Chart'}>
                <TxActivityChart
                  fetcher={Api.getTransactionsHistory}
                  field={'txs'}
                  yAbbr={'txs'}
                  enabled={belowFoldReady}
                />
              </div>
              <div className={'HomeActivity__Chart'}>
                <IdentityGrowthChart
                  fetcher={Api.getIdentitiesHistory}
                  field={'registeredIdentities'}
                  yAbbr={'identities'}
                  enabled={belowFoldReady}
                />
              </div>
            </div>
          </div>
        </Box>

        <HomeLeaders rate={rate} enabled={belowFoldReady}/>

        <Box
          id={'home-epochs'}
          className={'InfoBlock InfoBlock--NoBorder HomeEpochs'}
          w={'100%'}
          tabIndex={-1}
        >
          <EpochsOverview
            title={'Epochs'}
            epochs={epochsList}
            currentEpoch={epochData}
            rate={rate}
            loading={epochsLoading}
            slotNumbers={epochNumbers}
          />
        </Box>

        <div className={'HomeShieldQuorum'}>
          <div className={'HomeShieldQuorum__Cell'}>
            <ShieldedPoolCard rate={rate} enabled={belowFoldReady}/>
          </div>
          <div className={'HomeShieldQuorum__Cell'}>
            <MasternodesDonut
              validators={validators}
              validatorsActive={validatorsActive}
              validatorsBanned={validatorsBanned}
              validatorsInactive={validatorsInactive}
              validatorsList={validatorsGeoQuery.data?.resultSet}
              bannedValidatorsList={validatorsBannedListQuery.data?.resultSet}
              currentQuorum={currentQuorumQuery.data}
              currentQuorumLoading={currentQuorumQuery.isPending || currentQuorumQuery.isLoading}
              currentQuorumError={currentQuorumQuery.isError}
              nextQuorum={nextQuorumQuery.data}
            />
          </div>
        </div>

        <GovernanceCard
          contested={contested}
          activeContested={activeContested}
          latestContested={latestContested}
          latestVotes={latestVotes}
          epochData={epochData}
        />
      </Flex>
    </Container>
  )
}

export default Home
