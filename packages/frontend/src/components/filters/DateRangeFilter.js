// import { SubmitButton } from '../ui/forms'
import { DateRangePicker } from '../calendar'
// import FilterActions from './FilterActions'
import { useEffect, useState } from 'react'
import { Button } from '@chakra-ui/react'
import { defaultChartConfig, defaultIntervalsCount } from '../charts/config'
import './DateRangeFilter.scss'
import './RangeFilter.scss'

export const DateRangeFilter = ({
  value = { start: null, end: null },
  onChange,
  // showSubmitButton = false,
  onSubmit,
  config = defaultChartConfig
}) => {
  const [timespan, setTimespan] = useState(config.timespan.values[config.timespan.defaultIndex])
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

    changeHandler({
      label,
      range: {
        start: selectedRange.start.toISOString(),
        end: selectedRange.end.toISOString()
      },
      intervalsCount: defaultIntervalsCount
    })

    onSubmit()
  }

  useEffect(() => {

    onChange(selectedRange)
    console.log('selectedRange', selectedRange)
  }, [selectedRange])

  return (
    <div className={'DateRangeFilter'}>
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

      <DateRangePicker
        disableFutureDates={true}
        monthsToShow={7}
        noTopNavigation={true}
        noWeekDay={true}
        changeHandler={calendarHandler}
        value={calendarValue}
      />

      {/*{showSubmitButton && (*/}
      {/*  <FilterActions className={'RangeFilter__Actions'}>*/}
      {/*    <SubmitButton onSubmit={onSubmit}/>*/}
      {/*  </FilterActions>*/}
      {/*)}*/}
    </div>
  )
}
