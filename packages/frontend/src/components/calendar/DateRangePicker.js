import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './DateRangePicker.scss'

const DateRangePicker = ({
  disableFutureDates = false,
  monthsToShow = 5,
  noTopNavigation,
  noWeekDay,
  changeHandler,
  className
}) => {
  const [range, setRange] = useState([null, null])
  const [currentMonthIndex, setCurrentMonthIndex] = useState(disableFutureDates ? -monthsToShow : 0)
  const today = new Date()

  const generateMonthPairs = () => {
    const months = []
    for (let i = 0; i < monthsToShow; i += 2) {
      const date1 = new Date(today.getFullYear(), today.getMonth() + currentMonthIndex + i, 1)
      const date2 = new Date(today.getFullYear(), today.getMonth() + currentMonthIndex + i + 1, 1)

      months.push({
        start1: new Date(date1.getFullYear(), date1.getMonth(), 1),
        end1: new Date(date1.getFullYear(), date1.getMonth() + 1, 0),
        start2: new Date(date2.getFullYear(), date2.getMonth(), 1),
        end2: new Date(date2.getFullYear(), date2.getMonth() + 1, 0),
        label: `${date1.toLocaleString('en-US', { month: 'long', year: 'numeric' })} - ${date2.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
        labelShort: `${date1.toLocaleString('en-US', { month: 'short' })} - ${date2.toLocaleString('en-US', { month: 'short' })}`
      })
    }
    return months
  }

  const monthPairs = generateMonthPairs()

  const onDateChange = (dates) => {
    if (typeof changeHandler === 'function') changeHandler(dates)

    if (Array.isArray(dates)) {
      setRange(dates)
    }
  }

  const handleNext = () => {
    setCurrentMonthIndex(prev => prev + 2)
  }

  const handlePrev = () => {
    setCurrentMonthIndex(prev => prev - 2)
  }

  const handleSetRange = (start1, end2) => {
    setRange([start1, end2])
  }

  const tileDisabled = ({ date }) => {
    if (disableFutureDates) return date > today
    return false
  }

  return (
    <div className={'DateRangePicker ' +
      `${className || ''} ` +
      `${noTopNavigation ? 'DateRangePicker--NoTopNavigation' : ''} ` +
      `${noWeekDay ? 'DateRangePicker--NoWeekDay' : ''} `}
    >
      <div className={'DateRangePicker__Header'}>
        <div className={'DateRangePicker__HeaderMonth'}>
          {monthPairs[0].label.split(' - ')[0]}
        </div>
        <div className={'DateRangePicker__HeaderMonth'}>
          {monthPairs[0].label.split(' - ')[1]}
        </div>
      </div>

      <div className={'DateRangePicker__Calendar'}>
        <Calendar
          locale={'en-US'}
          selectRange
          onChange={onDateChange}
          value={range}
          tileDisabled={tileDisabled}
          showDoubleView={true}
        />
      </div>

      <div className="DateRangePicker__MonthSelector">
        <button className={'DateRangePicker__Arrow DateRangePicker__Arrow--left'} onClick={handlePrev}>
          &lt;
        </button>

        {monthPairs.map((pair, i) => (
          <button
            key={i}
            className={'DateRangePicker__MonthButton ' +
              `${range[0] && range[1] && range[0].getTime() === pair.start1.getTime() &&
                range[1].getTime() === pair.end2.getTime()
                  ? 'DateRangePicker__MonthButton--Active'
                  : ''}`}
            onClick={() => handleSetRange(pair.start1, pair.end2)}
            disabled={disableFutureDates && pair.start1 > today}
          >
            {pair.labelShort}
          </button>
        ))}

        <button className={'DateRangePicker__Arrow DateRangePicker__Arrow--right'} onClick={handleNext}>
          &gt;
        </button>
      </div>
    </div>
  )
}

export default DateRangePicker
