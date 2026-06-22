'use client'

import Link from 'next/link'
import { Flex, Progress } from '@chakra-ui/react'
import EpochProgress from '../networkStatus/EpochProgress'
import { useCountUp } from './hooks'
import { compact, isNetworkLive, isApiOperational } from './utils'
import { StatusCell } from './StatusCell'
import { VersionLink } from './VersionLink'
import { ContestedCell } from './ContestedCell'
import { TotalVotesCell } from './TotalVotesCell'

function ShieldGlyph ({ className }) {
  return (
    <svg className={className} viewBox={'0 0 12 12'} aria-hidden={'true'}>
      <path d={'M6 0.6 1.3 2.3v3.3c0 3 2 4.8 4.7 5.8 2.7-1 4.7-2.8 4.7-5.8V2.3L6 0.6Z'}/>
    </svg>
  )
}

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
  const live = isNetworkLive(status)
  const apiOk = isApiOperational(status)
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
          ? <span className={'HomeHero__Epoch'}>
              #{epoch.number}
              {epoch?.startTime && epoch?.endTime &&
                <EpochProgress className={'HomeHero__EpochProgress'} epoch={epoch}/>}
            </span>
          : 'n/a'}
      </StatusCell>

      <StatusCell
        label={'Status'}
        hint={`Network: ${live ? 'live' : 'stalled'} (${status?.network || 'n/a'}) · API: ${apiOk ? 'operational' : 'disrupted'}. Network = blocks are being produced; API = the explorer data service is responding.`}
      >
        <span className={'HomeHero__StatusLines'}>
          <span className={'HomeHero__StatusLine'}>
            <i className={`HomeHero__DotMark ${live ? 'is-ok' : 'is-down'}`} aria-hidden={'true'}/>
            {status?.network || 'n/a'}
          </span>
          <span className={'HomeHero__StatusLine'}>
            <i className={`HomeHero__DotMark ${apiOk ? 'is-ok' : 'is-down'}`} aria-hidden={'true'}/>
            {apiOk ? 'operational' : 'disrupted'}
          </span>
        </span>
      </StatusCell>

      <StatusCell label={'Versions'} hint={'Software the network runs — Drive stores data; Tenderdash (TD) keeps all nodes in agreement.'}>
        {status?.versions?.software?.drive !== undefined || status?.versions?.software?.tenderdash
          ? <span className={'HomeHero__Versions'}>
              <VersionLink label={'Drive'} version={status?.versions?.software?.drive} href={'https://github.com/dashpay/platform/releases'}/>
              <VersionLink label={'TD'} version={status?.versions?.software?.tenderdash} href={'https://github.com/dashpay/tenderdash/releases'}/>
            </span>
          : '-'}
      </StatusCell>

      <StatusCell label={'Masternodes'} hint={<MasternodesHint/>}>
        <span className={'HomeHero__MnStack'}>
          <Link href={'/validators'} className={'HomeHero__MnHead'}>
            <ShieldGlyph className={'HomeHero__MnShield'}/>
            {typeof masternodesAnimated === 'number' ? masternodesAnimated : '-'}
          </Link>

          {validatorsTotal > 0 && typeof activeTotal === 'number' &&
            <span className={'HomeHero__MnBar'}>
              <Progress
                className={'HomeHero__MnProgress'}
                value={Math.min(100, (activeTotal / validatorsTotal) * 100)}
                size={'xs'}
              />
              <span className={'HomeHero__MnBarLabel'}>{activeTotal} active</span>
            </span>}

          {securedDash &&
            <span className={'HomeHero__MnSecured'}>
              {compact(securedDash)} DASH{securedUsd ? ` · ~$${compact(securedUsd)}` : ''}
            </span>}
        </span>
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
