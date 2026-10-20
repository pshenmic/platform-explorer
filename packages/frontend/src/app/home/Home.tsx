'use client'

import { useState, useEffect, useMemo, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { useQuery, useQueries } from '@tanstack/react-query'
import * as Api from '../../util/Api'
import HomeHero from './HomeHero'
import useNearViewport from '../../hooks/useNearViewport'
import { HeroMeta } from '../../components/home/HeroMeta'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import type { LoadableState, Rate } from '../../types'
import type { QueryFilters } from '../../util/Api'
import { useHomeStatus } from '../../components/home/hooks/useHomeStatus'
import './Home.css'

function HomeChunkPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div className={`HomeChunkPlaceholder ${className}`} aria-hidden={'true'} aria-busy={'true'} />
  )
}

function HomeViewportContent({
  enabled,
  placeholder,
  children
}: {
  enabled: boolean
  placeholder: 'epochs' | 'chart' | 'leaders'
  children: ReactNode
}) {
  return enabled ? (
    children
  ) : (
    <HomeChunkPlaceholder className={`HomeChunkPlaceholder--${placeholder}`} />
  )
}

const CompactTxList = dynamic(
  () => import('../../components/home/CompactTxList').then(mod => ({ default: mod.CompactTxList })),
  {
    ssr: false,
    loading: () => <HomeChunkPlaceholder className={'HomeChunkPlaceholder--list'} />
  }
)
const CompactBlocksList = dynamic(
  () =>
    import('../../components/home/CompactBlocksList').then(mod => ({
      default: mod.CompactBlocksList
    })),
  {
    ssr: false,
    loading: () => <HomeChunkPlaceholder className={'HomeChunkPlaceholder--list'} />
  }
)
const HeroNodes = dynamic(() => import('../../components/home/HeroNodes'), { ssr: false })
const EpochsOverview = dynamic(
  () =>
    import('../../components/home/EpochsOverview').then(mod => ({ default: mod.EpochsOverview })),
  {
    ssr: false,
    loading: () => <HomeChunkPlaceholder className={'HomeChunkPlaceholder--epochs'} />
  }
)
const TxActivityChart = dynamic(() => import('../../components/home/TxActivityChart'), {
  ssr: false,
  loading: () => <HomeChunkPlaceholder className={'HomeChunkPlaceholder--chart'} />
})
const IdentityGrowthChart = dynamic(() => import('../../components/home/IdentityGrowthChart'), {
  ssr: false,
  loading: () => <HomeChunkPlaceholder className={'HomeChunkPlaceholder--chart'} />
})
const TxTypesBar = dynamic(() => import('../../components/home/TxTypesBar'), {
  ssr: false,
  loading: () => <HomeChunkPlaceholder className={'HomeChunkPlaceholder--chart'} />
})
const ShieldedPoolCard = dynamic(() => import('../../components/home/ShieldedPoolCard'), {
  ssr: false,
  loading: () => <HomeChunkPlaceholder className={'HomeChunkPlaceholder--chart'} />
})
const HomeLeaders = dynamic(() => import('../../components/home/HomeLeaders'), {
  ssr: false,
  loading: () => <HomeChunkPlaceholder className={'HomeChunkPlaceholder--leaders'} />
})
const QuorumCard = dynamic(() => import('../../components/home/QuorumCard'), {
  ssr: false,
  loading: () => <HomeChunkPlaceholder className={'HomeChunkPlaceholder--leaders'} />
})

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

