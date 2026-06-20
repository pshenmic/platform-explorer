'use client'

import { useEffect, useRef, useState } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import * as d3 from 'd3'
import * as Api from '../../util/Api'
import { defaultChartConfig } from '../../components/charts/config'
import { splitNum } from '../../util/numbers'
import './HomeHeroSparkline.scss'

const ID = 'HomeHeroSparkline'
const bisect = d3.bisector(d => d.x).center
const dateFormat = d3.timeFormat('%b %d')

function compact (value) {
  if (typeof value !== 'number' || isNaN(value)) return value
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`
  return String(value)
}

export default function HomeHeroSparkline ({ height = 72 }) {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  const [points, setPoints] = useState([])
  const [hover, setHover] = useState(null)

  useResizeObserver(ref, entry => setWidth(entry.contentRect.width))
  useEffect(() => { if (ref.current) setWidth(ref.current.offsetWidth) }, [])

  useEffect(() => {
    const { start = null, end = null } = defaultChartConfig.timespan.values[3].range || {}
    if (!start || !end) return

    Api.getTransactionsHistory(start, end, 40)
      .then(res => setPoints((res || [])
        .map(item => ({ x: new Date(item.timestamp), y: item.data?.txs }))
        .filter(d => typeof d.y === 'number' && !isNaN(d.y))))
      .catch(() => setPoints([]))
  }, [])

  const pad = 4
  const ready = width > 0 && points.length > 1

  let x, y, linePath, areaPath, lastX, lastY, peak

  if (ready) {
    peak = d3.max(points, d => d.y)
    x = d3.scaleTime(d3.extent(points, d => d.x), [pad, width - pad])
    y = d3.scaleLinear([0, peak], [height - pad, pad])
    linePath = d3.line().x(d => x(d.x)).y(d => y(d.y)).curve(d3.curveMonotoneX)(points)
    areaPath = d3.area().x(d => x(d.x)).y0(height).y1(d => y(d.y)).curve(d3.curveMonotoneX)(points)
    lastX = x(points[points.length - 1].x)
    lastY = y(points[points.length - 1].y)
  }

  const onMove = (e) => {
    if (!ready) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const i = Math.max(0, Math.min(points.length - 1, bisect(points, x.invert(px))))
    setHover({ i, cx: x(points[i].x), cy: y(points[i].y) })
  }

  const hoverPoint = hover ? points[hover.i] : null
  // keep the tooltip inside the container
  const tipLeft = hover ? Math.max(54, Math.min(width - 54, hover.cx)) : 0

  return (
    <div className={'HomeHeroSparkline'} ref={ref} style={{ height }}>
      {ready &&
        <>
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            role={'img'}
            aria-label={'Transactions over the last month'}
          >
            <defs>
              <linearGradient id={`${ID}-fill`} x1={'0'} y1={'1'} x2={'0'} y2={'0'}>
                <stop offset={'0%'} stopColor={'#0F4D74'} stopOpacity={'0.02'}/>
                <stop offset={'100%'} stopColor={'#0E75B5'} stopOpacity={'0.4'}/>
              </linearGradient>
            </defs>

            <path d={areaPath} fill={`url(#${ID}-fill)`}/>
            <path
              d={linePath}
              fill={'none'}
              stroke={'#008DE4'}
              strokeWidth={2}
              strokeLinejoin={'round'}
              strokeLinecap={'round'}
              vectorEffect={'non-scaling-stroke'}
            />

            <text x={width} y={10} className={'HomeHeroSparkline__Scale'} textAnchor={'end'}>{compact(peak)}</text>
            <text x={width} y={height - 2} className={'HomeHeroSparkline__Scale'} textAnchor={'end'}>0</text>

            {!hover &&
              <circle cx={lastX} cy={lastY} r={3} fill={'#008DE4'}/>}

            {hover &&
              <g className={'HomeHeroSparkline__Focus'}>
                <line x1={hover.cx} x2={hover.cx} y1={0} y2={height} className={'HomeHeroSparkline__Guide'}/>
                <circle cx={hover.cx} cy={hover.cy} r={5} className={'HomeHeroSparkline__Dot'}/>
              </g>}

            <rect
              x={0} y={0} width={width} height={height}
              fill={'transparent'}
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>

          {hover && hoverPoint &&
            <div className={'HomeHeroSparkline__Tooltip'} style={{ left: tipLeft }}>
              <span className={'HomeHeroSparkline__TipValue'}>{splitNum(hoverPoint.y).join(' ')} txs</span>
              <span className={'HomeHeroSparkline__TipDate'}>{dateFormat(hoverPoint.x)}</span>
            </div>}
        </>}
    </div>
  )
}
