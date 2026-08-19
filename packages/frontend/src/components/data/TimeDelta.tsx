'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getTimeDelta } from '../../util'
import { NotActive } from './index'
import { Tooltip } from '../ui/Tooltips'
import './TimeDelta.css'

interface WrapperProps {
  children?: ReactNode
  tooltipDate?: Date
  showTimestampTooltip?: boolean
  format?: string
}

const Wrapper = ({ children, tooltipDate, showTimestampTooltip, format }: WrapperProps) => (
  showTimestampTooltip && format !== 'detailed' && tooltipDate != null && !isNaN(tooltipDate.getTime())
    ? <Tooltip
      placement={'top'}
      content={
        <span className={'TimeDelta__TooltipContent'}>
          {tooltipDate?.toLocaleDateString()} {tooltipDate?.toLocaleTimeString()}
        </span>
      }
    >
      <span className={'TimeDelta'}>{children}</span>
    </Tooltip>
    : <>{children}</>
)

interface TimeDeltaProps {
  startDate?: string | number | Date | null
  endDate?: string | number | Date | null
  showTimestampTooltip?: boolean
  tooltipDate?: string | number | Date | null
  format?: string
}

function TimeDelta ({ startDate, endDate, showTimestampTooltip = true, tooltipDate, format = 'default' }: TimeDeltaProps) {
  const [timeDelta, setTimeDelta] = useState<string | null>(null)
  const resolvedTooltipDate = new Date(tooltipDate || endDate || 0)

  useEffect(() => {
    if (!endDate) {
      setTimeDelta(null)
      return
    }

    let timeout: ReturnType<typeof setTimeout>

    const updateDelta = () => {
      const adjustedStartDate = startDate ? new Date(startDate) : new Date()
      const now = new Date()
      const diff = new Date(endDate).getTime() - now.getTime()

      setTimeDelta(getTimeDelta(adjustedStartDate, endDate, format))

      const absoluteDiff = Math.abs(diff)

      if (absoluteDiff > 1000 * 60) {
        const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
        timeout = setTimeout(updateDelta, msUntilNextMinute)
      } else {
        timeout = setTimeout(updateDelta, 1000)
      }
    }

    updateDelta()

    return () => clearTimeout(timeout)
  }, [startDate, endDate, format])

  return timeDelta
    ? <Wrapper
        tooltipDate={resolvedTooltipDate}
        showTimestampTooltip={showTimestampTooltip}
        format={format}
      >
        {timeDelta}
      </Wrapper>
    : <NotActive/>
}

export default TimeDelta
