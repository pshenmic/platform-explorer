import { useState, useEffect, useRef } from 'react'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { LineChart, TimeframeMenu } from './../../../components/charts'
import * as Api from '../../../util/Api'
import { Button } from '@chakra-ui/react'
import { CalendarIcon } from './../../../components/ui/icons'
import { ErrorMessageBlock } from '../../../components/Errors'
import './TimeframeSelector.scss'
import './TabsChart.scss'

function getDaysBetweenDates(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffInMilliseconds = Math.abs(end - start)
  const daysDifference = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24))
  return daysDifference
}

const getDynamicRange = (duration) => {
  const now = new Date()
  const end = now.toISOString()
  const start = new Date(now - duration).toISOString()
  return { start, end }
}

const chartConfig = {
  timespan: {
    defaultIndex: 3,
    values: [
      {
        label: '1 hour',
        range: getDynamicRange(60 * 60 * 1000)
      },
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
      }
    ]
  }
}

const TimeframeSelector = ({ config, isActive, changeCallback, openStateCallback, menuRef }) => {
  const [timespan, setTimespan] = useState(chartConfig.timespan.values[chartConfig.timespan.defaultIndex])
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  const changeHandler = (value) => {
    setTimespan(value)
    if (typeof changeCallback === 'function') changeCallback(value)
    setMenuIsOpen(false)
  }

  useEffect(() => {
    if (!isActive) setMenuIsOpen(false)
  }, [isActive])

  useEffect(() => {
    if (typeof openStateCallback === 'function') openStateCallback(menuIsOpen)
  }, [menuIsOpen])

  return (
    <div className={`TimeframeSelector ${menuIsOpen ? 'TimeframeSelector--MenuActive' : ''}`}>
      <TimeframeMenu
        ref={menuRef}
        className={'TimeframeSelector__Menu'}
        config={config}
        changeCallback={changeHandler}
      />

      <Button
        className={`TimeframeSelector__Button ${menuIsOpen ? 'TimeframeSelector__Button--Active' : ''}`}
        onClick={() => setMenuIsOpen(state => !state)}
      >
        <CalendarIcon mr={'10px'}/>
        {timespan.label}
      </Button>
    </div>
  )
}

export default function BlocksChart ({ hash, isActive }) {
  const [blocksHistory, setBlocksHistory] = useState({ data: {}, loading: true, error: false })
  const [timespan, setTimespan] = useState(chartConfig.timespan.values[chartConfig.timespan.defaultIndex])
  const [customRange, setCustomRange] = useState({ start: null, end: null })
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const TimeframeMenuRef = useRef(null)
  const [selectorHeight, setSelectorHeight] = useState(0)

  useEffect(() => {
    const { start, end } = timespan.range

    Api.getBlocksStatsByValidator(hash, start, end)
      .then(res => fetchHandlerSuccess(setBlocksHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setBlocksHistory, err));
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
    setCustomRange({ start, end });
    setTimespan(chartConfig.timespan.values[4]); // Выбираем кастомный диапазон
  };

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
