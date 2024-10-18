import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { useState, useEffect } from 'react'
import { LineChart } from './../../../components/charts'
import * as Api from '../../../util/Api'
import { Button } from '@chakra-ui/react'
import { CalendarIcon } from './../../../components/ui/icons'
import { ErrorMessageBlock } from '../../../components/Errors'
import { DateRangePicker } from '../../../components/calendar'
import './TimeframeSelector.scss'
import './TimeframeMenu.scss'
import './TabsChart.scss'

const chartConfig = {
  timespan: {
    defaultIndex: 3,
    values: [
      {
        label: '1 hour',
        range: '1h'
      },
      {
        label: '24 hours',
        range: '24h'
      },
      {
        label: '3 days',
        range: '3d'
      },
      {
        label: '1 week',
        range: '1w'
      }
    ]
  }
}

const TimeframeSelector = ({ config, isActive, changeCallback, openStateCallback }) => {
  const [timespan, setTimespan] = useState(chartConfig.timespan.values[chartConfig.timespan.defaultIndex])
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  const changeHandler = (value) => {
    setTimespan(value)
    if (typeof changeCallback === 'function') changeCallback(value)
  }

  useEffect(() => {
    if (!isActive) setMenuIsOpen(false)
  }, [isActive])

  useEffect(() => {
    if (typeof openStateCallback === 'function') openStateCallback(menuIsOpen)
  }, [menuIsOpen])

  const calendarHandler = (value) => {
    // console.log('calendarHandler', value)
  }

  return (
    <div className={`TimeframeSelector ${menuIsOpen ? 'TimeframeSelector--MenuActive' : ''}`}>
      <div className={'TimeframeSelector__Menu TimeframeMenu'}>
        <div className={'TimeframeMenu__ValuesContainer'}>
          <div className={'TimeframeMenu__ValuesTitle'}>
            Select a day, period or Timeframe:
          </div>

          <div className={'TimeframeMenu__Values'}>
            {config.timespan.values.map((iTimespan, i) => (
              <Button
                className={`TimeframeMenu__ValueButton ${iTimespan.range === timespan.range ? 'TimeframeMenu__ValueButton--Active' : ''}`}
                onClick={() => {
                  changeHandler(iTimespan)
                  setMenuIsOpen(false)
                }}
                key={i}
                size={'xs'}
              >
                {iTimespan.label}
              </Button>
            ))}
          </div>
        </div>

        <div className={'TimeframeMenu__Calendar'}>
          <DateRangePicker
            disableFutureDates={true}
            monthsToShow={7}
            noTopNavigation={true}
            noWeekDay={true}
            changeHandler={calendarHandler}
          />
        </div>
      </div>

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
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  useEffect(() => {
    Api.getBlocksStatsByValidator(hash, timespan.range)
      .then(res => fetchHandlerSuccess(setBlocksHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setBlocksHistory, err))
  }, [timespan])

  if (blocksHistory.error || (!blocksHistory.loading && !blocksHistory.data?.resultSet)) {
    return (<ErrorMessageBlock/>)
  }

  return (
    <div style={{ height: menuIsOpen ? '400px' : '350px' }} className={'TabsChart'}>
      {!blocksHistory.loading &&
        <TimeframeSelector
          className={'TabsChart__TimeframeSelector'}
          config={chartConfig}
          changeCallback={setTimespan}
          isActive={isActive}
          openStateCallback={setMenuIsOpen}
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
              if (timespan.range === '1h') return { axis: 'time' }
              if (timespan.range === '24h') return { axis: 'time' }
              if (timespan.range === '3d') return { axis: 'date', tooltip: 'datetime' }
              if (timespan.range === '1w') return { axis: 'date' }
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
