import { Grid, GridItem, Badge } from '@chakra-ui/react'
import { Alias, Identifier, NotActive, TimeDelta, TimeRemaining } from '../data'
import ValueContainer from '../ui/containers/ValueContainer'
import Link from 'next/link'
import { Tooltip } from '../ui/Tooltips'
import StatusIcon from '../transactions/StatusIcon'
import contestedResources from '../../util/contestedResources'
import VoteBadges from './VoteBadges'
import ContendersBadge from './ContendersBadge'
import { LinkContainer } from '../ui/containers'
import { useRouter } from 'next/navigation'
import './ContestedResourcesListItem.scss'

export function ContestedResourcesListItem ({ contestedResource }) {
  const isEnded = new Date() > new Date(contestedResource?.endTimestamp)
  const router = useRouter()
  const resourceValueBase64 = btoa(JSON.stringify(contestedResource?.resourceValue))

  return (
    <Link
      href={`/contestedResource/${resourceValueBase64}`}
      className={'ContestedResourcesListItem'}
    >
      <Grid className={'ContestedResourcesListItem__Content'}>
        <GridItem className={'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--Timestamp'}>
          {contestedResource?.timestamp
            ? <>
              {contestedResource?.status &&
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
              }
              <TimeDelta endDate={new Date(contestedResource.timestamp)}/>
            </>
            : <NotActive/>
          }
        </GridItem>

        <GridItem className={'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--ResourceValue'}>
          <Alias ellipsis={false}>{contestedResources.getResourceValue(contestedResource?.resourceValue)}</Alias>
          {contestedResource?.contenders &&
            <ContendersBadge contenders={contestedResource.contenders}/>
          }
        </GridItem>

        <GridItem className={'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--DataContract'}>
          <LinkContainer
            className={'BlocksListItem__LinkContainer'}
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/dataContract/${contestedResource?.dataContractIdentifier}`)
            }}
          >
            <Identifier
              avatar={true}
              ellipsis={false}
              styles={['highlight-both']}
            >
              {contestedResource?.dataContractIdentifier}
            </Identifier>
          </LinkContainer>
        </GridItem>

        <GridItem className={'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--IndexName'}>
          <ValueContainer colorScheme={'gray'} size={'xxs'}>
            {contestedResource?.indexName}
          </ValueContainer>
        </GridItem>

        <GridItem className={'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--DocumentType'}>
          <Badge colorScheme={'gray'} size={'xs'}>
            {contestedResource?.documentTypeName}
          </Badge>
        </GridItem>

        <GridItem className={'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--Votes'}>
          <VoteBadges
            totalCountAbstain={contestedResource?.totalCountAbstain}
            totalCountLock={contestedResource?.totalCountLock}
            totalCountTowardsIdentity={contestedResource?.totalCountTowardsIdentity}
          />
        </GridItem>

        <GridItem className={'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--EndsIn'}>
          <TimeRemaining
            startTime={contestedResource?.timestamp}
            endTime={contestedResource?.endTimestamp}
            displayProgress={!isEnded}
          />
        </GridItem>
      </Grid>
    </Link>
  )
}
