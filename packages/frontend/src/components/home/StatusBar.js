'use client'

import Link from 'next/link'
import { Flex } from '@chakra-ui/react'
import { BigNumber } from '../data'
import { useCountUp } from './hooks'
import { compact } from './utils'
import { StatusCell } from './StatusCell'
import { ContestedCell } from './ContestedCell'
import { TotalVotesCell } from './TotalVotesCell'

// cumulative network totals from the status payload (the figures the old KPI wave showed)
const TOTALS = [
  { key: 'transactions', label: 'Transactions', field: 'transactionsCount', href: '/transactions', hint: 'Total state transitions processed across the network.' },
  { key: 'dataContracts', label: 'Data Contracts', field: 'dataContractsCount', href: '/dataContracts', hint: 'Total registered data contracts (app schemas).' },
  { key: 'documents', label: 'Documents', field: 'documentsCount', hint: 'Total documents across all data contracts.' },
  { key: 'identities', label: 'Identities', field: 'identitiesCount', href: '/identities', hint: 'Total registered identities on the platform.' }
]

function TotalCell ({ item, status }) {
  const value = status?.[item.field]
  const animated = useCountUp(typeof value === 'number' ? value : null)
  const num = animated != null ? <BigNumber>{animated}</BigNumber> : '-'

  return (
    <StatusCell label={item.label} hint={item.hint}>
      {item.href
        ? <Link href={item.href} className={'HomeHero__GovCount HomeHero__TotalNum'}>{num}</Link>
        : <span className={'HomeHero__GovCount HomeHero__TotalNum'}>{num}</span>}
    </StatusCell>
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
  const contestedCount = contested?.data?.totalContestedResources
  const votesCount = contested?.data?.totalVotesCount
  const validatorsTotal = validators?.data?.pagination?.total

  // secured = node count × collateral (evonode 4000 / regular 1000 DASH); evo ratio sampled from loaded page.
  const rows = validators?.data?.resultSet || []
  const evoCount = rows.filter(v => /evo|high/i.test(v?.proTxInfo?.type || '')).length
  const evoRatio = rows.length ? evoCount / rows.length : 1
  const avgCollateral = evoRatio * 4000 + (1 - evoRatio) * 1000
  const securedDash = validatorsTotal > 0 ? Math.round(validatorsTotal * avgCollateral) : null
  const securedUsd = securedDash && rate?.data?.usd ? securedDash * rate.data.usd : null

  const lockedAnimated = useCountUp(securedDash || null)

  return (
    <Flex className={'HomeHero__StatusBar'}>
      {TOTALS.map(item => <TotalCell key={item.key} item={item} status={status}/>)}

      <StatusCell label={'Value'} hint={<MasternodesHint/>}>
        <div className={'HomeHero__GovLeft'}>
          <Link
            href={'/validators'}
            className={'HomeHero__GovCount HomeHero__Value'}
            aria-label={securedDash ? `${securedDash} DASH locked by masternodes` : 'masternodes collateral'}
          >
            {lockedAnimated != null ? <BigNumber>{lockedAnimated}</BigNumber> : '-'}
            <span className={'HomeHero__ValueUnit'}>DASH</span>
          </Link>
          {securedUsd &&
            <span className={'HomeHero__ValueUsd'}>≈ ${compact(securedUsd)}</span>}
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
