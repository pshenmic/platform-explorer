import type { ComponentType, ReactNode } from 'react'
import type { Status } from '../../../types'
import { EpochTooltip } from '../../ui/Tooltips'
import { InfoIcon } from '../../ui/icons'
import NotActiveJs from '../../data/NotActive'
import EpochProgressJs from '../../networkStatus/EpochProgress'
import './EpochCardContent.css'

const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode }>
const EpochProgress = EpochProgressJs as ComponentType<{
  epoch?: Status['epoch']
  className?: string
}>

interface EpochCardContentProps {
  status?: Pick<Status, 'epoch'> | null
}

export function EpochCardContent({ status }: EpochCardContentProps) {
  return (
    <div className={'EpochCardContent'}>
      {typeof status?.epoch?.number === 'number' ? (
        <EpochTooltip epoch={status.epoch}>
          <div className={'ValidatorsTotalCard__EpochNumber'}>
            #{status.epoch.number}
            <InfoIcon className={'EpochCardContent__InfoIcon'} />
          </div>
        </EpochTooltip>
      ) : (
        <NotActive />
      )}
      {status?.epoch && (
        <EpochProgress epoch={status.epoch} className={'EpochCardContent__EpochProgress'} />
      )}
    </div>
  )
}
