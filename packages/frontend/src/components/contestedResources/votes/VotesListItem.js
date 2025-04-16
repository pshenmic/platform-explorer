import { Badge, Grid, GridItem } from '@chakra-ui/react'
import { Identifier, NotActive, TimeDelta } from '../../data'
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
          {(vote?.timestamp ?? null)
            ? <TimeDelta endDate={new Date(vote?.timestamp)}/>
            : <NotActive>-</NotActive>
          }
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--ProTxHash'}>
          {(vote?.proTxHash ?? null) &&
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
          }
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--DataContract'}>
          {(vote?.dataContractIdentifier ?? null) &&
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
          }
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--Voter'}>
          {(vote?.voterIdentifier ?? null) &&
            <LinkContainer
              className={'BlocksListItem__LinkContainer'}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/identity/${vote?.voterIdentifier}`)
              }}
            >
              <Identifier
                avatar={true}
                ellipsis={true}
                styles={['highlight-both']}
              >
                {vote?.voterIdentifier}
              </Identifier>
            </LinkContainer>
          }
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--Document'}>
          -
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--TowardsIdentity'}>
          {(vote?.towardsIdentity ?? null) &&
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
          }
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--Choice'}>
          {(vote?.choice ?? null)
            ? <ChoiceBadge choice={vote?.choice}/>
            : <NotActive>-</NotActive>
          }
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--Power'}>
          {(vote?.power ?? null)
            ? <Badge
                colorScheme={vote?.power > 1 ? 'green' : 'blue'}
              >
                x{vote?.power}
              </Badge>
            : <NotActive>-</NotActive>
          }
        </GridItem>
      </Grid>
    </div>
  )
}

export default VotesListItem
