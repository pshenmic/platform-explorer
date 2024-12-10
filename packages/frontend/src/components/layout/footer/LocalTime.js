'use client'

import { useEffect, useState } from 'react'
import './LocalTime.scss'

function LocalTime ({ className }) {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [timeZone, setTimeZone] = useState('')

  useEffect(() => {
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
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
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
