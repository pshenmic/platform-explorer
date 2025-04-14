'use client'

import { CalendarIcon } from '../ui/icons'
import { TimeDelta } from './index'
import './DateBlock.scss'

function DateBlock ({ timestamp, format = 'all', showTime = false }) {
  const date = new Date(timestamp)

  if (String(date) === 'Invalid Date') return null

  const formats = {
    all: {
      calendarIcon: true,
      date: true,
      delta: true
    },
    deltaOnly: {
      calendarIcon: false,
      date: false,
      delta: true
    },
    dateOnly: {
      calendarIcon: false,
      date: true,
      delta: false
    }
  }

  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(showTime && { hour: '2-digit', minute: '2-digit' })
  }

  const formattedDate = date.toLocaleDateString('en-GB', options)

  return (
    <div className={'DateBlock'}>
      <div className={'DateBlock__InfoContainer'}>
        {formats[format].calendarIcon &&
          <CalendarIcon
            className={'DateBlock__CalendarIcon'}
            color={'gray.250'}
            w={'12px'}
            h={'14px'}
          />
        }
        {formats[format].date &&
          <div className={'DateBlock__Date'}>
            {formattedDate}
          </div>
        }
        {formats[format].delta &&
          <div className={'DateBlock__Delta'}>
            <TimeDelta endDate={date} showTimestampTooltip={format !== 'all'}/>
          </div>
        }
      </div>
    </div>
  )
}

export default DateBlock
