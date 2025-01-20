'use client'

import { useState, useEffect, useRef } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { LineChart, TimeframeSelector } from './'
import { ErrorMessageBlock } from '../Errors'
import { defaultChartConfig } from './config'
import './TabsChartBlock.scss'

export default function TabsChartBlock ({
  menuIsActive = true,
  timespanChangeCallback,
  loading,
  error,
  data,
  xAxis,
  yAxis,
  timespan,
  chartConfig = defaultChartConfig,
  heightPx = 350
}) {
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const TimeframeMenuRef = useRef(null)
  const [selectorHeight, setSelectorHeight] = useState(0)

  const updateMenuHeight = () => {
    if (menuIsOpen && TimeframeMenuRef?.current) {
      const element = TimeframeMenuRef.current
      const height = element.getBoundingClientRect().height
      setSelectorHeight(height)
    } else {
      setSelectorHeight(0)
    }
  }

  useEffect(updateMenuHeight, [menuIsOpen, TimeframeMenuRef])

  useResizeObserver(TimeframeMenuRef, updateMenuHeight)

  if (error || (!loading && !data)) {
    return (<ErrorMessageBlock h={`${heightPx}px`}/>)
  }

  return (
    <div
      className={'TabsChartBlock'}
      style={{ height: menuIsOpen ? `${Math.max(selectorHeight, heightPx)}px` : `${heightPx}px` }}
    >
      <TimeframeSelector
        menuRef={TimeframeMenuRef}
        className={'TabsChartBlock__TimeframeSelector'}
        config={chartConfig}
        changeCallback={timespanChangeCallback}
        forceTimespan={timespan}
        menuIsActive={menuIsActive}
        openStateCallback={setMenuIsOpen}
      />
      <div className={`TabsChartBlock__ChartContainer ${menuIsOpen ? 'TabsChartBlock__ChartContainer--Hidden' : ''}`}>
        <LineChart
          data={data}
          dataLoading={loading}
          timespan={timespan}
          xAxis={xAxis}
          yAxis={yAxis}
          height={`${heightPx}px`}
        />
      </div>
    </div>
  )
}
