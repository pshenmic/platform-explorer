import { useState, forwardRef } from 'react'
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

const TimeframeMenu = forwardRef(function TimeframeMenu ({ config, changeCallback, className }, ref) {
  const [timespan, setTimespan] = useState(chartConfig.timespan.values[chartConfig.timespan.defaultIndex])
  const [selectedRange, setSelectedRange] = useState(null)
  const [calendarValue, setCalendarValue] = useState(null)

  const changeHandler = (value) => {
    setTimespan(value)
    if (typeof changeCallback === 'function') changeCallback(value)
  }

  const calendarHandler = (value) => {
    setCalendarValue(value)
    const [start, end] = value
    setSelectedRange({ start, end })
  }

  const clearCalendarRange = () => {
    setSelectedRange(null)
    setCalendarValue([null, null])
  }

  const calendarSubmit = () => {
    if (!selectedRange.start || !selectedRange.end) return

    function formatDate (date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяц начинается с 0, поэтому прибавляем 1
      const year = date.getFullYear();
    
      return `${day}.${month}.${year}`;
    }

    const label = `${formatDate(selectedRange.start)} - ${formatDate(selectedRange.end)}`
    
    changeHandler({
      label,
      range: {
        start: selectedRange.start.toISOString(),
        end: selectedRange.end.toISOString()
      }
    })
  }

  return (
    <div ref={ref} className={`TimeframeMenu ${className || ''}`}>
      <div className={'TimeframeMenu__ValuesContainer'}>
        <div className={'TimeframeMenu__ValuesTitle'}>
          Select a day, period or Timeframe:
        </div>

        <div className={'TimeframeMenu__Values'}>
          {config.timespan.values.map((iTimespan, i) => (
            <Button
              className={`TimeframeMenu__ValueButton ${iTimespan.label === timespan.label ? 'TimeframeMenu__ValueButton--Active' : ''}`}
              onClick={() => {
                changeHandler(iTimespan)
                clearCalendarRange()
              }}
              key={i}
              size={'xs'}
            >
              {iTimespan.label}
            </Button>
          ))}
          {selectedRange && (
            <Button
              className={'TimeframeMenu__ValueButton'}
              onClick={calendarSubmit}
              size={'xs'}
            >
              ok
            </Button>
          )}
        </div>
      </div>

      <div className={'TimeframeMenu__Calendar'}>
        <DateRangePicker
          disableFutureDates={true}
          monthsToShow={7}
          noTopNavigation={true}
          noWeekDay={true}
          changeHandler={calendarHandler}
          value={calendarValue}
        />
      </div>
    </div>
  )
})

export default TimeframeMenu
