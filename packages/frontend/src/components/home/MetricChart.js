'use client'

import { useState, useEffect, useRef, useId } from 'react'
import * as d3 from 'd3'
import useResizeObserver from '@react-hook/resize-observer'
import { Box, Heading } from '@chakra-ui/react'
import { getDaysBetweenDates, currencyRound } from '../../util'
import './MetricChart.scss'

const DAY = 24 * 60 * 60 * 1000
const PRESETS = [
  { label: '24h', ms: DAY, intervals: 48 },
  { label: '1W', ms: 7 * DAY, intervals: 84 },
  { label: '1M', ms: 30 * DAY, intervals: 100 },
  { label: '1Y', ms: 365 * DAY, intervals: 100 },
  { label: 'All', start: '2024-01-01T00:00:00.000Z', intervals: 100 }
]
const DEFAULT_PRESET = 2

function presetRange (preset) {
  return {
    start: preset.start ?? new Date(Date.now() - preset.ms).toISOString(),
    end: new Date().toISOString()
  }
}

// full grouped numbers (3,361) so narrow ranges read precisely; k/M only when huge
const formatValue = (v) => Math.abs(v) >= 1e6 ? currencyRound(v) : d3.format(',')(Math.round(v))

const M = { top: 10, right: 8, bottom: 18, left: 46 }
const HEIGHT = 200

export function MetricChart ({ title, type = 'line', fetcher, field, yAbbr = '' }) {
  const [presetIdx, setPresetIdx] = useState(DEFAULT_PRESET)
  const [state, setState] = useState({ loading: true, error: false, points: [] })
  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState(null)
  const wrapRef = useRef(null)
  const gradientId = useId()

  useResizeObserver(wrapRef, entry => setWidth(entry.contentRect.width))
  useEffect(() => {
    if (wrapRef.current) setWidth(wrapRef.current.clientWidth)
  }, [])

  useEffect(() => {
    const preset = PRESETS[presetIdx]
    const { start, end } = presetRange(preset)
    setState(s => ({ ...s, loading: true, error: false }))
    fetcher(start, end, preset.intervals)
      .then(res => {
        const pts = (res || [])
          .map(item => ({ x: new Date(item.timestamp), y: item?.data?.[field] }))
          .filter(p => typeof p.y === 'number' && !isNaN(p.y))
        // drop leading zero buckets (before first activity) so the range isn't compressed
        let s = 0
        while (s < pts.length - 1 && pts[s].y === 0) s++
        setState({ loading: false, error: false, points: pts.slice(s) })
      })
      .catch(() => setState({ loading: false, error: true, points: [] }))
  }, [presetIdx, fetcher, field])

  const { loading, error, points } = state
  const preset = PRESETS[presetIdx]
  const range = presetRange(preset)
  const spanDays = getDaysBetweenDates(range.start, range.end)
  const tickFmt = d3.timeFormat(spanDays > 365 ? '%b %Y' : spanDays > 7 ? '%b %d' : '%H:%M')
  const tipFmt = d3.timeFormat(spanDays > 365 ? '%b %d, %Y' : spanDays > 3 ? '%b %d' : '%b %d, %H:%M')

  const ready = width > 0 && points.length > 1
  let x, y, areaD, lineD, bars, xTicks, yTicks
  if (ready) {
    x = d3.scaleTime(d3.extent(points, p => p.x), [M.left, width - M.right])
    const maxY = d3.max(points, p => p.y) || 1
    const minY = d3.min(points, p => p.y) || 0
    // bars read from a 0 baseline; a level line (cumulative) auto-zooms to its range
    const yDomain = type === 'bar'
      ? [0, maxY]
      : [minY - ((maxY - minY) * 0.12 || maxY * 0.05 || 1), maxY + ((maxY - minY) * 0.12 || maxY * 0.05 || 1)]
    y = d3.scaleLinear(yDomain, [HEIGHT - M.bottom, M.top]).nice()
    const baseline = HEIGHT - M.bottom
    lineD = d3.line().x(p => x(p.x)).y(p => y(p.y)).curve(d3.curveMonotoneX)(points)
    areaD = d3.area().x(p => x(p.x)).y0(baseline).y1(p => y(p.y)).curve(d3.curveMonotoneX)(points)
    const step = points.length > 1 ? Math.abs(x(points[1].x) - x(points[0].x)) : 8
    const bw = Math.max(1, Math.min(step * 0.65, 16))
    bars = points.map(p => ({ x: x(p.x) - bw / 2, y: y(p.y), w: bw, h: Math.max(0, y(0) - y(p.y)) }))
    xTicks = x.ticks(Math.min(5, points.length)).map(d => ({ v: x(d), label: tickFmt(d) }))
    yTicks = y.ticks(4).map(v => ({ v: y(v), label: formatValue(v) }))
  }

  function onMove (e) {
    if (!ready) return
    const px = e.nativeEvent.offsetX
    const i = d3.bisectCenter(points.map(p => p.x), x.invert(px))
    const p = points[i]
    if (p) setHover({ i, cx: x(p.x), cy: y(p.y), value: p.y, date: p.x })
  }

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder MetricChart'} w={'100%'}>
      <div className={'MetricChart__Head'}>
        <Heading className={'InfoBlock__Title'} as={'h2'}>{title}</Heading>
        <div className={'MetricChart__Presets'}>
          {PRESETS.map((pr, i) => (
            <button
              key={pr.label}
              type={'button'}
              className={`MetricChart__Chip ${i === presetIdx ? 'is-active' : ''}`}
              aria-pressed={i === presetIdx}
              onClick={() => setPresetIdx(i)}
            >
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={wrapRef} className={'MetricChart__Plot'} style={{ height: HEIGHT }}>
        {error
          ? <div className={'MetricChart__Empty'}>Error loading data</div>
          : loading
            ? <div className={'MetricChart__Empty'}>Loading…</div>
            : !ready
                ? <div className={'MetricChart__Empty'}>No data</div>
                : <svg
                  className={'MetricChart__Svg'}
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

                  {yTicks.map((t, i) => (
                    <g key={i}>
                      <line className={'MetricChart__Grid'} x1={M.left} x2={width - M.right} y1={t.v} y2={t.v}/>
                      <text className={'MetricChart__Tick MetricChart__Tick--Y'} x={M.left - 6} y={t.v} dy={'0.32em'}>{t.label}</text>
                    </g>
                  ))}

                  {xTicks.map((t, i) => (
                    <text key={i} className={'MetricChart__Tick MetricChart__Tick--X'} x={t.v} y={HEIGHT - 4}>{t.label}</text>
                  ))}

                  {type === 'bar'
                    ? bars.map((b, i) => (
                        <rect key={i} className={'MetricChart__Bar'} x={b.x} y={b.y} width={b.w} height={b.h} rx={1}/>
                    ))
                    : <>
                        <path className={'MetricChart__Area'} d={areaD} fill={`url(#mcArea-${gradientId})`}/>
                        <path className={'MetricChart__Line'} d={lineD}/>
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
            <span className={'MetricChart__TipDate'}>{tipFmt(hover.date)}</span>
          </div>}
      </div>
    </Box>
  )
}
