import { useState, useEffect, useRef } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { fetchHandlerSuccess, fetchHandlerError, getDaysBetweenDates, getDynamicRange } from '../../../util'
import { LineChart, TimeframeSelector } from './../../../components/charts'
import * as Api from '../../../util/Api'
import { ErrorMessageBlock } from '../../../components/Errors'

const chartConfig = {
  timespan: {
    defaultIndex: 3,
    values: [
      {
        label: '24 hours',
        range: getDynamicRange(24 * 60 * 60 * 1000)
      },
      {
        label: '3 days',
        range: getDynamicRange(3 * 24 * 60 * 60 * 1000)
      },
      {
        label: '1 week',
        range: getDynamicRange(7 * 24 * 60 * 60 * 1000)
      },
      {
        label: '1 Month',
        range: getDynamicRange(30 * 24 * 60 * 60 * 1000)
      }
    ]
  }
}

export default function BlocksChart ({ hash, isActive }) {
  const [blocksHistory, setBlocksHistory] = useState({ data: {}, loading: true, error: false })
  const [timespan, setTimespan] = useState(chartConfig.timespan.values[chartConfig.timespan.defaultIndex])
  const [customRange, setCustomRange] = useState({ start: null, end: null })
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const TimeframeMenuRef = useRef(null)
  const [selectorHeight, setSelectorHeight] = useState(0)

  useEffect(() => {
    const { start = null, end = null } = timespan.range
    if (!start || !end) return

    setBlocksHistory(state => ({ ...state, loading: true }))

    Api.getBlocksStatsByValidator(hash, start, end)
      .then(res => fetchHandlerSuccess(setBlocksHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setBlocksHistory, err))
  }, [timespan, customRange])

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

  if (blocksHistory.error || (!blocksHistory.loading && !blocksHistory.data?.resultSet)) {
    return (<ErrorMessageBlock/>)
  }

  return (
    <div style={{ height: menuIsOpen ? `${Math.max(selectorHeight, 350)}px` : '350px' }} className={'TabsChart'}>
      <TimeframeSelector
        menuRef={TimeframeMenuRef}
        className={'TabsChart__TimeframeSelector'}
        config={chartConfig}
        changeCallback={setTimespan}
        isActive={isActive}
        openStateCallback={setMenuIsOpen}
        customRangeCallback={(start, end) => setCustomRange({ start, end })}
      />
      <div className={`TabsChart__ChartContiner ${menuIsOpen ? 'TabsChart__ChartContiner--Hidden' : ''}`}>
        <LineChart
          data={blocksHistory.data?.resultSet?.map((item) => ({
            x: new Date(item.timestamp),
            y: item.data.blocksCount
          })) || []}
          dataLoading={blocksHistory.loading}
          timespan={timespan.range}
          xAxis={{
            type: (() => {
              if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 7) return { axis: 'date' }
              if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 3) return { axis: 'date', tooltip: 'datetime' }
              return { axis: 'time' }
            })()
          }}
          yAxis={{
            type: 'number',
            abbreviation: 'blocks'
          }}
          height={'350px'}
        />
      </div>
    </div>
  )
}
