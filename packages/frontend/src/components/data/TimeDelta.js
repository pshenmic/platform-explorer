'use client'

import { useEffect, useState } from 'react'
import { getTimeDelta } from '../../util'
import { NotActive } from './index'
import { Tooltip } from '../ui/Tooltips'
import './TimeDelta.scss'

function TimeDelta ({ startDate, endDate, showTimestampTooltip = true, tooltipDate, format = 'default' }) {
  const [timeDelta, setTimeDelta] = useState(null)
  tooltipDate = new Date(tooltipDate || endDate)

  const Wrapper = ({ children }) => (
    showTimestampTooltip && format !== 'detailed' && !isNaN(tooltipDate)
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

  useEffect(() => {
    if (!endDate) {
      setTimeDelta(null)
      return
    }

    let timeout

    const updateDelta = () => {
      const adjustedStartDate = startDate ? new Date(startDate) : new Date()
      const now = new Date()
      const diff = new Date(endDate) - now

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
    ? <Wrapper>{timeDelta}</Wrapper>
    : <NotActive/>
}

export default TimeDelta
