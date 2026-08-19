'use client'

import { useState, useEffect, useMemo, useRef, type CSSProperties } from 'react'
import Link from 'next/link'
import { Box } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { getTokenName } from '../../util'
import { Identifier, BigNumber, Alias } from '../data'
import { RateTooltip } from '../ui/Tooltips'
import RankMark, { placeOf } from './RankMark'
import { Skeleton } from './Skeleton'
import { HOME_RICH_LIST_LIMIT } from './listLimits'
import './HomeLeaders.css'

const DAY = 24 * 60 * 60 * 1000
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const QUARTER = 90 * DAY

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
          Array.from({ length: HOME_RICH_LIST_LIMIT }).map((_, i) => (
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
  return (
    <Identifier ellipsis avatar styles={['highlight-both']}>
      {item.identifier}
    </Identifier>
  )
}

export default function HomeLeaders({ rate, enabled = true }: { rate?: any; enabled?: boolean }) {
  const loadContracts = useMemo(
    () => () =>
      Api.getDataContractsRating(1, HOME_RICH_LIST_LIMIT, 'desc').then(res =>
        (res?.resultSet ?? []).slice(0, HOME_RICH_LIST_LIMIT)
      ),
    []
  )
  const loadByBalance = useMemo(
    () => () =>
      Api.getIdentities(1, HOME_RICH_LIST_LIMIT, 'desc', 'balance').then(res =>
        (res?.resultSet ?? [])
          .slice(0, HOME_RICH_LIST_LIMIT)
          .sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0))
      ),
    []
  )
  const loadByTxs = useMemo(
    () => () =>
      Api.getIdentities(1, HOME_RICH_LIST_LIMIT, 'desc', 'tx_count').then(res =>
        (res?.resultSet ?? [])
          .slice(0, HOME_RICH_LIST_LIMIT)
          .sort((a, b) => (Number(b.totalTxs) || 0) - (Number(a.totalTxs) || 0))
      ),
    []
  )
  const loadActiveContracts = useMemo(
    () => () => {
      const { start, end } = rangeIso(QUARTER)
      return Api.getActiveDataContracts(1, HOME_RICH_LIST_LIMIT, 'desc', start, end).then(res =>
        (res?.resultSet ?? []).slice(0, HOME_RICH_LIST_LIMIT)
      )
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
          const id = (item as any)?.tokenIdentifier || (item as any)?.identifier
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
      return Api.getActiveIdentities(1, HOME_RICH_LIST_LIMIT, 'desc', start, end).then(res =>
        (res?.resultSet ?? []).slice(0, HOME_RICH_LIST_LIMIT)
      )
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

  const panels = useMemo(
    () => [
      {
        key: 'contracts',
        label: 'Activity',
        eyebrow: 'Contracts',
        title: 'By activity',
        lede: 'Usage volume · last 30 days',
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
            renderRail={(item: any, i: any) => {
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
        key: 'activeContracts',
        label: 'Recent',
        eyebrow: 'Contracts',
        title: 'Recently used',
        lede: 'At least one tx · last 90 days',
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
            renderRail={(item: any, i: any) => {
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
        label: 'Tokens',
        eyebrow: 'Tokens',
        title: 'Trending',
        lede: 'Token activity · last 30 days',
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
            renderRail={(item: any, i: any) => {
              const n = Number(item.transitionCount) || 0
              const name = getTokenName(item.localizations)
              return (
                <LeaderRail
                  place={placeOf(i)}
                  href={`/token/${item.tokenIdentifier}`}
                  accent={'tokens'}
                  title={
                    name ? (
                      <Alias avatarSource={item.tokenIdentifier}>{name}</Alias>
                    ) : (
                      <Identifier ellipsis avatar styles={['highlight-both']}>
                        {item.tokenIdentifier}
                      </Identifier>
                    )
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
        label: 'Active',
        eyebrow: 'Identities',
        title: 'Active this week',
        lede: 'Sent at least one tx · last 7 days',
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
    [
      contracts,
      byBalance,
      byTxs,
      activeContracts,
      tokens,
      activeIds,
      maxTransitions,
      maxBalance,
      maxTxs,
      maxActiveContracts,
      maxTokenTx,
      maxActiveIdTx,
      rate
    ]
  )

  const viewportRef = useRef<HTMLDivElement | null>(null)
  // React state only for tab index; slide chrome updates via DOM class
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  // true while we own scrollLeft so user scroll handlers do not thrash
  const busy = useRef(false)
  const n = panels.length

  // three copies so the loop always has neighbors on both sides
  const loopPanels = useMemo(() => {
    if (!n) return []
    return [0, 1, 2].flatMap(copy =>
      panels.map((p, i) => ({
        ...p,
        key: `${p.key}__c${copy}`,
        realIndex: i,
        copy
      }))
    )
  }, [panels, n])

  const slideLabels = useMemo(() => panels.map(p => p.label), [panels])

  const getSlides = () => {
    const vp = viewportRef.current
    if (!vp) return []
    return [...vp.querySelectorAll('.HomeLeaders__Slide')]
  }

  const nearestDomIndex = () => {
    const vp = viewportRef.current
    const slides = getSlides()
    if (!vp || !slides.length) return n // middle first
    const midX = vp.getBoundingClientRect().left + vp.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    slides.forEach((el, i) => {
      const r = el.getBoundingClientRect()
      const d = Math.abs(r.left + r.width / 2 - midX)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    return best
  }

  // DOM class only: avoids re-rendering three cloned lists each scroll tick
  const markActiveDom = (domIndex: any) => {
    getSlides().forEach((el, i) => {
      el.classList.toggle('is-active', i === domIndex)
    })
  }

  const setLogical = (real: any) => {
    const i = ((real % n) + n) % n
    if (activeRef.current !== i) {
      activeRef.current = i
      setActive(i)
    }
  }

  // centers slide; is-programmatic disables CSS scroll-snap mid-move
  const centerEl = (el: any, smooth: any) => {
    const vp = viewportRef.current
    if (!vp || !el) return
    const vpRect = vp.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const delta = elRect.left + elRect.width / 2 - (vpRect.left + vpRect.width / 2)
    if (Math.abs(delta) < 0.5) return
    vp.classList.add('is-programmatic')
    if (smooth) {
      vp.scrollBy({ left: delta, behavior: 'smooth' })
    } else {
      vp.scrollLeft += delta
    }
  }

  // if scroll landed on a side clone, jump to the middle copy without a second smooth scroll
  const normalizeLoop = () => {
    if (!n || busy.current) return
    const slides = getSlides()
    if (slides.length < n * 3) return
    const dom = nearestDomIndex()
    const real = dom % n
    const copy = Math.floor(dom / n)
    setLogical(real)
    markActiveDom(dom)
    if (copy === 1) {
      viewportRef.current?.classList.remove('is-programmatic')
      return
    }
    const mid = slides[n + real]
    if (!mid) return
    busy.current = true
    viewportRef.current?.classList.add('is-programmatic')
    centerEl(mid, false)
    markActiveDom(n + real)
    // double rAF waits for layout so the next user scroll is not dropped
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        busy.current = false
        viewportRef.current?.classList.remove('is-programmatic')
      })
    })
  }

  const goToDom = (domIndex: any, { smooth = true, thenNormalize = true } = {}) => {
    if (!n) return
    const slides = getSlides()
    const el = slides[domIndex]
    if (!el) return
    const real = domIndex % n
    setLogical(real)
    markActiveDom(domIndex)
    busy.current = true
    centerEl(el, smooth)
    const finish = () => {
      busy.current = false
      if (thenNormalize) normalizeLoop()
      else viewportRef.current?.classList.remove('is-programmatic')
    }
    if (smooth) {
      const vp = viewportRef.current
      let done = false
      const once = () => {
        if (done) return
        done = true
        vp?.removeEventListener('scrollend', once)
        window.clearTimeout(fallback)
        finish()
      }
      const fallback = window.setTimeout(once, 420)
      vp?.addEventListener('scrollend', once, { once: true })
    } else {
      finish()
    }
  }

  // tabs always target the middle deck so both directions still have neighbors
  const scrollToLogical = (realIndex: any) => {
    if (!n || busy.current) return
    const real = ((realIndex % n) + n) % n
    goToDom(n + real, { smooth: true, thenNormalize: false })
  }

  // step one slide; landing on a clone is OK, normalizeLoop re-centers after settle
  const scrollByDir = (dir: any) => {
    if (!n || busy.current) return
    const dom = nearestDomIndex()
    let next = dom + dir
    if (next < 0) next = n * 3 - 1
    if (next >= n * 3) next = 0
    goToDom(next, { smooth: true, thenNormalize: true })
  }

  useEffect(() => {
    const vp = viewportRef.current
    if (!vp || !n) return undefined

    // land on middle copy of list 0 (room to scroll either way)
    requestAnimationFrame(() => {
      const slides = getSlides()
      const el = slides[n]
      if (!el) return
      busy.current = true
      vp.classList.add('is-programmatic')
      centerEl(el, false)
      setLogical(0)
      markActiveDom(n)
      requestAnimationFrame(() => {
        busy.current = false
        vp.classList.remove('is-programmatic')
      })
    })

    let settleTimer = 0
    const onScroll = () => {
      if (busy.current) return
      const dom = nearestDomIndex()
      setLogical(dom % n)
      markActiveDom(dom)
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(normalizeLoop, 160)
    }

    vp.addEventListener('scroll', onScroll, { passive: true })

    const onKey = (e: any) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        scrollByDir(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        scrollByDir(-1)
      }
    }
    vp.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(settleTimer)
      vp.removeEventListener('scroll', onScroll)
      vp.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, loopPanels.length])

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
        <div className={'HomeLeaders__Nav'} aria-label={'Carousel controls'}>
          <button
            type={'button'}
            className={'HomeLeaders__Arrow'}
            aria-label={'Previous lists'}
            onClick={() => scrollByDir(-1)}
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
            {slideLabels.map((label, i) => (
              <button
                key={panels[i].key}
                type={'button'}
                role={'tab'}
                aria-selected={active === i}
                className={`HomeLeaders__Tab${active === i ? ' is-on' : ''}`}
                onClick={() => scrollToLogical(i)}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type={'button'}
            className={'HomeLeaders__Arrow'}
            aria-label={'Next lists'}
            onClick={() => scrollByDir(1)}
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

      <div
        ref={viewportRef}
        className={'HomeLeaders__Viewport HomeLeaders__Viewport--loop'}
        tabIndex={0}
        role={'region'}
        aria-roledescription={'carousel'}
        aria-label={'Leaders lists — infinite carousel'}
      >
        <div className={'HomeLeaders__Track'}>
          {loopPanels.map(panel => (
            <div
              key={panel.key}
              className={'HomeLeaders__Slide'}
              data-real={panel.realIndex}
              data-copy={panel.copy}
              role={'group'}
              aria-roledescription={'slide'}
              aria-label={`${panel.realIndex + 1} of ${n}`}
            >
              {panel.node}
            </div>
          ))}
        </div>
      </div>
    </Box>
  )
}
