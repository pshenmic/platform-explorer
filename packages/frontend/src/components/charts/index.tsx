import { useState, useEffect, useRef, useCallback } from 'react'
import type { ReactElement, RefObject } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import * as d3 from 'd3'
import './charts.css'
import theme from '../../styles/theme'
import TimeframeMenu from './TimeframeMenu'
import TimeframeSelector from './TimeframeSelector'
import type {
  AxisFormatCode,
  ChartAxis,
  ChartDataPoint,
  ChartRenderType,
  TimespanValue
} from './types'

function getDatesTicks(dates: Array<Date | number>, numTicks: number): Date[] {
  if (!dates.length) return []

  const sortedDates = dates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime())
  const [firstDate] = sortedDates
  const lastDate = sortedDates[sortedDates.length - 1]
  const totalDuration = lastDate.getTime() - firstDate.getTime()
  const intervalDuration = totalDuration / (numTicks + 1)
  const rangeDates: Date[] = []

  for (let i = 1; i <= numTicks; i++) {
    const tickDate = new Date(firstDate.getTime() + intervalDuration * i)
    rangeDates.push(tickDate)
  }

  return [firstDate, ...rangeDates, lastDate]
}

interface LineChartProps {
  data?: ChartDataPoint[]
  timespan?: TimespanValue | string
  xAxis?: ChartAxis
  yAxis?: ChartAxis
  width?: string | number
  height?: string | number
  dataLoading?: boolean
  type?: ChartRenderType
}

const LineChart = ({
  data,
  timespan,
  xAxis = { title: '', type: { axis: 'number' } },
  yAxis = { title: '', type: { axis: 'number' } },
  width,
  height,
  dataLoading,
  type = 'line'
}: LineChartProps) => {
  const chartContainer = useRef<HTMLDivElement>(null)
  const [chartElement, setChartElement] = useState<ReactElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [skeleton, setSkeleton] = useState(true)
  const previousDataRef = useRef(data)

  const render = useCallback(() => {
    if (loading || !chartContainer.current) return
    setLoading(true)
    setSkeleton(true)
    setChartElement(null)
  }, [loading, chartContainer])

  useEffect(() => {
    if (JSON.stringify(previousDataRef.current) !== JSON.stringify(data)) {
      previousDataRef.current = data
      render()
    }
  }, [data, render])

  useResizeObserver(chartContainer as RefObject<HTMLElement>, render)

  useEffect(() => {
    if (!data?.length) {
      setLoading(true)
      setSkeleton(true)
      return
    }

    if (chartElement) {
      setLoading(false)
      setSkeleton(false)
      return
    }

    if (!chartContainer.current) return

    setChartElement(
      <LineGraph
        xAxis={xAxis}
        yAxis={yAxis}
        timespan={timespan}
        width={chartContainer.current.offsetWidth}
        height={chartContainer.current.offsetHeight}
        data={data}
        type={type}
      />
    )
  }, [chartElement, data, timespan, xAxis, yAxis, type])

  return (
    <div
      ref={chartContainer}
      className={`ChartContainer ${skeleton || dataLoading ? 'loading' : ''}`}
      style={{ width: width || '100%', height: height || '100%' }}
    >
      {chartElement || <></>}
    </div>
  )
}

interface LineGraphProps {
  data?: ChartDataPoint[]
  timespan?: TimespanValue | string
  width?: number
  height?: number
  xAxis?: ChartAxis
  yAxis?: ChartAxis
  type?: ChartRenderType
}

