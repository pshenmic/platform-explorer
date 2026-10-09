'use client'

import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react'
import { useQuery } from '@tanstack/react-query'
import useResizeObserver from '@react-hook/resize-observer'
import * as d3 from 'd3'
import * as Api from '../../../util/Api'
import { epochProgress } from '../../../util/epochProgress'
import { creditsToDash, removeTrailingZeros } from '../../../util'
import { BigNumber } from '../../../components/data'
import { StatusCell } from '../../../components/home/StatusCell'
import { Skeleton } from '../../../components/home/Skeleton'
import ChartDateRange, { defaultChartRange } from '../../../components/calendar/ChartDateRange'
import '../../../components/home/IdentityGrowthChart.css'
import '../../../components/home/TxActivityChart.css'
import '../../../app/home/Home.css'
import '../../../app/home/HomeHero.css'
import './ValidatorEpochs.css'

const M = { top: 8, right: 4, bottom: 20 }
const MAX_EPOCH_POINTS = 84

function dashAmount(credits: number) {
  const dash = creditsToDash(credits)
  const digits = Math.abs(dash) >= 100 ? 2 : Math.abs(dash) >= 1 ? 4 : 8
  return String(removeTrailingZeros(dash.toFixed(digits)))
}

function axisDash(dash: number) {
  if (!Number.isFinite(dash) || dash === 0) return '0'
  const abs = Math.abs(dash)
  if (abs >= 1) return String(removeTrailingZeros(dash.toFixed(2)))
  if (abs >= 0.0001) return String(removeTrailingZeros(dash.toFixed(4)))
  return dash.toExponential(0)
}

function axisGutter(labels: string[]) {
  const widest = labels.reduce((max, label) => Math.max(max, label.length), 1)
  return Math.ceil(widest * 7.4) + 8
}

