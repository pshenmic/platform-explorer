'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Box } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { getTokenName } from '../../util'
import { Identifier, BigNumber, Alias } from '../data'
import { RateTooltip } from '../ui/Tooltips'
import RankMark, { placeOf } from './RankMark'
import { Skeleton } from './Skeleton'
import { HOME_RICH_LIST_LIMIT } from './listLimits'
import './HomeLeaders.scss'

const DAY = 24 * 60 * 60 * 1000
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const QUARTER = 90 * DAY

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
  return Math.max(Math.sqrt(value / max) * 100, 1.5)
}

function rangeIso (ms) {
  const end = new Date()
  const start = new Date(end.getTime() - ms)
  return { start: start.toISOString(), end: end.toISOString() }
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
  accent,
  renderRail
}) {
  return (
    <div className={`HomeLeaders__Col HomeLeaders__Col--${accent}`}>
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
          <div key={item.identifier || item.tokenIdentifier || i} role={'listitem'}>
            {renderRail(item, i)}
          </div>
        ))}
      </div>
    </div>
  )
}

function identityTitle (item) {
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
  const loadActiveContracts = useMemo(
    () => () => {
      const { start, end } = rangeIso(QUARTER)
      return Api.getActiveDataContracts(1, HOME_RICH_LIST_LIMIT, 'desc', start, end)
        .then(res => (res?.resultSet ?? []).slice(0, HOME_RICH_LIST_LIMIT))
    },
    []
  )
  const loadTokens = useMemo(
    () => () => {
      const { start, end } = rangeIso(MONTH)
      return Api.getTokensRating(1, HOME_RICH_LIST_LIMIT * 2, 'desc', {
        timestamp_start: start,
        timestamp_end: end
      }).then(res => {
        const raw = res?.resultSet ?? []
        const seen = new Set()
        const unique = []
        for (const item of raw) {
          const id = item?.tokenIdentifier
          if (!id || seen.has(id)) continue
          seen.add(id)
          unique.push(item)
          if (unique.length >= HOME_RICH_LIST_LIMIT) break
        }
        return unique
      })
    },
    []
  )
  const loadActiveIdentities = useMemo(
    () => () => {
      const { start, end } = rangeIso(WEEK)
      return Api.getActiveIdentities(1, HOME_RICH_LIST_LIMIT, 'desc', start, end)
        .then(res => (res?.resultSet ?? []).slice(0, HOME_RICH_LIST_LIMIT))
    },
    []
  )

  const contracts = useRatingList(enabled, loadContracts)
  const byBalance = useRatingList(enabled, loadByBalance)
  const byTxs = useRatingList(enabled, loadByTxs)
  const activeContracts = useRatingList(enabled, loadActiveContracts)
  const tokens = useRatingList(enabled, loadTokens)
  const activeIds = useRatingList(enabled, loadActiveIdentities)

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
  const maxActiveContracts = useMemo(
    () => Math.max(1, ...activeContracts.items.map(i => Number(i.transitionsCount) || 0)),
    [activeContracts.items]
  )
  const maxTokenTx = useMemo(
    () => Math.max(1, ...tokens.items.map(i => Number(i.transitionCount) || 0)),
    [tokens.items]
  )
  const maxActiveIdTx = useMemo(
    () => Math.max(1, ...activeIds.items.map(i => Number(i.transactionsCount) || 0)),
    [activeIds.items]
  )

  const panels = useMemo(() => [
    {
      key: 'contracts',
      node: (
        <LeaderColumn
          accent={'contracts'}
          eyebrow={'Contracts'}
          title={'By activity'}
          lede={'Usage volume · last 30 days'}
          loading={contracts.loading}
          error={contracts.error}
          items={contracts.items}
          empty={'No contracts yet'}
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
      )
    },
    {
      key: 'balance',
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
          renderRail={(item, i) => {
            const credits = Number(item.balance) || 0
            return (
              <LeaderRail
                place={placeOf(i)}
                href={`/identity/${item.identifier}`}
                accent={'balance'}
                title={identityTitle(item)}
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
      )
    },
    {
      key: 'txs',
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
          renderRail={(item, i) => {
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
      key: 'activeContracts',
      node: (
        <LeaderColumn
          accent={'activeContracts'}
          eyebrow={'Contracts'}
          title={'Recently used'}
          lede={'At least one tx · last 90 days'}
          loading={activeContracts.loading}
          error={activeContracts.error}
          items={activeContracts.items}
          empty={'No active contracts in this window'}
          renderRail={(item, i) => {
            const n = Number(item.transitionsCount) || 0
            return (
              <LeaderRail
                place={placeOf(i)}
                href={`/dataContract/${item.identifier}`}
                accent={'activeContracts'}
                title={
                  <Identifier ellipsis avatar styles={['highlight-both']}>
                    {item.identifier}
                  </Identifier>
                }
                metric={<BigNumber>{item.transitionsCount}</BigNumber>}
                meterValue={n}
                meterMax={maxActiveContracts}
              />
            )
          }}
        />
      )
    },
    {
      key: 'tokens',
      node: (
        <LeaderColumn
          accent={'tokens'}
          eyebrow={'Tokens'}
          title={'Trending'}
          lede={'Token activity · last 30 days'}
          loading={tokens.loading}
          error={tokens.error}
          items={tokens.items}
          empty={'No token activity yet'}
          renderRail={(item, i) => {
            const n = Number(item.transitionCount) || 0
            const name = getTokenName(item.localizations)
            return (
              <LeaderRail
                place={placeOf(i)}
                href={`/token/${item.tokenIdentifier}`}
                accent={'tokens'}
                title={
                  name
                    ? <Alias avatarSource={item.tokenIdentifier}>{name}</Alias>
                    : <Identifier ellipsis avatar styles={['highlight-both']}>
                        {item.tokenIdentifier}
                      </Identifier>
                }
                metric={<BigNumber>{item.transitionCount}</BigNumber>}
                meterValue={n}
                meterMax={maxTokenTx}
              />
            )
          }}
        />
      )
    },
    {
      key: 'activeIds',
      node: (
        <LeaderColumn
          accent={'activeIds'}
          eyebrow={'Identities'}
          title={'Active this week'}
          lede={'Sent at least one tx · last 7 days'}
          loading={activeIds.loading}
          error={activeIds.error}
          items={activeIds.items}
          empty={'No active identities in this window'}
          renderRail={(item, i) => {
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
  ], [
    contracts, byBalance, byTxs, activeContracts, tokens, activeIds,
    maxTransitions, maxBalance, maxTxs, maxActiveContracts, maxTokenTx, maxActiveIdTx,
    rate
  ])

  const loopPanels = useMemo(
    () => [...panels, ...panels.map(p => ({ ...p, key: `${p.key}-dup` }))],
    [panels]
  )

  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return undefined

    const reduced = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let offset = 0
    let raf = 0
    let lastT = 0
    let paused = false
    let dragging = false
    let dragStartX = 0
    let dragStartOffset = 0
    let dragMoved = 0
    const SPEED = 42 // px / s

    const halfWidth = () => {
      const w = track.scrollWidth / 2
      return w > 0 ? w : 0
    }

    const wrap = (v) => {
      const half = halfWidth()
      if (half <= 0) return 0
      let x = v % half
      if (x < 0) x += half
      return x
    }

    const paint = () => {
      offset = wrap(offset)
      track.style.transform = `translate3d(${-offset}px, 0, 0)`
    }

    const tick = (now) => {
      if (!lastT) lastT = now
      const dt = Math.min(0.05, (now - lastT) / 1000)
      lastT = now
      if (!reduced && !paused && !dragging) {
        offset += SPEED * dt
        paint()
      }
      raf = requestAnimationFrame(tick)
    }

    const onEnter = () => { paused = true }
    const onLeave = () => {
      if (!dragging) paused = false
      lastT = 0
    }

    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      dragging = true
      paused = true
      dragStartX = e.clientX
      dragStartOffset = offset
      dragMoved = 0
      viewport.classList.add('is-dragging')
      try { viewport.setPointerCapture(e.pointerId) } catch (_) { /* noop */ }
    }

    const onPointerMove = (e) => {
      if (!dragging) return
      const dx = e.clientX - dragStartX
      dragMoved = Math.max(dragMoved, Math.abs(dx))
      offset = wrap(dragStartOffset - dx)
      paint()
    }

    const endDrag = (e) => {
      if (!dragging) return
      dragging = false
      viewport.classList.remove('is-dragging')
      try { viewport.releasePointerCapture(e.pointerId) } catch (_) { /* noop */ }
      if (dragMoved > 6) {
        const block = (ev) => {
          ev.preventDefault()
          ev.stopPropagation()
          viewport.removeEventListener('click', block, true)
        }
        viewport.addEventListener('click', block, true)
        setTimeout(() => viewport.removeEventListener('click', block, true), 0)
      }
      const over = viewport.matches(':hover')
      paused = over
      lastT = 0
    }

    viewport.addEventListener('pointerenter', onEnter)
    viewport.addEventListener('pointerleave', onLeave)
    viewport.addEventListener('pointerdown', onPointerDown)
    viewport.addEventListener('pointermove', onPointerMove)
    viewport.addEventListener('pointerup', endDrag)
    viewport.addEventListener('pointercancel', endDrag)

    paint()
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      viewport.removeEventListener('pointerenter', onEnter)
      viewport.removeEventListener('pointerleave', onLeave)
      viewport.removeEventListener('pointerdown', onPointerDown)
      viewport.removeEventListener('pointermove', onPointerMove)
      viewport.removeEventListener('pointerup', endDrag)
      viewport.removeEventListener('pointercancel', endDrag)
    }
  }, [loopPanels])

  return (
    <Box
      className={'InfoBlock InfoBlock--NoBorder HomeLeaders'}
      w={'100%'}
      as={'section'}
      aria-label={'Platform leaders carousel'}
    >
      <div
        ref={viewportRef}
        className={'HomeLeaders__Viewport'}
        tabIndex={0}
        role={'region'}
        aria-roledescription={'carousel'}
        aria-label={'Leaders lists — drag to browse, auto-moves when idle'}
      >
        <div ref={trackRef} className={'HomeLeaders__Track'}>
          {loopPanels.map(panel => (
            <div key={panel.key} className={'HomeLeaders__Slide'}>
              {panel.node}
            </div>
          ))}
        </div>
      </div>
    </Box>
  )
}
