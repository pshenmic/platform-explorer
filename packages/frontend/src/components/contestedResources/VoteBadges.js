import { Badge } from '@chakra-ui/react'
import { Tooltip } from '../ui/Tooltips'
import './VoteBadges.scss'

function VoteBadges ({ totalCountAbstain, totalCountLock, totalCountTowardsIdentity, className }) {
  return (
    <div className={`VoteBadges ${className || ''}`}>
      <Tooltip
        title={'Total Towards Identity'}
        placement={'top'}
      >
        <Badge
          className={'VoteBadges__Badge'}
          style={{ opacity: totalCountTowardsIdentity === 0 ? 0.4 : 1 }}
          colorScheme={'green'}
          size={'xs'}
        >
          {totalCountTowardsIdentity}
        </Badge>
      </Tooltip>

      <Tooltip
        title={'Total Abstain'}
        placement={'top'}
      >
        <Badge
          className={'VoteBadges__Badge'}
          style={{ opacity: totalCountAbstain === 0 ? 0.4 : 1 }}
          colorScheme={'orange'}
          size={'xs'}
        >
          {totalCountAbstain}
        </Badge>
      </Tooltip>

      <Tooltip
        title={'Total Lock'}
        placement={'top'}
      >
        <Badge
          className={'VoteBadges__Badge'}
          style={{ opacity: totalCountLock === 0 ? 0.4 : 1 }}
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
