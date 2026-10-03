'use client'

import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react'
import { useQuery } from '@tanstack/react-query'
import useResizeObserver from '@react-hook/resize-observer'
import * as d3 from 'd3'
import * as Api from '../../../util/Api'
import { creditsToDash, currencyRound, getDaysBetweenDates } from '../../../util'
import ChartDateRange, { defaultChartRange } from '../../../components/calendar/ChartDateRange'
import { Skeleton } from '../../../components/home/Skeleton'
import '../../../components/home/TxActivityChart.css'
import './ValidatorCharts.css'

const M = { top: 12, right: 10, bottom: 22, left: 44 }

const formatValue = (v: number, blocks: boolean) =>
  blocks
    ? Math.abs(v) >= 1e6
      ? currencyRound(v)
      : d3.format(',')(Math.round(v))
    : v.toLocaleString('en-US', { maximumFractionDigits: 8 }).replace(/,/g, '\u202f')

async function loadActivity(
  hash: string,
  metric: 'blocks' | 'rewards',
  start: string,
  end: string,
  intervals: number
) {
  const points =
    metric === 'blocks'
      ? (await Api.getBlocksStatsByValidator(hash, start, end, intervals)).map(point => ({
          x: new Date(point.timestamp!),
          y: Number(point.data?.blocksCount ?? 0)
        }))
      : (await Api.getRewardsStatsByValidator(hash, start, end, intervals)).map(point => ({
          x: new Date(point.timestamp!),
          y: creditsToDash(Number(point.data?.reward ?? 0))
        }))
  const unique = [...new Map(points.map(point => [+point.x, point])).values()].filter(
    point => typeof point.y === 'number' && !Number.isNaN(point.y)
  )
  let from = 0
  let to = unique.length - 1
  while (from < to && unique[from].y === 0) from++
  while (to > from && unique[to].y === 0) to--
  return unique.slice(from, to + 1)
}