const LineGraph = ({
  data = [],
  timespan,
  width = 460,
  height = 180,
  xAxis = { title: '', type: { axis: 'number' } },
  yAxis = { title: '', type: { axis: 'number' } },
  type = 'line'
}: LineGraphProps) => {
  const [loading, setLoading] = useState(true)
  const marginTop = yAxis.title ? 40 : 20
  const marginRight = 40
  const marginBottom = xAxis.title ? 45 : 20
  const marginLeft = 40
  const chartInnerOffset = 15
  const xAxisFormatCode: AxisFormatCode = (
    typeof xAxis.type === 'string' ? xAxis.type : xAxis.type.axis
  ) as AxisFormatCode
  const [chartWidth, setChartWidth] = useState(0)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const uniqueComponentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const tickFormats: Record<AxisFormatCode, (d: Date | number) => string> = {
    number: d3.format(',.0f'),
    date: d3.timeFormat('%B %d'),
    datetime: d3.timeFormat('%B %d, %H:%M'),
    time: d3.timeFormat('%H:%M')
  }

  const xTickFormat = tickFormats[xAxisFormatCode]
  const filteredData = data.filter(d => typeof d.y === 'number' && !isNaN(d.y))
  const y = d3.scaleLinear(
    d3.extent(filteredData, (d: ChartDataPoint) => d.y),
    [height - marginBottom, marginTop]
  )

  const [x, setX] = useState(() => {
    if (xAxisFormatCode === 'number')
      return d3.scaleLinear(
        d3.extent(data, (d: ChartDataPoint) => d.x),
        [marginLeft, width - marginRight]
      )
    if (xAxisFormatCode === 'date' || xAxisFormatCode === 'time' || xAxisFormatCode === 'datetime')
      return d3.scaleTime(
        d3.extent(data, (d: ChartDataPoint) => d.x),
        [marginLeft, width - marginRight]
      )
    return d3.scaleLinear(
      d3.extent(data, (d: ChartDataPoint) => d.x),
      [marginLeft, width - marginRight]
    )
  })

  const timespanKey = typeof timespan === 'string' ? timespan : timespan?.label

  const xTicksCount = (() => {
    const isSmallScreen = chartWidth < 500

    if (xAxisFormatCode === 'number') return isSmallScreen ? 4 : 6
    if (xAxisFormatCode === 'time') return isSmallScreen ? 4 : 6
    if (xAxisFormatCode === 'date' || xAxisFormatCode === 'datetime') {
      if (timespanKey === '1w') return isSmallScreen ? 4 : 6
      if (timespanKey === '3d') return isSmallScreen ? 3 : 4
      if (timespanKey === '24h') return isSmallScreen ? 4 : 6
      if (timespanKey === '1h') return isSmallScreen ? 4 : 6
      return isSmallScreen ? 4 : 6
    }

    return 6
  })()

  useEffect(() => {
    if (svgRef.current) {
      const currentWidth = svgRef.current.getBoundingClientRect().width
      setChartWidth(currentWidth)
    }
  }, [svgRef.current])

  const gx = useRef<SVGGElement | null>(null)
  const gy = useRef<SVGGElement | null>(null)
  const tooltip = useRef<SVGGElement | null>(null)
  const graphicLine = useRef<SVGPathElement | null>(null)
  const focusPoint = useRef<SVGGElement | null>(null)

  const [line, setLine] = useState(() =>
    d3
      .line()
      .x((d: ChartDataPoint) => x(d.x))
      .y((d: ChartDataPoint) => y(d.y))
      .curve(d3.curveLinear)
  )

  const [area, setArea] = useState(() =>
    d3
      .area()
      .curve(d3.curveLinear)
      .x((d: ChartDataPoint) => x(d.x))
      .y0(y(0))
      .y1((d: ChartDataPoint) => y(d.y))
  )

  const valuesFormat = (value: number | string | null | undefined) => {
    if (typeof value !== 'number' || isNaN(value)) return value

    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`
    return value
  }

  useEffect(() => {
    d3.select(gx.current)
      .call(
        (axis: {
          select: (s: string) => {
            call: (c: unknown) => unknown
            node: () => { getBBox: () => DOMRect }
            attr: (k: string, v: string) => unknown
          }
        }) => {
          axis.select('.Axis__TickContainer').call(
            d3
              .axisBottom(x)
              .tickSize(0)
              .tickPadding(10)
              .tickFormat(xTickFormat)
              .tickValues(
                getDatesTicks(
                  data.map(d => d.x),
                  xTicksCount - 2
                )
              )
          )
        }
      )
      .call(
        (axis: {
          select: (s: string) => {
            call: (c: unknown) => unknown
            node: () => { getBBox: () => DOMRect }
            attr: (k: string, v: string) => unknown
          }
        }) => {
          const labelSize = axis.select('.Axis__Label').node().getBBox()

          axis
            .select('.Axis__Label')
            .attr(
              'transform',
              `translate(${width - labelSize.width / 2 - marginRight}, ${marginBottom})`
            )
        }
      )

    setLine(() =>
      d3
        .line()
        .x((d: ChartDataPoint) => x(d.x))
        .y((d: ChartDataPoint) => y(d.y))
        .curve(d3.curveLinear)
    )

    setArea(() =>
      d3
        .area()
        .curve(d3.curveLinear)
        .x((d: ChartDataPoint) => x(d.x))
        .y0(y(0))
        .y1((d: ChartDataPoint) => y(d.y))
    )
  }, [gx, x, data, width, xTicksCount, marginBottom])

  useEffect(() => {
    d3.select(gy.current)
      .select('.Axis__TickContainer')
      .call(d3.axisLeft(y).tickSize(0).ticks(5).tickFormat(valuesFormat).tickPadding(10))
  }, [gy, y])

  useEffect(() => {
    if (!gx.current || !gy.current) return

    const yGrid = d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat('')

    d3.select(gy.current).select('.grid-y').remove()
    d3.select(gy.current).append('g').attr('class', 'grid grid-y').call(yGrid)

    const xGrid = d3
      .axisBottom(x)
      .tickValues(
        getDatesTicks(
          data.map(d => d.x),
          xTicksCount - 2
        )
      )
      .tickSize(-height + marginTop)
      .tickFormat('')

    d3.select(gx.current).select('.grid-x').remove()
    d3.select(gx.current).append('g').attr('class', 'grid grid-x').call(xGrid)
  }, [x, y, width, height, marginLeft, marginRight, marginTop, marginBottom, gx, gy, data])

  const updateSize = () => {
    if (!loading || !d3.select(gy.current).node()) return

    const yAxisTicksWidth = d3
      .select(gy.current)
      .select('.Axis__TickContainer')
      .node()
      .getBBox().width

    d3.select(gy.current)
      .select('.Axis__Label')
      .attr('transform', `translate(${-yAxisTicksWidth}, ${marginTop - 15})`)

    d3.select(gy.current).attr('transform', `translate(${yAxisTicksWidth}, 0)`)

    setX(() => {
      if (xAxisFormatCode === 'number')
        return d3.scaleLinear(
          d3.extent(data, (d: ChartDataPoint) => d.x),
          [yAxisTicksWidth, width - marginRight]
        )
      if (
        xAxisFormatCode === 'date' ||
        xAxisFormatCode === 'time' ||
        xAxisFormatCode === 'datetime'
      )
        return d3.scaleTime(
          d3.extent(data, (d: ChartDataPoint) => d.x),
          [yAxisTicksWidth, width - marginRight]
        )
      return d3.scaleLinear(
        d3.extent(data, (d: ChartDataPoint) => d.x),
        [yAxisTicksWidth, width - marginRight]
      )
    })

    if (loading) setLoading(false)
  }

  useEffect(updateSize, [data, loading, marginTop, width, xAxisFormatCode])

  const bisect = d3.bisector((d: ChartDataPoint) => d.x).center

  function tooltipPosition(point: number) {
    const tooltipElement = d3.select(tooltip.current)
    const { width: tooltipWidth } = tooltipElement.node().getBoundingClientRect()

    const xPos =
      x(data[point].x) + tooltipWidth + 20 < width
        ? x(data[point].x) + tooltipWidth / 2 + 15
        : x(data[point].x) - tooltipWidth / 2 - 15

    tooltipElement
      .attr('transform', `translate(${xPos},${y(data[point].y)})`)
      .transition()
      .duration(0)
      .style('transition', 'all .15s')
      .style('opacity', '1')
      .style('visibility', 'visible')
  }

  function pointermoved(event: MouseEvent) {
    const i = bisect(data, x.invert(d3.pointer(event)[0] - chartInnerOffset))

    d3.select(focusPoint.current)
      .style('display', 'block')
      .selectAll('circle')
      .attr('cx', x(data[i].x))
      .attr('cy', y(data[i].y))

    const path = d3
      .select(tooltip.current)
      .selectAll('path')
      .data([''])
      .join('path')
      .attr('fill', theme.colors.gray['800'])
      .attr('opacity', '1')
      .attr('stroke', theme.colors.gray['700'])

    const lineClass = (styles: string | string[]) => {
      if (typeof styles === 'string') styles = [styles]

      let classStr = ''

      styles.forEach(style => {
        if (style === 'blocks') classStr += ' ChartTooltip__InfoLine--Blocks'
        if (style === 'inline') classStr += ' ChartTooltip__InfoLine--Inline'
        if (style === 'bold') classStr += ' ChartTooltip__InfoLine--Bold'
        if (style === 'tiny') classStr += ' ChartTooltip__InfoLine--Tiny'
      })

      return classStr
    }

    const infoLines: Array<{ styles: string[]; value: string }> = []
    const xFormatCode: AxisFormatCode = (
      typeof xAxis.type === 'object' && xAxis.type.tooltip
        ? xAxis.type.tooltip
        : typeof xAxis.type === 'string'
          ? xAxis.type
          : xAxis.type.axis
    ) as AxisFormatCode
    const xFormat = tickFormats[xFormatCode]

    infoLines.push(
      {
        styles: ['inline', 'tiny'],
        value: `${xFormat(data[i].x)}: `
      },
      {
        styles: ['inline', 'bold'],
        value: ` ${new Intl.NumberFormat('fr-FR', { useGrouping: true, minimumFractionDigits: 0 }).format(data[i].y)} `
      },
      {
        styles: ['inline', 'tiny'],
        value: ` ${yAxis.abbreviation ?? ''}`
      }
    )

    const text = d3
      .select(tooltip.current)
      .selectAll('text')
      .data([''])
      .join('text')
      .attr('class', 'ChartTooltip__TextContainer')
      .call(
        (t: {
          selectAll: (s: string) => {
            data: (d: unknown) => {
              join: (s: string) => {
                attr: (
                  k: string,
                  v: string | ((d: { styles: string[] }) => string)
                ) => {
                  attr: (
                    k: string,
                    v: string | ((d: { styles: string[] }) => string)
                  ) => {
                    text: (fn: (d: { value: string }) => string) => unknown
                  }
                }
              }
            }
          }
        }) =>
          t
            .selectAll('tspan')
            .data(infoLines)
            .join('tspan')
            .attr(
              'class',
              (infoLine: { styles: string[] }) =>
                `ChartTooltip__InfoLine ${lineClass(infoLine.styles)}`
            )
            .attr(
              'fill',
              (infoLine: { styles: string[] }) =>
                `${!infoLine.styles.includes('tiny') ? '#fff' : theme.colors.gray['100']}`
            )
            .text((d: { value: string }) => d.value)
      )

    const { width: textW, height: textH } = text.node().getBBox()

    text.attr('transform', `translate(${-textW / 2},${-(textH - 20) / 2 + 5})`)

    path.attr(
      'd',
      `M${-textW / 2 - 10}, ${-textH / 2 - 10}
                    H${textW / 2 + 10}
                    v${textH + 20}
                    h-${textW + 20}
                    z`
    )

    tooltipPosition(i)
  }

  function pointerleft() {
    d3.select(tooltip.current)
      .transition()
      .delay(1)
      .style('opacity', 0)
      .style('visibility', 'none')
      .style('transition', 'all 0s')

    d3.select(focusPoint.current).style('display', 'none')
  }

  return (
    <div className={`Chart ${!loading ? 'loaded' : ''}`}>
      <svg
        ref={svgRef}
        onMouseEnter={pointermoved as unknown as React.MouseEventHandler<SVGSVGElement>}
        onMouseMove={pointermoved as unknown as React.MouseEventHandler<SVGSVGElement>}
        onMouseLeave={pointerleft}
        overflow={'visible'}
        viewBox={`0 0 ${width} ${height}`}
      >
        <filter id={`shadow-${uniqueComponentId}`}>
          <feDropShadow dx="0.2" dy="0.4" stdDeviation=".15" />
        </filter>

        <svg x={chartInnerOffset} y={-chartInnerOffset} overflow={'visible'}>
          <g
            className={'Axis Axis--X'}
            ref={gx}
            transform={`translate(0,${height - marginBottom + chartInnerOffset})`}
          >
            <line
              x1={marginLeft - chartInnerOffset - 20}
              x2={width - marginRight + 50}
              y1={0}
              y2={0}
              className={'Axis__Line'}
            />
            <g>
              <text className={'Axis__Label'} fill="white">
                {xAxis.title}
              </text>
            </g>
            <g className={'Axis__TickContainer'}></g>
          </g>
        </svg>

        <svg x="0" y={-chartInnerOffset} overflow={'visible'}>
          <g className={'Axis Axis--Y'} ref={gy}>
            <line
              x1={0}
              x2={0}
              y1={marginTop - 5}
              y2={height - marginBottom + chartInnerOffset + 5}
              className={'Axis__Line'}
            />
            <g>
              <text className={'Axis__Label'} fill="white">
                {yAxis.title}
              </text>
            </g>
            <g className={'Axis__TickContainer'}></g>
          </g>
        </svg>

        <g transform={`translate(${chartInnerOffset},${-chartInnerOffset})`}>
          <defs>
            <linearGradient id={`AreaFill-${uniqueComponentId}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop stopColor="#0F4D74" stopOpacity="0.02" offset="0%" />
              <stop stopColor="#0E75B5" stopOpacity="0.4" offset="100%" />
            </linearGradient>
            <clipPath id={`clipPath-${uniqueComponentId}`}>
              <rect
                x={Math.max(marginLeft - 20, 0)}
                y={Math.max(marginTop, 0)}
                width={Math.max(width - (marginLeft - 20 + marginRight), 0)}
                height={Math.max(height - (marginTop + marginBottom), 0)}
              ></rect>
            </clipPath>
          </defs>

          {type === 'bar' ? (
            (() => {
              const step = data.length > 1 ? Math.abs(x(data[1].x) - x(data[0].x)) : 12
              const barW = Math.max(1, Math.min(step * 0.6, 14))
              const baseY = y(0)
              return (
                <g clipPath={`url(#clipPath-${uniqueComponentId})`}>
                  {data.map((d, i) => {
                    const h = Math.max(0, baseY - y(d.y))
                    return (
                      <rect
                        key={i}
                        x={x(d.x) - barW / 2}
                        y={y(d.y)}
                        width={barW}
                        height={h}
                        rx={1}
                        fill={`url(#AreaFill-${uniqueComponentId})`}
                        stroke={'#008DE4'}
                        strokeWidth={1}
                        className={'Chart__Bar'}
                      />
                    )
                  })}
                </g>
              )
            })()
          ) : (
            <>
              <path
                d={area(data) ?? undefined}
                fill={`url(#AreaFill-${uniqueComponentId})`}
                clipPath={`url(#clipPath-${uniqueComponentId})`}
              />

              <g filter={`url(#shadow-${uniqueComponentId})`}>
                <path
                  ref={graphicLine}
                  d={line(data) ?? undefined}
                  stroke={'#008DE4'}
                  strokeWidth={2}
                  fill={'none'}
                  strokeLinejoin={'round'}
                />

                <g fill="#008DE4">
                  {data.map((d, i) => (
                    <circle key={i} cx={x(d.x)} cy={y(d.y)} r={4} className={'Chart__Point'} />
                  ))}
                </g>
              </g>
            </>
          )}

          <g ref={focusPoint} className={'Chart__FocusPoint'}>
            <circle r={3} />
          </g>

          <g
            ref={tooltip}
            className={'Chart__Tooltip ChartTooltip'}
            filter={`url(#shadow-${uniqueComponentId})`}
          ></g>
        </g>
      </svg>
    </div>
  )
}

export { LineChart, TimeframeMenu, TimeframeSelector }
