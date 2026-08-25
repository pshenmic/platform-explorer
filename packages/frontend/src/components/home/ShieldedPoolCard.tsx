'use client'

import { useState, useEffect, useMemo, useRef, useId, type RefObject } from 'react'
import * as d3 from 'd3'
import useResizeObserver from '@react-hook/resize-observer'
import { Box } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { Presets } from '../cards'
import { Tooltip } from '../ui/Tooltips'
import { creditsToDash, roundUsd } from '../../util'
import { Skeleton } from './Skeleton'
import { PRESETS, presetRange } from './MetricChart'
import './ShieldedPoolCard.css'

const DEFAULT_PRESET = PRESETS.length - 1
const DAY_MS = 24 * 60 * 60 * 1000
// margins keep vol label and flow ticks from overlapping
const M = { top: 22, right: 54, bottom: 24, left: 48 }

function fmtDash(dash: any) {
  if (!dash) return '0'
  return Math.abs(dash) >= 0.01 ? dash.toFixed(2) : Number(dash.toPrecision(2)).toString()
}

function fmtCompact(dash: any) {
  const n = Number(dash) || 0
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}k`
  if (Math.abs(n) >= 10) return n.toFixed(1)
  return fmtDash(n)
}

function fmtUsd(n: number, compact = false) {
  const sign = n < 0 ? '−' : ''
  const a = Math.abs(n)
  if (compact || a >= 1000) return `${sign}$${fmtCompact(a)}`
  return `${sign}$${roundUsd(a)}`
}

function fmtAmt(dash: number, inUsd: boolean, usdPx: number | null, compact = false) {
  if (inUsd && usdPx != null) return fmtUsd(dash * usdPx, compact)
  return compact ? fmtCompact(dash) : fmtDash(dash)
}

function buildTvlSeries(buckets: any, balanceCredits: any) {
  if (!buckets.length || balanceCredits == null) return []
  const series = new Array(buckets.length)
  let tvl = Number(balanceCredits) || 0
  for (let i = buckets.length - 1; i >= 0; i--) {
    const inAmt = Number(buckets[i].inAmt) || 0
    const outAmt = Number(buckets[i].outAmt) || 0
    series[i] = { ts: buckets[i].ts, tvl, inAmt, outAmt }
    tvl -= inAmt - outAmt
  }
  return series
}

async function fetchFlowBuckets(start: any, end: any, intervals: any) {
  const [shieldRes, unshieldRes] = await Promise.all([
    Api.getShieldHistory(start, end, intervals).catch(() => []),
    Api.getUnshieldHistory(start, end, intervals).catch(() => [])
  ])
  const count = Math.max(shieldRes?.length || 0, unshieldRes?.length || 0)
  return Array.from({ length: count }, (_, i) => ({
    ts: shieldRes?.[i]?.timestamp ?? unshieldRes?.[i]?.timestamp ?? null,
    inAmt: Number(shieldRes?.[i]?.data?.amount) || 0,
    outAmt: Number(unshieldRes?.[i]?.data?.amount) || 0
  }))
}

function trimLeadingEmpty(buckets: any) {
  if (buckets.length < 3) return buckets
  let s = 0
  while (s < buckets.length - 2 && !buckets[s].inAmt && !buckets[s].outAmt) s++
  return buckets.slice(s)
}

/** Target bucket count for an active span — prefer ~daily up to 120 pts. */
function intervalsForSpan(startIso: any, endIso: any) {
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  const days = Math.max(1, Math.ceil((end - start) / DAY_MS))
  // short ranges: more resolution; long: daily-ish, cap 120
  if (days <= 2) return 48
  if (days <= 7) return Math.min(84, days * 8)
  if (days <= 31) return Math.min(90, days * 2)
  return Math.min(120, Math.max(60, days))
}

/**
 * Load flows, then re-bucket from first activity so "All" does not
 * smear every deposit into ~3 giant bars over empty history.
 */
async function loadDenseBuckets(rangeStart: any, rangeEnd: any) {
  const scoutIntervals = 48
  const raw = await fetchFlowBuckets(rangeStart, rangeEnd, scoutIntervals)
  const scout = trimLeadingEmpty(raw)

  if (!scout.length) {
    return [{ ts: rangeEnd, inAmt: 0, outAmt: 0 }]
  }

  const firstTs = scout[0].ts || rangeStart
  const denseStart = new Date(firstTs).toISOString()
  const intervals = intervalsForSpan(denseStart, rangeEnd)
  const dense = trimLeadingEmpty(await fetchFlowBuckets(denseStart, rangeEnd, intervals))
  return dense.length ? dense : scout
}

export default function ShieldedPoolCard({
  enabled = true,
  rate: rateState
}: {
  enabled?: boolean
  rate?: { data?: { usd?: number } | null }
}) {
  const [pool, setPool] = useState<{ loading: boolean; error: boolean; balance: number | null }>({
    loading: true,
    error: false,
    balance: null
  })
  const [series, setSeries] = useState<{ loading: boolean; points: any[] }>({
    loading: true,
    points: []
  })
  const [period, setPeriod] = useState({ loading: true, in: 0, out: 0 })
  const [presetIdx, setPresetIdx] = useState(DEFAULT_PRESET)
  const [hoverI, setHoverI] = useState<number | null>(null)
  const [showDeposits, setShowDeposits] = useState(true)
  const [showWithdrawals, setShowWithdrawals] = useState(true)
  const [unit, setUnit] = useState<'dash' | 'usd'>('dash')
  const [width, setWidth] = useState(0)
  const [plotH, setPlotH] = useState(180)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const gid = useId().replace(/:/g, '')
  const fetchGen = useRef(0)
  const periodGen = useRef(0)

  useResizeObserver(wrapRef as RefObject<HTMLElement>, entry => {
    const { width: w, height: hh } = entry.contentRect
    setWidth(Math.max(0, Math.floor(w)))
    setPlotH(Math.max(120, Math.floor(hh) || 180))
  })

  useEffect(() => {
    if (!wrapRef.current) return
    setWidth(Math.max(0, Math.floor(wrapRef.current.clientWidth)))
    setPlotH(Math.max(120, Math.floor(wrapRef.current.clientHeight || 180)))
  }, [])

  useEffect(() => {
    if (!enabled) {
      setPool(s => ({ ...s, loading: true, error: false }))
      return
    }
    Api.getShieldedPool()
      .then(res =>
        setPool({
          loading: false,
          error: false,
          balance: res?.poolBalance != null ? Number(res.poolBalance) : null
        })
      )
      .catch(() => setPool({ loading: false, error: true, balance: null }))
  }, [enabled])

  useEffect(() => {
    if (!enabled || pool.loading || pool.error) {
      if (!enabled) setSeries(s => ({ ...s, loading: true }))
      return
    }

    const gen = ++fetchGen.current
    const { start, end } = presetRange(PRESETS[presetIdx])
    const balance = pool.balance ?? 0
    setSeries(s => ({ ...s, loading: true }))
    setHoverI(null)

    loadDenseBuckets(start, end)
      .then(buckets => {
        if (gen !== fetchGen.current) return
        setSeries({ loading: false, points: buildTvlSeries(buckets, balance) })
      })
      .catch(() => {
        if (gen !== fetchGen.current) return
        setSeries({
          loading: false,
          points: [{ ts: new Date().toISOString(), tvl: Number(balance) || 0, inAmt: 0, outAmt: 0 }]
        })
      })
  }, [presetIdx, enabled, pool.loading, pool.error, pool.balance])

  // exact deposit/withdraw totals for the selected range
  useEffect(() => {
    if (!enabled) {
      setPeriod({ loading: true, in: 0, out: 0 })
      return
    }
    const gen = ++periodGen.current
    const { start, end } = presetRange(PRESETS[presetIdx])
    setPeriod(s => ({ ...s, loading: true }))
    Api.getShieldedStatistic(start, end)
      .then(res => {
        if (gen !== periodGen.current) return
        setPeriod({
          loading: false,
          in: Number(res?.totalShieldedIn) || 0,
          out: Number(res?.totalShieldedOut) || 0
        })
      })
      .catch(() => {
        if (gen !== periodGen.current) return
        setPeriod({ loading: false, in: 0, out: 0 })
      })
  }, [presetIdx, enabled])

  const balanceDash = creditsToDash(Number(pool.balance) || 0)
  const points = series.points
  const isAll = PRESETS[presetIdx].label === 'All'
  const windowLabel = isAll ? 'all time' : PRESETS[presetIdx].label
  const rangeInDash = creditsToDash(period.in)
  const rangeOutDash = creditsToDash(period.out)
  const rangeNetDash = rangeInDash - rangeOutDash
  const usdPx = typeof rateState?.data?.usd === 'number' ? rateState.data.usd : null
  const inUsd = unit === 'usd' && usdPx != null
  const k = inUsd && usdPx != null ? usdPx : 1

  const ready = width > 0 && plotH > 0 && points.length >= 1 && !series.loading

  const chart = useMemo(() => {
    if (!ready) return null

    let pts = points
      .map(p => {
        const tvlDash = creditsToDash(p.tvl)
        const inDash = creditsToDash(p.inAmt)
        const outDash = creditsToDash(p.outAmt)
        return {
          x: p.ts ? new Date(p.ts) : null,
          tvlDash,
          inDash,
          outDash,
          tvl: tvlDash * k,
          inAmt: inDash * k,
          outAmt: outDash * k
        }
      })
      .filter(p => p.x && !isNaN(p.x.getTime()))

    if (!pts.length) return null
    if (pts.length === 1) {
      const only = pts[0]
      pts = [{ ...only, x: new Date(Number(only.x) - 3600000) }, only]
    }

    const x = d3.scaleTime(
      d3.extent(pts, (p: any) => p.x),
      [M.left, width - M.right]
    )

    const tvlMin = d3.min(pts, (p: any) => p.tvl) ?? 0
    const tvlMax = d3.max(pts, (p: any) => p.tvl) ?? 1
    const tvlPad = (tvlMax - tvlMin) * 0.12 || Math.max(tvlMax * 0.08, 0.01)
    const yTvl = d3
      .scaleLinear([Math.max(0, tvlMin - tvlPad * 0.3), tvlMax + tvlPad], [plotH - M.bottom, M.top])
      .nice()

    const flowVisible = showDeposits || showWithdrawals
    const flowMax = flowVisible
      ? d3.max(pts, (p: any) =>
          Math.max(showDeposits ? p.inAmt : 0, showWithdrawals ? p.outAmt : 0)
        ) || 0
      : 0
    const yFlow = d3
      .scaleLinear([0, flowMax > 0 ? flowMax * 1.2 : 1], [plotH - M.bottom, M.top])
      .nice()

    const line = d3
      .line()
      .x((p: any) => x(p.x))
      .y((p: any) => yTvl(p.tvl))
      .curve(d3.curveMonotoneX)

    const area = d3
      .area()
      .x((p: any) => x(p.x))
      .y0(plotH - M.bottom)
      .y1((p: any) => yTvl(p.tvl))
      .curve(d3.curveMonotoneX)

    const spanMs = Number(pts[pts.length - 1].x) - Number(pts[0].x)
    const tickFmt = d3.timeFormat(
      spanMs > 365 * DAY_MS ? '%b %Y' : spanMs > 3 * DAY_MS ? '%b %d' : '%H:%M'
    )
    const tipFmt = d3.timeFormat(
      spanMs > 365 * DAY_MS ? '%b %d, %Y' : spanMs > 3 * DAY_MS ? '%b %d' : '%b %d, %H:%M'
    )

    const xTickN = Math.max(2, Math.min(6, Math.floor((width - M.left - M.right) / 72)))
    const xTicks = x.ticks(xTickN)
    const yTvlTicks = yTvl.ticks(4)
    // skip top flow tick so it does not collide with the vol caption
    const yFlowTicks = flowVisible ? yFlow.ticks(4).filter((v: any) => yFlow(v) > M.top + 14) : []

    const step =
      pts.length > 1
        ? Math.abs(x(pts[1].x) - x(pts[0].x))
        : (width - M.left - M.right) / Math.max(pts.length, 1)
    const both = showDeposits && showWithdrawals
    const groupW = Math.max(5, Math.min(20, step * 0.72))
    const barW = both ? Math.max(2, (groupW - 2) / 2) : Math.max(2, groupW * 0.7)
    const baseline = plotH - M.bottom

    const bars = pts.map((p, i) => {
      const cx = x(p.x)
      const inH = showDeposits ? Math.max(0, baseline - yFlow(p.inAmt)) : 0
      const outH = showWithdrawals ? Math.max(0, baseline - yFlow(p.outAmt)) : 0
      let inX = 0
      let outX = 0
      if (both) {
        inX = cx - groupW / 2
        outX = cx - groupW / 2 + barW + 1
      } else if (showDeposits) {
        inX = cx - barW / 2
        outX = cx
      } else {
        inX = cx
        outX = cx - barW / 2
      }
      return {
        i,
        cx,
        inX,
        outX,
        inY: baseline - inH,
        outY: baseline - outH,
        inH,
        outH,
        barW
      }
    })

    return {
      pts,
      x,
      yTvl,
      yFlow,
      line: line(pts),
      area: area(pts),
      tickFmt,
      tipFmt,
      xTicks,
      yTvlTicks,
      yFlowTicks,
      bars,
      baseline,
      flowVisible,
      inUsd
    }
  }, [ready, points, width, plotH, showDeposits, showWithdrawals, k, inUsd])

  const handleMove = (e: any) => {
    if (!chart) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const t = chart.x.invert(mx)
    let best = 0
    let bestDist = Infinity
    chart.pts.forEach((p, i) => {
      const d = Math.abs(Number(p.x) - Number(t))
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    setHoverI(best)
  }

  const hovered = chart && hoverI != null ? chart.pts[hoverI] : null

  const statDash = isAll ? balanceDash : rangeNetDash
  const statCount = (() => {
    if (pool.loading) return null
    if (!isAll && period.loading) return null
    if (!statDash) return inUsd ? fmtUsd(0) : '0'
    const body = fmtAmt(Math.abs(statDash), inUsd, usdPx)
    if (isAll) return body
    return `${statDash >= 0 ? '+' : '−'}${body.replace(/^[−-]/, '')}`
  })()
  const statTone =
    !isAll && !period.loading
      ? rangeNetDash > 0
        ? ' is-up'
        : rangeNetDash < 0
          ? ' is-down'
          : ''
      : ''
  const flowsLoading = period.loading

  return (
    <Box
      ref={rootRef}
      className={'InfoBlock InfoBlock--NoBorder ShieldedPool'}
      w={'100%'}
      as={'section'}
      aria-label={'Shielded pool'}
    >
      <header className={'ShieldedPool__Head'}>
        <div className={'ShieldedPool__HeadText'}>
          <span className={'ShieldedPool__Eyebrow'}>Privacy layer</span>
          <h2 className={'ShieldedPool__Title'}>Shielded pool</h2>
          <p className={'ShieldedPool__Lede'}>
            Pool size over time; bars show
            <br />
            deposit and withdrawal volume.
            <Tooltip
              title={'How to read'}
              content={
                'Line (left axis) is total locked in the pool. Bars (right axis) are deposit and withdrawal volume in each bucket. Switch DASH / USD next to the headline; USD uses the current rate, not historical prices. All starts from the first real pool activity so volumes are not merged into a few coarse columns.'
              }
              placement={'top'}
            >
              <span className={'ShieldedPool__LedeMore'}>How to read</span>
            </Tooltip>
          </p>
        </div>
        <div className={'ShieldedPool__Controls'}>
          <Presets options={PRESETS} value={presetIdx} onChange={setPresetIdx} />
          <div className={'ShieldedPool__Stat'}>
            <div className={'ShieldedPool__StatMain'}>
              {statCount == null ? (
                <Skeleton w={'7ch'} h={'1.6em'} />
              ) : (
                <button
                  type={'button'}
                  className={`ShieldedPool__StatCount${statTone}`}
                  disabled={usdPx == null}
                  title={
                    usdPx == null
                      ? 'USD rate unavailable'
                      : inUsd
                        ? 'Show in DASH'
                        : 'Show in USD at current rate'
                  }
                  aria-label={
                    inUsd ? 'Amount in USD, switch to DASH' : 'Amount in DASH, switch to USD'
                  }
                  onClick={() => usdPx != null && setUnit(u => (u === 'dash' ? 'usd' : 'dash'))}
                >
                  {statCount}
                </button>
              )}
              <div
                className={'ShieldedPool__UnitSwitch'}
                role={'group'}
                aria-label={'Display unit'}
              >
                <button
                  type={'button'}
                  className={`ShieldedPool__Unit${!inUsd ? ' is-on' : ''}`}
                  aria-pressed={!inUsd}
                  onClick={() => setUnit('dash')}
                >
                  DASH
                </button>
                <button
                  type={'button'}
                  className={`ShieldedPool__Unit${inUsd ? ' is-on' : ''}`}
                  aria-pressed={inUsd}
                  disabled={usdPx == null}
                  title={usdPx == null ? 'USD rate unavailable' : 'USD at current DASH rate'}
                  onClick={() => usdPx != null && setUnit('usd')}
                >
                  USD
                </button>
              </div>
            </div>
            <div className={'ShieldedPool__Flows'} aria-label={`Flows · ${windowLabel}`}>
              {flowsLoading ? (
                <Skeleton w={'16ch'} h={'0.85em'} />
              ) : (
                <>
                  <button
                    type={'button'}
                    className={`ShieldedPool__Flow ShieldedPool__Flow--in${showDeposits ? ' is-on' : ' is-off'}`}
                    aria-pressed={showDeposits}
                    aria-label={
                      showDeposits
                        ? `Hide deposits, ${fmtAmt(rangeInDash, inUsd, usdPx)}`
                        : `Show deposits, ${fmtAmt(rangeInDash, inUsd, usdPx)}`
                    }
                    title={showDeposits ? 'Hide deposits on chart' : 'Show deposits on chart'}
                    onClick={() => setShowDeposits(v => !v)}
                  >
                    <i className={'ShieldedPool__FlowSwatch'} aria-hidden={'true'} />
                    <b>+{fmtAmt(rangeInDash, inUsd, usdPx)}</b>
                  </button>
                  <button
                    type={'button'}
                    className={`ShieldedPool__Flow ShieldedPool__Flow--out${showWithdrawals ? ' is-on' : ' is-off'}`}
                    aria-pressed={showWithdrawals}
                    aria-label={
                      showWithdrawals
                        ? `Hide withdrawals, ${fmtAmt(rangeOutDash, inUsd, usdPx)}`
                        : `Show withdrawals, ${fmtAmt(rangeOutDash, inUsd, usdPx)}`
                    }
                    title={
                      showWithdrawals ? 'Hide withdrawals on chart' : 'Show withdrawals on chart'
                    }
                    onClick={() => setShowWithdrawals(v => !v)}
                  >
                    <i className={'ShieldedPool__FlowSwatch'} aria-hidden={'true'} />
                    <b>−{fmtAmt(rangeOutDash, inUsd, usdPx)}</b>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {pool.error ? (
        <div className={'ShieldedPool__Empty'}>No data</div>
      ) : (
        <div className={'ShieldedPool__Body'}>
          <div
            ref={wrapRef}
            className={'ShieldedPool__Chart'}
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverI(null)}
          >
            {(pool.loading || series.loading) && !chart ? (
              <Skeleton className={'ShieldedPool__ChartSkel'} radius={8} />
            ) : chart ? (
              <>
                <svg
                  className={`ShieldedPool__Svg${series.loading ? ' is-stale' : ''}`}
                  viewBox={`0 0 ${width} ${plotH}`}
                  width={width}
                  height={plotH}
                  role={'img'}
                  aria-label={'Shielded pool TVL with deposit and withdrawal volume'}
                >
                  <defs>
                    <linearGradient id={`pool-tvl-fill-${gid}`} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
                      <stop className={'ShieldedPool__AreaTop'} offset={'0%'} />
                      <stop className={'ShieldedPool__AreaBot'} offset={'100%'} />
                    </linearGradient>
                    <linearGradient id={`pool-bar-in-${gid}`} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
                      <stop className={'ShieldedPool__BarInTop'} offset={'0%'} />
                      <stop className={'ShieldedPool__BarInBot'} offset={'100%'} />
                    </linearGradient>
                    <linearGradient id={`pool-bar-out-${gid}`} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
                      <stop className={'ShieldedPool__BarOutTop'} offset={'0%'} />
                      <stop className={'ShieldedPool__BarOutBot'} offset={'100%'} />
                    </linearGradient>
                    <filter
                      id={`pool-glow-${gid}`}
                      x={'-40%'}
                      y={'-40%'}
                      width={'180%'}
                      height={'180%'}
                    >
                      <feGaussianBlur stdDeviation={'2'} result={'b'} />
                      <feMerge>
                        <feMergeNode in={'b'} />
                        <feMergeNode in={'SourceGraphic'} />
                      </feMerge>
                    </filter>
                  </defs>

                  {chart.yTvlTicks.map((v: any, i: any) => (
                    <g key={`yl-${i}`}>
                      <line
                        className={'ShieldedPool__Grid'}
                        x1={M.left}
                        x2={width - M.right}
                        y1={chart.yTvl(v)}
                        y2={chart.yTvl(v)}
                      />
                      <text
                        className={'ShieldedPool__YTick ShieldedPool__YTick--left'}
                        x={M.left - 6}
                        y={chart.yTvl(v)}
                        dy={'0.32em'}
                        textAnchor={'end'}
                      >
                        {inUsd ? fmtUsd(v, true) : fmtCompact(v)}
                      </text>
                    </g>
                  ))}

                  {chart.yFlowTicks.map((v: any, i: any) => (
                    <text
                      key={`yr-${i}`}
                      className={'ShieldedPool__YTick ShieldedPool__YTick--right'}
                      x={width - M.right + 8}
                      y={chart.yFlow(v)}
                      dy={'0.32em'}
                      textAnchor={'start'}
                    >
                      {inUsd ? fmtUsd(v, true) : fmtCompact(v)}
                    </text>
                  ))}

                  <text
                    className={'ShieldedPool__AxisTitle ShieldedPool__AxisTitle--left'}
                    x={M.left - 6}
                    y={10}
                    textAnchor={'end'}
                  >
                    TVL
                  </text>
                  {chart.flowVisible && (
                    <text
                      className={'ShieldedPool__AxisTitle ShieldedPool__AxisTitle--right'}
                      x={width - 4}
                      y={10}
                      textAnchor={'end'}
                    >
                      vol
                    </text>
                  )}

                  {chart.flowVisible &&
                    chart.bars.map(b => {
                      const dim = hoverI != null && hoverI !== b.i
                      return (
                        <g key={b.i} opacity={dim ? 0.22 : 1}>
                          {showDeposits && b.inH > 0.5 && (
                            <rect
                              className={'ShieldedPool__Bar ShieldedPool__Bar--in'}
                              fill={`url(#pool-bar-in-${gid})`}
                              x={b.inX}
                              y={b.inY}
                              width={b.barW}
                              height={b.inH}
                              rx={1}
                            />
                          )}
                          {showWithdrawals && b.outH > 0.5 && (
                            <rect
                              className={'ShieldedPool__Bar ShieldedPool__Bar--out'}
                              fill={`url(#pool-bar-out-${gid})`}
                              x={b.outX}
                              y={b.outY}
                              width={b.barW}
                              height={b.outH}
                              rx={1}
                            />
                          )}
                        </g>
                      )
                    })}

                  <path
                    className={'ShieldedPool__Area'}
                    d={chart.area}
                    fill={`url(#pool-tvl-fill-${gid})`}
                  />
                  <path
                    className={'ShieldedPool__Line'}
                    d={chart.line}
                    filter={`url(#pool-glow-${gid})`}
                  />

                  {hovered && (
                    <>
                      <line
                        className={'ShieldedPool__Cross'}
                        x1={chart.x(hovered.x)}
                        x2={chart.x(hovered.x)}
                        y1={M.top}
                        y2={chart.baseline}
                      />
                      <circle
                        className={'ShieldedPool__DotRing'}
                        cx={chart.x(hovered.x)}
                        cy={chart.yTvl(hovered.tvl)}
                        r={8}
                      />
                      <circle
                        className={'ShieldedPool__Dot'}
                        cx={chart.x(hovered.x)}
                        cy={chart.yTvl(hovered.tvl)}
                        r={4}
                      />
                    </>
                  )}

                  {chart.xTicks.map((t: any, i: any) => (
                    <text
                      key={`x-${i}`}
                      className={'ShieldedPool__Tick'}
                      style={{
                        textAnchor:
                          i === 0 ? 'start' : i === chart.xTicks.length - 1 ? 'end' : 'middle'
                      }}
                      x={chart.x(t)}
                      y={plotH - 4}
                    >
                      {chart.tickFmt(t)}
                    </text>
                  ))}
                </svg>

                {hovered && (
                  <div
                    className={'ShieldedPool__Tip'}
                    style={{
                      left: `${Math.min(Math.max((chart.x(hovered.x) / width) * 100, 14), 86)}%`
                    }}
                  >
                    <span className={'ShieldedPool__TipDate'}>{chart.tipFmt(hovered.x)}</span>
                    <span className={'ShieldedPool__TipRow is-tvl'}>
                      TVL {fmtAmt(hovered.tvlDash, inUsd, usdPx)}
                      {usdPx != null && <em> · {fmtAmt(hovered.tvlDash, !inUsd, usdPx)}</em>}
                    </span>
                    {showDeposits && (
                      <span className={'ShieldedPool__TipRow is-in'}>
                        In +{fmtAmt(hovered.inDash, inUsd, usdPx)}
                      </span>
                    )}
                    {showWithdrawals && (
                      <span className={'ShieldedPool__TipRow is-out'}>
                        Out −{fmtAmt(hovered.outDash, inUsd, usdPx)}
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className={'ShieldedPool__EmptyChart'}>Not enough history</div>
            )}
          </div>
        </div>
      )}
    </Box>
  )
}