function Home({ brand }: { brand?: ReactNode }) {
  const listsViewport = useNearViewport<HTMLElement>()
  const epochsViewport = useNearViewport<HTMLElement>()
  const metricsViewport = useNearViewport()
  const chartsViewport = useNearViewport()
  const leadersViewport = useNearViewport()
  const [showHeroNodes, setShowHeroNodes] = useState(false)
  const [rate, setRate] = useState<LoadableState<Rate>>({ data: null, loading: true, error: false })

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 48em)')
    const apply = () => setShowHeroNodes(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const { query: statusQuery, health } = useHomeStatus()
  const txQuery = useQuery({
    enabled: listsViewport.enabled,
    queryKey: ['home', 'transactions'],
    queryFn: () => Api.getTransactions(1, 10, 'desc'),
    refetchInterval: 30000
  })
  const blocksQuery = useQuery({
    enabled: listsViewport.enabled,
    queryKey: ['home', 'blocks'],
    queryFn: () => Api.getBlocks(1, 10, 'desc'),
    refetchInterval: 30000
  })
  const validatorsQuery = useQuery({
    enabled: leadersViewport.enabled,
    queryKey: ['home', 'validators', 'total'],
    queryFn: () => Api.getValidators(1, 1, 'desc'),
    staleTime: 60_000
  })
  const validatorsActiveQuery = useQuery({
    enabled: leadersViewport.enabled,
    queryKey: ['home', 'validators', 'active'],
    queryFn: () => Api.getValidators(1, 1, 'desc', { isActive: 'true' }),
    staleTime: 60_000
  })
  const validatorsBannedQuery = useQuery({
    enabled: leadersViewport.enabled,
    queryKey: ['home', 'validators', 'banned'],
    queryFn: () => Api.getValidators(1, 1, 'desc', { isBanned: 'true' }),
    staleTime: 60_000
  })
  const validatorsInactiveQuery = useQuery({
    enabled: leadersViewport.enabled,
    queryKey: ['home', 'validators', 'inactive'],
    queryFn: () => Api.getValidators(1, 1, 'desc', { isActive: 'false', isBanned: 'false' }),
    staleTime: 60_000
  })
  const validatorsPoolHeadQuery = useQuery({
    enabled: leadersViewport.enabled,
    queryKey: ['home', 'validators', 'pool', 'head', 'unbanned'],
    queryFn: () => Api.getValidators(1, VALIDATORS_PAGE, 'desc', { isBanned: 'false' }),
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
    queryKey: ['home', 'validators', 'pool', 'rest', 'unbanned', poolTotal],
    queryFn: async () => {
      const rest = await Promise.all(
        Array.from({ length: poolPages - 1 }, (_, i) =>
          Api.getValidators(i + 2, VALIDATORS_PAGE, 'desc', { isBanned: 'false' })
        )
      )
      const rows = []
      for (const page of rest) {
        if (Array.isArray(page?.resultSet)) rows.push(...page.resultSet)
      }
      return rows
    },
    enabled: leadersViewport.enabled && validatorsPoolHeadQuery.isSuccess && poolPages > 1,
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
    enabled: leadersViewport.enabled,
    queryKey: ['home', 'validators', 'banned-list'],
    queryFn: () => fetchAllValidators({ isBanned: 'true' }),
    staleTime: 60_000,
    refetchInterval: 120_000
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
      enabled: n === currentEpochNumber || epochsViewport.enabled,
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
  const epochAvgBlockMs = Number(
    (currentEpochPayload as { avgBlockTime?: number } | null)?.avgBlockTime
  )
  const epochData = {
    data: currentEpochPayload || {},
    loading: typeof currentEpochNumber === 'number' && !currentEpochPayload && epochsLoading,
    error: false
  }

  const rateEnabled =
    epochsViewport.enabled ||
    metricsViewport.enabled ||
    chartsViewport.enabled ||
    leadersViewport.enabled

  useEffect(() => {
    if (!rateEnabled) return
    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }, [rateEnabled])

  const epochsSettled =
    epochNumbers.length > 0 &&
    epochQueries.length === epochNumbers.length &&
    epochQueries.every(q => !q.isPending && !q.isLoading)
  const belowFoldReady = epochsBaseList.length > 0 || epochsSettled

  return (
    <div className={'HomePage'}>
      <HomeHero
        health={health}
        status={statusQuery.data ?? {}}
        loading={statusQuery.isLoading}
        epochNumber={currentEpochNumber}
        epochEndTime={currentEpochPayload?.epoch?.endTime}
        avgBlockTimeSec={computeAvgBlockTime(blocksQuery.data?.resultSet)}
        showNodes={showHeroNodes}
        brand={brand}
      />

      <section
        ref={listsViewport.ref}
        className={'InfoBlock InfoBlock--NoBorder HomeOverview'}
        aria-label={'Network overview'}
      >
        <div className={'HomeOverview__Grid'}>
          <div className={'HomeOverview__Sys'}>
            {showHeroNodes ? <HeroNodes compact className={'HomeOverview__Nodes'} /> : null}
            <HeroMeta
              health={health}
              status={statusQuery.data ?? {}}
              loading={statusQuery.isLoading}
            />
          </div>
          <div className={'HomeOverview__Tx'}>
            <CompactTxList
              transactions={txQuery.data?.resultSet}
              limit={5}
              loading={txQuery.isPending}
              moreHref={'/transactions'}
              moreLabel={'View all transactions'}
            />
          </div>
          <div className={'HomeOverview__Blocks'}>
            <CompactBlocksList
              blocks={blocksQuery.data?.resultSet}
              limit={5}
              loading={blocksQuery.isPending}
              moreHref={'/blocks'}
              moreLabel={'View all blocks'}
            />
          </div>
        </div>
      </section>

      <section
        ref={epochsViewport.ref}
        id={'home-epochs'}
        className={'InfoBlock InfoBlock--NoBorder HomeEpochs'}
        tabIndex={-1}
      >
        <HomeViewportContent enabled={epochsViewport.enabled} placeholder={'epochs'}>
          <EpochsOverview
            title={'Epochs'}
            epochs={epochsList}
            currentEpoch={epochData}
            rate={rate}
            loading={epochsLoading}
            slotNumbers={epochNumbers}
          />
        </HomeViewportContent>
      </section>

      <div ref={metricsViewport.ref} className={'HomeCardPair HomeCardPair--metrics'}>
        <div className={'HomeCardPair__Cell'}>
          <HomeViewportContent enabled={metricsViewport.enabled} placeholder={'chart'}>
            <TxActivityChart
              fetcher={Api.getTransactionsHistory}
              field={'txs'}
              yAbbr={'txs'}
              enabled={belowFoldReady && metricsViewport.enabled}
            />
          </HomeViewportContent>
        </div>
        <div className={'HomeCardPair__Cell'}>
          <HomeViewportContent enabled={metricsViewport.enabled} placeholder={'chart'}>
            <IdentityGrowthChart
              fetcher={Api.getIdentitiesHistory}
              field={'registeredIdentities'}
              yAbbr={'identities'}
              enabled={belowFoldReady && metricsViewport.enabled}
            />
          </HomeViewportContent>
        </div>
      </div>

      <div ref={chartsViewport.ref} className={'HomeCardPair HomeCardPair--viz'}>
        <div className={'HomeCardPair__Cell'}>
          <HomeViewportContent enabled={chartsViewport.enabled} placeholder={'chart'}>
            <TxTypesBar enabled={belowFoldReady && chartsViewport.enabled} />
          </HomeViewportContent>
        </div>
        <div className={'HomeCardPair__Cell'}>
          <HomeViewportContent enabled={chartsViewport.enabled} placeholder={'chart'}>
            <ShieldedPoolCard rate={rate} enabled={belowFoldReady && chartsViewport.enabled} />
          </HomeViewportContent>
        </div>
      </div>

      <div ref={leadersViewport.ref} className={'HomeCardPair HomeCardPair--leaders'}>
        <div className={'HomeCardPair__Cell'}>
          <HomeViewportContent enabled={leadersViewport.enabled} placeholder={'leaders'}>
            <HomeLeaders rate={rate} enabled={belowFoldReady && leadersViewport.enabled} />
          </HomeViewportContent>
        </div>
        <div className={'HomeCardPair__Cell'}>
          <HomeViewportContent enabled={leadersViewport.enabled} placeholder={'leaders'}>
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
              lastProposerProTx={blocksQuery.data?.resultSet?.[0]?.header?.validator}
              avgBlockTimeSec={
                epochAvgBlockMs > 0
                  ? epochAvgBlockMs / 1000
                  : computeAvgBlockTime(blocksQuery.data?.resultSet)
              }
            />
          </HomeViewportContent>
        </div>
      </div>
    </div>
  )
}

export default Home
