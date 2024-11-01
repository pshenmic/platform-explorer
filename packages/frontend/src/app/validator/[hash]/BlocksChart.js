import { useState, useEffect, useRef } from 'react'
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

    Api.getBlocksStatsByValidator(hash, start, end)
      .then(res => fetchHandlerSuccess(setBlocksHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setBlocksHistory, err))
  }, [timespan, customRange])

  useEffect(() => {
    if (menuIsOpen && TimeframeMenuRef.current) {
      const element = TimeframeMenuRef.current
      const height = element.getBoundingClientRect().height
      setSelectorHeight(height)
    } else {
      setSelectorHeight(0)
    }
  }, [menuIsOpen, TimeframeMenuRef])

  const handleDateChange = (start, end) => {
    setCustomRange({ start, end })
    setTimespan(chartConfig.timespan.values[4])
  }

  if (blocksHistory.error || (!blocksHistory.loading && !blocksHistory.data?.resultSet)) {
    return (<ErrorMessageBlock/>)
  }

  return (
    <div style={{ height: menuIsOpen ? `${Math.max(selectorHeight, 350)}px` : '350px' }} className={'TabsChart'}>
      {!blocksHistory.loading &&
        <TimeframeSelector
          menuRef={TimeframeMenuRef}
          className={'TabsChart__TimeframeSelector'}
          config={chartConfig}
          changeCallback={setTimespan}
          isActive={isActive}
          openStateCallback={setMenuIsOpen}
          customRangeCallback={handleDateChange}
        />
      }
      <div className={`TabsChart__ChartContiner ${menuIsOpen ? 'TabsChart__ChartContiner--Hidden' : ''}`}>
        <LineChart
          data={blocksHistory.data?.resultSet?.map((item) => ({
            x: new Date(item.timestamp),
            y: item.data.blocksCount
          })) || []}
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
        />
      </div>
    </div>
  )
}
