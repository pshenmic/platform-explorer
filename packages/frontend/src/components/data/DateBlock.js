'use client'

import { useMemo } from 'react'

import { CalendarIcon } from '../ui/icons'
import { TimeDelta } from './index'
import { Tooltip } from '../ui/Tooltips'
import { formateDate } from '../../util'

import './DateBlock.scss'

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

function DateBlock ({
  timestamp,
  format = 'all',
  showTime = false,
  showRelativeTooltip
}) {
  const { calendarIcon, date, delta } = formats[format]

  const formattedDate = useMemo(
    () =>
      formateDate(timestamp, ({ hour, minute, ...other }) => ({
        ...other,
        ...(showTime && { hour: '2-digit', minute: '2-digit' })
      })),
    [showTime, timestamp]
  )

  if (!formattedDate) {
    return null
  }

  return (
    <Wrapper
      className={'DateBlock'}
      tooltipContent={showRelativeTooltip
        ? <TimeDelta endDate={timestamp} showTimestampTooltip={false}/>
        : null
      }
    >
      <div className={'DateBlock__InfoContainer'}>
        {calendarIcon && (
          <CalendarIcon
            className={'DateBlock__CalendarIcon'}
            color={'gray.250'}
            w={'12px'}
            h={'14px'}
          />
        )}
        {date && (
          <div className={'DateBlock__Date'}>{formattedDate.formatted}</div>
        )}
        {delta && (
          <div className={'DateBlock__Delta'}>
            <TimeDelta
              endDate={formattedDate.date}
              showTimestampTooltip={format !== 'all'}
            />
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export default DateBlock
