'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueries } from '@tanstack/react-query'
import * as Api from '../../util/Api'
import HomeHero from './HomeHero'
import {
  EpochsOverview,
  QuorumCard,
  TxTypesBar,
  TxActivityChart,
  IdentityGrowthChart,
  ShieldedPoolCard,
  HomeLeaders,
  CompactTxList,
  CompactBlocksList,
  HeroMeta,
  HeroNodes
} from '../../components/home'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import theme from '../../styles/theme'
import { Box, Container, Flex } from '@chakra-ui/react'
import type { LoadableState, Rate } from '../../types'
import type { QueryFilters } from '../../util/Api'
import './Home.css'

function computeAvgBlockTime(blocks: any) {
  const stamps = (blocks || [])
    .map((b: any) => new Date(b?.header?.timestamp).getTime())
    .filter((t: number) => !Number.isNaN(t))
    .sort((a: number, b: number) => b - a)
  if (stamps.length < 2) return null
  let total = 0
  for (let i = 0; i < stamps.length - 1; i++) total += stamps[i] - stamps[i + 1]
  return Math.round(total / (stamps.length - 1) / 1000)
}

function epochNumbersOf(current: unknown) {
  if (typeof current !== 'number') return []
  return [current - 3, current - 2, current - 1, current].filter(n => n >= 0)
}

const VALIDATORS_PAGE = 100

async function fetchAllValidators(filters?: QueryFilters) {
  const first = await Api.getValidators(1, VALIDATORS_PAGE, 'desc', filters)
  const rows = Array.isArray(first?.resultSet) ? [...first.resultSet] : []
  const total = typeof first?.pagination?.total === 'number' ? first.pagination.total : rows.length
  const pages = Math.max(1, Math.ceil(total / VALIDATORS_PAGE))
  if (pages <= 1) return rows
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) =>
      Api.getValidators(i + 2, VALIDATORS_PAGE, 'desc', filters)
    )
  )
  for (const page of rest) {
    if (Array.isArray(page?.resultSet)) rows.push(...page.resultSet)
  }
  return rows
}

