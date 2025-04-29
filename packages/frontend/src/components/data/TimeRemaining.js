'use client'

import { Progress } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { getTimeDelta } from '../../util'
import './TimeRemaining.scss'

function TimeRemaining ({ startTime, endTime, displayProgress = true }) {
  const startDate = useMemo(() => new Date(startTime), [startTime])
  const endDate = useMemo(() => new Date(endTime), [endTime])
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState(getTimeDelta(new Date(), endDate))

  useEffect(() => {
    const updateProgress = () => {
      const totalDuration = endDate - startDate
      const elapsedTime = new Date() - startDate
      const percentage = (elapsedTime / totalDuration) * 100
      setProgress(Math.min(percentage, 100))
      setTimeLeft(getTimeDelta(new Date(), endDate))
    }

    const intervalId = setInterval(updateProgress, 1000)
    updateProgress()
    return () => clearInterval(intervalId)
  }, [startDate, endDate])

  return (
    <div className={'TimeRemaining'}>
      {displayProgress &&
        <Progress value={progress} height={'1px'}/>
      }
      <div className={'TimeRemaining__TimeLeft'}>{timeLeft}</div>
    </div>
  )
}

export default TimeRemaining
