'use client'

import { useState, useEffect } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { ChevronIcon } from '../ui/icons'
import type { WithClassName } from '../../types/common'
import './DateRangePicker.css'

type CalendarRange = [Date | null, Date | null]
type CalendarValue = Date | null | CalendarRange

interface MonthPair {
  start1: Date
  end2: Date
  label: string
  labelShort: string
}

interface DateRangePickerProps extends WithClassName {
  disableFutureDates?: boolean
  noTopNavigation?: boolean
  noWeekDay?: boolean
  changeHandler?: (dates: CalendarValue) => void
  value?: CalendarRange | null
  showSingleCalendar?: boolean
  monthsToShow?: number
  compact?: boolean
}

function toRange(value: CalendarRange | null | undefined): DateRange | undefined {
  if (!value?.[0] && !value?.[1]) return undefined
  return { from: value[0] ?? undefined, to: value[1] ?? undefined }
}

function sameCalendarDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function toTuple(range: DateRange | undefined): CalendarRange {
  const from = range?.from ?? null
  const to = range?.to ?? null
  if (from && to && from.getTime() > to.getTime()) return [to, from]
  return [from, to]
}

const dayPickerClassNames = {
  root: 'DateRangePicker__Root',
  months: 'DateRangePicker__Months',
  month: 'DateRangePicker__Month',
  month_caption: 'DateRangePicker__Caption',
  month_grid: 'DateRangePicker__Grid',
  weekdays: 'DateRangePicker__Weekdays',
  weekday: 'DateRangePicker__Weekday',
  weeks: 'DateRangePicker__Weeks',
  week: 'DateRangePicker__Week',
  day: 'DateRangePicker__Day',
  day_button: 'DateRangePicker__DayBtn',
  selected: 'DateRangePicker__Day--Selected',
  range_start: 'DateRangePicker__Day--RangeStart',
  range_end: 'DateRangePicker__Day--RangeEnd',
  range_middle: 'DateRangePicker__Day--RangeMiddle',
  today: 'DateRangePicker__Day--Today',
  outside: 'DateRangePicker__Day--Outside',
  disabled: 'DateRangePicker__Day--Disabled',
  hidden: 'DateRangePicker__Day--Hidden',
  nav: 'DateRangePicker__Nav',
  button_previous: 'DateRangePicker__NavBtn',
  button_next: 'DateRangePicker__NavBtn',
  chevron: 'DateRangePicker__NavChevron',
  caption_label: 'DateRangePicker__CaptionLabel'
}

