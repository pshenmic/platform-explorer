// import { SubmitButton } from '../ui/forms'
import { DateRangePicker } from '../calendar'
// import FilterActions from './FilterActions'
import { useEffect, useState } from 'react'
import { Button } from '@chakra-ui/react'
import { defaultChartConfig } from '../charts/config'
import './DateRangeFilter.scss'
import './RangeFilter.scss'

export const DateRangeFilter = ({
  value = { start: null, end: null },
  onChange,
  // showSubmitButton = false,
  onSubmit,
  config = defaultChartConfig
}) => {
  const [timespan, setTimespan] = useState(null)
  const [selectedRange, setSelectedRange] = useState(null)
  const [calendarValue, setCalendarValue] = useState(null)

  const timeframeButtonHandler = (value) => {
    setTimespan(value)

    setSelectedRange({
      start: value?.range?.start ? new Date(value.range.start) : null,
      end: value?.range?.end ? new Date(value.range.end) : null
    })
  }

  const calendarHandler = (value) => {
    setCalendarValue(value)
    setTimespan(null)
    const [start, end] = value
    setSelectedRange({ start, end })
  }

  useEffect(() => {
    onChange(selectedRange)
  }, [selectedRange])

  useEffect(() => {
    const formatedValue = [
      value?.start || null,
      value?.end || null
    ]

    if (JSON.stringify(formatedValue) !== JSON.stringify(calendarValue)) {
      setCalendarValue(formatedValue)
    }
  }, [value])

  return (
    <div className={'DateRangeFilter'}>
      <div className={'TimeframeMenu__ValuesContainer'}>
        <div className={'TimeframeMenu__Values'}>
          {config.timespan.values.map((iTimespan, i) => (
            <Button
              className={`TimeframeMenu__ValueButton ${iTimespan.label === timespan?.label ? 'TimeframeMenu__ValueButton--Active' : ''}`}
              onClick={() => timeframeButtonHandler(iTimespan)}
              key={i}
              size={'xs'}
            >
              {iTimespan.label}
            </Button>
          ))}
          <Button
            className={'TimeframeMenu__ValueButton'}
            onClick={onSubmit}
            size={'xs'}
            variant={'customGreen'}
          >
            ok
          </Button>
        </div>
      </div>

      <DateRangePicker
        disableFutureDates={true}
        monthsToShow={7}
        noTopNavigation={true}
        noWeekDay={true}
        changeHandler={calendarHandler}
        value={calendarValue}
      />
    </div>
  )
}
