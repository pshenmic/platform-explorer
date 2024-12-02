'use client'

import './LocalTime.scss'

function LocalTime () {
  const now = new Date()
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const date = now.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  })

  return (
    <div className={'LocalTime'}>
      <span className={'LocalTime__Time'}>{time}</span>
      <span className={'LocalTime__Date'}>{date}</span>
      <span className={'LocalTime__TimeZone'}>({timeZone})</span>
    </div>
  )
}

export default LocalTime
