import type { ReactElement, ReactNode } from 'react'
import Tooltip from './Tooltip'
import type { Epoch } from '../../../types'
import './EpochTooltip.scss'

function formatDate (timestamp: number) {
  const date = new Date(timestamp)
  const day = date.getDate()
  const month = date.toLocaleString('en-GB', { month: 'long' })
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${day} ${month}, ${hours}:${minutes}`
}

interface EpochTooltipProps {
  epoch?: Partial<Epoch> | null
  children: ReactElement
}

export default function EpochTooltip ({ epoch, children }: EpochTooltipProps) {
  return (
    <Tooltip
      label={(
        <div className={'EpochTooltip'}>
          <div className={'EpochTooltip__Line'}>
            {epoch?.number != null &&
              <div className={'EpochTooltip__Title'}>Epoch #{epoch?.number || ''} started</div>
            }
            {epoch?.startTime != null &&
              <div className={'EpochTooltip__Value'}>{formatDate(epoch.startTime)}</div>
            }
          </div>

          {epoch?.endTime != null &&
            <div className={'EpochTooltip__Line'}>
              <div className={'EpochTooltip__Title'}>Next epoch:</div>
              <div className={'EpochTooltip__Value'}>{formatDate(epoch.endTime)}</div>
            </div>
          }
        </div>
      ) as ReactNode}
      placement={'top'}
      color={'#fff'}
    >
      {children}
    </Tooltip>
  )
}
