'use client'

import { useState, useEffect, useRef, useId, useMemo, type RefObject } from 'react'
import { Box } from '@chakra-ui/react'
import * as d3 from 'd3'
import useResizeObserver from '@react-hook/resize-observer'
import { Presets } from '../cards'
import { getDaysBetweenDates, currencyRound } from '../../util'
import { Skeleton } from './Skeleton'
import { PRESETS, presetRange } from './MetricChart'
import './IdentityGrowthChart.css'

const DEFAULT_PRESET = PRESETS.length - 1
const M = { top: 12, right: 10, bottom: 22, left: 48 }

const formatValue = (v: number) =>
  Math.abs(v) >= 1e6 ? currencyRound(v) : d3.format(',')(Math.round(v))

export default function IdentityGrowthChart({
  fetcher,
  field = 'registeredIdentities',
  yAbbr = 'identities',
  enabled = true
}: {
  fetcher?: any
  field?: string
  yAbbr?: string
  enabled?: boolean
}) {
  const [presetIdx, setPresetIdx] = useState(DEFAULT_PRESET)
  const [state, setState] = useState<{
    loading: boolean
    error: boolean
    points: any[]
    dataPresetIdx: number
  }>({
    loading: true,
    error: false,
    points: [],
    dataPresetIdx: DEFAULT_PRESET
  })
  const [width, setWidth] = useState(0)
  const [plotH, setPlotH] = useState(160)
  const [hoverI, setHoverI] = useState<number | null>(null)
  const [pinI, setPinI] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const gid = useId().replace(/:/g, '')
  const fetchGen = useRef(0)

  useResizeObserver(wrapRef as RefObject<HTMLElement>, entry => {
    const { width: w, height: hh } = entry.contentRect
    setWidth(Math.max(0, Math.floor(w)))
    setPlotH(Math.max(120, Math.floor(hh)))
  })

  useEffect(() => {
    if (!wrapRef.current) return
    setWidth(Math.max(0, Math.floor(wrapRef.current.clientWidth)))
    setPlotH(Math.max(120, Math.floor(wrapRef.current.clientHeight || 160)))
  }, [])

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: true, error: false }))
      return
    }
    const preset = PRESETS[presetIdx]
    const { start, end } = presetRange(preset)
    const gen = ++fetchGen.current
    setState(s => ({ ...s, loading: true, error: false }))
    setHoverI(null)
    setPinI(null)
    fetcher(start, end, preset.intervals)
      .then((res: any) => {
        if (gen !== fetchGen.current) return
        const pts = (res || [])
          .map((item: any) => ({ x: new Date(item.timestamp), y: item?.data?.[field] }))
          .filter((p: any) => typeof p.y === 'number' && !isNaN(p.y))
        let s = 0
        while (s < pts.length - 1 && pts[s].y === 0) s++
        setState({
          loading: false,
          error: false,
          points: pts.slice(s),
          dataPresetIdx: presetIdx
        })
      })
      .catch(() => {
        if (gen !== fetchGen.current) return
        setState(s => ({
          ...s,
          loading: false,
          error: true,
          points: [],
          dataPresetIdx: presetIdx
        }))
      })
  }, [presetIdx, fetcher, field, enabled])

  const { loading, error, points, dataPresetIdx } = state
  const h = plotH
  const ready = width > 0 && h > 0 && points.length > 1

  const chart = useMemo(() => {
    if (!ready) return null
    const x = d3.scaleTime(
      d3.extent(points, (p: any) => p.x),
      [M.left, width - M.right]
    )
    const dataSpanDays = getDaysBetweenDates(points[0].x, points[points.length - 1].x)
    const tickFmt = d3.timeFormat(
      dataSpanDays > 365 ? '%b %Y' : dataSpanDays > 7 ? '%b %d' : '%H:%M'
    )
    const tipFmt = d3.timeFormat(
      dataSpanDays > 365 ? '%b %d, %Y' : dataSpanDays > 3 ? '%b %d' : '%b %d, %H:%M'
    )
    const maxY = d3.max(points, (p: any) => p.y) || 1
    const minY = d3.min(points, (p: any) => p.y) || 0
    const pad = (maxY - minY) * 0.12 || maxY * 0.05 || 1
    const y = d3.scaleLinear([Math.max(0, minY - pad), maxY + pad], [h - M.bottom, M.top]).nice()
    const baseline = h - M.bottom
    const lineD = d3
      .line()
      .x((p: any) => x(p.x))
      .y((p: any) => y(p.y))
      .curve(d3.curveMonotoneX)(points)
    const areaD = d3
      .area()
      .x((p: any) => x(p.x))
      .y0(baseline)
      .y1((p: any) => y(p.y))
      .curve(d3.curveMonotoneX)(points)
    const nodes = points.map((p, i) => ({
      i,
      cx: x(p.x),
      cy: y(p.y),
      value: p.y,
      date: p.x
    }))
    const tickCount = Math.max(2, Math.min(6, Math.floor((width - M.left - M.right) / 72)))
    const xTicks = x.ticks(tickCount).map((d: any) => ({ v: x(d), label: tickFmt(d) }))
    const yTicks = y.ticks(4).map((v: any) => ({ v: y(v), label: formatValue(v) }))
    const first = points[0]
    const latest = points[points.length - 1]
    const delta = latest.y - first.y
    const growthPct = first.y > 0 ? (delta / first.y) * 100 : null
    return { lineD, areaD, nodes, xTicks, yTicks, tipFmt, first, latest, delta, growthPct }
  }, [ready, points, width, h])

  const activeI = pinI != null ? pinI : hoverI
  const active = chart && activeI != null ? chart.nodes[activeI] : null

  const onMove = (e: any) => {
    if (!chart) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    let best = 0
    let bestDist = Infinity
    for (const n of chart.nodes) {
      const d = Math.abs(n.cx - px)
      if (d < bestDist) {
        bestDist = d
        best = n.i
      }
    }
    if (hoverI !== best) setHoverI(best)
  }

  const onLeave = () => setHoverI(null)
  const onClick = () => {
    if (hoverI == null) return
    setPinI((p: any) => (p === hoverI ? null : hoverI))
  }

  const isAll = PRESETS[dataPresetIdx].label === 'All'
  const rangeLabel = isAll ? 'all time' : PRESETS[dataPresetIdx].label
  const rangeTotal = chart
    ? isAll
      ? formatValue(chart.latest.y)
      : `${chart.delta >= 0 ? '+' : ''}${formatValue(chart.delta)}`
    : '—'
  const statMeta = active
    ? `${chart!.tipFmt(active.date)} · ${formatValue(active.value)} ${yAbbr}`
    : chart
      ? isAll
        ? [
            `${chart.delta >= 0 ? '+' : ''}${formatValue(chart.delta)} since start`,
            chart.growthPct != null
              ? `${chart.growthPct >= 0 ? '+' : ''}${chart.growthPct.toFixed(1)}%`
              : null
          ]
            .filter(Boolean)
            .join(' · ')
        : [
            `total ${formatValue(chart.latest.y)}`,
            chart.growthPct != null
              ? `${chart.growthPct >= 0 ? '+' : ''}${chart.growthPct.toFixed(1)}% ${rangeLabel}`
              : null
          ]
            .filter(Boolean)
            .join(' · ')
      : ''

  return (
    <Box
      className={'InfoBlock InfoBlock--NoBorder IdentityGrowthChart'}
      w={'100%'}
      as={'section'}
      aria-label={'Identity growth'}
    >
      <header className={'IdentityGrowthChart__Head'}>
        <div className={'IdentityGrowthChart__HeadText'}>
          <span className={'IdentityGrowthChart__Eyebrow'}>Network growth</span>
          <h2 className={'IdentityGrowthChart__Title'}>Identities</h2>
          <p className={'IdentityGrowthChart__Lede'}>
            Cumulative identity registrations over time.
          </p>
        </div>
        <div className={'IdentityGrowthChart__Controls'}>
          <Presets options={PRESETS} value={presetIdx} onChange={setPresetIdx} />
          <div
            className={`IdentityGrowthChart__Stat${active ? ' is-on' : ''}${pinI != null ? ' is-pinned' : ''}`}
          >
            <div className={'IdentityGrowthChart__StatMain'}>
              <span className={'IdentityGrowthChart__StatCount'}>{rangeTotal}</span>
              <span className={'IdentityGrowthChart__StatUnit'}>{yAbbr}</span>
            </div>
            {statMeta && <span className={'IdentityGrowthChart__StatMeta'}>{statMeta}</span>}
          </div>
        </div>
      </header>

      <div ref={wrapRef} className={'IdentityGrowthChart__Plot'}>
        {error ? (
          <div className={'IdentityGrowthChart__Empty'}>Error loading data</div>
        ) : loading && !chart ? (
          <div className={'IdentityGrowthChart__Ghost'}>
            <Skeleton w={'100%'} h={'70%'} radius={8} />
          </div>
        ) : !chart ? (
          <div className={'IdentityGrowthChart__Empty'}>No data</div>
        ) : (
          <svg
            className={`IdentityGrowthChart__Svg${loading ? ' is-stale' : ''}`}
            viewBox={`0 0 ${width} ${h}`}
            width={width}
            height={h}
            role={'img'}
            aria-label={
              isAll
                ? `Identities, total ${formatValue(chart.latest.y)}`
                : `Identities, ${chart.delta >= 0 ? '+' : ''}${formatValue(chart.delta)} in ${rangeLabel}`
            }
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            onClick={onClick}
          >
            <defs>
              <linearGradient id={`idArea-${gid}`} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
                <stop className={'IdentityGrowthChart__AreaTop'} offset={'0%'} />
                <stop className={'IdentityGrowthChart__AreaBot'} offset={'100%'} />
              </linearGradient>
              <filter id={`idGlow-${gid}`} x={'-40%'} y={'-40%'} width={'180%'} height={'180%'}>
                <feGaussianBlur stdDeviation={'2'} result={'b'} />
                <feMerge>
                  <feMergeNode in={'b'} />
                  <feMergeNode in={'SourceGraphic'} />
                </feMerge>
              </filter>
            </defs>

            {chart.yTicks.map((t: any, i: number) => (
              <g key={`y${i}`}>
                <line
                  className={'IdentityGrowthChart__Grid'}
                  x1={M.left}
                  x2={width - M.right}
                  y1={t.v}
                  y2={t.v}
                />
                <text
                  className={'IdentityGrowthChart__Tick IdentityGrowthChart__Tick--Y'}
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
                className={'IdentityGrowthChart__Tick IdentityGrowthChart__Tick--X'}
                style={{
                  textAnchor: i === 0 ? 'start' : i === chart.xTicks.length - 1 ? 'end' : 'middle'
                }}
                x={t.v}
                y={h - 4}
              >
                {t.label}
              </text>
            ))}

            <path
              className={'IdentityGrowthChart__Area'}
              d={chart.areaD}
              fill={`url(#idArea-${gid})`}
            />
            <path
              className={'IdentityGrowthChart__Line'}
              d={chart.lineD}
              filter={`url(#idGlow-${gid})`}
            />
            <path className={'IdentityGrowthChart__Scan'} d={chart.lineD} pathLength={'100'} />

            {active && (
              <>
                <line
                  className={'IdentityGrowthChart__Guide'}
                  x1={active.cx}
                  x2={active.cx}
                  y1={M.top}
                  y2={h - M.bottom}
                />
                <circle
                  className={'IdentityGrowthChart__DotRing'}
                  cx={active.cx}
                  cy={active.cy}
                  r={8}
                />
                <circle
                  className={'IdentityGrowthChart__Dot'}
                  cx={active.cx}
                  cy={active.cy}
                  r={4}
                />
              </>
            )}
          </svg>
        )}
      </div>
    </Box>
  )
}
