import type { ComponentType, ReactNode, MouseEvent } from 'react'
import { Badge } from '@chakra-ui/react'
import {
  Identifier as IdentifierJs,
  NotActive as NotActiveJs,
  TimeDelta as TimeDeltaJs
} from '../../data'
import Link from 'next/link'
import { LinkContainer } from '../../ui/containers'
import { useRouter } from 'next/navigation'
import ChoiceBadge from '../ChoiceBadge'
import type { Vote } from '../../../types'
import './VotesListItem.css'

// Untyped JS components — loose wrappers until data/* is migrated
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
  className?: string
}>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode; className?: string }>
const TimeDelta = TimeDeltaJs as ComponentType<{ endDate?: Date }>

interface VotesListItemProps {
  vote: Vote
  showDataContract?: boolean
}

function VotesListItem({ vote, showDataContract = true }: VotesListItemProps) {
  const router = useRouter()

  return (
    <Link href={`/transaction/${vote?.txHash}`} className={'VotesListItem'}>
      <div
        className={`VotesListItem__Content ${!showDataContract ? 'VotesListItem__Content--NoDataContract' : ''}`}
      >
        <div className={'VotesListItem__Column VotesListItem__Column--Timestamp'}>
          {(vote?.timestamp ?? null) ? (
            <TimeDelta endDate={new Date(vote?.timestamp ?? '')} />
          ) : (
            <NotActive>-</NotActive>
          )}
        </div>

        <div className={'VotesListItem__Column VotesListItem__Column--ProTxHash'}>
          {(vote?.proTxHash ?? null) && (
            <LinkContainer
              className={'BlocksListItem__LinkContainer'}
              onClick={(e: MouseEvent) => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/validator/${vote?.proTxHash?.toUpperCase()}`)
              }}
            >
              <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
                {vote?.proTxHash?.toUpperCase()}
              </Identifier>
            </LinkContainer>
          )}
        </div>

        {showDataContract && (
          <div className={'VotesListItem__Column VotesListItem__Column--DataContract'}>
            {(vote?.dataContractIdentifier ?? null) && (
              <LinkContainer
                className={'BlocksListItem__LinkContainer'}
                onClick={(e: MouseEvent) => {
                  e.stopPropagation()
                  e.preventDefault()
                  router.push(`/dataContract/${vote?.dataContractIdentifier}`)
                }}
              >
                <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
                  {vote?.dataContractIdentifier}
                </Identifier>
              </LinkContainer>
            )}
          </div>
        )}

        <div className={'VotesListItem__Column VotesListItem__Column--Document'}>
          {(vote?.documentIdentifier ?? null) && (
            <LinkContainer
              className={'BlocksListItem__LinkContainer'}
              onClick={(e: MouseEvent) => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/document/${vote?.documentIdentifier}`)
              }}
            >
              <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
                {vote?.documentIdentifier}
              </Identifier>
            </LinkContainer>
          )}
        </div>

        <div className={'VotesListItem__Column VotesListItem__Column--TowardsIdentity'}>
          {(vote?.towardsIdentity ?? null) && (
            <LinkContainer
              className={'BlocksListItem__LinkContainer'}
              onClick={(e: MouseEvent) => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/identity/${vote?.towardsIdentity}`)
              }}
            >
              <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
                {vote?.towardsIdentity}
              </Identifier>
            </LinkContainer>
          )}
        </div>

        <div className={'VotesListItem__Column VotesListItem__Column--Choice'}>
          {typeof vote?.choice === 'number' ? (
            <ChoiceBadge choice={vote?.choice} />
          ) : (
            <NotActive>-</NotActive>
          )}
        </div>

        <div className={'VotesListItem__Column VotesListItem__Column--Power'}>
          {typeof vote?.power === 'number' ? (
            <Badge colorScheme={vote?.power > 1 ? 'green' : 'blue'}>x{vote?.power}</Badge>
          ) : (
            <NotActive>-</NotActive>
          )}
        </div>
      </div>
    </Link>
  )
}

export default VotesListItem
