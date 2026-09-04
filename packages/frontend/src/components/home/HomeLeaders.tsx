'use client'

import { useState, useEffect, useMemo, type CSSProperties } from 'react'
import Link from 'next/link'

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

function LeaderColumn({
  eyebrow,
  title,
  lede,
  loading,
  error,
  items,
  empty,
  accent,
  renderRail
}: any) {
  return (
    <div className={`HomeLeaders__Col HomeLeaders__Col--${accent}`}>
      <p className={'HomeLeaders__Caption'} title={`${eyebrow} · ${title} · ${lede}`}>
        <span className={'HomeLeaders__CaptionPart'}>{eyebrow}</span>
        <span className={'HomeLeaders__CaptionSep'} aria-hidden={'true'}>
          ·
        </span>
        <span className={'HomeLeaders__CaptionPart'}>{title}</span>
        <span className={'HomeLeaders__CaptionSep'} aria-hidden={'true'}>
          ·
        </span>
        <span className={'HomeLeaders__CaptionPart HomeLeaders__CaptionPart--muted'}>{lede}</span>
      </p>
      <div className={'HomeLeaders__Rails'} role={'list'}>
        {loading &&
          Array.from({ length: HOME_LEADERS_LIMIT }).map((_, i) => (
            <Skeleton key={i} w={'100%'} h={'2.75rem'} radius={10} />
          ))}
        {!loading && error && <div className={'HomeLeaders__Empty'}>No data</div>}
        {!loading && !error && items.length === 0 && (
          <div className={'HomeLeaders__Empty'}>{empty}</div>
        )}
        {!loading &&
          !error &&
          items.map((item: any, i: any) => (
            <div key={item.identifier || item.tokenIdentifier || i} role={'listitem'}>
              {renderRail(item, i)}
            </div>
          ))}
      </div>
    </div>
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

export default function HomeLeaders({ rate, enabled = true }: { rate?: any; enabled?: boolean }) {
  const loadByBalance = useMemo(
    () => () =>
      Api.getIdentities(1, HOME_LEADERS_LIMIT, 'desc', 'balance').then(res =>
        (res?.resultSet ?? [])
          .slice(0, HOME_LEADERS_LIMIT)
          .sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0))
      ),
    []
  )
  const loadByTxs = useMemo(
    () => () =>
      Api.getIdentities(1, HOME_LEADERS_LIMIT, 'desc', 'tx_count').then(res =>
        (res?.resultSet ?? [])
          .slice(0, HOME_LEADERS_LIMIT)
          .sort((a, b) => (Number(b.totalTxs) || 0) - (Number(a.totalTxs) || 0))
      ),
    []
  )
  const loadActiveIdentities = useMemo(
    () => () => {
      const { start, end } = rangeIso(WEEK)
      return Api.getActiveIdentities(1, HOME_LEADERS_LIMIT, 'desc', start, end).then(res =>
        (res?.resultSet ?? []).slice(0, HOME_LEADERS_LIMIT)
      )
    },
    []
  )

  const byBalance = useRatingList(enabled, loadByBalance)
  const byTxs = useRatingList(enabled, loadByTxs)
  const activeIds = useRatingList(enabled, loadActiveIdentities)

  const maxBalance = useMemo(
    () => Math.max(1, ...byBalance.items.map(i => Number(i.balance) || 0)),
    [byBalance.items]
  )
  const maxTxs = useMemo(
    () => Math.max(1, ...byTxs.items.map(i => Number(i.totalTxs) || 0)),
    [byTxs.items]
  )
  const maxActiveIdTx = useMemo(
    () => Math.max(1, ...activeIds.items.map(i => Number(i.transactionsCount) || 0)),
    [activeIds.items]
  )

  const panels = useMemo(
    () => [
      {
        key: 'balance',
        label: 'Balance',
        eyebrow: 'Identities',
        title: 'Highest balance',
        lede: 'Most credits held',
        node: (
          <LeaderColumn
            accent={'balance'}
            eyebrow={'Identities'}
            title={'Highest balance'}
            lede={'Most credits held'}
            loading={byBalance.loading}
            error={byBalance.error}
            items={byBalance.items}
            empty={'No identities yet'}
            renderRail={(item: any, i: any) => {
              const credits = Number(item.balance) || 0
              return (
                <LeaderRail
                  place={placeOf(i)}
                  href={`/identity/${item.identifier}`}
                  accent={'balance'}
                  title={identityTitle(item)}
                  metric={
                    <RateTooltip credits={credits} rate={rate?.data}>
                      <span>
                        <BigNumber>{item.balance}</BigNumber>
                      </span>
                    </RateTooltip>
                  }
                  meterValue={credits}
                  meterMax={maxBalance}
                />
              )
            }}
          />
        )
      },
      {
        key: 'txs',
        label: 'Most txs',
        eyebrow: 'Identities',
        title: 'Most activity',
        lede: 'All-time transaction count',
        node: (
          <LeaderColumn
            accent={'txs'}
            eyebrow={'Identities'}
            title={'Most activity'}
            lede={'All-time transaction count'}
            loading={byTxs.loading}
            error={byTxs.error}
            items={byTxs.items}
            empty={'No identities yet'}
            renderRail={(item: any, i: any) => {
              const n = Number(item.totalTxs) || 0
              return (
                <LeaderRail
                  place={placeOf(i)}
                  href={`/identity/${item.identifier}`}
                  accent={'txs'}
                  title={identityTitle(item)}
                  metric={<BigNumber>{item.totalTxs}</BigNumber>}
                  meterValue={n}
                  meterMax={maxTxs}
                />
              )
            }}
          />
        )
      },
      {
        key: 'activeIds',
        label: 'This week',
        eyebrow: 'Identities',
        title: 'Transacted this week',
        lede: 'At least one state transition · last 7 days',
        node: (
          <LeaderColumn
            accent={'activeIds'}
            eyebrow={'Identities'}
            title={'Transacted this week'}
            lede={'At least one state transition · last 7 days'}
            loading={activeIds.loading}
            error={activeIds.error}
            items={activeIds.items}
            empty={'No active identities in this window'}
            renderRail={(item: any, i: any) => {
              const n = Number(item.transactionsCount) || 0
              return (
                <LeaderRail
                  place={placeOf(i)}
                  href={`/identity/${item.identifier}`}
                  accent={'activeIds'}
                  title={identityTitle(item)}
                  metric={<BigNumber>{item.transactionsCount}</BigNumber>}
                  meterValue={n}
                  meterMax={maxActiveIdTx}
                />
              )
            }}
          />
        )
      }
    ],
    [byBalance, byTxs, activeIds, maxBalance, maxTxs, maxActiveIdTx, rate]
  )

  const [active, setActive] = useState(0)
  const n = panels.length
  const current = panels[active] || panels[0]

  const goBy = (dir: number) => {
    if (!n) return
    setActive(i => (((i + dir) % n) + n) % n)
  }

  return (
    <section
      className={'InfoBlock InfoBlock--NoBorder HomeLeaders'}
      aria-label={'Platform leaders'}
    >
      <header className={'HomeLeaders__Head'}>
        <div className={'HomeLeaders__HeadText'}>
          <span className={'HomeLeaders__Eyebrow'}>Leaderboards</span>
          <h2 className={'HomeLeaders__Title'}>Platform leaders</h2>
        </div>
        <div className={'HomeLeaders__Nav'} aria-label={'Leader list controls'}>
          <button
            type={'button'}
            className={'HomeLeaders__Arrow'}
            aria-label={'Previous list'}
            onClick={() => goBy(-1)}
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
          <div className={'HomeLeaders__Tabs'} role={'tablist'} aria-label={'Leader lists'}>
            {panels.map((panel, i) => (
              <button
                key={panel.key}
                type={'button'}
                role={'tab'}
                aria-selected={active === i}
                className={`HomeLeaders__Tab${active === i ? ' is-on' : ''}`}
                onClick={() => setActive(i)}
              >
                {panel.label}
              </button>
            ))}
          </div>
          <button
            type={'button'}
            className={'HomeLeaders__Arrow'}
            aria-label={'Next list'}
            onClick={() => goBy(1)}
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
      </header>

      <div className={'HomeLeaders__Panel'} role={'tabpanel'}>
        {current?.node}
      </div>
    </section>
  )
}