export default function ValidatorCharts({ hash }: { hash: string }) {
  const [metric, setMetric] = useState<'blocks' | 'rewards'>('blocks')
  const [selection, setSelection] = useState(defaultChartRange)
  const [width, setWidth] = useState(0)
  const [plotH, setPlotH] = useState(160)
  const [hoverI, setHoverI] = useState<number | null>(null)
  const [pinI, setPinI] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const gradId = useId().replace(/:/g, '')
  useResizeObserver(wrapRef as RefObject<HTMLElement>, entry => {
    setWidth(Math.max(0, Math.floor(entry.contentRect.width)))
    setPlotH(Math.max(120, Math.floor(entry.contentRect.height || 160)))
  })
  useEffect(() => {
    if (!wrapRef.current) return
    setWidth(Math.max(0, Math.floor(wrapRef.current.clientWidth)))
    setPlotH(Math.max(120, Math.floor(wrapRef.current.clientHeight || 160)))
  }, [])
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
  const h = plotH
  const ready = width > 0 && h > 0 && points.length > 1
  const isBlocks = metric === 'blocks'
  const yAbbr = isBlocks ? 'blocks' : 'DASH'
  const chart = useMemo(() => {
    if (!ready) return null
    const x = d3.scaleTime(
      d3.extent(points, (p: any) => p.x),
      [M.left, width - M.right]
    )
    const spanDays = getDaysBetweenDates(points[0].x, points[points.length - 1].x)
    const tickFmt = d3.timeFormat(spanDays > 365 ? '%b %Y' : spanDays > 7 ? '%b %d' : '%H:%M')
    const tipFmt = d3.timeFormat(
      spanDays > 365 ? '%b %d, %Y' : spanDays > 3 ? '%b %d' : '%b %d, %H:%M'
    )
    const maxY = d3.max(points, (p: any) => p.y) || (isBlocks ? 1 : 0.00000001)
    const y = d3.scaleLinear([0, maxY], [h - M.bottom, M.top]).nice()
    const step = points.length > 1 ? Math.abs(x(points[1].x) - x(points[0].x)) : 8
    const bw = Math.max(2, Math.min(step * 0.72, 18))
    const bars = points.map((p, i) => ({
      i,
      x: x(p.x) - bw / 2,
      y: y(p.y),
      w: bw,
      h: Math.max(0, y(0) - y(p.y)),
      cx: x(p.x),
      value: p.y,
      date: p.x
    }))
    const tickCount = Math.max(2, Math.min(6, Math.floor((width - M.left - M.right) / 72)))
    const xTicks = x.ticks(tickCount).map((d: any) => ({ v: x(d), label: tickFmt(d) }))
    const yTicks = y
      .ticks(4)
      .filter((v: number) => !isBlocks || Number.isInteger(v))
      .map((v: any) => ({ v: y(v), label: formatValue(v, isBlocks) }))
    const total = points.reduce((sum, p) => sum + p.y, 0)
    return { bars, xTicks, yTicks, tipFmt, total }
  }, [ready, points, width, h, isBlocks])
  const activeI = pinI != null ? pinI : hoverI
  const activeBar = chart && activeI != null ? chart.bars[activeI] : null
  const rangeTotal = chart ? formatValue(chart.total, isBlocks) : '—'
  const statMeta = activeBar
    ? `${chart!.tipFmt(activeBar.date)} · ${formatValue(activeBar.value, isBlocks)} ${yAbbr}`
    : 'in selected period'
  const onMove = (e: any) => {
    if (!chart) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    let best = 0
    let bestDist = Infinity
    for (const b of chart.bars) {
      const d = Math.abs(b.cx - px)
      if (d < bestDist) {
        bestDist = d
        best = b.i
      }
    }
    if (hoverI !== best) setHoverI(best)
  }
  return (
    <section className={'ValidatorCharts TxActivityChart'} aria-label={'Validator activity'}>
      <header className={'TxActivityChart__Head'}>
        <div className={'TxActivityChart__HeadText'}>
          <span className={'TxActivityChart__Eyebrow'}>Activity</span>
          <h2 className={'TxActivityChart__Title'}>{isBlocks ? 'Proposed blocks' : 'Rewards'}</h2>
          <p className={'TxActivityChart__Lede'}>
            {isBlocks ? 'Blocks proposed per interval.' : 'DASH earned per interval.'}
          </p>
        </div>
        <div className={'TxActivityChart__Controls'}>
          <div className={'ValidatorCharts__Filters'}>
            <div className={'ValidatorCharts__Metrics'} role={'group'} aria-label={'Chart metric'}>
              {(['blocks', 'rewards'] as const).map(option => (
                <button
                  key={option}
                  type={'button'}
                  aria-pressed={metric === option}
                  onClick={() => {
                    setMetric(option)
                    setHoverI(null)
                    setPinI(null)
                  }}
                >
                  {option === 'blocks' ? 'Blocks' : 'Rewards'}
                </button>
              ))}
            </div>
            <ChartDateRange
              value={selection}
              onChange={next => {
                setSelection(next)
                setHoverI(null)
                setPinI(null)
              }}
            />
          </div>
          <div
            className={`TxActivityChart__Stat${activeBar ? ' is-on' : ''}${pinI != null ? ' is-pinned' : ''}`}
          >
            <div className={'TxActivityChart__StatMain'}>
              <span className={'TxActivityChart__StatCount'}>{rangeTotal}</span>
              <span className={'TxActivityChart__StatUnit'}>{yAbbr}</span>
            </div>
            <span className={'TxActivityChart__StatMeta'}>{statMeta}</span>
          </div>
        </div>
      </header>
      <div ref={wrapRef} className={'TxActivityChart__Plot'}>
        {query.isError ? (
          <div className={'TxActivityChart__Empty'}>
            Unable to load chart
            <button type={'button'} onClick={() => void query.refetch()}>
              Retry
            </button>
          </div>
        ) : query.isPending && !chart ? (
          <div className={'TxActivityChart__Ghost'}>
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton
                key={i}
                className={'TxActivityChart__GhostBar'}
                w={'100%'}
                h={`${30 + (i % 5) * 12}%`}
                radius={3}
              />
            ))}
          </div>
        ) : !chart ? (
          <div className={'TxActivityChart__Empty'}>
            No {isBlocks ? 'proposed blocks' : 'rewards'} in this period
          </div>
        ) : (
          <svg
            className={`TxActivityChart__Svg${query.isFetching ? ' is-stale' : ''}`}
            viewBox={`0 0 ${width} ${h}`}
            width={width}
            height={h}
            role={'img'}
            aria-label={`${isBlocks ? 'Proposed blocks' : 'Rewards'}, sum ${formatValue(chart.total, isBlocks)} ${yAbbr}`}
            onMouseMove={onMove}
            onMouseLeave={() => setHoverI(null)}
            onClick={() => {
              if (hoverI == null) return
              setPinI(p => (p === hoverI ? null : hoverI))
            }}
          >
            <defs>
              <linearGradient id={`txBar-${gradId}`} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
                <stop className={'TxActivityChart__GradTop'} offset={'0%'} />
                <stop className={'TxActivityChart__GradBot'} offset={'100%'} />
              </linearGradient>
              <linearGradient id={`txBarOn-${gradId}`} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
                <stop className={'TxActivityChart__GradOnTop'} offset={'0%'} />
                <stop className={'TxActivityChart__GradOnBot'} offset={'100%'} />
              </linearGradient>
              <filter id={`txGlow-${gradId}`} x={'-50%'} y={'-50%'} width={'200%'} height={'200%'}>
                <feGaussianBlur stdDeviation={'2.2'} result={'b'} />
                <feMerge>
                  <feMergeNode in={'b'} />
                  <feMergeNode in={'SourceGraphic'} />
                </feMerge>
              </filter>
            </defs>
            {chart.yTicks.map((t: any, i: number) => (
              <g key={`y${i}`}>
                <line
                  className={'TxActivityChart__Grid'}
                  x1={M.left}
                  x2={width - M.right}
                  y1={t.v}
                  y2={t.v}
                />
                <text
                  className={'TxActivityChart__Tick TxActivityChart__Tick--Y'}
                  x={M.left - 6}
                  y={t.v}
                  dy={'0.32em'}
                >
                  {t.label}
                </text>
              </g>
            ))}
            {chart.xTicks.map((t: any, i: number) => (
              <text
                key={`x${i}`}
                className={'TxActivityChart__Tick TxActivityChart__Tick--X'}
                style={{
                  textAnchor: i === 0 ? 'start' : i === chart.xTicks.length - 1 ? 'end' : 'middle'
                }}
                x={t.v}
                y={h - 4}
              >
                {t.label}
              </text>
            ))}
            <line
              className={'TxActivityChart__Baseline'}
              x1={M.left}
              x2={width - M.right}
              y1={h - M.bottom}
              y2={h - M.bottom}
            />
            {chart.bars.map((b: any) => {
              const on = activeI === b.i
              const dim = activeI != null && activeI !== b.i
              return (
                <rect
                  key={b.i}
                  className={['TxActivityChart__Bar', on ? 'is-on' : '', dim ? 'is-dim' : '']
                    .filter(Boolean)
                    .join(' ')}
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={Math.max(b.h, b.value > 0 ? 2 : 0)}
                  rx={Math.min(3, b.w / 2)}
                  fill={on ? `url(#txBarOn-${gradId})` : `url(#txBar-${gradId})`}
                  filter={on ? `url(#txGlow-${gradId})` : undefined}
                />
              )
            })}
            {activeBar && (
              <line
                className={'TxActivityChart__Guide'}
                x1={activeBar.cx}
                x2={activeBar.cx}
                y1={M.top}
                y2={h - M.bottom}
              />
            )}
          </svg>
        )}
      </div>
    </section>
  )
}
