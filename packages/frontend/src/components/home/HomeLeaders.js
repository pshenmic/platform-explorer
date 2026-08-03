'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Box } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { Identifier, BigNumber } from '../data'
import { RateTooltip } from '../ui/Tooltips'
import RankMark, { placeOf } from './RankMark'
import { Skeleton } from './Skeleton'
import { HOME_RICH_LIST_LIMIT } from './listLimits'
import './HomeLeaders.scss'

function useRatingList (enabled, load) {
  const [state, setState] = useState({ loading: true, error: false, items: [] })

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
    return () => { cancelled = true }
  }, [enabled, load])

  return state
}

function meterWidth (value, max) {
  if (!(max > 0) || !(value > 0)) return 0
  const linear = value / max
  return Math.max(Math.sqrt(linear) * 100, 1.5)
}

function LeaderRail ({ place, href, title, metric, meterValue, meterMax, accent }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={`HomeLeaders__Rail HomeLeaders__Rail--${accent} HomeLeaders__Rail--p${place}`}
      style={{ '--meter': `${meterWidth(meterValue, meterMax)}%` }}
    >
      <span className={'HomeLeaders__Rank'}>
        <RankMark place={place}/>
      </span>
      <span className={'HomeLeaders__Entity'}>{title}</span>
      <span className={'HomeLeaders__Metric'}>{metric}</span>
      <span className={'HomeLeaders__Meter'} aria-hidden={'true'}>
        <i/>
      </span>
    </Link>
  )
}

function LeaderColumn ({
  eyebrow,
  title,
  lede,
  loading,
  error,
  items,
  empty,
  footerHref,
  footerLabel,
  renderRail
}) {
  return (
    <div className={'HomeLeaders__Col'}>
      <div className={'HomeLeaders__ColHead'}>
        <span className={'HomeLeaders__ColEyebrow'}>{eyebrow}</span>
        <h3 className={'HomeLeaders__ColTitle'}>{title}</h3>
        <p className={'HomeLeaders__ColLede'}>{lede}</p>
      </div>

      <div className={'HomeLeaders__Rails'} role={'list'}>
        {loading &&
          Array.from({ length: HOME_RICH_LIST_LIMIT }).map((_, i) => (
            <Skeleton key={i} w={'100%'} h={'2.75rem'} radius={10}/>
          ))}
        {!loading && error &&
          <div className={'HomeLeaders__Empty'}>No data</div>}
        {!loading && !error && items.length === 0 &&
          <div className={'HomeLeaders__Empty'}>{empty}</div>}
        {!loading && !error && items.map((item, i) => (
          <div key={item.identifier || i} role={'listitem'}>
            {renderRail(item, i)}
          </div>
        ))}
      </div>

      <Link href={footerHref} prefetch={false} className={'HomeLeaders__More'}>
        {footerLabel}
      </Link>
    </div>
  )
}

function identityLinkTitle (item) {
  return (
    <Identifier ellipsis avatar styles={['highlight-both']}>
      {item.identifier}
    </Identifier>
  )
}

export default function HomeLeaders ({ rate, enabled = true }) {
  const loadContracts = useMemo(
    () => () => Api.getDataContractsRating(1, HOME_RICH_LIST_LIMIT, 'desc')
      .then(res => (res?.resultSet ?? []).slice(0, HOME_RICH_LIST_LIMIT)),
    []
  )
  // re-sort by live balance after API (sorts by transfer-sum first)
  const loadByBalance = useMemo(
    () => () => Api.getIdentities(1, HOME_RICH_LIST_LIMIT, 'desc', 'balance')
      .then(res => (res?.resultSet ?? [])
        .slice(0, HOME_RICH_LIST_LIMIT)
        .sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0))),
    []
  )
  const loadByTxs = useMemo(
    () => () => Api.getIdentities(1, HOME_RICH_LIST_LIMIT, 'desc', 'tx_count')
      .then(res => (res?.resultSet ?? [])
        .slice(0, HOME_RICH_LIST_LIMIT)
        .sort((a, b) => (Number(b.totalTxs) || 0) - (Number(a.totalTxs) || 0))),
    []
  )

  const contracts = useRatingList(enabled, loadContracts)
  const byBalance = useRatingList(enabled, loadByBalance)
  const byTxs = useRatingList(enabled, loadByTxs)

  const maxTransitions = useMemo(
    () => Math.max(1, ...contracts.items.map(i => Number(i.transitionsCount) || 0)),
    [contracts.items]
  )
  const maxBalance = useMemo(
    () => Math.max(1, ...byBalance.items.map(i => Number(i.balance) || 0)),
    [byBalance.items]
  )
  const maxTxs = useMemo(
    () => Math.max(1, ...byTxs.items.map(i => Number(i.totalTxs) || 0)),
    [byTxs.items]
  )

  return (
    <Box
      className={'InfoBlock InfoBlock--NoBorder HomeLeaders'}
      w={'100%'}
      as={'section'}
      aria-label={'Platform leaders: busiest contracts, highest balances, most transactions'}
    >
      <div className={'HomeLeaders__Grid'}>
        <LeaderColumn
          eyebrow={'Contracts'}
          title={'Busiest'}
          lede={'Most transitions · last 30 days'}
          loading={contracts.loading}
          error={contracts.error}
          items={contracts.items}
          empty={'No contracts yet'}
          footerHref={'/dataContracts'}
          footerLabel={'View all data contracts'}
          renderRail={(item, i) => {
            const n = Number(item.transitionsCount) || 0
            return (
              <LeaderRail
                place={placeOf(i)}
                href={`/dataContract/${item.identifier}`}
                accent={'contracts'}
                title={
                  <Identifier ellipsis avatar styles={['highlight-both']}>
                    {item.identifier}
                  </Identifier>
                }
                metric={<BigNumber>{item.transitionsCount}</BigNumber>}
                meterValue={n}
                meterMax={maxTransitions}
              />
            )
          }}
        />

        <LeaderColumn
          eyebrow={'Balance'}
          title={'Highest balance'}
          lede={'Identities with the most credits'}
          loading={byBalance.loading}
          error={byBalance.error}
          items={byBalance.items}
          empty={'No identities yet'}
          footerHref={'/identities'}
          footerLabel={'View all identities'}
          renderRail={(item, i) => {
            const credits = Number(item.balance) || 0
            return (
              <LeaderRail
                place={placeOf(i)}
                href={`/identity/${item.identifier}`}
                accent={'balance'}
                title={identityLinkTitle(item)}
                metric={
                  <RateTooltip credits={credits} rate={rate?.data}>
                    <span><BigNumber>{item.balance}</BigNumber></span>
                  </RateTooltip>
                }
                meterValue={credits}
                meterMax={maxBalance}
              />
            )
          }}
        />

        <LeaderColumn
          eyebrow={'Throughput'}
          title={'Most transactions'}
          lede={'Identities by state transition count'}
          loading={byTxs.loading}
          error={byTxs.error}
          items={byTxs.items}
          empty={'No identities yet'}
          footerHref={'/identities'}
          footerLabel={'View all identities'}
          renderRail={(item, i) => {
            const n = Number(item.totalTxs) || 0
            return (
              <LeaderRail
                place={placeOf(i)}
                href={`/identity/${item.identifier}`}
                accent={'txs'}
                title={identityLinkTitle(item)}
                metric={<BigNumber>{item.totalTxs}</BigNumber>}
                meterValue={n}
                meterMax={maxTxs}
              />
            )
          }}
        />
      </div>
    </Box>
  )
}
