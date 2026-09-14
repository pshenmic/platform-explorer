'use client'

import { useMemo, useRef, useState, type RefObject, type PointerEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import useResizeObserver from '@react-hook/resize-observer'
import * as d3 from 'd3'
import * as Api from '../../../util/Api'
import { creditsToDash } from '../../../util'
import ChartDateRange, { defaultChartRange } from '../../../components/calendar/ChartDateRange'
import { Skeleton } from '../../../components/home/Skeleton'
import './ValidatorCharts.css'

const HEIGHT = 224
const LEFT = 48
const RIGHT = 12
const BOTTOM = 28
const TOP = 16

async function loadActivity(
  hash: string,
  metric: 'blocks' | 'rewards',
  start: string,
  end: string,
  intervals: number
) {
  const fetchPoints = async (from: string, to: string, count: number) => {
    if (metric === 'blocks') {
      const result = await Api.getBlocksStatsByValidator(hash, from, to, count)
      return result.map(point => ({
        timestamp: point.timestamp!,
        value: Number(point.data?.blocksCount ?? 0)
      }))
    }
    const result = await Api.getRewardsStatsByValidator(hash, from, to, count)
    return result.map(point => ({
      timestamp: point.timestamp!,
      value: creditsToDash(Number(point.data?.reward ?? 0))
    }))
  }
  const raw = await fetchPoints(start, end, intervals)
  return [...new Map(raw.map(point => [point.timestamp, point])).values()]
}

export default function ValidatorCharts({ hash }: { hash: string }) {
  const [metric, setMetric] = useState<'blocks' | 'rewards'>('blocks')
  const [selection, setSelection] = useState(defaultChartRange)
  const [active, setActive] = useState<number | null>(null)
  const [width, setWidth] = useState(480)
  const containerRef = useRef<HTMLDivElement>(null)
  useResizeObserver(containerRef as RefObject<HTMLElement>, entry =>
    setWidth(entry.contentRect.width)
  )
  const range = useMemo(() => {
    const start = new Date(selection.start!)
    const end = new Date(selection.end!)
    if (selection.mode !== 'rolling') {
      start.setHours(0, 0, 0, 0)
      end.setHours(24, 0, 0, 0)
    }
    return {
      start: new Date(Math.floor(start.getTime() / 60000) * 60000).toISOString(),
      end: new Date(Math.floor(Math.min(end.getTime(), Date.now()) / 60000) * 60000).toISOString()
    }
  }, [selection])
  const intervals = width < 480 ? 30 : 60
  const query = useQuery({
    queryKey: ['validator-chart', hash, metric, range.start, range.end, intervals],
    queryFn: () => loadActivity(hash, metric, range.start, range.end, intervals),
    staleTime: 60000,
    retry: 1
  })
  const points = query.data ?? []
  const total = points.reduce((sum, point) => sum + point.value, 0)
  const selected = active == null ? null : points[active]
  const format = (value: number) =>
    value
      .toLocaleString('en-US', {
        maximumFractionDigits: metric === 'blocks' ? 0 : 8
      })
      .replace(/,/g, '\u202f')
  const unit = metric === 'blocks' ? 'blocks' : 'DASH'
  const plotWidth = Math.max(1, width - LEFT - RIGHT)
  const step = plotWidth / Math.max(1, points.length)
  const selectAtPointer = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const index = Math.floor((((event.clientX - rect.left) * width) / rect.width - LEFT) / step)
    setActive(Math.max(0, Math.min(points.length - 1, index)))
  }
  const maximum = Math.max(
    metric === 'blocks' ? 1 : 0.00000001,
    ...points.map(point => point.value)
  )
  const scale = d3
    .scaleLinear()
    .domain([0, maximum])
    .nice(3)
    .range([HEIGHT - BOTTOM, TOP])
  const ticks = scale
    .ticks(3)
    .filter((value: number) => metric !== 'blocks' || Number.isInteger(value))
  const dateFormat = (timestamp: string) =>
    new Date(timestamp).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  const labelIndexes = [
    ...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])
  ].filter(index => index >= 0)
  return (
    <section className={'ValidatorCharts'} aria-label={'Validator activity'}>
      <div className={'ValidatorCharts__Toolbar'}>
        <div className={'ValidatorCharts__Metrics'} role={'group'} aria-label={'Chart metric'}>
          {(['blocks', 'rewards'] as const).map(option => (
            <button
              key={option}
              type={'button'}
              aria-pressed={metric === option}
              onClick={() => {
                setMetric(option)
                setActive(null)
              }}
            >
              {option === 'blocks' ? 'Proposed blocks' : 'Rewards'}
            </button>
          ))}
        </div>
        <ChartDateRange
          value={selection}
          onChange={next => {
            setSelection(next)
            setActive(null)
          }}
        />
      </div>
      <div className={'ValidatorCharts__Summary'} aria-live={'polite'} aria-atomic={true}>
        <div className={'ValidatorCharts__Value'}>
          {query.isPending ? (
            <Skeleton w={'7ch'} h={'1em'} />
          ) : query.isError ? (
            '—'
          ) : (
            format(selected?.value ?? total)
          )}
          <span>{unit}</span>
        </div>
        <p>
          {selected
            ? `${dateFormat(selected.timestamp)} – ${dateFormat(points[(active ?? 0) + 1]?.timestamp ?? range.end)}`
            : 'Total in selected period'}
        </p>
      </div>
      <div ref={containerRef} className={'ValidatorCharts__Plot'}>
        {query.isPending ? (
          <div className={'ValidatorCharts__Loading'} role={'status'} aria-label={'Loading chart'}>
            {[32, 54, 42, 70, 48, 84, 62, 50, 74, 56, 90, 68].map((height, index) => (
              <Skeleton key={index} w={'100%'} h={`${height}%`} />
            ))}
          </div>
        ) : query.isError ? (
          <div className={'ValidatorCharts__Message'} role={'status'}>
            <p>Unable to load chart</p>
            <button type={'button'} onClick={() => void query.refetch()}>
              Retry
            </button>
          </div>
        ) : !points.length || total === 0 ? (
          <div className={'ValidatorCharts__Message'} role={'status'}>
            No {metric === 'blocks' ? 'proposed blocks' : 'rewards'} in this period
          </div>
        ) : (
          <svg
            width={'100%'}
            height={HEIGHT}
            viewBox={`0 0 ${width} ${HEIGHT}`}
            role={'img'}
            aria-label={`${metric === 'blocks' ? 'Proposed blocks' : 'Rewards'} per interval. ${format(total)} ${unit} total. Use left and right arrows to explore.`}
            tabIndex={0}
            onPointerMove={selectAtPointer}
            onPointerDown={selectAtPointer}
            onPointerLeave={event => {
              if (event.pointerType === 'mouse') setActive(null)
            }}
            onBlur={() => setActive(null)}
            onKeyDown={event => {
              if (event.key === 'Escape') setActive(null)
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
              event.preventDefault()
              setActive(index =>
                Math.max(
                  0,
                  Math.min(points.length - 1, (index ?? -1) + (event.key === 'ArrowRight' ? 1 : -1))
                )
              )
            }}
          >
            {ticks.map((tick: number) => (
              <g key={tick} className={'ValidatorCharts__Axis'}>
                <line x1={LEFT} x2={width - RIGHT} y1={scale(tick)} y2={scale(tick)} />
                <text x={LEFT - 8} y={scale(tick)} dy={'0.35em'} textAnchor={'end'}>
                  {tick >= 1000
                    ? d3.format('.2~s')(tick)
                    : Number(tick.toPrecision(2)).toLocaleString('en-US', {
                        maximumFractionDigits: 8
                      })}
                </text>
              </g>
            ))}
            {points.map((point, index) => (
              <rect
                key={point.timestamp}
                className={`ValidatorCharts__Bar${active === index ? ' is-active' : ''}`}
                x={LEFT + index * step + 1}
                y={scale(point.value)}
                width={Math.max(1, step - 2)}
                height={Math.max(0, scale(0) - scale(point.value))}
                rx={2}
              />
            ))}
            {labelIndexes.map((index, position) => (
              <text
                key={index}
                className={'ValidatorCharts__Date'}
                x={
                  position === 0
                    ? LEFT
                    : position === labelIndexes.length - 1
                      ? width - RIGHT
                      : LEFT + plotWidth / 2
                }
                y={HEIGHT - 6}
                textAnchor={
                  position === 0 ? 'start' : position === labelIndexes.length - 1 ? 'end' : 'middle'
                }
              >
                {new Date(points[index].timestamp).toLocaleString(
                  'en-GB',
                  Date.parse(range.end) - Date.parse(range.start) <= 86400000
                    ? { hour: '2-digit', minute: '2-digit' }
                    : { day: 'numeric', month: 'short' }
                )}
              </text>
            ))}
          </svg>
        )}
      </div>
      <p className={'ValidatorCharts__Hint'}>
        Each bar shows {metric === 'blocks' ? 'blocks proposed' : 'DASH earned'} in one interval.
        Hover or tap to inspect.
      </p>
    </section>
  )
}
