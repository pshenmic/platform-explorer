'use client'

import { getTimeDelta } from '../../util'

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
    <div>
      <div>{formattedDate}</div>
      <div>
        {getTimeDelta(new Date(), date)}
      </div>
    </div>
  )
}

export default DateBlock
