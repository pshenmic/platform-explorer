'use client'

import { useState, useEffect, useRef, useId, type RefObject } from 'react'
import * as d3 from 'd3'
import useResizeObserver from '@react-hook/resize-observer'

import { CardHead, Presets } from '../cards'
import { currencyRound } from '../../util'
import './MetricChart.css'

const DAY = 24 * 60 * 60 * 1000
export const PRESETS = [
  { label: '24h', ms: DAY, intervals: 48 },
  { label: '1W', ms: 7 * DAY, intervals: 84 },
  { label: '1M', ms: 30 * DAY, intervals: 100 },
  { label: '6M', ms: 182 * DAY, intervals: 100 },
  { label: '1Y', ms: 365 * DAY, intervals: 100 },
  { label: 'All', start: '2024-01-01T00:00:00.000Z', intervals: 100 }
]
const DEFAULT_PRESET = 2

export function presetRange(preset: any) {
  // floor end to hour: history API drops partial trailing buckets
  const endMs = Math.ceil(Date.now() / 3600000) * 3600000
  return {
    start: preset.start ?? new Date(endMs - preset.ms).toISOString(),
    end: new Date(endMs).toISOString()
  }
}

export function seriesTimeDomain(points: { x: Date }[], preset?: any): [Date, Date] {
  const xs = points.map(p => Number(p.x)).filter(n => Number.isFinite(n))
  const dataStart = new Date(Math.min(...xs))
  const dataEnd = new Date(Math.max(...xs))
  const presetEnd = preset ? new Date(presetRange(preset).end) : dataEnd
  const end = presetEnd.getTime() > dataEnd.getTime() ? presetEnd : dataEnd
  return [dataStart, end]
}

function presetSpanMs(preset: { ms?: number; start?: string }) {
  if (typeof preset.ms === 'number') return preset.ms
  if (preset.start) return Math.max(0, Date.now() - new Date(preset.start).getTime())
  return DAY
}

export function axisTimeFormat(preset: { ms?: number; start?: string }) {
  const span = presetSpanMs(preset)
  if (span <= DAY) return d3.timeFormat('%H:%M')
  if (span <= 40 * DAY) return d3.timeFormat('%b %d')
  return d3.timeFormat('%b %Y')
}

export function tipTimeFormat(preset: { ms?: number; start?: string }) {
  const span = presetSpanMs(preset)
  if (span <= 8 * DAY) return d3.timeFormat('%b %d, %H:%M')
  if (span <= 40 * DAY) return d3.timeFormat('%b %d')
  return d3.timeFormat('%b %d, %Y')
}

const fmtHour = d3.timeFormat('%H:%M')
const fmtDay = d3.timeFormat('%b %d')
const fmtMonYear = d3.timeFormat("%b '%y")

export function buildTimeTicks(
  x: { domain: () => Date[]; ticks: (count: number) => Date[] } & ((value: Date) => number),
  innerWidth: number
): { v: number; label: string }[] {
  const domain = x.domain()
  const start = domain[0]
  const end = domain[1]
  const span = Math.max(3600000, Number(end) - Number(start))
  const minPx = span <= DAY ? 52 : span <= 45 * DAY ? 58 : 50
  const maxTicks = Math.max(3, Math.min(6, Math.floor(Math.max(innerWidth, 1) / minPx)))

  let interval = d3.timeHour
  let step = 1
  if (span <= DAY) {
    interval = d3.timeHour
    step = Math.max(4, Math.ceil(24 / maxTicks))
  } else if (span <= 10 * DAY) {
    interval = d3.timeDay
    step = Math.max(1, Math.ceil(7 / maxTicks))
  } else if (span <= 45 * DAY) {
    interval = d3.timeWeek
    step = Math.max(1, Math.ceil(5 / maxTicks))
  } else {
    interval = d3.timeMonth
    const months = Math.max(1, span / DAY / 30)
    step = Math.max(1, Math.ceil(months / maxTicks))
  }

  const dates: Date[] = [new Date(start)]
  let cursor = interval.offset(new Date(end), -step)
  const interiors: Date[] = []
  while (cursor.getTime() > start.getTime() && interiors.length < maxTicks + 4) {
    interiors.push(new Date(cursor))
    cursor = interval.offset(cursor, -step)
  }
  interiors.reverse()
  const startX = x(start)
  const endX = x(end)
  for (const d of interiors) {
    const v = x(d)
    const last = dates[dates.length - 1]
    if (v - x(last) < minPx || endX - v < minPx) continue
    dates.push(d)
  }
  if (endX - x(dates[dates.length - 1]) >= minPx * 0.5) dates.push(new Date(end))
  else dates[dates.length - 1] = new Date(end)

  const ticks: { v: number; label: string }[] = []
  for (const d of dates) {
    const label = span <= DAY ? fmtHour(d) : span <= 45 * DAY ? fmtDay(d) : fmtMonYear(d)
    const v = x(d)
    const last = ticks[ticks.length - 1]
    if (last && (last.label === label || Math.abs(v - last.v) < minPx * 0.85)) continue
    ticks.push({ v, label })
  }
  return ticks
}

