'use client'

import { Flex } from '@chakra-ui/react'
import { StatusCell } from './StatusCell'
import { ContestedCell } from './ContestedCell'
import { TotalVotesCell } from './TotalVotesCell'

function VotesHint ({ topVotedResource }) {
  const t = topVotedResource
  const hasBreakdown = t && typeof t.totalCountTowardsIdentity === 'number'
  return (
    <span className={'HomeHero__VotesHint'}>
      Votes cast by masternodes (servers securing the network) to settle contested names.
      {hasBreakdown &&
        <span className={'HomeHero__VotesBreakdown'}>
          <span className={'HomeHero__VotesBreakdownLabel'}>Most-voted resource this epoch</span>
          <span className={'HomeHero__VotesBreakdownRow'}>
            <b className={'HomeHero__Vote HomeHero__Vote--towards'}>{t.totalCountTowardsIdentity}</b> Towards
            <span className={'HomeHero__VoteSep'}>·</span>
            <b className={'HomeHero__Vote HomeHero__Vote--abstain'}>{t.totalCountAbstain}</b> Abstain
            <span className={'HomeHero__VoteSep'}>·</span>
            <b className={'HomeHero__Vote HomeHero__Vote--lock'}>{t.totalCountLock}</b> Lock
          </span>
        </span>}
    </span>
  )
}

export function StatusBar ({ contested, activeContested, latestContested, latestVotes, epochData }) {
  const contestedCount = contested?.data?.totalContestedResources
  const votesCount = contested?.data?.totalVotesCount

  return (
    <Flex className={'HomeHero__StatusBar'}>
      <StatusCell
        label={'Contested'}
        hint={'Usernames/resources more than one identity is claiming; masternodes vote to decide the owner.'}
      >
        <ContestedCell count={contestedCount} active={activeContested} latest={latestContested}/>
      </StatusCell>

      <StatusCell
        label={'Total votes'}
        hint={<VotesHint topVotedResource={epochData?.data?.topVotedResource}/>}
      >
        <TotalVotesCell count={votesCount} votes={latestVotes}/>
      </StatusCell>
    </Flex>
  )
}
