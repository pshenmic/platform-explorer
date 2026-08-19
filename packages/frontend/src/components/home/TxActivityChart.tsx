'use client'

import { useState, useEffect, useRef, useId, useMemo, type RefObject } from 'react'
import * as d3 from 'd3'
import useResizeObserver from '@react-hook/resize-observer'
import { Presets } from '../cards'
import { getDaysBetweenDates, currencyRound } from '../../util'
import { Skeleton } from './Skeleton'
import { PRESETS, presetRange } from './MetricChart'
import './TxActivityChart.css'

const DEFAULT_PRESET = PRESETS.length - 1
const M = { top: 12, right: 10, bottom: 22, left: 44 }

const formatValue = (v: number) =>
  Math.abs(v) >= 1e6 ? currencyRound(v) : d3.format(',')(Math.round(v))

export default function TxActivityChart({
  fetcher,
  field = 'txs',
  yAbbr = 'txs',
  enabled = true
}: {
  fetcher?: any
  field?: string
  yAbbr?: string
  enabled?: boolean
}) {
  const [presetIdx, setPresetIdx] = useState(DEFAULT_PRESET)
  const [state, setState] = useState<{ loading: boolean; error: boolean; points: any[] }>({
    loading: true,
    error: false,
    points: []
  })
  const [width, setWidth] = useState(0)
  const [plotH, setPlotH] = useState(160)
  const [hoverI, setHoverI] = useState<number | null>(null)
  const [pinI, setPinI] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const gradId = useId().replace(/:/g, '')

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
    setState(s => ({ ...s, loading: true, error: false }))
    setHoverI(null)
    setPinI(null)
    fetcher(start, end, preset.intervals)
      .then((res: any) => {
        const pts = (res || [])
          .map((item: any) => ({ x: new Date(item.timestamp), y: item?.data?.[field] }))
          .filter((p: any) => typeof p.y === 'number' && !isNaN(p.y))
        let s = 0
        while (s < pts.length - 1 && pts[s].y === 0) s++
        setState({ loading: false, error: false, points: pts.slice(s) })
      })
      .catch(() => setState({ loading: false, error: true, points: [] }))
  }, [presetIdx, fetcher, field, enabled])

  const { loading, error, points } = state
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
    const yTicks = y.ticks(4).map((v: any) => ({ v: y(v), label: formatValue(v) }))
    const total = points.reduce((s, p) => s + p.y, 0)
    const peak = d3.max(points, (p: any) => p.y) || 0
    const latest = points[points.length - 1]
    return { bars, xTicks, yTicks, tipFmt, total, peak, latest, maxY }
  }, [ready, points, width, h])

  const activeI = pinI != null ? pinI : hoverI
  const activeBar = chart && activeI != null ? chart.bars[activeI] : null

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

  const onLeave = () => setHoverI(null)

  const onClick = () => {
    if (hoverI == null) return
    setPinI((p: any) => (p === hoverI ? null : hoverI))
  }

  const rangeTotal = chart ? formatValue(chart.total) : '—'
  const statMeta = activeBar
    ? `${chart!.tipFmt(activeBar.date)} · ${formatValue(activeBar.value)} ${yAbbr}`
    : chart
      ? `peak ${formatValue(chart.peak)} · latest ${formatValue(chart.latest.y)}`
      : ''

  return (
    <div className={'TxActivityChart'} aria-label={'Volume'}>
      <header className={'TxActivityChart__Head'}>
        <div className={'TxActivityChart__HeadText'}>
          <span className={'TxActivityChart__Eyebrow'}>Throughput</span>
          <h2 className={'TxActivityChart__Title'}>Volume</h2>
          <p className={'TxActivityChart__Lede'}>Platform state transitions per bucket.</p>
        </div>
        <div className={'TxActivityChart__Controls'}>
          <Presets options={PRESETS} value={presetIdx} onChange={setPresetIdx} />
          <div
            className={`TxActivityChart__Stat${activeBar ? ' is-on' : ''}${pinI != null ? ' is-pinned' : ''}`}
          >
            <div className={'TxActivityChart__StatMain'}>
              <span className={'TxActivityChart__StatCount'}>{rangeTotal}</span>
              <span className={'TxActivityChart__StatUnit'}>{yAbbr}</span>
            </div>
            {statMeta && <span className={'TxActivityChart__StatMeta'}>{statMeta}</span>}
          </div>
        </div>
      </header>

      <div ref={wrapRef} className={'TxActivityChart__Plot'}>
        {error ? (
          <div className={'TxActivityChart__Empty'}>Error loading data</div>
        ) : loading && !chart ? (
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
          <div className={'TxActivityChart__Empty'}>No data</div>
        ) : (
          <svg
            className={`TxActivityChart__Svg${loading ? ' is-stale' : ''}`}
            viewBox={`0 0 ${width} ${h}`}
            width={width}
            height={h}
            role={'img'}
            aria-label={`Volume, sum ${formatValue(chart.total)} ${yAbbr}`}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            onClick={onClick}
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
                  data-i={b.i}
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
    </div>
  )
}
