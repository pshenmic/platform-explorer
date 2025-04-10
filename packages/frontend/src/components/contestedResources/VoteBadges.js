import { Badge } from '@chakra-ui/react'
import './VoteBadges.scss'

function VoteBadges ({ totalCountAbstain, totalCountLock, totalCountTowardsIdentity }) {
  return (
    <div className={'VoteBadges'}>
      <Badge colorScheme={'green'} size={'xs'}>
        {totalCountAbstain}
      </Badge>
      <Badge colorScheme={'orange'} size={'xs'}>
        {totalCountLock}
      </Badge>
      <Badge colorScheme={'red'} size={'xs'}>
        {totalCountTowardsIdentity}
      </Badge>
    </div>
  )
}

export default VoteBadges
