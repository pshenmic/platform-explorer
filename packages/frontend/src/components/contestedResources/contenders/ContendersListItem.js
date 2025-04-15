import { Grid, GridItem } from '@chakra-ui/react'
import { ProportionsLine } from '../../ui/infographics'
import './ContendersListItem.scss'

function ContendersListItem ({ contender, className }) {
  console.log('contender', contender)

  return (
    <div className={`ContendersListItem ${className || ''}`}>
      <Grid className={'ContendersListItem__Content'}>
        <GridItem className={'ContendersListItem__Column--Date'}>
          {contender?.timestamp}
        </GridItem>
        <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Hash'}>
          2 Hash
        </GridItem>
        <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Identity'}>
          {contender?.identifier}
        </GridItem>
        <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Document'}>
          {contender?.documentIdentifier}
        </GridItem>
        <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Votes'}>
          <ProportionsLine items={[
            {
              count: contender?.totalCountTowardsIdentity,
              color: '#8EE9B6',
              tooltipContent: 'Towards Identity'
            },
            {
              count: contender?.abstainVotes,
              color: '#F4B270',
              tooltipContent: 'Abstain'
            },
            {
              count: contender?.lockVotes,
              color: '#EF7373',
              tooltipContent: 'Lock'
            }
          ]} />
        </GridItem>
      </Grid>
    </div>
  )
}

export default ContendersListItem
