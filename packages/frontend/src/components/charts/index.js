import { useState, useEffect, useRef, useCallback } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import * as d3 from 'd3'
import './charts.scss'
import { Container } from '@chakra-ui/react'
import theme from '../../styles/theme'
import TimeframeMenu from './TimeframeMenu'
import TimeframeSelector from './TimeframeSelector'

function getDatesTicks (dates, numTicks) {
  if (!dates.length) return []

  const sortedDates = dates.map(d => new Date(d)).sort((a, b) => a - b)
  const [firstDate] = sortedDates
  const lastDate = sortedDates[sortedDates.length - 1]
  const totalDuration = lastDate - firstDate
  const intervalDuration = totalDuration / (numTicks + 1)
  const rangeDates = []

  for (let i = 1; i <= numTicks; i++) {
    const tickDate = new Date(firstDate.getTime() + intervalDuration * i)
    rangeDates.push(tickDate)
  }

  return [firstDate, ...rangeDates, lastDate]
}

const LineChart = ({
  data,
  timespan,
  xAxis = { title: '', type: { axis: 'number' } },
  yAxis = { title: '', type: { axis: 'number' } },
  width,
  height,
  dataLoading
}) => {
  const chartContainer = useRef()
  const [chartElement, setChartElement] = useState(null)
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

  useResizeObserver(chartContainer.current, render)

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

    setChartElement(<LineGraph
      xAxis={xAxis}
      yAxis={yAxis}
      timespan={timespan}
      width={chartContainer.current.offsetWidth}
      height={chartContainer.current.offsetHeight}
      data={data}
    />)
  }, [chartElement, data, timespan, xAxis, yAxis])

  return (
    <Container
      ref={chartContainer}
      width={width || '100%'}
      height={height || '100%'}
      maxW={'none'}
      p={0} m={0}
      className={`ChartContainer ${(skeleton || dataLoading) ? 'loading' : ''}`}
    >
      {chartElement || <></>}
    </Container>
  )
}

