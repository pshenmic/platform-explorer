import { DateRangePicker } from '../calendar'
import { useEffect, useState } from 'react'
import { Button } from '@chakra-ui/react'
import { defaultChartConfig } from '../charts/config'
import type { ChartConfig, TimespanValue } from '../charts/types'
import type { DateRangeFilterValue } from './types'
import './DateRangeFilter.scss'
import './RangeFilter.scss'

type CalendarRange = [Date | null, Date | null]

interface DateRangeFilterProps {
  value?: DateRangeFilterValue
  onChange: (value: DateRangeFilterValue | null) => void
  onSubmit?: () => void
  config?: ChartConfig
}

export const DateRangeFilter = ({
  value = { start: null, end: null },
  onChange,
  onSubmit,
  config = defaultChartConfig
}: DateRangeFilterProps) => {
  const [timespan, setTimespan] = useState<TimespanValue | null>(null)
  const [selectedRange, setSelectedRange] = useState<DateRangeFilterValue | null>(null)
  const [calendarValue, setCalendarValue] = useState<CalendarRange | null>(null)

  const timeframeButtonHandler = (timespanValue: TimespanValue) => {
    setTimespan(timespanValue)
    setSelectedRange({
      start: timespanValue?.range?.start ? new Date(timespanValue.range.start) : null,
      end: timespanValue?.range?.end ? new Date(timespanValue.range.end) : null
    })
  }

  const calendarHandler = (nextValue: Date | null | CalendarRange) => {
    const range = Array.isArray(nextValue) ? nextValue : [nextValue, null] as CalendarRange
    setCalendarValue(range)
    setTimespan(null)
    const [start, end] = range
    setSelectedRange({ start, end })
  }

  useEffect(() => {
    onChange(selectedRange)
  }, [selectedRange, onChange])

  useEffect(() => {
    const formatedValue: CalendarRange = [
      value?.start || null,
      value?.end || null
    ]

    if (JSON.stringify(formatedValue) !== JSON.stringify(calendarValue)) {
      setCalendarValue(formatedValue)
    }
  }, [value, calendarValue])

  return (
    <div className={'DateRangeFilter'}>
      <div className={'DateRangeFilter__ValuesContainer'}>
        <div className={'DateRangeFilter__ValuesTitle'}>
          Select a day, period or Timeframe:
        </div>
        <div className={'DateRangeFilter__Values'}>
          {config.timespan.values.map((iTimespan, i) => (
            <Button
              className={`DateRangeFilter__ValueButton ${iTimespan.label === timespan?.label ? 'DateRangeFilter__ValueButton--Active' : ''}`}
              onClick={() => timeframeButtonHandler(iTimespan)}
              key={i}
              size={'xs'}
            >
              {iTimespan.label}
            </Button>
          ))}
          <Button
            className={'DateRangeFilter__ValueButton DateRangeFilter__ValueButton--Submit'}
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
        noTopNavigation={true}
        noWeekDay={true}
        changeHandler={calendarHandler}
        value={calendarValue}
      />
    </div>
  )
}
