import { Alias, TimeRemaining } from '../../data'
import contestedResources from '../../../util/contestedResources'
import { Badge } from '@chakra-ui/react'
import VoteBadges from '../../contestedResources/VoteBadges'
import './ExpiringContestedResourceContent.scss'

export function ExpiringContestedResourceContent ({ contestedResource }) {
  return (
    <div className={'ExpiringContestedResourceContent'}>
      <div className={'ExpiringContestedResourceContent__ValueContainer'}>
        <Alias
          className={'ExpiringContestedResourceContent__Value'}
          ellipsis={false}
        >
          {contestedResources.getResourceValue(contestedResource?.resourceValue)}
        </Alias>
        {contestedResource?.contenders &&
          <Badge
            className={'ExpiringContestedResourceContent__ContendersBadge'}
            colorScheme={'blue'}
            size={'xs'}
            ml={'0.25rem'}
          >
            {contestedResource.contenders}
          </Badge>
        }
      </div>

      <VoteBadges
        className={'ExpiringContestedResourceContent__VoteBadges'}
        totalCountAbstain={contestedResource?.totalCountAbstain}
        totalCountLock={contestedResource?.totalCountLock}
        totalCountTowardsIdentity={contestedResource?.totalCountTowardsIdentity}
      />

      {(contestedResource?.timestamp && contestedResource?.endTimestamp) &&
        <TimeRemaining
          startTime={contestedResource?.timestamp}
          endTime={contestedResource?.endTimestamp}
        />
      }
    </div>
  )
}
