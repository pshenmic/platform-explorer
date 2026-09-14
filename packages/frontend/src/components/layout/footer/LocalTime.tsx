'use client'

import { useEffect, useState } from 'react'
import type { WithClassName } from '../../../types/common'
import './LocalTime.css'

function LocalTime({ className }: WithClassName) {
  const [time, setTime] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [timeZone, setTimeZone] = useState<string | null>(null)

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

    let interval: ReturnType<typeof setInterval> | undefined
    const timeout = setTimeout(() => {
      updateTime()
      interval = setInterval(updateTime, 60000)
    }, millisecondsUntilNextMinute)

    return () => {
      clearTimeout(timeout)
      if (interval) clearInterval(interval)
    }
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
