import { useState, forwardRef, useEffect } from 'react'
import { Button } from '@chakra-ui/react'
import { DateRangePicker } from '../calendar'
import { getDaysBetweenDates } from '../../util'
import './TimeframeMenu.scss'

const TimeframeMenu = forwardRef(function TimeframeMenu ({ config, forceTimespan, changeCallback, className }, ref) {
  const [timespan, setTimespan] = useState(config.timespan.values[config.timespan.defaultIndex])
  const [selectedRange, setSelectedRange] = useState(null)
  const [calendarValue, setCalendarValue] = useState(null)

  useEffect(() => setTimespan(forceTimespan), [forceTimespan])

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

  const submitHandler = () => {
    if (!selectedRange?.start || !selectedRange?.end) {
      if (typeof changeCallback === 'function') changeCallback(timespan)
      return
    }

    function labelFormatDate (date) {
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()

      return `${day}.${month}.${year}`
    }

    const label = `${labelFormatDate(selectedRange.start)} - ${labelFormatDate(selectedRange.end)}`

    const intervalsCount = (() => {
      const daysRange = getDaysBetweenDates(selectedRange.start, selectedRange.end)

      if (daysRange > 25) return Math.min(daysRange, 100)
      if (daysRange > 14) return Math.min(daysRange * 2, 100)
      if (daysRange > 7) return Math.min(daysRange * 4, 100)
      if (daysRange > 2) return Math.min(daysRange * 11, 100)
      return 24
    })()

    changeHandler({
      label,
      range: {
        start: selectedRange.start.toISOString(),
        end: selectedRange.end.toISOString()
      },
      intervalsCount
    })
  }

  return (
    <div ref={ref} className={`TimeframeMenu ${className || ''}`}>
      <div className={'TimeframeMenu__ValuesContainer'}>
        <div className={'TimeframeMenu__Values'}>
          {config.timespan.values.map((iTimespan, i) => (
            <Button
              className={`TimeframeMenu__ValueButton ${iTimespan.label === timespan?.label ? 'TimeframeMenu__ValueButton--Active' : ''}`}
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
            <Button
              className={'TimeframeMenu__ValueButton'}
              onClick={submitHandler}
              size={'xs'}
              variant={'customGreen'}
            >
              ok
            </Button>
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
