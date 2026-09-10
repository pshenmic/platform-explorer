'use client'

import { DateRangePicker } from '../calendar'
import { useEffect, useState } from 'react'
import { Button } from '@chakra-ui/react'
import { defaultChartConfig } from '../charts/config'
import type { ChartConfig, TimespanValue } from '../charts/types'
import type { DateRangeFilterValue } from './types'
import './DateRangeFilter.css'
import './RangeFilter.css'

type CalendarRange = [Date | null, Date | null]

interface DateRangeFilterProps {
  value?: DateRangeFilterValue
  onChange: (value: DateRangeFilterValue | null) => void
  onSubmit?: () => void
  config?: ChartConfig
}

function sameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (a == null && b == null) return true
  if (a == null || b == null) return false
  return a.getTime() === b.getTime()
}

function sameRange(
  a: DateRangeFilterValue | null | undefined,
  b: DateRangeFilterValue | null | undefined
): boolean {
  return sameDay(a?.start, b?.start) && sameDay(a?.end, b?.end)
}

/**
 * Date range filter panel.
 * Calls onChange only from user actions (not from useEffect) to avoid
 * Filters menuData remount loops / Maximum update depth.
 */
export const DateRangeFilter = ({
  value = { start: null, end: null },
  onChange,
  onSubmit,
  config = defaultChartConfig
}: DateRangeFilterProps) => {
  const [timespan, setTimespan] = useState<TimespanValue | null>(null)
  const [calendarValue, setCalendarValue] = useState<CalendarRange>([
    value?.start ?? null,
    value?.end ?? null
  ])

  // Sync from parent when applied filters change (open menu snapshot) — do not call onChange here
  useEffect(() => {
    setCalendarValue(prev => {
      const next: CalendarRange = [value?.start ?? null, value?.end ?? null]
      if (sameDay(prev[0], next[0]) && sameDay(prev[1], next[1])) return prev
      return next
    })
  }, [value?.start, value?.end])

  const emitChange = (next: DateRangeFilterValue | null) => {
    if (sameRange(next, value)) return
    onChange(next)
  }

  const timeframeButtonHandler = (timespanValue: TimespanValue) => {
    setTimespan(timespanValue)
    const next: DateRangeFilterValue = {
      start: timespanValue?.range?.start ? new Date(timespanValue.range.start) : null,
      end: timespanValue?.range?.end ? new Date(timespanValue.range.end) : null
    }
    setCalendarValue([next.start ?? null, next.end ?? null])
    emitChange(next)
  }

  const calendarHandler = (nextValue: Date | null | CalendarRange) => {
    const range = (Array.isArray(nextValue) ? nextValue : [nextValue, null]) as CalendarRange
    setCalendarValue(range)
    setTimespan(null)
    emitChange({ start: range[0], end: range[1] })
  }

  return (
    <div className={'DateRangeFilter'}>
      <div className={'DateRangeFilter__ValuesContainer'}>
        <div className={'DateRangeFilter__ValuesTitle'}>Select a day, period or Timeframe:</div>
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