const LineGraph = ({
  data = [],
  timespan,
  width = 460,
  height = 180,
  xAxis = { title: '', type: { axis: 'number' } },
  yAxis = { title: '', type: { axis: 'number' } }
}) => {
  const [loading, setLoading] = useState(true)
  const marginTop = yAxis.title ? 40 : 20
  const marginRight = 40
  const marginBottom = xAxis.title ? 45 : 20
  const marginLeft = 40
  const chartInnerOffset = 15
  const xAxisFormatCode = typeof xAxis.type === 'string' ? xAxis.type : xAxis.type.axis
  const [chartWidth, setChartWidth] = useState(0)
  const svgRef = useRef(null)
  const uniqueComponentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const tickFormats = {
    number: d3.format(',.0f'),
    date: d3.timeFormat('%B %d'),
    datetime: d3.timeFormat('%B %d, %H:%M'),
    time: d3.timeFormat('%H:%M')
  }

  const xTickFormat = tickFormats[xAxisFormatCode]
  const filteredData = data.filter(d => typeof d.y === 'number' && !isNaN(d.y))
  const y = d3.scaleLinear(d3.extent(filteredData, d => d.y), [height - marginBottom, marginTop])

  const [x, setX] = useState(() => {
    if (xAxisFormatCode === 'number') return d3.scaleLinear(d3.extent(data, d => d.x), [marginLeft, width - marginRight])
    if (xAxisFormatCode === 'date' || xAxisFormatCode === 'time' || xAxisFormatCode === 'datetime') return d3.scaleTime(d3.extent(data, d => d.x), [marginLeft, width - marginRight])
  })

  const xTicksCount = (() => {
    const isSmallScreen = chartWidth < 500

    if (xAxisFormatCode === 'number') return isSmallScreen ? 4 : 6
    if (xAxisFormatCode === 'time') return isSmallScreen ? 4 : 6
    if (xAxisFormatCode === 'date' || xAxisFormatCode === 'datetime') {
      if (timespan === '1w') return isSmallScreen ? 4 : 6
      if (timespan === '3d') return isSmallScreen ? 3 : 4
      if (timespan === '24h') return isSmallScreen ? 4 : 6
      if (timespan === '1h') return isSmallScreen ? 4 : 6
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

  const gx = useRef()
  const gy = useRef()
  const tooltip = useRef()
  const graphicLine = useRef()
  const focusPoint = useRef()

  const [line, setLine] = useState(() => d3.line()
    .x(d => x(d.x))
    .y(d => y(d.y))
    .curve(d3.curveLinear))

  const [area, setArea] = useState(() => d3.area()
    .curve(d3.curveLinear)
    .x((d) => x(d.x))
    .y0(y(0))
    .y1((d) => y(d.y)))

  const valuesFormat = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return value

    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`
    return value
  }

  useEffect(() => {
    d3.select(gx.current)
      .call((axis) => {
        axis.select('.Axis__TickContainer')
          .call(d3.axisBottom(x)
            .tickSize(0)
            .tickPadding(10)
            .tickFormat(xTickFormat)
            .tickValues(getDatesTicks(data.map((d) => d.x), xTicksCount - 2))
          )
      })
      .call((axis) => {
        const labelSize = axis.select('.Axis__Label').node().getBBox()

        axis.select('.Axis__Label')
          .attr('transform', `translate(${width - labelSize.width / 2 - marginRight}, ${marginBottom})`)
      })

    setLine((d) => d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveLinear))

    setArea((d) => d3.area()
      .curve(d3.curveLinear)
      .x((d) => x(d.x))
      .y0(y(0))
      .y1((d) => y(d.y)))
  }, [gx, x, data, width, xTicksCount, marginBottom])

  useEffect(() => {
    d3.select(gy.current)
      .select('.Axis__TickContainer')
      .call(d3.axisLeft(y)
        .tickSize(0)
        .ticks(5)
        .tickFormat(valuesFormat)
        .tickPadding(10)
      )
  }, [gy, y])

  useEffect(() => {
    if (!gx.current || !gy.current) return

    const yGrid = d3.axisLeft(y)
      .ticks(5)
      .tickSize(-width)
      .tickFormat('')

    d3.select(gy.current).select('.grid-y').remove()
    d3.select(gy.current)
      .append('g')
      .attr('class', 'grid grid-y')
      .call(yGrid)

    const xGrid = d3.axisBottom(x)
      .tickValues(getDatesTicks(data.map((d) => d.x), xTicksCount - 2))
      .tickSize(-height + marginTop)
      .tickFormat('')

    d3.select(gx.current).select('.grid-x').remove()
    d3.select(gx.current)
      .append('g')
      .attr('class', 'grid grid-x')
      .call(xGrid)
  }, [x, y, width, height, marginLeft, marginRight, marginTop, marginBottom, gx, gy, data])

  const updateSize = () => {
    if (!loading || !d3.select(gy.current).node()) return

    const yAxisTicksWidth = d3.select(gy.current).select('.Axis__TickContainer').node().getBBox().width

    d3.select(gy.current)
      .select('.Axis__Label')
      .attr('transform', `translate(${-yAxisTicksWidth}, ${marginTop - 15})`)

    d3.select(gy.current)
      .attr('transform', `translate(${yAxisTicksWidth}, 0)`)

    setX(() => {
      if (xAxisFormatCode === 'number') return d3.scaleLinear(d3.extent(data, d => d.x), [yAxisTicksWidth, width - marginRight])
      if (xAxisFormatCode === 'date' || xAxisFormatCode === 'time' || xAxisFormatCode === 'datetime') return d3.scaleTime(d3.extent(data, d => d.x), [yAxisTicksWidth, width - marginRight])
    })

    if (loading) setLoading(false)
  }

  useEffect(updateSize, [data, loading, marginTop, width, xAxisFormatCode])

  const bisect = d3.bisector(d => d.x).center

  function tooltipPosition (point) {
    const tooltipElement = d3.select(tooltip.current)
    const { width: tooltipWidth } = tooltipElement.node().getBoundingClientRect()

    const xPos = x(data[point].x) + tooltipWidth + 20 < width
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

  function pointermoved (event) {
    const i = bisect(data, x.invert(d3.pointer(event)[0] - chartInnerOffset))

    d3.select(focusPoint.current)
      .style('display', 'block')
      .selectAll('circle')
      .attr('cx', x(data[i].x))
      .attr('cy', y(data[i].y))

    const path = d3.select(tooltip.current)
      .selectAll('path')
      .data([''])
      .join('path')
      .attr('fill', theme.colors.gray['800'])
      .attr('opacity', '1')
      .attr('stroke', theme.colors.gray['700'])

    const lineClass = (styles) => {
      if (typeof styles === 'string') styles = [styles]

      let classStr = ''

      styles.forEach((style) => {
        if (style === 'blocks') classStr += ' ChartTooltip__InfoLine--Blocks'
        if (style === 'inline') classStr += ' ChartTooltip__InfoLine--Inline'
        if (style === 'bold') classStr += ' ChartTooltip__InfoLine--Bold'
        if (style === 'tiny') classStr += ' ChartTooltip__InfoLine--Tiny'
      })

      return classStr
    }

    const infoLines = []
    const xFormatCode = typeof xAxis.type.tooltip === 'string' ? xAxis.type.tooltip : xAxis.type.axis
    const xFormat = tickFormats[xFormatCode]

    infoLines.push({
      styles: ['inline', 'tiny'],
      value: `${xFormat(data[i].x)}: `
    }, {
      styles: ['inline', 'bold'],
      value: ` ${new Intl.NumberFormat('fr-FR', { useGrouping: true, grouping: [3], minimumFractionDigits: 0 }).format(data[i].y)} `
    }, {
      styles: ['inline', 'tiny'],
      value: ` ${yAxis.abbreviation}`
    })

    const text = d3.select(tooltip.current)
      .selectAll('text')
      .data([''])
      .join('text')
      .attr('class', 'ChartTooltip__TextContainer')
      .call(t => t
        .selectAll('tspan')
        .data(infoLines)
        .join('tspan')
        .attr('class', (infoLine, i) => `ChartTooltip__InfoLine ${lineClass(infoLine.styles)}`)
        .attr('fill', (infoLine, i) => `${!infoLine.styles.includes('tiny') ? '#fff' : theme.colors.gray['100']}`)
        .text(d => d.value))

    const { width: textW, height: textH } = text.node().getBBox()

    text.attr('transform', `translate(${-textW / 2},${-(textH - 20) / 2 + 5})`)

    path.attr('d', `M${-textW / 2 - 10}, ${-textH / 2 - 10}
                    H${textW / 2 + 10}
                    v${textH + 20}
                    h-${textW + 20}
                    z`)

    tooltipPosition(i)
  }

  function pointerleft () {
    d3.select(tooltip.current)
      .transition()
      .delay(1)
      .style('opacity', 0)
      .style('visibility', 'none')
      .style('transition', 'all 0s')

    d3.select(focusPoint.current)
      .style('display', 'none')
  }

  return (
    <div className={`Chart ${!loading ? 'loaded' : ''}`}>
        <svg
            ref={svgRef}
            onMouseEnter = {pointermoved}
            onMouseMove = {pointermoved}
            onMouseLeave = {pointerleft}
            overflow={'visible'}
            viewBox={`0 0 ${width} ${height}`}
        >
            <filter id={`shadow-${uniqueComponentId}`}>
                <feDropShadow dx='0.2' dy='0.4' stdDeviation='.15'/>
            </filter>

            <svg x={chartInnerOffset} y={-chartInnerOffset} overflow={'visible'}>
              <g className={'Axis Axis--X'} ref={gx} transform={`translate(0,${height - marginBottom + chartInnerOffset})`}>
                <line
                  x1={marginLeft - chartInnerOffset - 20}
                  x2={width - marginRight + 50}
                  y1={0}
                  y2={0}
                  className={'Axis__Line'}
                />
                <g><text className={'Axis__Label'} fill='white'>{xAxis.title}</text></g>
                <g className={'Axis__TickContainer'}></g>
              </g>
            </svg>

            <svg x='0' y={-chartInnerOffset} overflow={'visible'}>
              <g className={'Axis Axis--Y'} ref={gy} >
                <line
                  x1={0}
                  x2={0}
                  y1={marginTop - 5}
                  y2={height - marginBottom + chartInnerOffset + 5}
                  className={'Axis__Line'}
                />
                <g><text className={'Axis__Label'} fill='white'>{yAxis.title}</text></g>
                <g className={'Axis__TickContainer'}></g>
              </g>
            </svg>

            <g transform={`translate(${chartInnerOffset},${-chartInnerOffset})`}>
                <defs>
                    <linearGradient id={`AreaFill-${uniqueComponentId}`} x1='0%' y1='100%' x2='0%' y2='0%'>
                        <stop stopColor='#0F4D74' stopOpacity='0.02' offset='0%' />
                        <stop stopColor='#0E75B5' stopOpacity='0.4' offset='100%' />
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

                <path d={area(data)} fill={`url(#AreaFill-${uniqueComponentId})`} clipPath={`url(#clipPath-${uniqueComponentId})`}/>

                <g filter={`url(#shadow-${uniqueComponentId})`}>
                    <path ref={graphicLine} d={line(data)} stroke={'#008DE4'} strokeWidth={2} fill={'none'} strokeLinejoin={'round'}/>

                    <g fill='#008DE4'>
                        {data.map((d, i) => (<circle key={i} cx={x(d.x)} cy={y(d.y)} r={4} className={'Chart__Point'}/>))}
                    </g>
                </g>

                <g ref={focusPoint} className={'Chart__FocusPoint'}>
                    <circle r={3}/>
                </g>

                <g ref={tooltip} className={'Chart__Tooltip ChartTooltip'} filter={`url(#shadow-${uniqueComponentId})`}></g>
            </g>
        </svg>
    </div>
  )
}

export {
  LineChart,
  TimeframeMenu,
  TimeframeSelector
}
