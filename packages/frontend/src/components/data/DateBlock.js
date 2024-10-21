'use client'

import { getTimeDelta } from '../../util'
import { CalendarIcon } from '../ui/icons'
import './DateBlock.scss'

function DateBlock ({ timestamp, format }) {
  const date = new Date(timestamp)

  if (String(date) === 'Invalid Date') return null

  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }

  const formattedDate = date.toLocaleDateString('en-GB', options)

  return (
    <div className={'DateBlock'}>
      {format !== 'delta-only' &&
        <CalendarIcon
          className={'DateBlock__CalendarIcon'}
          color={'gray.250'}
          w={'12px'}
          h={'14px'}
        />
      }
      {format !== 'delta-only' &&
        <div className={'DateBlock__Date'}>
          {formattedDate}
        </div>
      }
      <div className={'DateBlock__Delta'}>
        {getTimeDelta(new Date(), date)}
      </div>
    </div>
  )
}

export default DateBlock
