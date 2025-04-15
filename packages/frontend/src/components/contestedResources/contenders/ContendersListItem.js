import { Grid, GridItem } from '@chakra-ui/react'
import { ProportionsLine } from '../../ui/infographics'
import { Identifier, TimeDelta } from '../../data'
import { LinkContainer } from '../../ui/containers'
import { useRouter } from 'next/navigation'
import './ContendersListItem.scss'

function ContendersListItem ({ contender, className }) {
  const router = useRouter()

  console.log('contender', contender)

  return (
    <div className={`ContendersListItem ${className || ''}`}>
      <Grid className={'ContendersListItem__Content'}>
        <GridItem className={'ContendersListItem__Column--Timestamp'}>
          <TimeDelta endDate={new Date(contender?.timestamp)}/>
        </GridItem>
        <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Hash'}>
          <Identifier
            avatar={true}
            ellipsis={false}
            styles={['highlight-both']}
          >
            {contender?.documentStateTransition}
          </Identifier>
        </GridItem>
        <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Identity'}>
          <Identifier
            avatar={true}
            ellipsis={false}
            styles={['highlight-both']}
          >
            {contender?.identifier}
          </Identifier>
        </GridItem>
        <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Document'}>
          <LinkContainer
            className={'BlocksListItem__LinkContainer'}
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/document/${contender?.documentIdentifier}`)
            }}
          >
            <Identifier
              avatar={true}
              ellipsis={false}
              styles={['highlight-both']}
            >
              {contender?.documentIdentifier}
            </Identifier>
          </LinkContainer>
        </GridItem>
        <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Votes'}>
          <ProportionsLine items={[
            {
              count: contender?.totalCountTowardsIdentity,
              color: '#8EE9B6',
              tooltipTitle: 'Towards Identity',
              tooltipContent: <span>{contender?.totalCountTowardsIdentity} Towards identity votes</span>
            },
            {
              count: contender?.abstainVotes,
              color: '#F4B270',
              tooltipTitle: 'Abstain',
              tooltipContent: <span>{contender?.abstainVotes} Abstain votes</span>
            },
            {
              count: contender?.lockVotes,
              color: '#EF7373',
              tooltipTitle: 'Lock',
              tooltipContent: <span>{contender?.lockVotes} Lock votes</span>
            }
          ]} />
        </GridItem>
      </Grid>
    </div>
  )
}

export default ContendersListItem
