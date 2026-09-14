'use client'

import type { ReactNode } from 'react'
import { StatusCell } from './StatusCell'
import { ContestedCell } from './ContestedCell'
import { TotalVotesCell } from './TotalVotesCell'
import type {
  ContestedResource,
  ContestedResourcesStatus,
  EpochData,
  LoadableState,
  PaginatedResultSet,
  Vote,
  VotingTotals
} from '../../types'

interface VotesHintProps {
  topVotedResource?: VotingTotals | null
}

function VotesHint({ topVotedResource }: VotesHintProps) {
  const t = topVotedResource
  const hasBreakdown = t && typeof t.totalCountTowardsIdentity === 'number'
  return (
    <span className={'HomeHero__VotesHint'}>
      Votes cast by masternodes (servers securing the network) to settle contested names.
      {hasBreakdown && t && (
        <span className={'HomeHero__VotesBreakdown'}>
          <span className={'HomeHero__VotesBreakdownLabel'}>Most-voted resource this epoch</span>
          <span className={'HomeHero__VotesBreakdownRow'}>
            <b className={'HomeHero__Vote HomeHero__Vote--towards'}>
              {t.totalCountTowardsIdentity}
            </b>{' '}
            Towards
            <span className={'HomeHero__VoteSep'}>·</span>
            <b className={'HomeHero__Vote HomeHero__Vote--abstain'}>{t.totalCountAbstain}</b>{' '}
            Abstain
            <span className={'HomeHero__VoteSep'}>·</span>
            <b className={'HomeHero__Vote HomeHero__Vote--lock'}>{t.totalCountLock}</b> Lock
          </span>
        </span>
      )}
    </span>
  )
}

type ContestedStatsState =
  | LoadableState<ContestedResourcesStatus>
  | {
      data?: ContestedResourcesStatus | null
    }

type ContestedFeedState =
  | LoadableState<PaginatedResultSet<ContestedResource>>
  | {
      data?: PaginatedResultSet<ContestedResource> | null
    }

type VotesFeedState =
  | LoadableState<PaginatedResultSet<Vote>>
  | {
      data?: PaginatedResultSet<Vote> | null
    }

type EpochState =
  | LoadableState<EpochData>
  | {
      data?: EpochData | null
    }

interface StatusBarProps {
  contested?: ContestedStatsState | null
  activeContested?: ContestedFeedState | null
  latestContested?: ContestedFeedState | null
  latestVotes?: VotesFeedState | null
  epochData?: EpochState | null
}

export function StatusBar({
  contested,
  activeContested,
  latestContested,
  latestVotes,
  epochData
}: StatusBarProps) {
  const contestedCount = contested?.data?.totalContestedResources
  const votesCount = contested?.data?.totalVotesCount

  return (
    <div className={'HomeHero__StatusBar'}>
      <StatusCell
        label={'Contested'}
        hint={
          'Usernames/resources more than one identity is claiming; masternodes vote to decide the owner.'
        }
      >
        <ContestedCell count={contestedCount} active={activeContested} latest={latestContested} />
      </StatusCell>

      <StatusCell
        label={'Total votes'}
        hint={(<VotesHint topVotedResource={epochData?.data?.topVotedResource} />) as ReactNode}
      >
        <TotalVotesCell count={votesCount} votes={latestVotes} />
      </StatusCell>
    </div>
  )
}
