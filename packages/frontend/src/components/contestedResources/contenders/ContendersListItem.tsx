import type { ComponentType, ReactNode } from 'react'
import { ProportionsLine } from '../../ui/infographics'
import { Identifier as IdentifierJs, TimeDelta as TimeDeltaJs } from '../../data'
import { LinkContainer } from '../../ui/containers'
import { colors } from '../../../styles/colors'
import { VoteManeger } from './VoteManager'
import type { VoteControlStateValue } from './useVoteValidation'
import type { VoteEnumValue } from './constants'
import type { WalletInfo } from 'src/contexts'
import type { WithClassName } from '../../../types'

import './ContendersListItem.css'

// Untyped JS components — loose wrappers until data/* is migrated
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
}>
const TimeDelta = TimeDeltaJs as ComponentType<{
  endDate?: Date
  startDate?: Date
  showTimestampTooltip?: boolean
  tooltipDate?: Date | string
  format?: string
}>

export interface Contender {
  identifier: string
  timestamp?: string | null
  documentStateTransition?: string | null
  documentIdentifier?: string | null
  towardsIdentityVotes?: number | null
  abstainVotes?: number | null
  lockVotes?: number | null
}

interface ContendersListItemProps extends WithClassName {
  contender: Contender
  isVoteVisible?: boolean
  prevVote?: VoteEnumValue | null
  voteValidateState?: VoteControlStateValue
  connectWallet?: () => void
  isConnecting?: boolean
  walletInfo?: WalletInfo | null
  currentIdentity?: string | null
  resourceValue?: string[] | unknown
  refresh?: () => void
  isPollingAfterVote?: boolean
}

const ContendersListItem = ({
  contender,
  className,
  isVoteVisible,
  ...props
}: ContendersListItemProps) => (
  <div
    className={`ContendersListItem ${className || ''} ${isVoteVisible ? '' : 'ContendersListItem__Content--Hidden'}`}
  >
    <div className={'ContendersListItem__ScrollZone'}>
      <div
        className={`ContendersListItem__Content ${isVoteVisible ? '' : 'ContendersListItem__Content--Hidden'}`}
      >
        <div className={'ContendersListItem__Column--Timestamp'}>
          <TimeDelta endDate={new Date(contender.timestamp ?? '')} />
        </div>
        <div className={'ContendersListItem__Column ContendersListItem__Column--Hash'}>
          <LinkContainer
            className={'ContendersListItem__LinkContainer'}
            href={`/transaction/${contender.documentStateTransition}`}
          >
            <Identifier ellipsis={false} styles={['highlight-both']}>
              {contender.documentStateTransition}
            </Identifier>
          </LinkContainer>
        </div>
        <div className={'ContendersListItem__Column ContendersListItem__Column--Identity'}>
          <LinkContainer
            className={'ContendersListItem__LinkContainer'}
            href={`/identity/${contender.identifier}`}
          >
            <Identifier avatar={true} ellipsis={false} styles={['highlight-both']}>
              {contender.identifier}
            </Identifier>
          </LinkContainer>
        </div>
        <div className={'ContendersListItem__Column ContendersListItem__Column--Document'}>
          <LinkContainer
            className={'ContendersListItem__LinkContainer'}
            href={`/document/${contender.documentIdentifier}`}
          >
            <Identifier avatar={true} ellipsis={false} styles={['highlight-both']}>
              {contender.documentIdentifier}
            </Identifier>
          </LinkContainer>
        </div>
        <div className={'ContendersListItem__Column ContendersListItem__Column--Votes'}>
          <ProportionsLine
            items={[
              {
                count: contender?.towardsIdentityVotes ?? 0,
                color: colors.green.emeralds,
                tooltipTitle: 'Towards Identity',
                tooltipContent: <span>{contender.towardsIdentityVotes} Towards identity votes</span>
              },
              {
                count: contender?.abstainVotes ?? 0,
                color: colors.orange.default,
                tooltipTitle: 'Abstain',
                tooltipContent: <span>{contender.abstainVotes} Abstain votes</span>
              },
              {
                count: contender?.lockVotes ?? 0,
                color: colors.red.default,
                tooltipTitle: 'Lock',
                tooltipContent: <span>{contender.lockVotes} Lock votes</span>
              }
            ]}
          />
        </div>

        {isVoteVisible && (
          <div className={'ContendersListItem__Column ContendersListItem__Column--Votes'}>
            <VoteManeger {...contender} {...props} />
          </div>
        )}
      </div>
    </div>
  </div>
)

export default ContendersListItem
