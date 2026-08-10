'use client'

import { useState, useEffect, useRef } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { LineChart, TimeframeSelector } from './'
import { ErrorMessageBlock } from '../Errors'
import { defaultChartConfig } from './config'
import type {
  ChartAxis,
  ChartConfig,
  ChartDataPoint,
  TimespanValue
} from './types'
import './TabsChartBlock.scss'

interface TabsChartBlockProps {
  menuIsActive?: boolean
  timespanChangeCallback?: (value: TimespanValue) => void
  loading?: boolean
  error?: boolean
  data?: ChartDataPoint[] | null
  xAxis?: ChartAxis
  yAxis?: ChartAxis
  timespan?: TimespanValue
  chartConfig?: ChartConfig
  heightPx?: number
}

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
}: TabsChartBlockProps) {
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const TimeframeMenuRef = useRef<HTMLDivElement>(null)
  const [selectorHeight, setSelectorHeight] = useState(0)

  const updateMenuHeight = () => {
    if (menuIsOpen && TimeframeMenuRef?.current) {
      const element = TimeframeMenuRef.current
      const h = element.getBoundingClientRect().height
      setSelectorHeight(h)
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
          data={data ?? undefined}
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
