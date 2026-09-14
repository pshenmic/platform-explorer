import { useState, forwardRef, useEffect } from 'react'
import type { Ref, ComponentType } from 'react'
// Untyped JS component — loose wrapper until calendar/* is migrated
import { DateRangePicker as DateRangePickerJs } from '../calendar'
import { defaultIntervalsCount } from './config'
import type { ChartConfig, TimespanValue } from './types'
import type { WithClassName } from '../../types/common'
import './TimeframeMenu.css'

const DateRangePicker = DateRangePickerJs as ComponentType<{
  disableFutureDates?: boolean
  monthsToShow?: number
  noTopNavigation?: boolean
  noWeekDay?: boolean
  changeHandler?: (value: [Date | null, Date | null]) => void
  value?: [Date | null, Date | null] | null
}>

interface TimeframeMenuProps extends WithClassName {
  config: ChartConfig
  forceTimespan?: TimespanValue | null
  changeCallback?: (value: TimespanValue) => void
}

const TimeframeMenu = forwardRef(function TimeframeMenu(
  { config, forceTimespan, changeCallback, className }: TimeframeMenuProps,
  ref: Ref<HTMLDivElement>
) {
  const [timespan, setTimespan] = useState<TimespanValue | undefined>(
    config.timespan.values[config.timespan.defaultIndex]
  )
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null)
  const [calendarValue, setCalendarValue] = useState<[Date | null, Date | null] | null>(null)

  useEffect(() => {
    if (forceTimespan) setTimespan(forceTimespan)
  }, [forceTimespan])

  const changeHandler = (value: TimespanValue) => {
    setTimespan(value)
    if (typeof changeCallback === 'function') changeCallback(value)
  }

  const calendarHandler = (value: [Date | null, Date | null]) => {
    setCalendarValue(value)
    const [start, end] = value
    if (start && end) setSelectedRange({ start, end })
  }

  const clearCalendarRange = () => {
    setSelectedRange(null)
    setCalendarValue([null, null])
  }

  const submitHandler = () => {
    if (!selectedRange?.start || !selectedRange?.end) {
      if (typeof changeCallback === 'function' && timespan) changeCallback(timespan)
      return
    }

    function labelFormatDate(date: Date) {
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
  }

  return (
    <div ref={ref} className={`TimeframeMenu ${className || ''}`}>
      <div className={'TimeframeMenu__ValuesContainer'}>
        <div className={'TimeframeMenu__Values'}>
          {config.timespan.values.map((iTimespan, i) => (
            <button
              type={'button'}
              className={`TimeframeMenu__ValueButton ${iTimespan.label === timespan?.label ? 'TimeframeMenu__ValueButton--Active' : ''}`}
              onClick={() => {
                changeHandler(iTimespan)
                clearCalendarRange()
              }}
              key={i}
            >
              {iTimespan.label}
            </button>
          ))}
          <button
            type={'button'}
            className={'TimeframeMenu__ValueButton TimeframeMenu__ValueButton--Ok'}
            onClick={submitHandler}
          >
            ok
          </button>
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
