'use client'

import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react'
import { useQuery } from '@tanstack/react-query'
import useResizeObserver from '@react-hook/resize-observer'
import * as d3 from 'd3'
import * as Api from '../../../util/Api'
import { creditsToDash, removeTrailingZeros } from '../../../util'
import { BigNumber } from '../../../components/data'
import { StatusCell } from '../../../components/home/StatusCell'
import { Skeleton } from '../../../components/home/Skeleton'
import ChartDateRange, { defaultChartRange } from '../../../components/calendar/ChartDateRange'
import '../../../components/home/IdentityGrowthChart.css'
import '../../../app/home/Home.css'
import '../../../app/home/HomeHero.css'
import './ValidatorEpochs.css'

const M = { top: 8, right: 4, bottom: 20 }

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

export default function ValidatorEpochs({
  hash,
  epochReward
}: {
  hash: string
  epochNumber: number | null
  epochStart: number | string | null
  epochEnd: number | string | null
  epochReward?: number | string | null
}) {
  const gradId = useId().replace(/:/g, '')
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)
  const [plotH, setPlotH] = useState(168)
  const [selection, setSelection] = useState(defaultChartRange)
  const [pinI, setPinI] = useState<number | null>(null)
  const [hoverI, setHoverI] = useState<number | null>(null)

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
    queryKey: ['validator-epochs', hash, queryRange?.start, queryRange?.end],
    queryFn: () => Api.getEpochStatsByValidator(hash, queryRange!.start, queryRange!.end),
    enabled: Boolean(hash && queryRange),
    staleTime: 60000,
    retry: 1
  })

  const epochWindow = useMemo(() => {
    const points = statsQuery.data
    const first = points?.[0]?.data
    const last = points?.[points.length - 1]?.data
    if (!first || !last || statsQuery.isError) return null
    return { fromEpoch: first.epoch, toEpoch: last.endEpoch ?? last.epoch }
  }, [statsQuery.data, statsQuery.isError])

  const slots = useMemo(
    () =>
      (statsQuery.data ?? []).map(point => ({
        from: point.data!.epoch,
        to: point.data!.endEpoch ?? point.data!.epoch,
        reward: Number(point.data!.fees),
        blocks: point.data!.blocksCount
      })),
    [statsQuery.data]
  )

  useEffect(() => {
    setPinI(null)
    setHoverI(null)
  }, [epochWindow?.fromEpoch, epochWindow?.toEpoch])

  const h = plotH
  const chart = useMemo(() => {
    if (width <= 0 || !epochWindow || slots.length === 0) return null
    const rewards = slots.map(slot => creditsToDash(slot.reward))
    const maxY = d3.max(rewards) || 0
    const y = d3.scaleLinear([0, maxY > 0 ? maxY : 1], [h - M.bottom, M.top]).nice()
    const yTickValues: number[] = maxY > 0 ? y.ticks(4) : [0]
    const left = axisGutter(yTickValues.map(axisDash))
    const x = d3.scaleLinear(
      [epochWindow.fromEpoch, Math.max(epochWindow.fromEpoch + 1, epochWindow.toEpoch)],
      [left, width - M.right]
    )
    const nodes = slots.map((slot, i) => ({
      i,
      from: slot.from,
      to: slot.to,
      cx: x((slot.from + slot.to) / 2),
      cy: y(rewards[i]),
      reward: slot.reward,
      blocks: slot.blocks
    }))
    const lineD =
      nodes.length > 1
        ? d3
            .line()
            .x((n: (typeof nodes)[number]) => n.cx)
            .y((n: (typeof nodes)[number]) => n.cy)
            .curve(d3.curveLinear)(nodes)
        : ''
    const areaD =
      nodes.length > 1
        ? d3
            .area()
            .x((n: (typeof nodes)[number]) => n.cx)
            .y0(h - M.bottom)
            .y1((n: (typeof nodes)[number]) => n.cy)
            .curve(d3.curveLinear)(nodes)
        : ''
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
    const totalReward = slots.reduce((sum, slot) => sum + slot.reward, 0)
    const totalBlocks = slots.reduce((sum, slot) => sum + slot.blocks, 0)
    return { nodes, lineD, areaD, xTicks, yTicks, totalReward, totalBlocks, left }
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
            <h2 className={'EpochsOverview__Title'}>Fees by epoch</h2>
            {epochReward != null && (
              <span className={'ValidatorEpochs__Now'} title={'Current epoch fees'}>
                {dashAmount(Number(epochReward))} DASH
              </span>
            )}
          </div>
          <p className={'EpochsOverview__Lede'}>
            Transaction fees in indexed blocks proposed by this node.
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
        ) : statsQuery.isSuccess && statsQuery.data?.length === 0 ? (
          <div className={'IdentityGrowthChart__Empty'}>No epochs in this range</div>
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
            role={'img'}
            aria-label={`Fees by epoch, ${dashAmount(chart.totalReward)} DASH`}
            onMouseMove={onMove}
            onMouseLeave={() => setHoverI(null)}
            onClick={() => {
              if (hoverI == null) return
              setPinI(pin => (pin === hoverI ? null : hoverI))
            }}
          >
            <defs>
              <linearGradient id={`epochArea-${gradId}`} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
                <stop className={'IdentityGrowthChart__AreaTop'} offset={'0%'} />
                <stop className={'IdentityGrowthChart__AreaBot'} offset={'100%'} />
              </linearGradient>
              <filter
                id={`epochGlow-${gradId}`}
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
            {chart.areaD ? (
              <path
                className={'IdentityGrowthChart__Area'}
                d={chart.areaD}
                fill={`url(#epochArea-${gradId})`}
              />
            ) : null}
            {chart.lineD ? (
              <path
                className={'IdentityGrowthChart__Line'}
                d={chart.lineD}
                filter={`url(#epochGlow-${gradId})`}
              />
            ) : null}
            {chart.nodes.map(node =>
              node.reward > 0 || chart.nodes.length <= 24 || node.i === activeI ? (
                <circle
                  key={`${node.from}-${node.to}`}
                  className={'ValidatorEpochs__Vertex'}
                  cx={node.cx}
                  cy={node.cy}
                  r={node.i === activeI ? 2.75 : chart.nodes.length <= 24 ? 2.75 : 1.75}
                />
              ) : null
            )}
            {shown && (
              <>
                <line
                  className={'IdentityGrowthChart__Guide'}
                  x1={shown.cx}
                  x2={shown.cx}
                  y1={M.top}
                  y2={h - M.bottom}
                />
                <circle
                  className={'IdentityGrowthChart__DotRing'}
                  cx={shown.cx}
                  cy={shown.cy}
                  r={8}
                />
                <circle className={'IdentityGrowthChart__Dot'} cx={shown.cx} cy={shown.cy} r={4} />
              </>
            )}
          </svg>
        ) : null}
      </div>
      <div className={'EpochsOverview__Detail'}>
        <div className={'EpochsOverview__Cells HomeHero__StatusBar ValidatorEpochs__Kpis'}>
          <StatusCell
            label={'Fees'}
            hint={
              'Sum of this node’s proposed-block fees in the selected range. Hover a point to read that stretch.'
            }
          >
            {loading && !chart ? (
              <Skeleton w={'64px'} h={'1.1em'} />
            ) : (
              <span className={'EpochsOverview__Stat'}>
                {chart ? `${dashAmount(shown ? shown.reward : chart.totalReward)} DASH` : '—'}
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
