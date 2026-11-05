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
  validatorChartRange
} from '../../../util/validatorChart'
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

function barPath(left: number, top: number, width: number, bottom: number) {
  const radius = width < 6 ? 0 : Math.min(2, (bottom - top) / 2)
  const right = left + width
  return `M${left},${bottom}V${top + radius}Q${left},${top} ${left + radius},${top}H${right - radius}Q${right},${top} ${right},${top + radius}V${bottom}Z`
}

export default function ValidatorEpochs({
  hash,
  payouts
}: {
  hash: string
  payouts: ValidatorPayoutsProps
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

  const statsQuery = useQuery({
    queryKey: [
      'validator-epochs',
      hash,
      queryRange?.start,
      queryRange?.end,
      MAX_EPOCH_POINTS,
      selectionKey
    ],
    queryFn: () =>
      Api.getEpochStatsByValidator(hash, queryRange!.start, queryRange!.end, MAX_EPOCH_POINTS),
    enabled: Boolean(hash && queryRange),
    staleTime: 60000,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === hash && previousQuery?.queryKey[5] === selectionKey
        ? previousData
        : undefined,
    retry: 1
  })

  const { visiblePoints, totalBlocks } = useMemo(
    () => validatorChartHistory(statsQuery.data ?? []),
    [statsQuery.data]
  )

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
        ongoing: point.data!.endTime == null,
        progress:
          point.data!.endTime == null &&
          point.data!.epoch === epoch?.number &&
          point.data!.endEpoch === epoch?.number
            ? progress
            : null,
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
    if (width <= 0 || !epochWindow || !queryRange || slots.length === 0) return null
    const payoutsInDash = slots.map(slot => (slot.payout == null ? 0 : creditsToDash(slot.payout)))
    const maxY = d3.max(payoutsInDash) || 0
    const y = d3.scaleLinear([0, maxY > 0 ? maxY : 1], [h - M.bottom, M.top]).nice()
    const yTickCount = Math.max(2, Math.min(4, Math.floor((h - M.top - M.bottom) / 40)))
    const yTickValues: number[] = maxY > 0 ? y.ticks(yTickCount) : [0]
    const left = axisGutter(yTickValues.map(axisDash))
    const x = d3.scaleLinear(
      [epochWindow.fromEpoch - 0.5, epochWindow.toEpoch + 0.5],
      [left, width - M.right]
    )
    const nodes = slots.map((slot, index) => {
      const slotX = x(slot.from - 0.5)
      const slotWidth = x(slot.to + 0.5) - slotX
      const gap = Math.min(4, slotWidth * 0.32)
      return {
        i: index,
        from: slot.from,
        to: slot.to,
        cx: x((slot.from + slot.to) / 2),
        slotX,
        slotWidth,
        barX: slotX + gap / 2,
        barWidth: slotWidth - gap,
        cy: y(payoutsInDash[index]),
        payout: slot.payout,
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
        ? [
            {
              v: left,
              label: validatorChartDateLabel(firstTimestamp, firstTimestamp, lastTimestamp)
            },
            {
              v: width - M.right,
              label: validatorChartDateLabel(lastTimestamp, firstTimestamp, lastTimestamp)
            }
          ]
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
  }, [width, h, slots, epochWindow, queryRange])

  const activeI = pinI ?? hoverI
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
          <dt>{shown ? 'Epoch reward' : 'Period rewards'}</dt>
          <dd>
            {chart && (shown ? shown.payout : chart.totalPayouts) != null ? (
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
          content={payoutDetails}
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
              left: shown?.cx ?? 0,
              top: !shown || shown.payout == null ? M.top : Math.min(shown.cy, h - M.bottom - 2)
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
        ) : statsQuery.isSuccess && visiblePoints.length === 0 ? (
          <div className={'IdentityGrowthChart__Empty'} role="status">
            No payout data in this range
          </div>
        ) : loading && !chart ? (
          <div
            className={'IdentityGrowthChart__Ghost'}
            role="status"
            aria-label="Loading Platform payouts"
          >
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
                  className={'IdentityGrowthChart__Grid'}
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
                    DASH
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
              <g className="ValidatorEpochs__Datum" key={`${node.from}-${node.to}`}>
                <path
                  className={`ValidatorEpochs__Bar${node.i === activeI ? ' is-on' : ''}${node.payout == null ? ' is-missing' : ''}`}
                  d={barPath(
                    node.barX,
                    node.payout == null ? M.top : Math.min(node.cy, h - M.bottom - 2),
                    node.barWidth,
                    h - M.bottom
                  )}
                  fill={node.payout == null ? `url(#epochMissing-${gradId})` : undefined}
                />
                {node.payout == null && node.progress != null && (
                  <>
                    <path
                      className={'ValidatorEpochs__TimeFill'}
                      d={barPath(
                        node.barX,
                        h - M.bottom - ((h - M.bottom - M.top) * node.progress) / 100,
                        node.barWidth,
                        h - M.bottom
                      )}
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
                  x={node.slotX}
                  width={node.slotWidth}
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
                  aria-label={`Epoch ${node.from === node.to ? node.from : `${node.from}–${node.to}`}: ${node.payout == null ? (node.progress != null ? `${Math.floor(node.progress)}% of estimated duration elapsed; payout unavailable` : node.ongoing ? 'Epoch in progress; payout unavailable' : 'Payout unavailable') : `${dashAmount(node.payout)} DASH`}`}
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
