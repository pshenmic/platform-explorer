'use client'

import { useState, useEffect, useMemo, type CSSProperties } from 'react'
import Link from 'next/link'
import { Box } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { Identifier, BigNumber, Alias } from '../data'
import { findActiveAlias } from '../../util'
import { RateTooltip } from '../ui/Tooltips'
import RankMark, { placeOf } from './RankMark'
import { Skeleton } from './Skeleton'
import { HOME_LEADERS_LIMIT } from './listLimits'
import './HomeLeaders.css'

const DAY = 24 * 60 * 60 * 1000
const WEEK = 7 * DAY

function useRatingList(enabled: boolean, load: () => Promise<any[]>) {
  const [state, setState] = useState<{ loading: boolean; error: boolean; items: any[] }>({
    loading: true,
    error: false,
    items: []
  })

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: true, error: false }))
      return
    }
    let cancelled = false
    setState(s => ({ ...s, loading: true, error: false }))
    load()
      .then(items => {
        if (!cancelled) setState({ loading: false, error: false, items })
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: true, items: [] })
      })
    return () => {
      cancelled = true
    }
  }, [enabled, load])

  return state
}

function meterWidth(value: number, max: number) {
  if (!(max > 0) || !(value > 0)) return 0
  return Math.max(Math.sqrt(value / max) * 100, 1.5)
}

function rangeIso(ms: number) {
  const end = new Date()
  const start = new Date(end.getTime() - ms)
  return { start: start.toISOString(), end: end.toISOString() }
}

function LeaderRail({ place, href, title, metric, meterValue, meterMax, accent }: any) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={`HomeLeaders__Rail HomeLeaders__Rail--${accent} HomeLeaders__Rail--p${place}`}
      style={{ ['--meter']: `${meterWidth(meterValue, meterMax)}%` } as CSSProperties}
    >
      <span className={'HomeLeaders__Rank'}>
        <RankMark place={place} />
      </span>
      <span className={'HomeLeaders__Entity'}>{title}</span>
      <span className={'HomeLeaders__Metric'}>{metric}</span>
      <span className={'HomeLeaders__Meter'} aria-hidden={'true'}>
        <i />
      </span>
    </Link>
  )
}

function identityTitle(item: any) {
  const activeAlias = findActiveAlias(item?.aliases)
  if (activeAlias?.alias) {
    return (
      <Alias ellipsis avatarSource={item.identifier}>
        {activeAlias.alias}
      </Alias>
    )
  }
  return (
    <Identifier ellipsis avatar styles={['highlight-both']}>
      {item.identifier}
    </Identifier>
  )
}

const ENTITIES = [
  {
    key: 'identities',
    label: 'Identities',
    metrics: [
      { key: 'balance', label: 'Highest Balance' },
      { key: 'txs', label: 'Most tx' },
      { key: 'active', label: 'Recent Active' }
    ]
  },
  {
    key: 'contracts',
    label: 'Data Contracts',
    metrics: [
      { key: 'active', label: 'Recent Active' },
      { key: 'rating', label: 'Most activity' },
      { key: 'docs', label: 'Most documents' }
    ]
  },
  {
    key: 'validators',
    label: 'Validators',
    metrics: [
      { key: 'blocks', label: 'Most blocks' },
      { key: 'current', label: 'Current set' },
      { key: 'active', label: 'Recent Active' }
    ]
  }
] as const

type EntityKey = (typeof ENTITIES)[number]['key']

