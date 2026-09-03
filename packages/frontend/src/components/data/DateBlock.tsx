'use client'

import { useMemo } from 'react'
import type { ReactNode, ComponentPropsWithoutRef } from 'react'

import { CalendarIcon } from '../ui/icons'
import { TimeDelta } from './index'
import { Tooltip } from '../ui/Tooltips'
import { formatDate } from '../../util'

import './DateBlock.css'

type DateBlockFormat = 'all' | 'deltaOnly' | 'dateOnly'

const formats: Record<DateBlockFormat, { calendarIcon: boolean; date: boolean; delta: boolean }> = {
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

interface WrapperProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode
  tooltipContent?: ReactNode
}

const Wrapper = ({ children, tooltipContent, ...props }: WrapperProps) =>
  tooltipContent ? (
    <Tooltip placement={'top'} content={tooltipContent}>
      <div {...props}>{children}</div>
    </Tooltip>
  ) : (
    <div {...props}>{children}</div>
  )

interface DateBlockProps {
  timestamp?: string | number | Date | null
  format?: DateBlockFormat
  showTime?: boolean
  showRelativeTooltip?: boolean
}

function DateBlock({
  timestamp,
  format = 'all',
  showTime = false,
  showRelativeTooltip
}: DateBlockProps) {
  const { calendarIcon, date, delta } = formats[format]

  const formattedDate = useMemo(() => {
    if (timestamp == null) return null
    const ts = timestamp instanceof Date ? timestamp.getTime() : timestamp
    return formatDate(ts, ({ hour, minute, ...other }) => ({
      ...other,
      ...(showTime && { hour: '2-digit', minute: '2-digit' })
    }))
  }, [showTime, timestamp])

  if (!formattedDate) {
    return null
  }

  return (
    <Wrapper
      className={'DateBlock'}
      tooltipContent={
        showRelativeTooltip ? <TimeDelta endDate={timestamp} showTimestampTooltip={false} /> : null
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
        {date && <div className={'DateBlock__Date'}>{formattedDate.formatted}</div>}
        {delta && (
          <div className={'DateBlock__Delta'}>
            <TimeDelta endDate={formattedDate.date} showTimestampTooltip={format !== 'all'} />
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export default DateBlock
