import { Grid, GridItem, Badge } from '@chakra-ui/react'
import { Alias, BigNumber, Identifier, NotActive, TimeDelta } from '../data'
import ValueContainer from '../ui/containers/ValueContainer'
import Link from 'next/link'
import { Tooltip } from '../ui/Tooltips'
import StatusIcon from '../transactions/StatusIcon'
import './ContestedResourcesListItem.scss'

export function ContestedResourcesListItem ({ contestedResource }) {
  console.log('contestedResources', contestedResource)

  const getResourceValue = () => (
    (contestedResource?.resourceValue?.[1] || '') +
    `${contestedResource?.resourceValue?.[0]
      ? '.' + contestedResource?.resourceValue?.[0]
      : ''}`
  )

  return (
    <Link
      href={`/contestedResource/${contestedResource?.identifier}`}
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

        <GridItem className={'ContestedResourcesListItem__Column ContestedResourcesListItem__Column--DocumentsCount'}>
          <Alias>{getResourceValue()}</Alias>
        </GridItem>

        <GridItem className={'ContestedResourcesListItem__Column'}>
          <Identifier
            avatar={true}
            ellipsis={false}
            styles={['highlight-both']}
          >
            {contestedResource?.dataContractIdentifier}
          </Identifier>
        </GridItem>

        <GridItem className={'ContestedResourcesListItem__Column'}>
          <ValueContainer colorScheme={'gray'} size={'xs'}>
            {contestedResource?.indexName}
          </ValueContainer>
        </GridItem>

        <GridItem className={'ContestedResourcesListItem__Column'}>
          <Badge colorScheme={'gray'} size={'xs'}>
            {contestedResource?.documentTypeName}
          </Badge>
        </GridItem>

        <GridItem className={'ContestedResourcesListItem__Column'}> {/* votes */}
          <Badge colorScheme={'green'} size={'xs'}>
            {contestedResource?.totalCountAbstain}
          </Badge>
          <Badge colorScheme={'orange'} size={'xs'}>
            {contestedResource?.totalCountLock}
          </Badge>
          <Badge colorScheme={'red'} size={'xs'}>
            {contestedResource?.totalCountTowardsIdentity}
          </Badge>
        </GridItem>
      </Grid>
    </Link>
  )
}
