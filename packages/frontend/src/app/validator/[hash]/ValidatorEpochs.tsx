'use client'

import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react'
import { useQuery } from '@tanstack/react-query'
import useResizeObserver from '@react-hook/resize-observer'
import * as d3 from 'd3'
import * as Api from '../../../util/Api'
import { epochProgress } from '../../../util/epochProgress'
import {
  validatorChartDateLabel,
  validatorChartHistory,
  validatorChartRange,
  validatorCurrentEpochReward
} from '../../../util/validatorChart'
import type { ValidatorPendingEpochReward } from '../../../types/Validator'
import { creditsToDash, removeTrailingZeros } from '../../../util'
import { BigNumber } from '../../../components/data'
import ValidatorAmountDetails from './ValidatorAmountDetails'
import { Tooltip } from '../../../components/ui/Tooltips'
import ValidatorPayouts, { type ValidatorPayoutsProps } from './ValidatorPayouts'
import { Skeleton } from '../../../components/home/Skeleton'
import ChartDateRange, {
  CHART_ALL_START,
  defaultChartRange
} from '../../../components/calendar/ChartDateRange'
import '../../../components/home/IdentityGrowthChart.css'
import '../../../app/home/Home.css'
import './ValidatorEpochs.css'

const M = { top: 12, right: 4, bottom: 20 }
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
  return Math.ceil(widest * 6.7) + 20
}

function dateRangeTicks(start: string, end: string, left: number, right: number) {
  const first = Date.parse(start)
  const duration = Date.parse(end) - first
  const count = Math.max(2, Math.min(5, Math.floor((right - left) / 110)))
  return Array.from({ length: count }, (_, index) => {
    const fraction = index / (count - 1)
    return {
      v: left + (right - left) * fraction,
      label: validatorChartDateLabel(
        new Date(first + duration * fraction).toISOString(),
        start,
        end
      )
    }
  })
}

function barPath(left: number, top: number, width: number, bottom: number) {
  const radius = width < 6 ? 0 : Math.min(2, (bottom - top) / 2)
  const right = left + width
  return `M${left},${bottom}V${top + radius}Q${left},${top} ${left + radius},${top}H${right - radius}Q${right},${top} ${right},${top + radius}V${bottom}Z`
}

