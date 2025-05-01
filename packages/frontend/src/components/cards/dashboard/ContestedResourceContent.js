import { Alias, TimeRemaining } from '../../data'
import contestedResources from '../../../util/contestedResources'
import { Badge } from '@chakra-ui/react'
import VoteBadges from '../../contestedResources/VoteBadges'
import './ContestedResourceContent.scss'

export function ContestedResourceContent ({ contestedResource }) {
  return (
    <div className={'ContestedResourceContent'}>
      {contestedResource
        ? <>
          <div className={'ContestedResourceContent__ValueContainer'}>
            <Alias
              className={'ContestedResourceContent__Value'}
              ellipsis={false}
            >
              {contestedResources.getResourceValue(contestedResource?.resourceValue)}
            </Alias>
            {contestedResource?.contenders &&
              <Badge
                className={'ContestedResourceContent__ContendersBadge'}
                colorScheme={'blue'}
                size={'xs'}
                ml={'0.25rem'}
              >
                {contestedResource.contenders}
              </Badge>
            }
          </div>

          <VoteBadges
            className={'ContestedResourceContent__VoteBadges'}
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
        </>
        : <div className={'ContestedResourceContent__AllCompleted'}>All completed</div>
      }
    </div>
  )
}