function Home() {
  const [rate, setRate] = useState<LoadableState<Rate>>({ data: null, loading: true, error: false })

  const gap = theme.blockOffset

  const statusQuery = useQuery({
    queryKey: ['home', 'status'],
    queryFn: Api.getStatus,
    refetchInterval: 60000
  })
  const txQuery = useQuery({
    queryKey: ['home', 'transactions'],
    queryFn: () => Api.getTransactions(1, 10, 'desc'),
    refetchInterval: 30000
  })
  const blocksQuery = useQuery({
    queryKey: ['home', 'blocks'],
    queryFn: () => Api.getBlocks(1, 10, 'desc'),
    refetchInterval: 30000
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
  const validatorsInactiveQuery = useQuery({
    queryKey: ['home', 'validators', 'inactive'],
    queryFn: () => Api.getValidators(1, 1, 'desc', { isActive: 'false', isBanned: 'false' }),
    staleTime: 60_000
  })
  const validatorsPoolHeadQuery = useQuery({
    queryKey: ['home', 'validators', 'pool', 'head'],
    queryFn: () => Api.getValidators(1, VALIDATORS_PAGE, 'desc'),
    staleTime: 60_000,
    refetchInterval: 120_000
  })
  const poolTotal =
    (typeof validatorsPoolHeadQuery.data?.pagination?.total === 'number'
      ? validatorsPoolHeadQuery.data.pagination.total
      : null) ??
    (typeof validatorsQuery.data?.pagination?.total === 'number'
      ? validatorsQuery.data.pagination.total
      : null)
  const poolPages =
    typeof poolTotal === 'number' ? Math.max(1, Math.ceil(poolTotal / VALIDATORS_PAGE)) : 1
  const validatorsPoolRestQuery = useQuery({
    queryKey: ['home', 'validators', 'pool', 'rest', poolTotal],
    queryFn: async () => {
      const rest = await Promise.all(
        Array.from({ length: poolPages - 1 }, (_, i) =>
          Api.getValidators(i + 2, VALIDATORS_PAGE, 'desc')
        )
      )
      const rows = []
      for (const page of rest) {
        if (Array.isArray(page?.resultSet)) rows.push(...page.resultSet)
      }
      return rows
    },
    enabled: validatorsPoolHeadQuery.isSuccess && poolPages > 1,
    staleTime: 60_000,
    refetchInterval: 120_000
  })
  const validatorsPoolList = useMemo(() => {
    const head = validatorsPoolHeadQuery.data?.resultSet
    const rest = validatorsPoolRestQuery.data
    const rows = Array.isArray(head) ? [...head] : []
    if (Array.isArray(rest)) rows.push(...rest)
    return rows
  }, [validatorsPoolHeadQuery.data, validatorsPoolRestQuery.data])
  const validatorsBannedListQuery = useQuery({
    queryKey: ['home', 'validators', 'banned-list'],
    queryFn: () => fetchAllValidators({ isBanned: 'true' }),
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

  const epochQueries = useQueries({
    queries: epochNumbers.map(n => ({
      queryKey: ['home', 'epoch', n],
      queryFn: () => Api.getEpoch(n),
      staleTime: 30_000,
      refetchInterval: n === currentEpochNumber ? 60_000 : false
    }))
  })

  const epochDataStamp = epochQueries.map(q => `${q.dataUpdatedAt}:${q.fetchStatus}`).join('|')
  const epochsBaseList = useMemo(
    () => epochNumbers.map((n, i) => epochQueries[i]?.data).filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stamp tracks per-query arrivals
    [epochNumbers, epochDataStamp]
  )

  const epochsLoading =
    typeof currentEpochNumber !== 'number' ||
    (epochsBaseList.length === 0 && epochQueries.some(q => q.isPending || q.isLoading))

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
  const epochsList = useMemo(
    () =>
      epochsBaseList.map((ep, i) => {
        const blockRes = blockQueries[i]?.data
        if (!blockRes) return ep
        return {
          ...ep,
          protocolVersion: blockRes?.resultSet?.[0]?.header?.appVersion ?? null,
          firstBlockHash: blockRes?.resultSet?.[0]?.header?.hash ?? null
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stamp tracks block enrich arrivals
    [epochsBaseList, blockDataStamp]
  )

  const currentEpochPayload = epochsList.find(e => e?.epoch?.number === currentEpochNumber) || null
  const epochData = {
    data: currentEpochPayload || {},
    loading: typeof currentEpochNumber === 'number' && !currentEpochPayload && epochsLoading,
    error: false
  }

  useEffect(() => {
    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }, [])

  const epochsSettled =
    epochNumbers.length > 0 &&
    epochQueries.length === epochNumbers.length &&
    epochQueries.every(q => !q.isPending && !q.isLoading)
  const belowFoldReady = epochsBaseList.length > 0 || epochsSettled

  return (
    <Container
      className={'HomePage'}
      maxW={'container.maxPageW'}
      color={'white'}
      px={{ base: 2, md: 3 }}
      py={0}
      mt={gap}
      mb={gap}
    >
      <Flex direction={'column'} gap={gap}>
        <HomeHero
          status={statusQuery.data ?? {}}
          loading={statusQuery.isLoading}
          epochNumber={currentEpochNumber}
          epochEndTime={currentEpochPayload?.epoch?.endTime}
          avgBlockTimeSec={computeAvgBlockTime(blocksQuery.data?.resultSet)}
        />

        <Box
          className={'InfoBlock InfoBlock--NoBorder HomeOverview'}
          w={'100%'}
          as={'section'}
          aria-label={'Network overview'}
        >
          <div className={'HomeOverview__Grid'}>
            <div className={'HomeOverview__Sys'}>
              <HeroNodes compact className={'HomeOverview__Nodes'} />
              <HeroMeta status={statusQuery.data ?? {}} loading={statusQuery.isLoading} />
            </div>
            <div className={'HomeOverview__Tx'}>
              <CompactTxList
                transactions={txQuery.data?.resultSet}
                limit={5}
                loading={txQuery.isLoading}
                moreHref={'/transactions'}
                moreLabel={'View all transactions'}
              />
            </div>
            <div className={'HomeOverview__Blocks'}>
              <CompactBlocksList
                blocks={blocksQuery.data?.resultSet}
                limit={5}
                loading={blocksQuery.isLoading}
                moreHref={'/blocks'}
                moreLabel={'View all blocks'}
              />
            </div>
          </div>
        </Box>

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

        <div className={'HomeCardPair HomeCardPair--metrics'}>
          <div className={'HomeCardPair__Cell'}>
            <TxActivityChart
              fetcher={Api.getTransactionsHistory}
              field={'txs'}
              yAbbr={'txs'}
              enabled={belowFoldReady}
            />
          </div>
          <div className={'HomeCardPair__Cell'}>
            <IdentityGrowthChart
              fetcher={Api.getIdentitiesHistory}
              field={'registeredIdentities'}
              yAbbr={'identities'}
              enabled={belowFoldReady}
            />
          </div>
        </div>

        <div className={'HomeCardPair HomeCardPair--viz'}>
          <div className={'HomeCardPair__Cell'}>
            <TxTypesBar enabled={belowFoldReady} />
          </div>
          <div className={'HomeCardPair__Cell'}>
            <ShieldedPoolCard rate={rate} enabled={belowFoldReady} />
          </div>
        </div>

        <div className={'HomeCardPair HomeCardPair--leaders'}>
          <div className={'HomeCardPair__Cell'}>
            <HomeLeaders rate={rate} enabled={belowFoldReady} />
          </div>
          <div className={'HomeCardPair__Cell'}>
            <QuorumCard
              validators={validators}
              validatorsActive={validatorsActive}
              validatorsBanned={validatorsBanned}
              validatorsInactive={validatorsInactive}
              validatorsList={validatorsPoolList}
              poolLoading={
                validatorsPoolHeadQuery.isPending ||
                (validatorsPoolHeadQuery.isSuccess &&
                  poolPages > 1 &&
                  validatorsPoolRestQuery.isPending)
              }
              bannedValidatorsList={validatorsBannedListQuery.data}
              bannedListLoading={validatorsBannedListQuery.isPending}
              currentQuorum={currentQuorumQuery.data}
              currentQuorumLoading={currentQuorumQuery.isPending || currentQuorumQuery.isLoading}
              currentQuorumError={currentQuorumQuery.isError}
              quorums={quorumsListQuery.data}
              avgBlockTimeSec={computeAvgBlockTime(blocksQuery.data?.resultSet)}
            />
          </div>
        </div>
      </Flex>
    </Container>
  )
}

export default Home
