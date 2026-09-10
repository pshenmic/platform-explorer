import type { ComponentType, ReactNode } from 'react'
import type { ContestedResource } from '../../../types'
import AliasJs from '../../data/Alias'
import TimeRemainingJs from '../../data/TimeRemaining'
import contestedResources from '../../../util/contestedResources'
import { Badge } from '@chakra-ui/react'
import VoteBadgesJs from '../../contestedResources/VoteBadges'
import './ContestedResourceContent.css'

const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  className?: string
  ellipsis?: boolean
}>

const TimeRemaining = TimeRemainingJs as ComponentType<{
  startTime?: string | number | Date | null
  endTime?: string | number | Date | null
}>

const VoteBadges = VoteBadgesJs as ComponentType<{
  className?: string
  totalCountAbstain?: number
  totalCountLock?: number
  totalCountTowardsIdentity?: number
}>

interface ContestedResourceContentProps {
  contestedResource?:
    | (Partial<ContestedResource> & {
        contenders?: ReactNode
      })
    | null
  nullMessage?: string
}

export function ContestedResourceContent({
  contestedResource,
  nullMessage = 'All completed'
}: ContestedResourceContentProps) {
  const resourceValue = contestedResources.getResourceValue(contestedResource?.resourceValue)

  return (
    <div className={'ContestedResourceContent'}>
      {contestedResource && resourceValue?.length ? (
        <>
          <div className={'ContestedResourceContent__ValueContainer'}>
            <Alias className={'ContestedResourceContent__Value'} ellipsis={false}>
              {resourceValue}
            </Alias>
            {contestedResource?.contenders && (
              <Badge
                className={'ContestedResourceContent__ContendersBadge'}
                colorScheme={'blue'}
                size={'xs'}
                ml={'0.25rem'}
              >
                {contestedResource.contenders}
              </Badge>
            )}
          </div>

          {contestedResource?.resourceValue && (
            <VoteBadges
              className={'ContestedResourceContent__VoteBadges'}
              totalCountAbstain={contestedResource?.totalCountAbstain}
              totalCountLock={contestedResource?.totalCountLock}
              totalCountTowardsIdentity={contestedResource?.totalCountTowardsIdentity}
            />
          )}

          {contestedResource?.timestamp && contestedResource?.endTimestamp && (
            <TimeRemaining
              startTime={contestedResource?.timestamp}
              endTime={contestedResource?.endTimestamp}
            />
          )}
        </>
      ) : (
        <div className={'ContestedResourceContent__NullMessage'}>{nullMessage}</div>
      )}
    </div>
  )
}
