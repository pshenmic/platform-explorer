'use client'

import { DateRangePicker } from '../calendar'
import { useEffect, useState } from 'react'
import { defaultChartConfig } from '../charts/config'
import { getDynamicRange } from '../../util'
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
  compact?: boolean
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
  return sameDay(a?.start, b?.start) && sameDay(a?.end, b?.end) && (a?.mode ?? 'days') === (b?.mode ?? 'days')
}

export const DateRangeFilter = ({
  value = { start: null, end: null },
  onChange,
  onSubmit,
  config = defaultChartConfig,
  compact = false
}: DateRangeFilterProps) => {
  const [timespan, setTimespan] = useState<TimespanValue | null>(null)
  const [calendarValue, setCalendarValue] = useState<CalendarRange>([
    value?.start ?? null,
    value?.end ?? null
  ])

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
    const rolling =
      typeof timespanValue.durationMs === 'number'
        ? getDynamicRange(timespanValue.durationMs)
        : timespanValue.range
    const next: DateRangeFilterValue = {
      start: rolling?.start ? new Date(rolling.start) : null,
      end: rolling?.end ? new Date(rolling.end) : null,
      mode: 'rolling'
    }
    setCalendarValue([next.start ?? null, next.end ?? null])
    emitChange(next)
  }

  const calendarHandler = (nextValue: Date | null | CalendarRange) => {
    const range = (Array.isArray(nextValue) ? nextValue : [nextValue, null]) as CalendarRange
    setCalendarValue(range)
    setTimespan(null)
    if (range[0] && range[1]) {
      emitChange({ start: range[0], end: range[1], mode: 'days' })
    } else if (!range[0] && !range[1]) {
      emitChange(null)
    }
  }

  const clearHandler = () => {
    setTimespan(null)
    setCalendarValue([null, null])
    emitChange(null)
  }

  const canClear = Boolean(calendarValue[0] || calendarValue[1] || value?.start || value?.end)

  return (
    <div className={`DateRangeFilter${compact ? ' DateRangeFilter--Compact' : ''}`}>
      <div className={'DateRangeFilter__ValuesContainer'}>
        {!compact && (
          <div className={'DateRangeFilter__ValuesTitle'}>Select a day, period or Timeframe:</div>
        )}
        <div className={'DateRangeFilter__Values'}>
          {config.timespan.values.map((iTimespan, i) => (
            <button
              type={'button'}
              className={`DateRangeFilter__ValueButton ${iTimespan.label === timespan?.label ? 'DateRangeFilter__ValueButton--Active' : ''}`}
              onClick={() => timeframeButtonHandler(iTimespan)}
              key={i}
            >
              {iTimespan.label}
            </button>
          ))}
          {!compact && onSubmit && (
            <button
              type={'button'}
              className={'DateRangeFilter__ValueButton DateRangeFilter__ValueButton--Submit'}
              onClick={onSubmit}
            >
              ok
            </button>
          )}
        </div>
      </div>

      <DateRangePicker
        disableFutureDates={true}
        noTopNavigation={!compact}
        noWeekDay={!compact}
        compact={compact}
        showSingleCalendar={compact}
        changeHandler={calendarHandler}
        value={calendarValue}
      />

      <button
        type={'button'}
        className={'DateRangeFilter__ClearLink'}
        onClick={clearHandler}
        disabled={!canClear}
      >
        Clear
      </button>
    </div>
  )
}
