'use client'

import { useState, useEffect, useRef, useId } from 'react'
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import * as d3 from 'd3'
import useResizeObserver from '@react-hook/resize-observer'
import { Box } from '@chakra-ui/react'
import { CardHead, Presets } from '../cards'
import { getDaysBetweenDates, currencyRound } from '../../util'
import './MetricChart.css'

const DAY = 24 * 60 * 60 * 1000

export interface MetricPreset {
  label: string
  ms?: number
  start?: string
  intervals: number
}

export const PRESETS: MetricPreset[] = [
  { label: '24h', ms: DAY, intervals: 48 },
  { label: '1W', ms: 7 * DAY, intervals: 84 },
  { label: '1M', ms: 30 * DAY, intervals: 100 },
  { label: '6M', ms: 182 * DAY, intervals: 100 },
  { label: '1Y', ms: 365 * DAY, intervals: 100 },
  { label: 'All', start: '2024-01-01T00:00:00.000Z', intervals: 100 }
]
const DEFAULT_PRESET = 2

export function presetRange (preset: MetricPreset): { start: string, end: string } {
  // full-hour end: the history API drops trailing buckets (and their data) for sub-hour ends
  const endMs = Math.ceil(Date.now() / 3600000) * 3600000
  return {
    start: preset.start ?? new Date(endMs - (preset.ms ?? 0)).toISOString(),
    end: new Date(endMs).toISOString()
  }
}

// full grouped numbers (3,361) so narrow ranges read precisely; k/M only when huge
const formatValue = (v: number): string => Math.abs(v) >= 1e6 ? String(currencyRound(v)) : d3.format(',')(Math.round(v))

const M = { top: 10, right: 8, bottom: 18, left: 46 }
const HEIGHT = 200

// first-load placeholder: ghost outline of the coming chart (grid + neutral series shape)
const GHOST_LINE_D = 'M 0 62 L 12 50 L 25 58 L 38 42 L 50 48 L 62 34 L 75 42 L 88 26 L 100 32'
const GHOST_BARS = [38, 52, 30, 60, 45, 66, 40, 56, 34, 62, 48, 58]

interface ChartGhostProps {
  type?: 'line' | 'bar' | string
}

function ChartGhost ({ type }: ChartGhostProps) {
  return (
    <svg className={'MetricChart__Ghost'} viewBox={'0 0 100 100'} preserveAspectRatio={'none'} aria-hidden={'true'}>
      {[18, 42, 66, 90].map(gy => (
        <line key={gy} className={'MetricChart__GhostGrid'} x1={0} x2={100} y1={gy} y2={gy} vectorEffect={'non-scaling-stroke'}/>
      ))}
      {type === 'bar'
        ? GHOST_BARS.map((h, i) => (
            <rect
              key={i}
              className={'MetricChart__GhostBar'}
              x={2 + i * 8.2}
              y={90 - h}
              width={4.5}
              height={h}
              style={{ animationDelay: `${i * 0.12}s` }}
            />
        ))
        : <>
            <path className={'MetricChart__GhostLine'} d={GHOST_LINE_D} fill={'none'} vectorEffect={'non-scaling-stroke'}/>
            <path className={'MetricChart__GhostScan'} d={GHOST_LINE_D} fill={'none'} pathLength={'100'} vectorEffect={'non-scaling-stroke'}/>
          </>}
    </svg>
  )
}

interface ChartPoint {
  x: Date
  y: number
}

interface ChartState {
  loading: boolean
  error: boolean
  points: ChartPoint[]
}

interface HoverState {
  i: number
  cx: number
  cy: number
  value: number
  date: Date
}

interface SeriesItem {
  timestamp: string
  data?: Record<string, number | null | undefined>
}

interface MetricChartProps {
  title?: ReactNode
  type?: 'line' | 'bar' | string
  fetcher: (start: string, end: string, intervals: number) => Promise<SeriesItem[] | null | undefined>
  field: string
  yAbbr?: string
  enabled?: boolean
}

