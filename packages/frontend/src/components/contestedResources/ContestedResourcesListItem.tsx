import type { ComponentType, ReactNode, MouseEvent } from 'react'
import { Badge } from '../ui/Badge'
import {
  Alias as AliasJs,
  Identifier as IdentifierJs,
  NotActive as NotActiveJs,
  TimeDelta as TimeDeltaJs,
  TimeRemaining as TimeRemainingJs
} from '../data'
import ValueContainer from '../ui/containers/ValueContainer'
import Link from 'next/link'
import { Tooltip } from '../ui/Tooltips'
import StatusIconJs from '../transactions/StatusIcon'
import contestedResources from '../../util/contestedResources'
import VoteBadges from './VoteBadges'
import ContendersBadge from './ContendersBadge'
import { LinkContainer } from '../ui/containers'
import { useRouter } from 'next/navigation'
import type { ContestedResource } from '../../types'
import './ContestedResourcesListItem.css'

// Untyped JS components — loose wrappers until data/* / transactions/* are migrated
const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  ellipsis?: boolean
  className?: string
}>
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
  className?: string
}>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode; className?: string }>
const TimeDelta = TimeDeltaJs as ComponentType<{ endDate?: Date }>
const TimeRemaining = TimeRemainingJs as ComponentType<{
  startTime?: string | null
  endTime?: string | null
  displayProgress?: boolean
}>
const StatusIcon = StatusIconJs as ComponentType<{
  className?: string
  status?: string | null
  w?: string
  h?: string
  mr?: string
}>

export type ContestedResourcesListItemData = ContestedResource & {
  error?: string | null
  contenders?: number | string | unknown[] | null
}

interface ContestedResourcesListItemProps {
  contestedResource: ContestedResourcesListItemData
}

export function ContestedResourcesListItem({ contestedResource }: ContestedResourcesListItemProps) {
  const isEnded = new Date() > new Date(contestedResource?.endTimestamp)
  const router = useRouter()
  const resourceValueBase64 = btoa(JSON.stringify(contestedResource?.resourceValue))

  return (
    <Link
      href={`/contestedResource/${resourceValueBase64}`}
      className={'ContestedResourcesListItem'}
    >
      <div className={'ContestedResourcesListItem__Content'}>
        <div
          className={
            'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--Timestamp'
          }
        >
          {contestedResource?.timestamp ? (
            <>
              {contestedResource?.status && (
                <Tooltip
                  title={contestedResource.status}
                  content={contestedResource?.error || ''}
                  placement={'top'}
                >
                  <span>
                    <StatusIcon
                      className={'ContestedResourcesListItem__StatusIcon'}
                      status={contestedResource.status}
                      w={'1.125rem'}
                      h={'1.125rem'}
                      mr={'0.5rem'}
                    />
                  </span>
                </Tooltip>
              )}
              <TimeDelta endDate={new Date(contestedResource.timestamp)} />
            </>
          ) : (
            <NotActive />
          )}
        </div>

        <div
          className={
            'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--ResourceValue'
          }
        >
          <Alias ellipsis={false}>
            {contestedResources.getResourceValue(contestedResource?.resourceValue)}
          </Alias>
          {contestedResource?.contenders && (
            <ContendersBadge contenders={contestedResource.contenders} />
          )}
        </div>

        <div
          className={
            'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--DataContract'
          }
        >
          <LinkContainer
            className={'BlocksListItem__LinkContainer'}
            onClick={(e: MouseEvent) => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/dataContract/${contestedResource?.dataContractIdentifier}`)
            }}
          >
            <Identifier avatar={true} ellipsis={false} styles={['highlight-both']}>
              {contestedResource?.dataContractIdentifier}
            </Identifier>
          </LinkContainer>
        </div>

        <div
          className={
            'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--IndexName'
          }
        >
          <ValueContainer colorScheme={'gray'} size={'xxs'}>
            {contestedResource?.indexName}
          </ValueContainer>
        </div>

        <div
          className={
            'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--DocumentType'
          }
        >
          <Badge colorScheme={'gray'} size={'xs'}>
            {contestedResource?.documentTypeName}
          </Badge>
        </div>

        <div
          className={'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--Votes'}
        >
          <VoteBadges
            totalCountAbstain={contestedResource?.totalCountAbstain}
            totalCountLock={contestedResource?.totalCountLock}
            totalCountTowardsIdentity={contestedResource?.totalCountTowardsIdentity}
          />
        </div>

        <div
          className={
            'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--EndsIn'
          }
        >
          <TimeRemaining
            startTime={contestedResource?.timestamp}
            endTime={contestedResource?.endTimestamp}
            displayProgress={!isEnded}
          />
        </div>
      </div>
    </Link>
  )
}
