'use client'

import { useEffect, useState } from 'react'
import './LocalTime.scss'

function LocalTime ({ className }) {
  const [time, setTime] = useState(null)
  const [date, setDate] = useState(null)
  const [timeZone, setTimeZone] = useState(null)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      )
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          day: '2-digit',
          month: 'short'
        })
      )
    }

    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    updateTime()

    const now = new Date()
    const millisecondsUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

    const timeout = setTimeout(() => {
      updateTime()
      const interval = setInterval(updateTime, 60000)
      return () => clearInterval(interval)
    }, millisecondsUntilNextMinute)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className={`LocalTime ${className || ''}`}>
      {time && <span className={'LocalTime__Time'}>{time}</span>}
      {date && <span className={'LocalTime__Date'}>{date}</span>}
      {timeZone && <span className={'LocalTime__TimeZone'}>({timeZone})</span>}
    </div>
  )
}

export default LocalTime
