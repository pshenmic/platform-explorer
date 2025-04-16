import { Grid, GridItem } from '@chakra-ui/react'
import { Identifier, TimeDelta } from '../../data'
import { LinkContainer } from '../../ui/containers'
import { useRouter } from 'next/navigation'
import ChoiceBadge from '../ChoiceBadge'
import './VotesListItem.scss'

function VotesListItem ({ vote }) {
  const router = useRouter()

  return (
    <div className={'VotesListItem'}>
      <Grid className={'VotesListItem__Content'}>
        <GridItem className={'VotesListItem__Column VotesListItem__Column--Timestamp'}>
          <TimeDelta endDate={new Date(vote?.timestamp)}/>
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--ProTxHash'}>
          <LinkContainer
            className={'BlocksListItem__LinkContainer'}
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/validator/${vote?.proTxHash}`)
            }}
          >
            <Identifier
              avatar={true}
              ellipsis={true}
              styles={['highlight-both']}
            >
              {vote?.proTxHash}
            </Identifier>
          </LinkContainer>
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--DataContract'}>
          <LinkContainer
            className={'BlocksListItem__LinkContainer'}
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/dataContract/${vote?.dataContractIdentifier}`)
            }}
          >
            <Identifier
              avatar={true}
              ellipsis={true}
              styles={['highlight-both']}
            >
              {vote?.dataContractIdentifier}
            </Identifier>
          </LinkContainer>
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--Voter'}>
          <Identifier
            avatar={true}
            ellipsis={true}
            styles={['highlight-both']}
          >
            {vote?.voterIdentifier}
          </Identifier>
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--Document'}>
          -
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--TowardsIdentity'}>
          <LinkContainer
            className={'BlocksListItem__LinkContainer'}
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/identity/${vote?.towardsIdentity}`)
            }}
          >
            <Identifier
              avatar={true}
              ellipsis={true}
              styles={['highlight-both']}
            >
              {vote?.towardsIdentity}
            </Identifier>
          </LinkContainer>
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--Choice'}>
          <ChoiceBadge choice={vote?.choice}/>
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--Power'}>
          {vote?.power}
        </GridItem>
      </Grid>
    </div>
  )
}

export default VotesListItem
