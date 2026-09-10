import { Badge } from '../ui/Badge'
import { Tooltip } from '../ui/Tooltips'
import type { WithClassName } from '../../types'
import './VoteBadges.css'

interface VoteBadgesProps extends WithClassName {
  totalCountAbstain?: number | null
  totalCountLock?: number | null
  totalCountTowardsIdentity?: number | null
}

function VoteBadges({
  totalCountAbstain,
  totalCountLock,
  totalCountTowardsIdentity,
  className
}: VoteBadgesProps) {
  return (
    <div className={`VoteBadges ${className || ''}`}>
      <Tooltip title={'Total Towards Identity'} placement={'top'}>
        <Badge
          className={`VoteBadges__Badge${totalCountTowardsIdentity === 0 ? ' VoteBadges__Badge--Dim' : ''}`}
          colorScheme={'green'}
          size={'xs'}
        >
          {totalCountTowardsIdentity}
        </Badge>
      </Tooltip>

      <Tooltip title={'Total Abstain'} placement={'top'}>
        <Badge
          className={`VoteBadges__Badge${totalCountAbstain === 0 ? ' VoteBadges__Badge--Dim' : ''}`}
          colorScheme={'orange'}
          size={'xs'}
        >
          {totalCountAbstain}
        </Badge>
      </Tooltip>

      <Tooltip title={'Total Lock'} placement={'top'}>
        <Badge
          className={`VoteBadges__Badge${totalCountLock === 0 ? ' VoteBadges__Badge--Dim' : ''}`}
          colorScheme={'red'}
          size={'xs'}
        >
          {totalCountLock}
        </Badge>
      </Tooltip>
    </div>
  )
}

export default VoteBadges
