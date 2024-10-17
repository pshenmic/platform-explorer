import React, { useState, useEffect } from 'react'
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
  const [showSingleCalendar, setShowSingleCalendar] = useState(window.innerWidth < 600)
  const today = new Date()

  useEffect(() => {
    const handleResize = () => {
      setShowSingleCalendar(window.innerWidth < 600)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

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
        labelShort: `${date1.toLocaleString('en-US', { month: 'short' })} - ${date2.toLocaleString('en-US', { month: 'short' })}`
      })
    }
    return months
  }

  // Получаем заголовки для диапазона
  const getHeaderLabel = (range) => {
    if (!range[0] || !range[1]) return ['', '']

    const startLabel = range[0].toLocaleString('en-US', { month: 'long', year: 'numeric' })
    const endLabel = range[1].toLocaleString('en-US', { month: 'long', year: 'numeric' })
    
    return [startLabel, endLabel]
  }

  const monthPairs = generateMonthPairs()

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

  const handleSetRange = (start1, end2) => {
    setRange([start1, end2])
  }

  const tileDisabled = ({ date }) => {
    if (disableFutureDates) return date > today
    return false
  }

  // Получаем заголовки на основе текущего выбранного диапазона
  const [headerStart, headerEnd] = getHeaderLabel(range)

  return (
    <div className={'DateRangePicker ' +
      `${className || ''} ` +
      `${noTopNavigation ? 'DateRangePicker--NoTopNavigation' : ''} ` +
      `${noWeekDay ? 'DateRangePicker--NoWeekDay' : ''} `}
    >
      {/* Заголовки месяцев */}
      <div className={'DateRangePicker__Header'}>
        <div className={'DateRangePicker__HeaderMonth'}>
          {headerStart || monthPairs[0].label.split(' - ')[0]} {/* Отображаем выбранный месяц или месяц по умолчанию */}
        </div>
        {!showSingleCalendar && (
          <div className={'DateRangePicker__HeaderMonth'}>
            {headerEnd || monthPairs[0].label.split(' - ')[1]} {/* Отображаем выбранный месяц или месяц по умолчанию */}
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
        />
      </div>

      <div className="DateRangePicker__MonthSelector">
        <button className={'DateRangePicker__Arrow DateRangePicker__Arrow--Left'} onClick={handlePrev}>
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
            {showSingleCalendar ? pair.labelShort.split(' - ')[0] : pair.labelShort}
          </button>
        ))}

        <button className={'DateRangePicker__Arrow DateRangePicker__Arrow--Right'} onClick={handleNext}>
          &gt;
        </button>
      </div>
    </div>
  )
}

export default DateRangePicker
