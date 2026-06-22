'use client'

import Link from 'next/link'
import { Flex, Progress } from '@chakra-ui/react'
import EpochProgress from '../networkStatus/EpochProgress'
import { useCountUp } from './hooks'
import { compact } from './utils'
import { StatusCell } from './StatusCell'
import { ContestedCell } from './ContestedCell'
import { TotalVotesCell } from './TotalVotesCell'

function MasternodesHint () {
  return (
    <span>
      Validators (evonodes) securing the network and casting governance votes.
      <span className={'HomeHero__VotesBreakdown'}>
        <span className={'HomeHero__VotesBreakdownLabel'}>Value secured</span>
        <span className={'HomeHero__VotesBreakdownRow'}>Collateral locked by nodes: 4000 DASH per evonode (1000 per regular). Active = currently in the validator set.</span>
      </span>
    </span>
  )
}

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

export function StatusBar ({ status, contested, activeContested, latestContested, latestVotes, validators, validatorsActive, epochData, rate }) {
  const epoch = status?.epoch

  const contestedCount = contested?.data?.totalContestedResources
  const votesCount = contested?.data?.totalVotesCount
  const validatorsTotal = validators?.data?.pagination?.total
  const activeTotal = validatorsActive?.data?.pagination?.total

  // secured = node count × collateral (evonode 4000 / regular 1000 DASH); evo ratio sampled from loaded page.
  const rows = validators?.data?.resultSet || []
  const evoCount = rows.filter(v => /evo|high/i.test(v?.proTxInfo?.type || '')).length
  const evoRatio = rows.length ? evoCount / rows.length : 1
  const avgCollateral = evoRatio * 4000 + (1 - evoRatio) * 1000
  const securedDash = validatorsTotal > 0 ? Math.round(validatorsTotal * avgCollateral) : null
  const securedUsd = securedDash && rate?.data?.usd ? securedDash * rate.data.usd : null

  const masternodesAnimated = useCountUp(validatorsTotal > 0 ? validatorsTotal : null)

  return (
    <Flex className={'HomeHero__StatusBar'}>
      <StatusCell label={'Epoch'} hint={'A fixed ~9-day window the network runs in. A new epoch starts automatically when the timer ends.'}>
        {typeof epoch?.number === 'number'
          ? <div className={'HomeHero__Gov'}>
              <div className={'HomeHero__GovLeft'}>
                <span className={'HomeHero__GovCount'}>#{epoch.number}</span>
                <span className={'HomeHero__GovCountLabel'}>epoch</span>
              </div>
              {epoch?.startTime && epoch?.endTime &&
                <EpochProgress className={'HomeHero__EpochProgress'} epoch={epoch}/>}
            </div>
          : 'n/a'}
      </StatusCell>

      <StatusCell label={'Masternodes'} hint={<MasternodesHint/>}>
        <div className={'HomeHero__Gov'}>
          <div className={'HomeHero__GovLeft'}>
            <Link
              href={'/validators'}
              className={'HomeHero__GovCount'}
              aria-label={`${validatorsTotal || 0} masternodes${typeof activeTotal === 'number' ? `, ${activeTotal} active` : ''}`}
            >
              {typeof masternodesAnimated === 'number' ? masternodesAnimated : '-'}
              {typeof activeTotal === 'number' &&
                <span className={'HomeHero__MnActive'}>/ {activeTotal}</span>}
            </Link>
            {validatorsTotal > 0 && typeof activeTotal === 'number' &&
              <span className={'HomeHero__MnBar'}>
                <Progress
                  className={'HomeHero__MnProgress'}
                  value={Math.min(100, (activeTotal / validatorsTotal) * 100)}
                  size={'xs'}
                />
              </span>}
          </div>

          {securedDash &&
            <div className={'HomeHero__MnSecured'}>
              <span className={'HomeHero__MnDash'}>{compact(securedDash)} DASH</span>
              {securedUsd && <span className={'HomeHero__MnUsd'}>≈ ${compact(securedUsd)}</span>}
            </div>}
        </div>
      </StatusCell>

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
