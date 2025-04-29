import { Badge, Grid, GridItem } from '@chakra-ui/react'
import { Identifier, NotActive, TimeDelta } from '../../data'
import Link from 'next/link'
import { LinkContainer } from '../../ui/containers'
import { useRouter } from 'next/navigation'
import ChoiceBadge from '../ChoiceBadge'
import './VotesListItem.scss'

function VotesListItem ({ vote, showDataContract = true }) {
  const router = useRouter()

  return (
    <Link href={`/transaction/${vote?.txHash}`} className={'VotesListItem'}>
      <Grid className={`VotesListItem__Content ${!showDataContract ? 'VotesListItem__Content--NoDataContract' : ''}`}>
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
                router.push(`/validator/${vote?.proTxHash?.toUpperCase()}`)
              }}
            >
              <Identifier
                avatar={true}
                ellipsis={true}
                styles={['highlight-both']}
              >
                {vote?.proTxHash?.toUpperCase()}
              </Identifier>
            </LinkContainer>
          }
        </GridItem>

        {showDataContract &&
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
        }

        <GridItem className={'VotesListItem__Column VotesListItem__Column--Document'}>
          {(vote?.documentIdentifier ?? null) &&
            <LinkContainer
              className={'BlocksListItem__LinkContainer'}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/document/${vote?.documentIdentifier}`)
              }}
            >
              <Identifier
                avatar={true}
                ellipsis={true}
                styles={['highlight-both']}
              >
                {vote?.documentIdentifier}
              </Identifier>
            </LinkContainer>
          }
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
          {typeof vote?.choice === 'number'
            ? <ChoiceBadge choice={vote?.choice}/>
            : <NotActive>-</NotActive>
          }
        </GridItem>

        <GridItem className={'VotesListItem__Column VotesListItem__Column--Power'}>
          {typeof vote?.power === 'number'
            ? <Badge
                colorScheme={vote?.power > 1 ? 'green' : 'blue'}
              >
                x{vote?.power}
              </Badge>
            : <NotActive>-</NotActive>
          }
        </GridItem>
      </Grid>
    </Link>
  )
}

export default VotesListItem
