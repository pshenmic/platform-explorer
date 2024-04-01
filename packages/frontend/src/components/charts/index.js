import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import './charts.scss'

const LineGraph = ({
    data = [],
    width = 460,
    xLabel = '',
    yLabel = '',
    height = 180,
    marginTop = 40,
    marginRight = 40,
    marginBottom = 40,
    marginLeft = 40,
}) => {
    const x = d3.scaleLinear(d3.extent(data, d => d.x), [marginRight, width - marginLeft])
    const y = d3.scaleLinear(d3.extent(data, d => d.y), [height - marginBottom, marginTop])

    const gx = useRef()
    const gy = useRef()
    const tooltip = useRef()
    const divTooltip = useRef()
    const graphicLine = useRef()
    const focusPoint = useRef()

    useEffect(() => void d3.select(gx.current)
                           .call(d3.axisBottom(x)
                                .tickSize(0)
                                .tickPadding(10)
                                .ticks(5)
                            )
                            .call((axis) => {
                                const labelWidth = axis.select('.Axis__Label').node().getBBox().width

                                axis.select('.Axis__Label')
                                    .attr("transform", `translate(${width - labelWidth + 15}, 35)`)
                            })
                            , [gx, x])

    useEffect(() => void d3.select(gy.current)
                            .call(d3.axisLeft(y)
                                .tickSize(0)
                                .ticks(5)
                                .tickPadding(10)
                            )
                            .call((axis) => {
                                const labelWidth = axis.select('.Axis__Label').node().getBBox().width

                                axis.select('.Axis__Label')
                                    .attr("transform", `translate(${labelWidth - 35}, 27)`)
                            })
                            , [gy, y])

    useEffect(()=> void d3.select(gy.current)
                            .select('.Axis_Label')
                            .attr("transform", `translate(50,50)`)
                            , [])

    const line = d3.line()
                    .x(d => x(d.x))
                    .y(d => y(d.y))
                    .curve(d3.curveCardinal)

    const area = d3.area()
                    .curve(d3.curveCardinal)
                    .x((d) => x(d.x))
                    .y0(y(0))
                    .y1((d) => y(d.y))

    const bisect = d3.bisector(d => d.x).center

    function tooltipPosition(point) {
        const tooltipElement = d3.select(tooltip.current)
        const {width: tooltipWidth} = tooltipElement.node().getBoundingClientRect()

        const xPos = x(data[point].x) + tooltipWidth + 15 < width ?
                            x(data[point].x) + tooltipWidth / 2 + 15 :
                            x(data[point].x) - tooltipWidth / 2 - 15 

        tooltipElement.attr("transform", `translate(${xPos},${y(data[point].y)})`)
    }
    
    function pointermoved(event) {
        const i = bisect(data, x.invert(d3.pointer(event)[0]))

        d3.select(divTooltip.current)
            .style("display", "block")

        d3.select(focusPoint.current)
            .style("display", "block")
            .selectAll("circle")
            .attr("cx", x(data[i].x))
            .attr("cy", y(data[i].y))

        d3.select(tooltip.current)
            .style("display", null)
            .attr("transform", `translate(${x(data[i].x) + 100}, ${y(data[i].y)})`)

        const path = d3.select(tooltip.current)
                        .selectAll("path")
                        .data([,])
                        .join("path")
                            .attr("fill", "#fff")
                            .attr('opacity', '.2')
                            .attr("stroke", "black")
    
        const text = d3.select(tooltip.current)
            .selectAll("text")
                .data([,])
                .join("text")
                .call(t => t
                    .selectAll("tspan")
                    .data([
                        'Block Height: ' + data[i].x, 
                        'Tx count: ' + data[i].y])
                    .join("tspan")
                    .attr("x", 0)
                    .attr("y", (_, i) => `${i * 1.1}em`)
                    .attr('fill', '#fff')
                    .attr('fontFamily', 'monospace')
                    .attr('style', {
                        fontSize: '25px', 
                        fontFamily: 'Segoe UI Symbol'
                    })
                    .text(d => d))

        const {width: w, height: h} = text.node().getBBox()

        text.attr("transform", `translate(${-w/2},${0})`)

        path.attr('d', `M${-w / 2 - 10}, ${-h/2 -10}
                    H${w / 2 + 10}
                    v${h + 20}
                    h-${w + 20}
                    z`)
    
        tooltipPosition(i)
    }

    function pointerleft() {
        d3.select(tooltip.current)
            .style("display", "none")

        d3.select(focusPoint.current)
            .style("display", "none")
    }

    return (
        <svg 
            width = {width} 
            height = {height}
            onMouseEnter = {pointermoved}    
            onMouseMove = {pointermoved}    
            onMouseLeave = {pointerleft}
            overflow="visible"
        >   
            <g transform={`translate(15,-15)`}>
                <defs>
                    <linearGradient id="AreaFill" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop stopColor="#0F4D74" stopOpacity="0.3" offset="0%" />
                        <stop stopColor="#0E75B5" stopOpacity="0.3" offset="100%" />
                    </linearGradient>
                    <clipPath id="clipPath">
                        <rect x="25" y="30" width={width - 65} height={height - 70}></rect>
                    </clipPath>
                </defs>

                <g className={'axis'} ref={gx} style={{fontSize: '14px', fontFamily: 'Segoe UI Symbol'}} transform={`translate(0,${height - marginBottom + 15})`} >
                    <g><text className={'Axis__Label'} fill='white'>{xLabel}</text></g>
                </g>
                <g className={'axis'} ref={gy} style={{fontSize: '14px', fontFamily: 'Segoe UI Symbol'}} transform={`translate(${marginLeft - 15},0)`} >
                    <g><text className={'Axis__Label'} fill='white'>{yLabel}</text></g>
                </g>
                <g width={100} height={100} overflow={'auto'}>
                    <path fill="url(#AreaFill)" strokeWidth="3" d={area(data)} clipPath={'url(#clipPath)'}/>
                </g>
                <path ref={graphicLine} fill="none" stroke="#0e75b5" strokeWidth="3" d={line(data)}/>

                <g fill='#0e75b5'>
                    {data.map((d, i) => (<circle key={i} cx={x(d.x)} cy={y(d.y)} r='4' className={'chart-point'} />))}
                </g>

                <g ref={focusPoint}
                    style={{
                        display: 'none',
                        opacity: '.8'
                    }}>
                    <circle r="2" fill='white' />
                </g>

                <g ref={tooltip} style={{
                        fontSize: '14px', 
                        fontFamily: 'Segoe UI Symbol'
                    }}>
                </g>
            </g>
        </svg>
    )
}

export {
    LineGraph
}