export default function ValidatorEpochs({ hash }: { hash: string }) {
  const gradId = useId().replace(/:/g, '')
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)
  const [plotH, setPlotH] = useState(168)
  const [selection, setSelection] = useState(defaultChartRange)
  const [pinI, setPinI] = useState<number | null>(null)
  const [hoverI, setHoverI] = useState<number | null>(null)
  useEffect(() => {
    const clearSelection = (event: PointerEvent) => {
      if (event.target instanceof Element &&
        wrapRef.current?.contains(event.target) &&
        event.target.closest('.ValidatorEpochs__Hit')) return
      setPinI(null)
      setHoverI(null)
    }
    document.addEventListener('pointerdown', clearSelection)
    return () => document.removeEventListener('pointerdown', clearSelection)
  }, [])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  const currentEpoch = useQuery({
    queryKey: ['validator-current-epoch'],
    queryFn: () => Api.getEpoch(),
    staleTime: 60000,
    refetchInterval: 60000
  })
  const epoch = currentEpoch.isError ? undefined : currentEpoch.data?.epoch
  const progress = epoch ? epochProgress(epoch.startTime, epoch.endTime, now) : null

  useResizeObserver(wrapRef as RefObject<HTMLElement>, entry => {
    setWidth(Math.max(0, Math.floor(entry.contentRect.width)))
    setPlotH(Math.max(140, Math.floor(entry.contentRect.height || 168)))
  })

  useEffect(() => {
    if (!wrapRef.current) return
    setWidth(Math.max(0, Math.floor(wrapRef.current.clientWidth)))
    setPlotH(Math.max(140, Math.floor(wrapRef.current.clientHeight || 168)))
  }, [])

  useEffect(() => {
    setSelection(defaultChartRange())
    setPinI(null)
    setHoverI(null)
  }, [hash])

  const queryRange = useMemo(() => {
    if (!selection.start || !selection.end) return null
    const start = new Date(selection.start)
    const end = new Date(selection.end)
    if (selection.mode !== 'rolling') {
      start.setHours(0, 0, 0, 0)
      end.setHours(24, 0, 0, 0)
    }
    return {
      start: new Date(Math.floor(start.getTime() / 60000) * 60000).toISOString(),
      end: new Date(Math.floor(Math.min(end.getTime(), Date.now()) / 60000) * 60000).toISOString()
    }
  }, [selection])

  const statsQuery = useQuery({
    queryKey: ['validator-epochs', hash, queryRange?.start, queryRange?.end, MAX_EPOCH_POINTS],
    queryFn: () => Api.getEpochStatsByValidator(hash, queryRange!.start, queryRange!.end, MAX_EPOCH_POINTS),
    enabled: Boolean(hash && queryRange),
    staleTime: 60000,
    retry: 1
  })

  const visiblePoints = useMemo(() => {
    const points = statsQuery.data ?? []
    const firstKnown = points.findIndex(point => point.data?.reward != null || point.data?.endTime == null)
    return firstKnown < 0 ? [] : points.slice(firstKnown)
  }, [statsQuery.data])

  const epochWindow = useMemo(() => {
    const points = visiblePoints
    const first = points?.[0]?.data
    const last = points?.[points.length - 1]?.data
    if (!first || !last || statsQuery.isError) return null
    return { fromEpoch: first.epoch, toEpoch: last.endEpoch ?? last.epoch }
  }, [visiblePoints, statsQuery.isError])

  const slots = useMemo(
    () =>
      visiblePoints.map(point => ({
        from: point.data!.epoch,
        to: point.data!.endEpoch ?? point.data!.epoch,
        payout: point.data!.reward,
        ongoing: point.data!.endTime == null,
        progress: point.data!.endTime == null && point.data!.epoch === epoch?.number &&
          point.data!.endEpoch === epoch?.number ? progress : null,
        blocks: point.data!.blocksProposed
      })),
    [visiblePoints, epoch?.number, progress]
  )

  useEffect(() => {
    setPinI(null)
    setHoverI(null)
  }, [epochWindow?.fromEpoch, epochWindow?.toEpoch])

  const h = plotH
  const chart = useMemo(() => {
    if (width <= 0 || !epochWindow || slots.length === 0) return null
    const payoutsInDash = slots.map(slot => slot.payout == null ? 0 : creditsToDash(slot.payout))
    const maxY = d3.max(payoutsInDash) || 0
    const y = d3.scaleLinear([0, maxY > 0 ? maxY : 1], [h - M.bottom, M.top]).nice()
    const yTickValues: number[] = maxY > 0 ? y.ticks(4) : [0]
    const left = axisGutter(yTickValues.map(axisDash))
    const x = d3.scaleLinear(
      [epochWindow.fromEpoch - 0.5, epochWindow.toEpoch + 0.5],
      [left, width - M.right]
    )
    const nodes = slots.map((slot, i) => ({
      i,
      from: slot.from,
      to: slot.to,
      cx: x((slot.from + slot.to) / 2),
      barX: x(slot.from - 0.5) + 1,
      barWidth: Math.max(1, x(slot.to + 0.5) - x(slot.from - 0.5) - 2),
      cy: y(payoutsInDash[i]),
      payout: slot.payout,
      ongoing: slot.ongoing,
      progress: slot.progress,
      blocks: slot.blocks
    }))
    const tickCount = Math.max(2, Math.min(5, Math.floor((width - left - M.right) / 64)))
    const tickEpochs = Array.from(
      new Set(
        Array.from({ length: tickCount }, (_, i) =>
          Math.round(
            epochWindow.fromEpoch +
              (i * (epochWindow.toEpoch - epochWindow.fromEpoch)) / Math.max(1, tickCount - 1)
          )
        )
      )
    )
    const xTicks = tickEpochs.map(epoch => ({ v: x(epoch), label: `#${epoch}` }))
    const yTicks = yTickValues.map((v: number) => ({ v: y(v), label: axisDash(v) }))
    const totalPayouts = slots.some(slot => slot.payout != null)
      ? slots.reduce((sum, slot) => sum + (slot.payout ?? 0), 0)
      : null
    const totalBlocks = slots.reduce((sum, slot) => sum + slot.blocks, 0)
    return { nodes, xTicks, yTicks, totalPayouts, totalBlocks, left }
  }, [width, h, slots, epochWindow])

  const activeI = hoverI != null ? hoverI : pinI
  const shown = activeI != null ? chart?.nodes[activeI] : null
  const focusFrom = shown ? shown.from : epochWindow?.fromEpoch
  const focusTo = shown ? shown.to : epochWindow?.toEpoch
  const focusDate = (() => {
    if (focusFrom == null || focusTo == null || !queryRange) return null
    const points = statsQuery.data ?? []
    const first = points.find(point => point.data?.epoch === focusFrom)
    const last = points.find(point => (point.data?.endEpoch ?? point.data?.epoch) === focusTo)
    if (!first?.timestamp || !last?.data) return null
    const from = Math.max(new Date(first.timestamp).getTime(), new Date(queryRange.start).getTime())
    const to = Math.min(
      new Date(last.data.endTime ?? queryRange.end).getTime(),
      new Date(queryRange.end).getTime()
    )
    const spanMs = to - from
    const mode = spanMs <= 48 * 3600000 ? 'time' : spanMs <= 120 * 86400000 ? 'day' : 'month'
    const stamp = (ms: number) => {
      const date = new Date(ms)
      const dd = String(date.getUTCDate()).padStart(2, '0')
      const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
      const yyyy = date.getUTCFullYear()
      const hh = String(date.getUTCHours()).padStart(2, '0')
      const min = String(date.getUTCMinutes()).padStart(2, '0')
      if (mode === 'month') return `${mm}.${yyyy}`
      if (mode === 'day') return `${dd}.${mm}.${yyyy}`
      return `${dd}.${mm} ${hh}:${min}`
    }
    const fromLabel = stamp(from)
    const toLabel = stamp(to)
    return fromLabel === toLabel ? fromLabel : `${fromLabel}–${toLabel}`
  })()
  const loading = statsQuery.isPending

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chart || chart.nodes.length === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    let best = 0
    let bestDist = Infinity
    for (const node of chart.nodes) {
      const dist = Math.abs(node.cx - px)
      if (dist < bestDist) {
        bestDist = dist
        best = node.i
      }
    }
    if (hoverI !== best) setHoverI(best)
  }

  return (
    <div className={'EpochsOverview ValidatorEpochs'} aria-label={'Validator epochs'}>
      <header className={'EpochsOverview__Head'}>
        <div className={'EpochsOverview__HeadText'}>
          <div className={'EpochsOverview__TitleRow'}>
            <h2 className={'EpochsOverview__Title'}>Platform payouts</h2>
          </div>
          <p className={'EpochsOverview__Lede'}>
            Rewards paid to this validator by epoch.
          </p>
        </div>
        <div className={'ValidatorEpochs__Filters'}>
          <ChartDateRange
            value={selection}
            onChange={next => {
              setSelection(next)
              setPinI(null)
              setHoverI(null)
            }}
          />
        </div>
      </header>
      <div ref={wrapRef} className={'ValidatorEpochs__Plot'}>
        {statsQuery.isError ? (
          <div className={'IdentityGrowthChart__Empty'}>
            {statsQuery.error instanceof Error && statsQuery.error.message.includes('updated API')
              ? statsQuery.error.message
              : 'Unable to load epochs. Try a shorter date range or retry.'}
            <button type={'button'} onClick={() => void statsQuery.refetch()}>
              Retry
            </button>
          </div>
        ) : statsQuery.isSuccess && visiblePoints.length === 0 ? (
          <div className={'IdentityGrowthChart__Empty'}>No payout data in this range</div>
        ) : loading && !chart ? (
          <div className={'IdentityGrowthChart__Ghost'}>
            <Skeleton w={'100%'} h={'70%'} radius={8} />
          </div>
        ) : chart ? (
          <svg
            className={`IdentityGrowthChart__Svg${statsQuery.isFetching ? ' is-stale' : ''}`}
            viewBox={`0 0 ${width} ${h}`}
            width={width}
            height={h}
            role={'group'}
            aria-label={`Platform payouts by epoch, ${chart.totalPayouts == null ? 'unavailable' : `${dashAmount(chart.totalPayouts)} DASH indexed`}`}
            onMouseMove={onMove}
            onMouseLeave={() => setHoverI(null)}
          >
            <defs>
              <linearGradient id={`epochBar-${gradId}`} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
                <stop className={'TxActivityChart__GradTop'} offset={'0%'} />
                <stop className={'TxActivityChart__GradBot'} offset={'100%'} />
              </linearGradient>
              <linearGradient id={`epochBarOn-${gradId}`} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
                <stop className={'TxActivityChart__GradOnTop'} offset={'0%'} />
                <stop className={'TxActivityChart__GradOnBot'} offset={'100%'} />
              </linearGradient>
              <pattern id={`epochMissing-${gradId}`} width={8} height={8} patternUnits={'userSpaceOnUse'}>
                <path d={'M0 8L8 0'} className={'ValidatorEpochs__Hatch'} />
              </pattern>
            </defs>
            {chart.yTicks.map((tick, i) => (
              <g key={`y${i}`}>
                <line
                  className={'IdentityGrowthChart__Grid'}
                  x1={chart.left}
                  x2={width - M.right}
                  y1={tick.v}
                  y2={tick.v}
                />
                <text
                  className={'IdentityGrowthChart__Tick IdentityGrowthChart__Tick--Y'}
                  x={chart.left - 6}
                  y={tick.v}
                  dy={'0.32em'}
                >
                  {tick.label}
                </text>
              </g>
            ))}
            {chart.xTicks.map((tick, i) => (
              <text
                key={`x${i}`}
                className={'IdentityGrowthChart__Tick IdentityGrowthChart__Tick--X'}
                style={{
                  textAnchor: i === 0 ? 'start' : i === chart.xTicks.length - 1 ? 'end' : 'middle'
                }}
                x={tick.v}
                y={h - 4}
              >
                {tick.label}
              </text>
            ))}
            {chart.nodes.map(node => (
              <g key={`${node.from}-${node.to}`}>
                <rect
                  className={`TxActivityChart__Bar ValidatorEpochs__Bar${node.i === activeI ? ' is-on' : activeI != null ? ' is-dim' : ''}${node.payout == null ? ' is-missing' : ''}`}
                  x={node.barX}
                  width={node.barWidth}
                  y={node.payout == null ? M.top : Math.min(node.cy, h - M.bottom - 2)}
                  height={node.payout == null ? h - M.bottom - M.top : Math.max(2, h - M.bottom - node.cy)}
                  fill={node.payout == null ? `url(#epochMissing-${gradId})` : `url(#${node.i === activeI ? 'epochBarOn' : 'epochBar'}-${gradId})`}
                  rx={Math.min(3, node.barWidth / 2)}
                />
                {node.payout == null && node.progress != null && (
                  <>
                    <rect
                      className={'ValidatorEpochs__TimeFill'}
                      x={node.barX}
                      width={node.barWidth}
                      y={h - M.bottom - (h - M.bottom - M.top) * node.progress / 100}
                      height={(h - M.bottom - M.top) * node.progress / 100}
                      rx={Math.min(3, node.barWidth / 2)}
                    />
                    {node.barWidth >= 60 && (
                      <text className={'ValidatorEpochs__ProgressLabel'} x={node.cx} y={M.top + 16}>
                        {Math.floor(node.progress)}% time
                      </text>
                    )}
                  </>
                )}
                <rect
                  className={'ValidatorEpochs__Hit'}
                  x={node.barX}
                  width={node.barWidth}
                  y={M.top}
                  height={h - M.bottom - M.top}
                  tabIndex={0}
                  role={'button'}
                  aria-pressed={pinI === node.i}
                  aria-label={`Epoch ${node.from === node.to ? node.from : `${node.from}–${node.to}`}: ${node.payout == null ? node.progress != null ? `${Math.floor(node.progress)}% of estimated duration elapsed; payout unavailable` : node.ongoing ? 'Epoch in progress; payout unavailable' : 'Payout unavailable' : `${dashAmount(node.payout)} DASH`}`}
                  onFocus={() => { setHoverI(null); setPinI(node.i) }}
                  onClick={() => { setHoverI(null); setPinI(node.i) }}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setPinI(node.i)
                    }
                    if (event.key === 'Escape') { setPinI(null); setHoverI(null) }
                  }}
                />
              </g>
            ))}
          </svg>
        ) : null}
      </div>
      <div className={'EpochsOverview__Detail'}>
        <div className={'EpochsOverview__Cells HomeHero__StatusBar ValidatorEpochs__Kpis'}>
          <StatusCell
            label={'Platform payouts'}
            hint={
              'Sum of available indexed payouts, not fees or a forecast. Hatched columns mean unavailable data, not zero. History may be incomplete. Select a column to inspect its epochs; Tab and Escape also work.'
            }
          >
            {loading && !chart ? (
              <Skeleton w={'64px'} h={'1.1em'} />
            ) : (
              <span className={'EpochsOverview__Stat'}>
                {chart && (shown ? shown.payout : chart.totalPayouts) != null
                  ? `${dashAmount((shown ? shown.payout : chart.totalPayouts)!)} DASH`
                  : shown?.ongoing ? 'In progress' : 'Unavailable'}
              </span>
            )}
          </StatusCell>
          <StatusCell
            label={'Blocks'}
            hint={'Platform blocks this node proposed in the selected range or point.'}
          >
            {loading && !chart ? (
              <Skeleton w={'40px'} h={'1.1em'} />
            ) : (
              <span className={'EpochsOverview__Stat'}>
                {chart ? <BigNumber>{shown ? shown.blocks : chart.totalBlocks}</BigNumber> : '—'}
              </span>
            )}
          </StatusCell>
          <StatusCell
            label={'Epoch'}
            hint={
              'Actual Platform epochs in the selected range. Long ranges group adjacent epochs.'
            }
          >
            <span className={'EpochsOverview__Stat'}>
              {focusFrom == null
                ? '—'
                : focusFrom === focusTo
                  ? `#${focusFrom}`
                  : `#${focusFrom}–#${focusTo}`}
            </span>
          </StatusCell>
          <StatusCell label={'Date'}>
            <span className={'EpochsOverview__Stat'}>{focusDate ?? '—'}</span>
          </StatusCell>
        </div>
      </div>
    </div>
  )
}
