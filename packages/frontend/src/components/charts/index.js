import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import './charts.scss'

const LinePlot = ({
    data = [],
    width = 460,
    height = 150,
    marginTop = 40,
    marginRight = 40,
    marginBottom = 40,
    marginLeft = 40
}) => {
    const x = d3.scaleTime(d3.extent(data, d => d.date).reverse(), [width - marginLeft, marginRight])
    const y = d3.scaleLinear(d3.extent(data, d => d.value), [height - marginBottom, marginTop])

    const gx = useRef()
    const gy = useRef()
    const dots = useRef()
    const tooltip = useRef()
    const divTooltip = useRef()
    const graphicLine = useRef()

    useEffect(() => void d3.select(gx.current)
                           .call(d3.axisBottom(x)
                                .tickSize(0)
                                .tickPadding(10)
                                .ticks(5)
                                .tickFormat(d3.timeFormat("%m.%d"))
                            ), [gx, x])

    useEffect(() => void d3.select(gy.current)
                            .call(d3.axisLeft(y)
                                .tickSize(0)
                                .ticks(5)
                                .tickPadding(10)
                            ), [gy, y])

    useEffect(() => void d3.select(dots.current)
                            .selectAll("dot")
                            .data(data)
                            .join("circle")
                            .attr("cx", d => x(d.date))
                            .attr("cy", d => y(d.value))
                            .attr("r", 4.0) 
                            .attr('class', 'chart-point')
                            .style("fill", "#0e75b5"), [gy, y])

    const line = d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.value))
                    .curve(d3.curveCardinal)

    const area = d3.area()
                    .curve(d3.curveCardinal)
                    .x((d) => x(d.date))
                    .y0(y(0))
                    .y1((d) => y(d.value))


    function tooltipPosition(point) {
        const tooltipElement = d3.select(tooltip.current)
        const {width: tooltipWidth} = tooltipElement.node().getBoundingClientRect()

        const xPos = x(data[point].date) + tooltipWidth < width ?
                            x(data[point].date) + tooltipWidth / 2 + 15 :
                            x(data[point].date) - tooltipWidth / 2 - 15 

        tooltipElement.attr("transform", `translate(${xPos},${y(data[point].value)})`)
    }
      

    const bisect = d3.bisector(d => d.date).center
    
    function pointermoved(event) {
        d3.select(divTooltip.current)
        .style("display", "block")

        const i = bisect(data, x.invert(d3.pointer(event)[0]))

        d3.select(tooltip.current)
            .style("display", null)
            .attr("transform", `translate(${x(data[i].date) + 100}, ${y(data[i].value)})`)

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
                    .data([data[i].date.toLocaleString(), data[i].value])
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
    }

    return (
        <svg 
            width = {width} 
            height = {height}
            onMouseEnter = {pointermoved}    
            onMouseMove = {pointermoved}    
            onMouseLeave = {pointerleft}    
        >   
            <g transform={`translate(15,-15)`}>
                <defs>
                    <linearGradient id="AreaFill" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop stopColor="#0F4D74" stopOpacity="0.3" offset="0%" />
                        <stop stopColor="#0E75B5" stopOpacity="0.3" offset="100%" />
                    </linearGradient>
                </defs>

                <g className={'axis'} ref={gx} style={{fontSize: '14px', fontFamily: 'Segoe UI Symbol'}} transform={`translate(0,${height - marginBottom + 15})`} />
                <g className={'axis'} ref={gy} style={{fontSize: '14px', fontFamily: 'Segoe UI Symbol'}} transform={`translate(${marginLeft - 15},0)`} />

                <path fill="url(#AreaFill)" strokeWidth="3" d={area(data)}/>

                <path ref={graphicLine} fill="none" stroke="#0e75b5" strokeWidth="3" d={line(data)}/>

                <g ref={dots}></g>

                <g fill="white" stroke="currentColor" strokeWidth="2">
                    {data.map((d, i) => (<circle key={i} cx={x(i)} cy={y(d)} r="2.5" />))}
                </g>

                <g ref={tooltip} style={{
                        fontSize: '14px', 
                        fontFamily: 'Segoe UI Symbol'
                    }}></g>
            </g>
        </svg>
    )
}


export {
    LinePlot
}