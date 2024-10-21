import { useState, useEffect, forwardRef } from 'react'
import { Button } from '@chakra-ui/react'
import { DateRangePicker } from '../calendar'
import './TimeframeMenu.scss'

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

const TimeframeMenu = forwardRef(function TimeframeMenu ({ config, isActive, changeCallback, openStateCallback, className }, ref) {
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

  const calendarHandler = (value) => {}

  return (
    <div ref={ref} className={`TimeframeMenu ${className || ''}`}>
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

      <div className={'TimeframeMenu__Calendar TimeframeMenu__Calendar--Stub'}>
        <DateRangePicker
          disableFutureDates={true}
          monthsToShow={7}
          noTopNavigation={true}
          noWeekDay={true}
          changeHandler={calendarHandler}
        />
      </div>
    </div>
  )
})

export default TimeframeMenu
