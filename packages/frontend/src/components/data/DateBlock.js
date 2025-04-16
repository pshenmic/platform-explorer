'use client'

import { CalendarIcon } from '../ui/icons'
import { TimeDelta } from './index'
import { Tooltip } from '../ui/Tooltips'
import './DateBlock.scss'

const Wrapper = ({ children, tooltipContent, props }) => (
  tooltipContent
    ? <Tooltip
        placement={'top'}
        content={tooltipContent}
      >
        <div {...props}>{children}</div>
      </Tooltip>
    : <div {...props}>{children}</div>
)

function DateBlock ({ timestamp, format = 'all', showTime = false, showRelativeTooltip }) {
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
    <Wrapper
      className={'DateBlock'}
      tooltipContent={showRelativeTooltip
        ? <TimeDelta endDate={timestamp} showTimestampTooltip={false}/>
        : null
      }
    >
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
    </Wrapper>
  )
}

export default DateBlock
