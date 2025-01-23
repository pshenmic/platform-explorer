'use client'

import React, { useEffect, useState } from 'react'
import { getTimeDelta } from '../../util'

function TimeDelta ({ startDate, endDate, format = 'default' }) {
  const [timeDelta, setTimeDelta] = useState('n/a')

  useEffect(() => {
    if (!endDate) return

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

  return <>{timeDelta}</>
}

export default TimeDelta