const DateRangePicker = ({
  disableFutureDates = false,
  noTopNavigation,
  noWeekDay,
  changeHandler,
  className,
  value,
  showSingleCalendar,
  monthsToShow = 12,
  compact = false
}: DateRangePickerProps) => {
  const single = compact || showSingleCalendar
  const today = new Date()
  const [range, setRange] = useState<CalendarRange>(value ?? [null, null])
  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    disableFutureDates ? (single ? -monthsToShow : -monthsToShow + 1) : 0
  )
  const [activeStartDate, setActiveStartDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth() - (single ? 0 : 1), 1)
  )
  const [monthPairs, setMonthPairs] = useState<MonthPair[]>([])

  useEffect(() => {
    const months: MonthPair[] = []
    const step = single ? 1 : 2
    for (let i = 0; i < monthsToShow; i += step) {
      const date1 = new Date(today.getFullYear(), today.getMonth() + currentMonthIndex + i, 1)
      const date2 = new Date(today.getFullYear(), today.getMonth() + currentMonthIndex + i + 1, 1)
      months.push({
        start1: new Date(date1.getFullYear(), date1.getMonth(), 1),
        end2: new Date(date2.getFullYear(), date2.getMonth() + 1, 0),
        label: `${date1.toLocaleString('en-US', { month: 'long', year: 'numeric' })} - ${date2.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
        labelShort: `${date1.toLocaleString('en-US', { month: 'short' })}-${date2.toLocaleString('en-US', { month: 'short' })}`
      })
    }
    setMonthPairs(months)
  }, [monthsToShow, currentMonthIndex, single])

  useEffect(() => {
    if (!value) {
      setRange([null, null])
      return
    }
    setRange(value)
  }, [value])

  const displayedLeft = activeStartDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const displayedRight = new Date(
    activeStartDate.getFullYear(),
    activeStartDate.getMonth() + 1,
    1
  ).toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const onSelect = (next: DateRange | undefined, triggerDate: Date) => {
    let resolved = next
    if (range[0] && !range[1] && sameCalendarDay(range[0], triggerDate)) {
      resolved = { from: range[0], to: range[0] }
    }
    const tuple = toTuple(resolved)
    setRange(tuple)
    changeHandler?.(tuple)
  }

  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const nextMonthDisabled =
    Boolean(disableFutureDates) && activeStartDate.getTime() >= currentMonthStart.getTime()

  return (
    <div
      className={
        `DateRangePicker ${className || ''}` +
        `${single ? ' DateRangePicker--SingleCalendar' : ''}` +
        `${compact ? ' DateRangePicker--Compact' : ''}` +
        `${noTopNavigation ? ' DateRangePicker--NoTopNavigation' : ''}` +
        `${noWeekDay ? ' DateRangePicker--NoWeekDay' : ''}`
      }
    >
      <div className={'DateRangePicker__Header'}>
        {compact ? (
          <>
            <button
              type={'button'}
              className={'DateRangePicker__Arrow DateRangePicker__Arrow--Left'}
              aria-label={'Previous month'}
              onClick={() =>
                setActiveStartDate(
                  new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() - 1, 1)
                )
              }
            >
              <ChevronIcon color={'gray.250'} />
            </button>
            <div className={'DateRangePicker__HeaderMonth'}>{displayedLeft}</div>
            <button
              type={'button'}
              className={'DateRangePicker__Arrow DateRangePicker__Arrow--Right'}
              aria-label={'Next month'}
              disabled={nextMonthDisabled}
              onClick={() =>
                setActiveStartDate(
                  new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() + 1, 1)
                )
              }
            >
              <ChevronIcon color={'gray.250'} />
            </button>
          </>
        ) : (
          <>
            <div className={'DateRangePicker__HeaderMonth'}>{displayedLeft}</div>
            {!single && <div className={'DateRangePicker__HeaderMonth'}>{displayedRight}</div>}
          </>
        )}
      </div>

      <div className={'DateRangePicker__Calendar'}>
        <DayPicker
          mode={'range'}
          month={activeStartDate}
          onMonthChange={setActiveStartDate}
          numberOfMonths={single ? 1 : 2}
          selected={toRange(range)}
          onSelect={onSelect}
          min={1}
          resetOnSelect={true}
          excludeDisabled={true}
          disabled={disableFutureDates ? { after: today } : undefined}
          hideNavigation={true}
          hideWeekdays={Boolean(noWeekDay)}
          showOutsideDays={false}
          classNames={dayPickerClassNames}
        />
      </div>

      {compact ? null : (
      <div className={'DateRangePicker__MonthSelector'}>
        <button
          type={'button'}
          className={'DateRangePicker__Arrow DateRangePicker__Arrow--Left'}
          onClick={() => setCurrentMonthIndex(prev => prev - (single ? 1 : 2))}
        >
          <ChevronIcon color={'gray.250'} />
        </button>

        {monthPairs.map((pair, i) => (
          <button
            type={'button'}
            key={i}
            className={
              'DateRangePicker__MonthButton ' +
              `${
                activeStartDate.getTime() === pair.start1.getTime()
                  ? 'DateRangePicker__MonthButton--Active'
                  : ''
              }`
            }
            onClick={() => setActiveStartDate(pair.start1)}
            disabled={disableFutureDates && pair.start1 > today}
          >
            {single ? pair.labelShort.split('-')[0] : pair.labelShort}
          </button>
        ))}

        <button
          type={'button'}
          className={'DateRangePicker__Arrow DateRangePicker__Arrow--Right'}
          onClick={() => setCurrentMonthIndex(prev => prev + (single ? 1 : 2))}
        >
          <ChevronIcon color={'gray.250'} />
        </button>
      </div>
      )}
    </div>
  )
}

export default DateRangePicker
