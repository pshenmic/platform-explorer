import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import './charts.scss'
import { Container } from '@chakra-ui/react'
import theme from '../../styles/theme'

function getDatesTicks (dates, numTicks) {
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

const LineChart = ({ data, timespan, xAxis = { title: '', type: { axis: 'number' } }, yAxis = { title: '', type: { axis: 'number' } } }) => {
  const chartContainer = useRef()
  const [chartElement, setChartElement] = useState('')

  const render = () => {
    if (!chartContainer.current) return

    setChartElement('')

    let lastWidth = chartContainer.current.offsetWidth

    const setupChart = () => {
      setTimeout(() => {
        if (!chartContainer.current) return

        if (chartContainer.current.offsetWidth !== lastWidth) {
          lastWidth = chartContainer.current.offsetWidth
          setupChart()
          return
        }

        setChartElement(<LineGraph
                    xAxis={xAxis}
                    yAxis={yAxis}
                    timespan={timespan}
                    width = {chartContainer.current.offsetWidth}
                    height = {chartContainer.current.offsetHeight}
                    data={data}
                />)
      }, 100)
    }

    setupChart()
  }

  const chartObserver = new ResizeObserver(render)

  useEffect(render, [data])

  useEffect(() => {
    if (chartContainer.current && chartElement === '') chartObserver.observe(chartContainer.current)
  }, [chartContainer])

  return <Container
            ref={chartContainer}
            width={'100%'}
            height={'100%'}
            maxW={'none'}
            p={0} m={0}
        >
            {chartElement}
        </Container>
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
  const xAxisFormatCode = typeof xAxis.type === 'string' ? xAxis.type : xAxis.type.axis

  const getFormatByCode = (code) => {
    if (code === 'number') return d3.format(',.0f')
    if (code === 'date') return d3.timeFormat('%B %d')
    if (code === 'datetime') return d3.timeFormat('%B %d, %H:%M')
    if (code === 'time') return d3.timeFormat('%H:%M')
  }

  const xTickFormat = (() => {
    return getFormatByCode(xAxisFormatCode)
  })()

  const y = d3.scaleLinear(d3.extent(data, d => d.y), [height - marginBottom, marginTop])

  const [x, setX] = useState(() => {
    if (xAxisFormatCode === 'number') return d3.scaleLinear(d3.extent(data, d => d.x), [marginLeft, width - marginRight])
    if (xAxisFormatCode === 'date' || xAxisFormatCode === 'time' || xAxisFormatCode === 'datetime') return d3.scaleTime(d3.extent(data, d => d.x), [marginLeft, width - marginRight])
  })

  const xTicksCount = (() => {
    if (xAxisFormatCode === 'number') return 6
    if (xAxisFormatCode === 'time') return 6
    if (xAxisFormatCode === 'date' || xAxisFormatCode === 'datetime') {
      if (typeof timespan === 'undefined') return 6
      if (timespan === '1w') return 6
      if (timespan === '3d') return 4
      if (timespan === '24h') return 6
      if (timespan === '1h') return 6
    }
  })()

  const gx = useRef()
  const gy = useRef()
  const tooltip = useRef()
  const graphicLine = useRef()
  const focusPoint = useRef()

  const [line, setLine] = useState(() => d3.line()
    .x(d => x(d.x))
    .y(d => y(d.y))
    .curve(d3.curveCardinal))

  const [area, setArea] = useState(() => d3.area()
    .curve(d3.curveCardinal)
    .x((d) => x(d.x))
    .y0(y(0))
    .y1((d) => y(d.y)))

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
      .curve(d3.curveBumpX))

    setArea((d) => d3.area()
      .curve(d3.curveBumpX)
      .x((d) => x(d.x))
      .y0(y(0))
      .y1((d) => y(d.y)))
  }, [gx, x])

  useEffect(() => void d3.select(gy.current)
    .select('.Axis__TickContainer')
    .call(d3.axisLeft(y)
      .tickSize(0)
      .ticks(5)
      .tickPadding(10)
    ), [gy, y])

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

  useEffect(updateSize, [])

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
    const i = bisect(data, x.invert(d3.pointer(event)[0]))

    d3.select(focusPoint.current)
      .style('display', 'block')
      .selectAll('circle')
      .attr('cx', x(data[i].x))
      .attr('cy', y(data[i].y))

    const path = d3.select(tooltip.current)
      .selectAll('path')
      .data([,])
      .join('path')
      .attr('fill', theme.colors.gray['800'])
      .attr('opacity', '1')
      .attr('stroke', theme.colors.gray['700'])

    const lineClass = (styles) => {
      if (typeof styles === 'string') styles = [styles]

      let classStr = ''

      styles.map((style) => {
        if (style === 'blocks') classStr += ' ChartTooltip__InfoLine--Blocks'
        if (style === 'inline') classStr += ' ChartTooltip__InfoLine--Inline'
        if (style === 'bold') classStr += ' ChartTooltip__InfoLine--Bold'
        if (style === 'tiny') classStr += ' ChartTooltip__InfoLine--Tiny'
      })

      return classStr
    }

    const infoLines = []
    const xFormatCode = typeof xAxis.type.tooltip === 'string' ? xAxis.type.tooltip : xAxis.type.axis
    const xFormat = getFormatByCode(xFormatCode)

    infoLines.push({
      styles: ['inline', 'tiny'],
      value: `${xFormat(data[i].x)}: `
    }, {
      styles: ['inline', 'bold'],
      value: ` ${data[i].y} `
    }, {
      styles: ['inline', 'tiny'],
      value: ` ${yAxis.abbreviation}`
    })

    const text = d3.select(tooltip.current)
      .selectAll('text')
      .data([,])
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
        <div className={`ChartContainer ${!loading ? 'loaded' : ''}`}>
            <svg
                onMouseEnter = {pointermoved}
                onMouseMove = {pointermoved}
                onMouseLeave = {pointerleft}
                overflow={'visible'}
                viewBox={`0 0 ${width} ${height}`}
            >
                <filter id="shadow">
                    <feDropShadow dx="0.2" dy="0.4" stdDeviation=".15" />
                </filter>

                <svg x='15' y='-15' overflow={'visible'}>
                    <g className={'Axis'} ref={gx} transform={`translate(0,${height - marginBottom + 15})`} >
                        <g><text className={'Axis__Label'} fill='white'>{xAxis.title}</text></g>
                        <g className={'Axis__TickContainer'}></g>
                    </g>
                </svg>

                <svg x='0' y='-15'>
                    <g className={'Axis'} ref={gy} >
                        <g><text className={'Axis__Label'} fill='white'>{yAxis.title}</text></g>
                        <g className={'Axis__TickContainer'}></g>
                    </g>
                </svg>

                <g transform={'translate(15,-15)'}>
                    <defs>
                        <linearGradient id="AreaFill" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop stopColor="#0F4D74" stopOpacity="0.02" offset="0%" />
                            <stop stopColor="#0E75B5" stopOpacity="0.4" offset="100%" />
                        </linearGradient>
                        <clipPath id="clipPath">
                            <rect
                                x={marginLeft - 10}
                                y={marginTop}
                                width={width - (marginLeft - 10 + marginRight)}
                                height={height - (marginTop + marginBottom)}
                            ></rect>
                        </clipPath>
                    </defs>

                    <path d={area(data)} fill="url(#AreaFill)" clipPath={'url(#clipPath)'}/>

                    <g filter='url(#shadow)'>
                        <path ref={graphicLine} d={line(data)} stroke="#0e75b5" strokeWidth="3" fill="none"/>

                        <g fill='#0e75b5'>
                            {data.map((d, i) => (<circle key={i} cx={x(d.x)} cy={y(d.y)} r='4' className={'Chart__Point'}/>))}
                        </g>
                    </g>

                    <g ref={focusPoint} className={'Chart__FocusPoint'}>
                        <circle r="3" fill='white' />
                    </g>

                    <g ref={tooltip} className={'Chart__Tooltip ChartTooltip'} filter='url(#shadow)'></g>
                </g>
            </svg>
        </div>
  )
}

export {
  LineChart
}
