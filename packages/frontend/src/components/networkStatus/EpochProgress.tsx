import { useState, useEffect, useMemo } from 'react'
import { Progress } from '@chakra-ui/react'
import { getTimeDelta } from '../../util'
import type { Epoch } from '../../types'
import type { WithClassName } from '../../types/common'
import './EpochProgress.css'

interface EpochProgressProps extends WithClassName {
  epoch: Pick<Epoch, 'startTime' | 'endTime'>
}

function EpochProgress({ epoch, className }: EpochProgressProps) {
  const startDate = useMemo(() => new Date(epoch.startTime), [epoch.startTime])
  const endDate = useMemo(() => new Date(epoch.endTime), [epoch.endTime])
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState(getTimeDelta(new Date(), endDate))

  useEffect(() => {
    const updateProgress = () => {
      const totalDuration = endDate.getTime() - startDate.getTime()
      const elapsedTime = Date.now() - startDate.getTime()
      const percentage = (elapsedTime / totalDuration) * 100
      setProgress(Math.min(percentage, 100))
      setTimeLeft(getTimeDelta(new Date(), endDate))
    }

    const intervalId = setInterval(updateProgress, 1000)
    updateProgress()
    return () => clearInterval(intervalId)
  }, [startDate, endDate])

  return (
    <div className={`EpochProgress ${className || ''}`}>
      <Progress value={progress} height={'1px'} />

      <div className={'EpochProgress__Info'}>
        <div className={'EpochProgress__InfoTitle'}>Next Epoch:</div>
        <div className={'EpochProgress__InfoValue'}>{timeLeft}</div>
      </div>
    </div>
  )
}

export default EpochProgress