const formatValue = (v: any) =>
  Math.abs(v) >= 1e6 ? currencyRound(v) : d3.format(',')(Math.round(v))

const M = { top: 10, right: 12, bottom: 18, left: 52 }
const HEIGHT = 200

const GHOST_LINE_D = 'M 0 62 L 12 50 L 25 58 L 38 42 L 50 48 L 62 34 L 75 42 L 88 26 L 100 32'
const GHOST_BARS = [38, 52, 30, 60, 45, 66, 40, 56, 34, 62, 48, 58]

function ChartGhost({ type }: any) {
  return (
    <svg
      className={'MetricChart__Ghost'}
      viewBox={'0 0 100 100'}
      preserveAspectRatio={'none'}
      aria-hidden={'true'}
    >
      {[18, 42, 66, 90].map(gy => (
        <line
          key={gy}
          className={'MetricChart__GhostGrid'}
          x1={0}
          x2={100}
          y1={gy}
          y2={gy}
          vectorEffect={'non-scaling-stroke'}
        />
      ))}
      {type === 'bar' ? (
        GHOST_BARS.map((h, i) => (
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
      ) : (
        <>
          <path
            className={'MetricChart__GhostLine'}
            d={GHOST_LINE_D}
            fill={'none'}
            vectorEffect={'non-scaling-stroke'}
          />
          <path
            className={'MetricChart__GhostScan'}
            d={GHOST_LINE_D}
            fill={'none'}
            pathLength={'100'}
            vectorEffect={'non-scaling-stroke'}
          />
        </>
      )}
    </svg>
  )
}

export function MetricChart({
  title,
  type = 'line',
  fetcher,
  field,
  yAbbr = '',
  enabled = true,
  embedded = false,
  fill = false
}: any) {
  const [presetIdx, setPresetIdx] = useState(DEFAULT_PRESET)
  const [state, setState] = useState<{ loading: boolean; error: boolean; points: any[] }>({
    loading: true,
    error: false,
    points: []
  })
  const [width, setWidth] = useState(0)
  const [plotH, setPlotH] = useState(HEIGHT)
  const [hover, setHover] = useState<any>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const gradientId = useId()

  useResizeObserver(wrapRef as RefObject<HTMLElement>, entry => {
    const { width: w, height: hh } = entry.contentRect
    setWidth(Math.max(0, Math.floor(w)))
    if (fill) setPlotH(Math.max(96, Math.floor(hh)))
  })
  useEffect(() => {
    if (!wrapRef.current) return
    setWidth(Math.max(0, Math.floor(wrapRef.current.clientWidth)))
    if (fill) setPlotH(Math.max(96, Math.floor(wrapRef.current.clientHeight || HEIGHT)))
  }, [fill])

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: true, error: false }))
      return
    }
    const preset = PRESETS[presetIdx]
    const { start, end } = presetRange(preset)
    setState(s => ({ ...s, loading: true, error: false }))
    fetcher(start, end, preset.intervals)
      .then((res: any) => {
        const pts = (res || [])
          .map((item: any) => ({ x: new Date(item.timestamp), y: item?.data?.[field] }))
          .filter((p: any) => typeof p.y === 'number' && !isNaN(p.y))
        // drop leading empty buckets so the series starts at first activity
        let s = 0
        while (s < pts.length - 1 && pts[s].y === 0) s++
        setState({ loading: false, error: false, points: pts.slice(s) })
      })
      .catch(() => setState({ loading: false, error: true, points: [] }))
  }, [presetIdx, fetcher, field, enabled])

  const { loading, error, points } = state

  const h = fill ? plotH : HEIGHT
  const ready = width > 0 && h > 0 && points.length > 1
  let x: any, y: any, areaD: any, lineD: any, bars: any, xTicks: any, yTicks: any, tipFmt: any
  if (ready) {
    x = d3.scaleTime(seriesTimeDomain(points, PRESETS[presetIdx]), [M.left, width - M.right])
    tipFmt = tipTimeFormat(PRESETS[presetIdx])
    const maxY = d3.max(points, (p: any) => p.y) || 1
    const minY = d3.min(points, (p: any) => p.y) || 0
    // bars from 0; line charts pad the domain around the series range
    const yDomain =
      type === 'bar'
        ? [0, maxY]
        : [
            minY - ((maxY - minY) * 0.12 || maxY * 0.05 || 1),
            maxY + ((maxY - minY) * 0.12 || maxY * 0.05 || 1)
          ]
    y = d3.scaleLinear(yDomain, [h - M.bottom, M.top]).nice()
    const baseline = h - M.bottom
    lineD = d3
      .line()
      .x((p: any) => x(p.x))
      .y((p: any) => y(p.y))
      .curve(d3.curveMonotoneX)(points)
    areaD = d3
      .area()
      .x((p: any) => x(p.x))
      .y0(baseline)
      .y1((p: any) => y(p.y))
      .curve(d3.curveMonotoneX)(points)
    const step = points.length > 1 ? Math.abs(x(points[1].x) - x(points[0].x)) : 8
    const bw = Math.max(1, Math.min(step * 0.65, 16))
    bars = points.map(p => ({
      x: x(p.x) - bw / 2,
      y: y(p.y),
      w: bw,
      h: Math.max(0, y(0) - y(p.y))
    }))
    xTicks = buildTimeTicks(x, width - M.left - M.right)
    yTicks = y.ticks(4).map((v: any) => ({ v: y(v), label: formatValue(v) }))
  }

  function onMove(e: any) {
    if (!ready) return
    const px = e.nativeEvent.offsetX
    const i = d3.bisectCenter(
      points.map(p => p.x),
      x.invert(px)
    )
    const p = points[i]
    if (p) setHover({ i, cx: x(p.x), cy: y(p.y), value: p.y, date: p.x })
  }

  const shellClass = [
    embedded ? 'MetricChart MetricChart--Embedded' : 'InfoBlock InfoBlock--NoBorder MetricChart',
    fill ? 'MetricChart--Fill' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClass} aria-label={title || undefined}>
      <CardHead title={title || null}>
        <Presets options={PRESETS} value={presetIdx} onChange={setPresetIdx} />
      </CardHead>

      <div
        ref={wrapRef}
        className={'MetricChart__Plot'}
        style={fill ? undefined : { height: HEIGHT }}
      >
        {error ? (
          <div className={'MetricChart__Empty'}>Error loading data</div>
        ) : loading && !ready ? (
          <ChartGhost type={type} />
        ) : !ready ? (
          <div className={'MetricChart__Empty'}>No data</div>
        ) : (
          <svg
            className={`MetricChart__Svg${loading ? ' MetricChart__Svg--Stale' : ''}`}
            viewBox={`0 0 ${width} ${h}`}
            width={width}
            height={h}
            role={'img'}
            aria-label={`${title}: latest ${formatValue(points[points.length - 1].y)} ${yAbbr}`}
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id={`mcArea-${gradientId}`} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
                <stop className={'MetricChart__AreaTop'} offset={'0%'} />
                <stop className={'MetricChart__AreaBottom'} offset={'100%'} />
              </linearGradient>
            </defs>

            {yTicks.map((t: any, i: any) => (
              <g key={i}>
                <line
                  className={'MetricChart__Grid'}
                  x1={M.left}
                  x2={width - M.right}
                  y1={t.v}
                  y2={t.v}
                />
                <text
                  className={'MetricChart__Tick MetricChart__Tick--Y'}
                  x={M.left - 6}
                  y={t.v}
                  dy={'0.32em'}
                >
                  {t.label}
                </text>
              </g>
            ))}

            {xTicks.map((t: any, i: any) => (
              <text
                key={i}
                className={'MetricChart__Tick MetricChart__Tick--X'}
                style={{
                  textAnchor: i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'
                }}
                x={t.v}
                y={h - 4}
              >
                {t.label}
              </text>
            ))}

            {type === 'bar' ? (
              (bars ?? []).map((b: any, i: number) => (
                <rect
                  key={i}
                  className={'MetricChart__Bar'}
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  rx={1}
                />
              ))
            ) : (
              <>
                <path
                  className={'MetricChart__Area'}
                  d={areaD}
                  fill={`url(#mcArea-${gradientId})`}
                />
                <path className={'MetricChart__Line'} d={lineD} />
              </>
            )}

            {hover && (
              <g className={'MetricChart__Hover'}>
                <line
                  className={'MetricChart__HoverLine'}
                  x1={hover.cx}
                  x2={hover.cx}
                  y1={M.top}
                  y2={h - M.bottom}
                />
                <circle className={'MetricChart__HoverDot'} cx={hover.cx} cy={hover.cy} r={3.5} />
              </g>
            )}
          </svg>
        )}

        {hover && ready && (
          <div
            className={'MetricChart__Tooltip'}
            style={{ left: `${hover.cx}px`, top: `${hover.cy}px` }}
          >
            <span className={'MetricChart__TipValue'}>
              {formatValue(hover.value)} {yAbbr}
            </span>
            <span className={'MetricChart__TipDate'}>{tipFmt(hover.date)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
