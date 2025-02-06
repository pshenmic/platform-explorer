'use client'

import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import { ChevronIcon } from '../ui/icons'
import 'react-calendar/dist/Calendar.css'
import './DateRangePicker.scss'

const DateRangePicker = ({
  disableFutureDates = false,
  noTopNavigation,
  noWeekDay,
  changeHandler,
  className,
  value,
  showSingleCalendar
}) => {
  const today = new Date()
  const [range, setRange] = useState([null, null])
  const monthsToShow = 12
  const [currentMonthIndex, setCurrentMonthIndex] = useState(disableFutureDates ? (showSingleCalendar ? -monthsToShow : -monthsToShow + 1) : 0)
  const [activeStartDate, setActiveStartDate] = useState(new Date(today.getFullYear(), today.getMonth() - 1, 1))
  const [displayedMonths, setDisplayedMonths] = useState([null, null])
  const [monthPairs, setMonthPairs] = useState([])

  useEffect(() => {
    const generateMonthPairs = () => {
      const months = []
      for (let i = 0; i < monthsToShow; i += showSingleCalendar ? 1 : 2) {
        const date1 = new Date(today.getFullYear(), today.getMonth() + currentMonthIndex + i, 1)
        const date2 = new Date(today.getFullYear(), today.getMonth() + currentMonthIndex + i + 1, 1)

        months.push({
          start1: new Date(date1.getFullYear(), date1.getMonth(), 1),
          end1: new Date(date1.getFullYear(), date1.getMonth() + 1, 0),
          start2: new Date(date2.getFullYear(), date2.getMonth(), 1),
          end2: new Date(date2.getFullYear(), date2.getMonth() + 1, 0),
          label: `${date1.toLocaleString('en-US', { month: 'long', year: 'numeric' })} - ${date2.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
          labelShort: `${date1.toLocaleString('en-US', { month: 'short' })}-${date2.toLocaleString('en-US', { month: 'short' })}`
        })
      }
      return months
    }
    const newMonthPairs = generateMonthPairs()
    setMonthPairs(newMonthPairs)
  }, [monthsToShow, currentMonthIndex, showSingleCalendar])

  useEffect(() => {
    const startMonthLabel = activeStartDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    const nextMonth = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() + 1, 1)
    const nextMonthLabel = nextMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })

    setDisplayedMonths([startMonthLabel, nextMonthLabel])
  }, [activeStartDate])

  useEffect(() => setRange(value), [value])

  const handleSetDisplayedMonths = (start1, end2) => {
    setDisplayedMonths([start1.toLocaleString('en-US', { month: 'long', year: 'numeric' }), end2.toLocaleString('en-US', { month: 'long', year: 'numeric' })])
    setActiveStartDate(start1)
  }

  const onDateChange = (dates) => {
    if (typeof changeHandler === 'function') changeHandler(dates)

    if (Array.isArray(dates)) {
      setRange(dates)
    }
  }

  const handleNext = () => {
    setCurrentMonthIndex(prev => prev + (showSingleCalendar ? 1 : 2))
  }

  const handlePrev = () => {
    setCurrentMonthIndex(prev => prev - (showSingleCalendar ? 1 : 2))
  }

  const tileDisabled = ({ date }) => {
    if (disableFutureDates) return date > today
    return false
  }

  return (
    <div className={`DateRangePicker ${className || ''}` +
      `${showSingleCalendar ? ' DateRangePicker--SingleCalendar' : ''}` +
      `${noTopNavigation ? ' DateRangePicker--NoTopNavigation' : ''} ` +
      `${noWeekDay ? ' DateRangePicker--NoWeekDay' : ''} `}
    >
      <div className={'DateRangePicker__Header'}>
        <div className={'DateRangePicker__HeaderMonth'}>
          {displayedMonths[0]}
        </div>
        {!showSingleCalendar && (
          <div className={'DateRangePicker__HeaderMonth'}>
            {displayedMonths[1]}
          </div>
        )}
      </div>

      <div className={'DateRangePicker__Calendar'}>
        <Calendar
          locale={'en-US'}
          selectRange
          onChange={onDateChange}
          value={range}
          tileDisabled={tileDisabled}
          showDoubleView={!showSingleCalendar}
          activeStartDate={activeStartDate}
        />
      </div>

      <div className="DateRangePicker__MonthSelector">
        <button className={'DateRangePicker__Arrow DateRangePicker__Arrow--Left'} onClick={handlePrev}>
          <ChevronIcon color={'gray.250'}/>
        </button>

        {monthPairs.map((pair, i) => (
          <button
            key={i}
            className={'DateRangePicker__MonthButton ' +
              `${activeStartDate.getTime() === pair.start1.getTime()
                  ? 'DateRangePicker__MonthButton--Active'
                  : ''}`}
            onClick={() => handleSetDisplayedMonths(pair.start1, pair.end2, i)}
            disabled={disableFutureDates && pair.start1 > today}
          >
            {showSingleCalendar ? pair.labelShort.split('-')[0] : pair.labelShort}
          </button>
        ))}

        <button className={'DateRangePicker__Arrow DateRangePicker__Arrow--Right'} onClick={handleNext}>
          <ChevronIcon color={'gray.250'}/>
        </button>
      </div>
    </div>
  )
}

export default DateRangePicker
