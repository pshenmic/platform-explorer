import { Badge } from '@chakra-ui/react'
import './VoteBadges.scss'

function VoteBadges ({ totalCountAbstain, totalCountLock, totalCountTowardsIdentity, className }) {
  return (
    <div className={`VoteBadges ${className || ''}`}>
      <Badge
        style={{
          opacity: totalCountAbstain === 0 ? 0.4 : 1
        }}
        colorScheme={'green'}
        size={'xs'}
      >
        {totalCountAbstain}
      </Badge>
      <Badge
        style={{
          opacity: totalCountLock === 0 ? 0.4 : 1
        }}
        colorScheme={'orange'}
        size={'xs'}
      >
        {totalCountLock}
      </Badge>
      <Badge
        style={{
          opacity: totalCountTowardsIdentity === 0 ? 0.4 : 1
        }}
        colorScheme={'red'}
        size={'xs'}
      >
        {totalCountTowardsIdentity}
      </Badge>
    </div>
  )
}

export default VoteBadges