export default function ValidatorEpochs({
  hash,
  payouts,
  pendingReward
}: {
  hash: string
  payouts: ValidatorPayoutsProps
  pendingReward?: ValidatorPendingEpochReward | null
}) {
  const gradId = useId().replace(/:/g, '')
  const tooltipId = useId()
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)
  const [plotH, setPlotH] = useState(168)
  const [selection, setSelection] = useState(defaultChartRange)
  const [pinI, setPinI] = useState<number | null>(null)
  const [hoverI, setHoverI] = useState<number | null>(null)
  const [focusedEpoch, setFocusedEpoch] = useState<number | null>(null)
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keepHover = () => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current)
    hoverCloseTimer.current = null
  }
  const leaveHover = () => {
    keepHover()
    hoverCloseTimer.current = setTimeout(() => setHoverI(null), 150)
  }
  useEffect(() => {
    const clearSelection = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        (event.target.closest('[data-chart-tooltip]') ||
          (wrapRef.current?.contains(event.target) &&
            event.target.closest('.ValidatorEpochs__Hit')))
      )
        return
      setPinI(null)
      setHoverI(null)
      const focused = document.activeElement
      if (
        focused instanceof SVGElement &&
        wrapRef.current?.contains(focused) &&
        focused.classList.contains('ValidatorEpochs__Hit')
      ) {
        focused.blur()
      }
    }
    document.addEventListener('pointerdown', clearSelection)
    return () => {
      document.removeEventListener('pointerdown', clearSelection)
      if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current)
    }
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

  const queryRange = useMemo(
    () => validatorChartRange(selection, now, CHART_ALL_START),
    [selection, now]
  )
  const selectionKey = JSON.stringify(selection)
  const includesCurrentEpoch = Boolean(
    epoch &&
      queryRange &&
      Date.parse(queryRange.start) < epoch.endTime &&
      Date.parse(queryRange.end) >= epoch.startTime
  )
  const epochStats = useQuery({
    queryKey: ['validator-current-epoch-stats', hash, epoch?.number],
    enabled: Boolean(hash && epoch && includesCurrentEpoch),
    queryFn: () =>
      Api.getEpochStatsByValidator(
        hash,
        new Date(epoch!.startTime).toISOString(),
        new Date().toISOString(),
        2
      ),
    staleTime: 60000,
    refetchInterval: 60000,
    retry: 1
  })

  const statsQuery = useQuery({
    queryKey: [
      'validator-epochs',
      hash,
      queryRange?.start,
      queryRange?.end,
      MAX_EPOCH_POINTS,
      selectionKey,
      epoch?.number
    ],
    queryFn: () => {
      const end = includesCurrentEpoch
        ? new Date(epoch!.startTime - 1).toISOString()
        : queryRange!.end
      return Date.parse(end) < Date.parse(queryRange!.start)
        ? Promise.resolve([])
        : Api.getEpochStatsByValidator(hash, queryRange!.start, end, MAX_EPOCH_POINTS - 1)
    },
    enabled: Boolean(hash && queryRange && !currentEpoch.isPending),
    staleTime: 60000,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === hash &&
      previousQuery?.queryKey[5] === selectionKey &&
      previousQuery?.queryKey[6] === epoch?.number
        ? previousData
        : undefined,
    retry: 1
  })

  const points = useMemo(
    () => [
      ...(statsQuery.data ?? []),
      ...(includesCurrentEpoch && !epochStats.isError
        ? (epochStats.data?.filter(point => point.data?.epoch === epoch?.number) ?? [])
        : [])
    ],
    [statsQuery.data, includesCurrentEpoch, epochStats.data, epochStats.isError, epoch?.number]
  )
  const { visiblePoints, totalBlocks } = useMemo(() => validatorChartHistory(points), [points])

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
        timestamp: point.timestamp,
        endTime: point.data!.endTime,
        from: point.data!.epoch,
        to: point.data!.endEpoch ?? point.data!.epoch,
        payout: point.data!.reward,
        estimatedReward:
          point.data!.reward == null &&
          point.data!.endTime == null &&
          point.data!.epoch === point.data!.endEpoch &&
          point.data!.epoch === epoch?.number
            ? (validatorCurrentEpochReward(pendingReward, epoch.number) ??
              (point.data!.blocksProposed === 0 ? 0 : null))
            : null,
        ongoing: point.data!.endTime == null,
        progress:
          point.data!.endTime == null &&
          point.data!.epoch === epoch?.number &&
          point.data!.endEpoch === epoch?.number
            ? progress
            : null,
        blocks: point.data!.blocksProposed
      })),
    [visiblePoints, epoch?.number, progress, pendingReward]
  )

  useEffect(() => {
    setPinI(null)
    setHoverI(null)
  }, [epochWindow?.fromEpoch, epochWindow?.toEpoch])

  const loading = statsQuery.isPending || (includesCurrentEpoch && epochStats.isPending)
  const h = plotH
  const chart = useMemo(() => {
    if (loading || width <= 0 || !queryRange) return null
    if (!epochWindow || slots.length === 0) {
      if (!statsQuery.isSuccess) return null
      const left = axisGutter(['0 DASH', '0.5', '1'])
      return {
        nodes: [],
        xTicks: dateRangeTicks(queryRange.start, queryRange.end, left, width - M.right),
        yTicks: [0, 0.5, 1].map(value => ({
          v: h - M.bottom - value * (h - M.bottom - M.top),
          label: axisDash(value)
        })),
        totalPayouts: null,
        left
      }
    }
    const payoutsInDash = slots.map(slot => creditsToDash(slot.estimatedReward ?? slot.payout ?? 0))
    const maxY = d3.max(payoutsInDash) || 0
    const y = d3.scaleLinear([0, maxY > 0 ? maxY : 1], [h - M.bottom, M.top]).nice()
    const yTickCount = Math.max(2, Math.min(4, Math.floor((h - M.top - M.bottom) / 40)))
    const yTickValues: number[] = y.ticks(yTickCount)
    const left = axisGutter(yTickValues.map(value => (value === 0 ? '0 DASH' : axisDash(value))))
    const x = d3.scaleLinear([-0.5, slots.length - 0.5], [left, width - M.right])
    const nodes = slots.map((slot, index) => {
      const slotX = x(index - 0.5)
      const slotWidth = x(index + 0.5) - slotX
      const gap = Math.min(4, slotWidth * 0.32)
      const barWidth = Math.min(32, slotWidth - gap)
      return {
        i: index,
        from: slot.from,
        to: slot.to,
        cx: x(index),
        slotX,
        slotWidth,
        barX: slotX + (slotWidth - barWidth) / 2,
        barWidth,
        cy: y(payoutsInDash[index]),
        payout: slot.payout,
        estimatedReward: slot.estimatedReward,
        ongoing: slot.ongoing,
        progress: slot.progress,
        blocks: slot.blocks
      }
    })
    const tickCount = Math.max(2, Math.min(5, Math.floor((width - left - M.right) / 110)))
    const tickIndices = Array.from(
      new Set(
        Array.from({ length: tickCount }, (_, i) =>
          Math.round((i * (slots.length - 1)) / Math.max(1, tickCount - 1))
        )
      )
    )
    const firstTimestamp = new Date(
      Math.max(Date.parse(slots[0].timestamp || queryRange.start), Date.parse(queryRange.start))
    ).toISOString()
    const lastTimestamp = new Date(
      Math.min(
        Date.parse(slots[slots.length - 1].endTime || queryRange.end),
        Date.parse(queryRange.end)
      )
    ).toISOString()
    const xTicks =
      slots.length === 1
        ? dateRangeTicks(firstTimestamp, lastTimestamp, left, width - M.right)
        : tickIndices.map(index => ({
            v: nodes[index].cx,
            label: validatorChartDateLabel(
              index === 0 ? firstTimestamp : slots[index].timestamp,
              firstTimestamp,
              lastTimestamp
            )
          }))
    const yTicks = yTickValues.map((value: number) => ({
      v: y(value),
      label: axisDash(value)
    }))
    const totalPayouts = slots.some(slot => slot.payout != null)
      ? slots.reduce((sum, slot) => sum + (slot.payout ?? 0), 0)
      : null
    return { nodes, xTicks, yTicks, totalPayouts, left }
  }, [loading, width, h, slots, epochWindow, queryRange, statsQuery.isSuccess])

  const activeI = pinI ?? hoverI
  const shown = activeI != null ? chart?.nodes[activeI] : null
  const focusFrom = shown ? shown.from : epochWindow?.fromEpoch
  const focusTo = shown ? shown.to : epochWindow?.toEpoch
  const focusDate = (() => {
    if (focusFrom == null || focusTo == null || !queryRange) return null
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

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    keepHover()
    if (pinI != null) return
    if (!chart || chart.nodes.length === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    if (px < chart.left || px > width - M.right || py < M.top || py > h - M.bottom) {
      setHoverI(null)
      return
    }
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

  const payoutDetails = (
    <div>
      <dl className="ValidatorEpochs__TooltipDetails">
        <div>
          <dt>{shown && shown.from === shown.to ? 'Epoch reward' : 'Period rewards'}</dt>
          <dd>
            {shown?.estimatedReward != null ? (
              <ValidatorAmountDetails dash={creditsToDash(shown.estimatedReward)} />
            ) : chart && (shown ? shown.payout : chart.totalPayouts) != null ? (
              <ValidatorAmountDetails
                dash={creditsToDash((shown ? shown.payout : chart.totalPayouts)!)}
              />
            ) : shown?.ongoing ? (
              'In progress'
            ) : (
              'Unavailable'
            )}
          </dd>
        </div>
        {shown?.progress != null && (
          <div>
            <dt>Time elapsed</dt>
            <dd>{Math.floor(shown.progress)}%</dd>
          </div>
        )}
        <div>
          <dt>Blocks proposed</dt>
          <dd>
            {statsQuery.isSuccess ? (
              <BigNumber>{shown ? shown.blocks : totalBlocks}</BigNumber>
            ) : (
              'Unavailable'
            )}
          </dd>
        </div>
        <div>
          <dt>Epoch</dt>
          <dd>
            {focusFrom == null
              ? '—'
              : focusFrom === focusTo
                ? `#${focusFrom}`
                : `#${focusFrom}–#${focusTo}`}
          </dd>
        </div>
        <div>
          <dt>Date (UTC)</dt>
          <dd>{focusDate ?? '—'}</dd>
        </div>
      </dl>
    </div>
  )

  const epochDetails = shown && (
    <div className="ValidatorEpochs__BarDetails">
      <div className="ValidatorEpochs__BarDates">{focusDate ?? '—'} UTC</div>
      <div className="ValidatorEpochs__BarAmount">
        {shown.estimatedReward != null ? (
          <ValidatorAmountDetails dash={creditsToDash(shown.estimatedReward)} />
        ) : shown.payout != null ? (
          <ValidatorAmountDetails dash={creditsToDash(shown.payout)} />
        ) : shown.ongoing ? (
          'In progress'
        ) : (
          'Unavailable'
        )}
      </div>
      <div>
        <BigNumber>{shown.blocks}</BigNumber> blocks proposed
      </div>
      {shown.progress != null && <div>{Math.floor(shown.progress)}% time elapsed</div>}
    </div>
  )

  return (
    <div className={'EpochsOverview ValidatorEpochs'} aria-label={'Validator epochs'}>
      <header className={'EpochsOverview__Head'}>
        <div className={'EpochsOverview__TitleRow'}>
          <h2 className={'EpochsOverview__Title'}>
            <Tooltip
              className="ValidatorPage__Tooltip"
              title={shown ? 'Selected epochs' : 'Selected period'}
              content={payoutDetails}
            >
              <button
                type="button"
                className="ValidatorEpochs__Info"
                aria-label="Payout details for the selected period or epoch"
              >
                Rewards chart
              </button>
            </Tooltip>
          </h2>
          <div className="ValidatorEpochs__Summary">
            <ValidatorPayouts {...payouts} />
          </div>
        </div>
        <div className={'ValidatorEpochs__Filters'}>
          <ChartDateRange
            value={selection}
            onChange={next => {
              setNow(Date.now())
              setSelection(next)
              setPinI(null)
              setHoverI(null)
            }}
          />
        </div>
      </header>
      <div ref={wrapRef} className={'ValidatorEpochs__Plot'}>
        <Tooltip
          className="ValidatorPage__Tooltip"
          title={
            !shown
              ? 'Epoch payout'
              : shown.from === shown.to
                ? `Epoch #${shown.from}`
                : `Epochs #${shown.from}–#${shown.to}`
          }
          content={epochDetails}
          placement="right"
          isOpen={Boolean(shown)}
          id={tooltipId}
          chart
          onOpenChange={open => {
            if (!open) {
              keepHover()
              setPinI(null)
              setHoverI(null)
            }
          }}
          onFloatingEnter={keepHover}
          onFloatingLeave={leaveHover}
        >
          <span
            className="ValidatorEpochs__TooltipAnchor"
            style={{
              left: shown?.barX ?? 0,
              width: shown?.barWidth ?? 1,
              top: !shown || shown.payout == null ? M.top : Math.min(shown.cy, h - M.bottom - 2),
              height: shown
                ? Math.max(1, h - M.bottom - (shown.payout == null ? M.top : shown.cy))
                : 1
            }}
          />
        </Tooltip>
        {statsQuery.isError ? (
          <div className={'IdentityGrowthChart__Empty'} role="status">
            {statsQuery.error instanceof Error && statsQuery.error.message.includes('updated API')
              ? statsQuery.error.message
              : 'Unable to load epochs. Try a shorter date range or retry.'}
            <button type={'button'} onClick={() => void statsQuery.refetch()}>
              Retry
            </button>
          </div>
        ) : loading ? (
          <div
            className={'IdentityGrowthChart__Ghost'}
            role="status"
            aria-label="Loading Platform payouts"
          >
            <Skeleton w={'100%'} h={'70%'} radius={8} />
          </div>
        ) : chart ? (
          <svg
            className={`IdentityGrowthChart__Svg${statsQuery.isFetching || epochStats.isFetching ? ' is-stale' : ''}`}
            viewBox={`0 0 ${width} ${h}`}
            width={width}
            height={h}
            role={'group'}
            aria-label={`Platform payouts by epoch, ${chart.totalPayouts == null ? 'unavailable' : `${dashAmount(chart.totalPayouts)} DASH indexed`}`}
            onMouseMove={onMove}
            onMouseLeave={leaveHover}
          >
            <defs>
              <pattern
                id={`epochMissing-${gradId}`}
                width={8}
                height={8}
                patternUnits={'userSpaceOnUse'}
              >
                <path d={'M0 8L8 0'} className={'ValidatorEpochs__Hatch'} />
              </pattern>
            </defs>
            {chart.yTicks.map((tick, i) => (
              <g key={`y${i}`}>
                <title>{`${tick.label} DASH`}</title>
                <line
                  className="IdentityGrowthChart__Grid ValidatorEpochs__Grid"
                  x1={chart.left}
                  x2={width - M.right}
                  y1={tick.v}
                  y2={tick.v}
                />
                {tick.label === '0' ? (
                  <text
                    className="IdentityGrowthChart__Tick"
                    x={chart.left - 8}
                    y={tick.v}
                    dy="0.32em"
                    textAnchor="end"
                  >
                    0 DASH
                  </text>
                ) : (
                  <>
                    <rect
                      className="ValidatorEpochs__AxisBadge"
                      x={chart.left - 8 - Math.ceil(tick.label.length * 6.7) - 12}
                      y={tick.v - 9}
                      width={Math.ceil(tick.label.length * 6.7) + 12}
                      height={18}
                      rx={9}
                    />
                    <text
                      className="ValidatorEpochs__AxisValue"
                      x={chart.left - 14}
                      y={tick.v}
                      dy={'0.32em'}
                      textAnchor="end"
                    >
                      {tick.label}
                    </text>
                  </>
                )}
              </g>
            ))}
            {chart.xTicks.map((tick, i) => (
              <g key={`x${i}`}>
                <line
                  className="ValidatorEpochs__Grid"
                  x1={tick.v}
                  x2={tick.v}
                  y1={M.top}
                  y2={h - M.bottom}
                />
                <text
                  className={'IdentityGrowthChart__Tick IdentityGrowthChart__Tick--X'}
                  style={{
                    textAnchor: i === 0 ? 'start' : i === chart.xTicks.length - 1 ? 'end' : 'middle'
                  }}
                  x={tick.v}
                  y={h - 4}
                >
                  {tick.label}
                </text>
              </g>
            ))}
            {chart.nodes.map(node => (
              <g className="ValidatorEpochs__Datum" key={`${node.from}-${node.to}`}>
                {(node.ongoing
                  ? (node.estimatedReward ?? node.payout ?? 0) > 0
                  : node.payout == null || node.payout > 0) && (
                  <>
                    <path
                      className={`ValidatorEpochs__Bar${node.i === activeI ? ' is-on' : ''}${node.ongoing ? ' is-current' : node.payout == null ? ' is-missing' : ''}`}
                      d={barPath(
                        node.barX,
                        node.ongoing || node.payout == null
                          ? M.top
                          : Math.min(node.cy, h - M.bottom - 2),
                        node.barWidth,
                        h - M.bottom
                      )}
                      fill={
                        !node.ongoing && node.payout == null
                          ? `url(#epochMissing-${gradId})`
                          : undefined
                      }
                    />
                    {node.ongoing && (
                      <path
                        className="ValidatorEpochs__CurrentReward"
                        d={barPath(
                          node.barX,
                          Math.min(node.cy, h - M.bottom - 2),
                          node.barWidth,
                          h - M.bottom
                        )}
                      />
                    )}
                  </>
                )}
                <rect
                  className={'ValidatorEpochs__Hit'}
                  x={
                    node.ongoing
                      ? Math.max(chart.left, Math.min(node.cx - 8, width - M.right - 16))
                      : node.slotX
                  }
                  width={node.ongoing ? Math.max(16, node.slotWidth) : node.slotWidth}
                  y={M.top}
                  height={h - M.bottom - M.top}
                  tabIndex={
                    node.i ===
                    (chart.nodes.some(item => item.i === focusedEpoch)
                      ? focusedEpoch
                      : chart.nodes[0]?.i)
                      ? 0
                      : -1
                  }
                  role={'button'}
                  aria-pressed={pinI === node.i}
                  aria-describedby={activeI === node.i ? tooltipId : undefined}
                  aria-label={`Epoch ${node.from === node.to ? node.from : `${node.from}–${node.to}`}: ${node.estimatedReward != null ? `Estimated reward so far ${dashAmount(node.estimatedReward)} DASH; epoch in progress` : node.payout == null ? (node.progress != null ? `${Math.floor(node.progress)}% of estimated duration elapsed; payout unavailable` : node.ongoing ? 'Epoch in progress; payout unavailable' : 'Payout unavailable') : `${dashAmount(node.payout)} DASH`}`}
                  onFocus={() => {
                    setFocusedEpoch(node.i)
                    setHoverI(node.i)
                  }}
                  onBlur={() => setHoverI(null)}
                  onClick={() => {
                    setHoverI(null)
                    setPinI(previous => (previous === node.i ? null : node.i))
                  }}
                  onKeyDown={event => {
                    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                      event.preventDefault()
                      const targets = Array.from(
                        event.currentTarget.ownerSVGElement?.querySelectorAll<SVGRectElement>(
                          '.ValidatorEpochs__Hit'
                        ) || []
                      )
                      const current = targets.indexOf(event.currentTarget)
                      const next =
                        event.key === 'Home'
                          ? 0
                          : event.key === 'End'
                            ? targets.length - 1
                            : Math.max(
                                0,
                                Math.min(
                                  targets.length - 1,
                                  current + (event.key === 'ArrowRight' ? 1 : -1)
                                )
                              )
                      targets[next]?.focus()
                    }
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setPinI(previous => (previous === node.i ? null : node.i))
                    }
                    if (event.key === 'Escape') {
                      setPinI(null)
                      setHoverI(null)
                    }
                  }}
                />
              </g>
            ))}
          </svg>
        ) : null}
      </div>
    </div>
  )
}