export function MetricChart ({
  title,
  type = 'line',
  fetcher,
  field,
  yAbbr = '',
  enabled = true
}: MetricChartProps) {
  const [presetIdx, setPresetIdx] = useState(DEFAULT_PRESET)
  const [state, setState] = useState<ChartState>({ loading: true, error: false, points: [] })
  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState<HoverState | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const gradientId = useId()

  useResizeObserver(wrapRef as never, entry => setWidth(entry.contentRect.width))
  useEffect(() => {
    if (wrapRef.current) setWidth(wrapRef.current.clientWidth)
  }, [])

  useEffect(() => {
    // below-fold: stay skeleton until parent prioritizes above-fold status/epochs
    if (!enabled) {
      setState(s => ({ ...s, loading: true, error: false }))
      return
    }
    const preset = PRESETS[presetIdx]
    const { start, end } = presetRange(preset)
    setState(s => ({ ...s, loading: true, error: false }))
    fetcher(start, end, preset.intervals)
      .then(res => {
        const pts = (res || [])
          .map(item => ({ x: new Date(item.timestamp), y: item?.data?.[field] as number }))
          .filter((p): p is ChartPoint => typeof p.y === 'number' && !isNaN(p.y))
        // drop leading zero buckets (before first activity) so the range isn't compressed
        let s = 0
        while (s < pts.length - 1 && pts[s].y === 0) s++
        setState({ loading: false, error: false, points: pts.slice(s) })
      })
      .catch(() => setState({ loading: false, error: true, points: [] }))
  }, [presetIdx, fetcher, field, enabled])

  const { loading, error, points } = state

  const ready = width > 0 && points.length > 1
  // d3 ships without ambient types in this package — keep scales loosely typed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let x: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let y: any
  let areaD: string | null | undefined
  let lineD: string | null | undefined
  let bars: Array<{ x: number, y: number, w: number, h: number }> | undefined
  let xTicks: Array<{ v: number, label: string }> | undefined
  let yTicks: Array<{ v: number, label: string }> | undefined
  let tipFmt: ((date: Date) => string) | undefined
  if (ready) {
    x = d3.scaleTime(d3.extent(points, (p: ChartPoint) => p.x) as [Date, Date], [M.left, width - M.right])
    // format and density follow the actual data window and width, not the preset span
    const dataSpanDays = getDaysBetweenDates(points[0].x, points[points.length - 1].x)
    const tickFmt = d3.timeFormat(dataSpanDays > 365 ? '%b %Y' : dataSpanDays > 7 ? '%b %d' : '%H:%M')
    tipFmt = d3.timeFormat(dataSpanDays > 365 ? '%b %d, %Y' : dataSpanDays > 3 ? '%b %d' : '%b %d, %H:%M')
    const maxY = d3.max(points, (p: ChartPoint) => p.y) || 1
    const minY = d3.min(points, (p: ChartPoint) => p.y) || 0
    // bars read from a 0 baseline; a level line (cumulative) auto-zooms to its range
    const yDomain = type === 'bar'
      ? [0, maxY]
      : [minY - ((maxY - minY) * 0.12 || maxY * 0.05 || 1), maxY + ((maxY - minY) * 0.12 || maxY * 0.05 || 1)]
    y = d3.scaleLinear(yDomain, [HEIGHT - M.bottom, M.top]).nice()
    const baseline = HEIGHT - M.bottom
    lineD = d3.line().x((p: ChartPoint) => x(p.x)).y((p: ChartPoint) => y(p.y)).curve(d3.curveMonotoneX)(points)
    areaD = d3.area().x((p: ChartPoint) => x(p.x)).y0(baseline).y1((p: ChartPoint) => y(p.y)).curve(d3.curveMonotoneX)(points)
    const step = points.length > 1 ? Math.abs(x(points[1].x) - x(points[0].x)) : 8
    const bw = Math.max(1, Math.min(step * 0.65, 16))
    bars = points.map(p => ({ x: x(p.x) - bw / 2, y: y(p.y), w: bw, h: Math.max(0, y(0) - y(p.y)) }))
    // one label per ~72px so narrow phones/"All" don't crowd or overlap the axis
    const tickCount = Math.max(2, Math.min(6, Math.floor((width - M.left - M.right) / 72)))
    xTicks = x.ticks(tickCount).map((d: Date) => ({ v: x(d), label: tickFmt(d) }))
    yTicks = y.ticks(4).map((v: number) => ({ v: y(v), label: formatValue(v) }))
  }

  function onMove (e: ReactMouseEvent<SVGSVGElement>) {
    if (!ready || !x || !y) return
    const px = e.nativeEvent.offsetX
    const i = d3.bisectCenter(points.map(p => p.x), x.invert(px))
    const p = points[i]
    if (p) setHover({ i, cx: x(p.x), cy: y(p.y), value: p.y, date: p.x })
  }

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder MetricChart'} w={'100%'}>
      <CardHead title={title}>
        <Presets options={PRESETS} value={presetIdx} onChange={setPresetIdx}/>
      </CardHead>

      <div ref={wrapRef} className={'MetricChart__Plot'} style={{ height: HEIGHT }}>
        {error
          ? <div className={'MetricChart__Empty'}>Error loading data</div>
          : loading && !ready
            ? <ChartGhost type={type}/>
            : !ready
                ? <div className={'MetricChart__Empty'}>No data</div>
                : <svg
                  // preset switch keeps the stale chart dimmed instead of flashing a skeleton
                  className={`MetricChart__Svg${loading ? ' MetricChart__Svg--Stale' : ''}`}
                  viewBox={`0 0 ${width} ${HEIGHT}`}
                  width={width}
                  height={HEIGHT}
                  role={'img'}
                  aria-label={`${title}: latest ${formatValue(points[points.length - 1].y)} ${yAbbr}`}
                  onMouseMove={onMove}
                  onMouseLeave={() => setHover(null)}
                >
                  <defs>
                    <linearGradient id={`mcArea-${gradientId}`} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
                      <stop className={'MetricChart__AreaTop'} offset={'0%'}/>
                      <stop className={'MetricChart__AreaBottom'} offset={'100%'}/>
                    </linearGradient>
                  </defs>

                  {yTicks?.map((t, i) => (
                    <g key={i}>
                      <line className={'MetricChart__Grid'} x1={M.left} x2={width - M.right} y1={t.v} y2={t.v}/>
                      <text className={'MetricChart__Tick MetricChart__Tick--Y'} x={M.left - 6} y={t.v} dy={'0.32em'}>{t.label}</text>
                    </g>
                  ))}

                  {xTicks?.map((t, i) => (
                    <text
                      key={i}
                      className={'MetricChart__Tick MetricChart__Tick--X'}
                      // first/last anchor inward (inline beats the CSS middle) so edge labels don't clip
                      style={{ textAnchor: i === 0 ? 'start' : i === (xTicks?.length ?? 0) - 1 ? 'end' : 'middle' }}
                      x={t.v}
                      y={HEIGHT - 4}
                    >{t.label}</text>
                  ))}

                  {type === 'bar'
                    ? bars?.map((b, i) => (
                        <rect key={i} className={'MetricChart__Bar'} x={b.x} y={b.y} width={b.w} height={b.h} rx={1}/>
                    ))
                    : <>
                        <path className={'MetricChart__Area'} d={areaD ?? undefined} fill={`url(#mcArea-${gradientId})`}/>
                        <path className={'MetricChart__Line'} d={lineD ?? undefined}/>
                      </>}

                  {hover &&
                    <g className={'MetricChart__Hover'}>
                      <line className={'MetricChart__HoverLine'} x1={hover.cx} x2={hover.cx} y1={M.top} y2={HEIGHT - M.bottom}/>
                      <circle className={'MetricChart__HoverDot'} cx={hover.cx} cy={hover.cy} r={3.5}/>
                    </g>}
                </svg>}

        {hover && ready &&
          <div
            className={'MetricChart__Tooltip'}
            style={{ left: `${hover.cx}px`, top: `${hover.cy}px` }}
          >
            <span className={'MetricChart__TipValue'}>{formatValue(hover.value)} {yAbbr}</span>
            <span className={'MetricChart__TipDate'}>{tipFmt?.(hover.date)}</span>
          </div>}
      </div>
    </Box>
  )
}