export default function HomeLeaders({ rate, enabled = true }: { rate?: any; enabled?: boolean }) {
  const [entityKey, setEntityKey] = useState<EntityKey>('identities')
  const [metricKey, setMetricKey] = useState<string>('balance')

  const entityIndex = ENTITIES.findIndex(e => e.key === entityKey)
  const entity = ENTITIES[entityIndex] || ENTITIES[0]
  const metrics = entity.metrics
  const metric = metrics.find(m => m.key === metricKey) || metrics[0]

  const goEntity = (dir: number) => {
    const next =
      ENTITIES[(((entityIndex + dir) % ENTITIES.length) + ENTITIES.length) % ENTITIES.length]
    setEntityKey(next.key)
    setMetricKey(next.metrics[0].key)
  }

  const selectEntity = (key: EntityKey) => {
    const next = ENTITIES.find(e => e.key === key) || ENTITIES[0]
    setEntityKey(next.key)
    setMetricKey(next.metrics[0].key)
  }

  const loadIdBalance = useMemo(
    () => () =>
      Api.getIdentities(1, HOME_LEADERS_LIMIT, 'desc', 'balance').then(res =>
        (res?.resultSet ?? [])
          .slice(0, HOME_LEADERS_LIMIT)
          .sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0))
      ),
    []
  )
  const loadIdTxs = useMemo(
    () => () =>
      Api.getIdentities(1, HOME_LEADERS_LIMIT, 'desc', 'tx_count').then(res =>
        (res?.resultSet ?? [])
          .slice(0, HOME_LEADERS_LIMIT)
          .sort((a, b) => (Number(b.totalTxs) || 0) - (Number(a.totalTxs) || 0))
      ),
    []
  )
  const loadIdActive = useMemo(
    () => () => {
      const { start, end } = rangeIso(WEEK)
      return Api.getActiveIdentities(1, HOME_LEADERS_LIMIT, 'desc', start, end).then(res =>
        (res?.resultSet ?? []).slice(0, HOME_LEADERS_LIMIT)
      )
    },
    []
  )
  const loadContractRating = useMemo(
    () => () =>
      Api.getDataContractsRating(1, HOME_LEADERS_LIMIT, 'desc').then(res =>
        (res?.resultSet ?? []).slice(0, HOME_LEADERS_LIMIT)
      ),
    []
  )
  const loadContractActive = useMemo(
    () => () => {
      const { start, end } = rangeIso(WEEK)
      return Api.getActiveDataContracts(1, HOME_LEADERS_LIMIT, 'desc', start, end).then(res =>
        (res?.resultSet ?? []).slice(0, HOME_LEADERS_LIMIT)
      )
    },
    []
  )
  const loadContractDocs = useMemo(
    () => () =>
      Api.getDataContracts(1, HOME_LEADERS_LIMIT, 'desc', 'documents_count').then(res =>
        (res?.resultSet ?? []).slice(0, HOME_LEADERS_LIMIT)
      ),
    []
  )
  const loadValidatorBlocks = useMemo(
    () => () =>
      Api.getValidators(1, 80, 'desc').then(res =>
        [...(res?.resultSet ?? [])]
          .sort(
            (a, b) => (Number(b.proposedBlocksAmount) || 0) - (Number(a.proposedBlocksAmount) || 0)
          )
          .slice(0, HOME_LEADERS_LIMIT)
      ),
    []
  )
  const loadValidatorCurrent = useMemo(
    () => () =>
      Api.getValidators(1, HOME_LEADERS_LIMIT, 'desc', { isActive: true }).then(res =>
        (res?.resultSet ?? []).slice(0, HOME_LEADERS_LIMIT)
      ),
    []
  )
  const loadValidatorActive = useMemo(
    () => () => {
      const { start, end } = rangeIso(WEEK)
      return Api.getValidators(1, 80, 'desc', {
        last_proposed_block_timestamp_start: start,
        last_proposed_block_timestamp_end: end
      }).then(res =>
        [...(res?.resultSet ?? [])]
          .sort(
            (a, b) => (Number(b.proposedBlocksAmount) || 0) - (Number(a.proposedBlocksAmount) || 0)
          )
          .slice(0, HOME_LEADERS_LIMIT)
      )
    },
    []
  )

  const onIdentities = enabled && entity.key === 'identities'
  const onContracts = enabled && entity.key === 'contracts'
  const onValidators = enabled && entity.key === 'validators'

  const idBalance = useRatingList(onIdentities && metric.key === 'balance', loadIdBalance)
  const idTxs = useRatingList(onIdentities && metric.key === 'txs', loadIdTxs)
  const idActive = useRatingList(onIdentities && metric.key === 'active', loadIdActive)
  const contractRating = useRatingList(onContracts && metric.key === 'rating', loadContractRating)
  const contractActive = useRatingList(onContracts && metric.key === 'active', loadContractActive)
  const contractDocs = useRatingList(onContracts && metric.key === 'docs', loadContractDocs)
  const valBlocks = useRatingList(onValidators && metric.key === 'blocks', loadValidatorBlocks)
  const valCurrent = useRatingList(onValidators && metric.key === 'current', loadValidatorCurrent)
  const valActive = useRatingList(onValidators && metric.key === 'active', loadValidatorActive)

  const list = (() => {
    if (entity.key === 'identities') {
      if (metric.key === 'balance')
        return { ...idBalance, accent: 'balance', empty: 'No identities yet' }
      if (metric.key === 'txs') return { ...idTxs, accent: 'txs', empty: 'No identities yet' }
      return { ...idActive, accent: 'activeIds', empty: 'No active identities in this window' }
    }
    if (entity.key === 'contracts') {
      if (metric.key === 'rating')
        return { ...contractRating, accent: 'contracts', empty: 'No data contracts yet' }
      if (metric.key === 'docs')
        return { ...contractDocs, accent: 'contracts', empty: 'No data contracts yet' }
      return {
        ...contractActive,
        accent: 'activeContracts',
        empty: 'No active contracts in this window'
      }
    }
    if (metric.key === 'current') {
      return { ...valCurrent, accent: 'txs', empty: 'No current validators' }
    }
    if (metric.key === 'active') {
      return { ...valActive, accent: 'activeIds', empty: 'No proposers in this window' }
    }
    return { ...valBlocks, accent: 'txs', empty: 'No validators yet' }
  })()

  const maxMeter = Math.max(
    1,
    ...list.items.map((item: any) => {
      if (entity.key === 'identities') {
        if (metric.key === 'balance') return Number(item.balance) || 0
        if (metric.key === 'txs') return Number(item.totalTxs) || 0
        return Number(item.transactionsCount) || 0
      }
      if (entity.key === 'contracts') {
        if (metric.key === 'docs') return Number(item.documentsCount) || 0
        return Number(item.transitionsCount) || 0
      }
      return Number(item.proposedBlocksAmount) || 0
    })
  )

  const renderRail = (item: any, i: number) => {
    const place = placeOf(i)
    if (entity.key === 'identities') {
      const credits = Number(item.balance) || 0
      const txs = Number(item.totalTxs) || 0
      const week = Number(item.transactionsCount) || 0
      const value = metric.key === 'balance' ? credits : metric.key === 'txs' ? txs : week
      return (
        <LeaderRail
          place={place}
          href={`/identity/${item.identifier}`}
          accent={list.accent}
          title={identityTitle(item)}
          metric={
            metric.key === 'balance' ? (
              <RateTooltip credits={credits} rate={rate?.data}>
                <span>
                  <BigNumber>{item.balance}</BigNumber>
                </span>
              </RateTooltip>
            ) : (
              <BigNumber>{metric.key === 'txs' ? item.totalTxs : item.transactionsCount}</BigNumber>
            )
          }
          meterValue={value}
          meterMax={maxMeter}
        />
      )
    }
    if (entity.key === 'contracts') {
      const n =
        metric.key === 'docs'
          ? Number(item.documentsCount) || 0
          : Number(item.transitionsCount) || 0
      return (
        <LeaderRail
          place={place}
          href={`/dataContract/${item.identifier}`}
          accent={list.accent}
          title={
            <Identifier ellipsis avatar styles={['highlight-both']}>
              {item.identifier}
            </Identifier>
          }
          metric={
            <BigNumber>
              {metric.key === 'docs' ? item.documentsCount : item.transitionsCount}
            </BigNumber>
          }
          meterValue={n}
          meterMax={maxMeter}
        />
      )
    }
    const n = Number(item.proposedBlocksAmount) || 0
    const hash = item.proTxHash
    return (
      <LeaderRail
        place={place}
        href={`/validator/${hash}`}
        accent={list.accent}
        title={
          <Identifier ellipsis avatar styles={['highlight-both']}>
            {hash}
          </Identifier>
        }
        metric={<BigNumber>{item.proposedBlocksAmount}</BigNumber>}
        meterValue={n}
        meterMax={maxMeter}
      />
    )
  }

  return (
    <Box
      className={'InfoBlock InfoBlock--NoBorder HomeLeaders'}
      w={'100%'}
      as={'section'}
      aria-label={'Platform leaders'}
    >
      <header className={'HomeLeaders__Head'}>
        <div className={'HomeLeaders__HeadText'}>
          <span className={'HomeLeaders__Eyebrow'}>Leaderboards</span>
          <h2 className={'HomeLeaders__Title'}>Platform leaders</h2>
        </div>
        <p className={'HomeLeaders__Lede'}>
          <span className={'HomeLeaders__LedeLine'}>Highest, busiest and recently active</span>
          <span className={'HomeLeaders__LedeLine'}>identities, contracts and validators</span>
        </p>
        <div className={'HomeLeaders__Switchers'}>
          <div className={'HomeLeaders__Nav'} aria-label={'Leader list controls'}>
            <button
              type={'button'}
              className={'HomeLeaders__Arrow'}
              aria-label={'Previous list'}
              onClick={() => goEntity(-1)}
            >
              <svg viewBox={'0 0 16 16'} width={'14'} height={'14'} aria-hidden={'true'}>
                <path
                  d={'M10 3L5 8l5 5'}
                  fill={'none'}
                  stroke={'currentColor'}
                  strokeWidth={'1.6'}
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                />
              </svg>
            </button>
            <div className={'HomeLeaders__Tabs'} role={'tablist'} aria-label={'Leader entities'}>
              {ENTITIES.map(item => (
                <button
                  key={item.key}
                  type={'button'}
                  role={'tab'}
                  aria-selected={entity.key === item.key}
                  className={`HomeLeaders__Tab${entity.key === item.key ? ' is-on' : ''}`}
                  onClick={() => selectEntity(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type={'button'}
              className={'HomeLeaders__Arrow'}
              aria-label={'Next list'}
              onClick={() => goEntity(1)}
            >
              <svg viewBox={'0 0 16 16'} width={'14'} height={'14'} aria-hidden={'true'}>
                <path
                  d={'M6 3l5 5-5 5'}
                  fill={'none'}
                  stroke={'currentColor'}
                  strokeWidth={'1.6'}
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                />
              </svg>
            </button>
          </div>
          <div
            className={'HomeLeaders__Metrics'}
            role={'tablist'}
            aria-label={`${entity.label} ranking`}
          >
            {metrics.map(item => (
              <button
                key={item.key}
                type={'button'}
                role={'tab'}
                aria-selected={metric.key === item.key}
                className={`HomeLeaders__MetricTab${metric.key === item.key ? ' is-on' : ''}`}
                onClick={() => setMetricKey(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={'HomeLeaders__Panel'} role={'tabpanel'}>
        <div className={`HomeLeaders__Col HomeLeaders__Col--${list.accent}`}>
          <div className={'HomeLeaders__Rails'} role={'list'}>
            {list.loading &&
              Array.from({ length: HOME_LEADERS_LIMIT }).map((_, i) => (
                <Skeleton key={i} className={'HomeLeaders__Skel'} w={'100%'} radius={12} />
              ))}
            {!list.loading && list.error && <div className={'HomeLeaders__Empty'}>No data</div>}
            {!list.loading && !list.error && list.items.length === 0 && (
              <div className={'HomeLeaders__Empty'}>{list.empty}</div>
            )}
            {!list.loading &&
              !list.error &&
              list.items.map((item: any, i: number) => (
                <div key={item.identifier || item.proTxHash || i} role={'listitem'}>
                  {renderRail(item, i)}
                </div>
              ))}
          </div>
        </div>
      </div>
    </Box>
  )
}
