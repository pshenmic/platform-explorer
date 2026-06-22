'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import { TimeDelta, BigNumber } from '../../components/data'
import { MetricWave, StatusBar } from '../../components/home'
import { useCountUp } from '../../components/home/hooks'
import './HomeHero.scss'

export default function HomeHero ({ status, loading, avgBlockTimeSec, contested, activeContested, latestContested, latestVotes, validators, validatorsActive, epochData, rate }) {
  const height = status?.api?.block?.height
  const lastBlockTimestamp = status?.api?.block?.timestamp
  const heightCount = useCountUp(typeof height === 'number' ? height : null)

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder HomeHero'}>
      <div className={'HomeHero__Glow'} aria-hidden={'true'}/>

      <Box className={'HomeHero__Inner'}>
        <div className={'HomeHero__Brand'}>
          <Text className={'HomeHero__Welcome'}>Dash Platform</Text>
          <Heading as={'h1'} className={'HomeHero__Title'}>Platform Explorer</Heading>
          <Text className={'HomeHero__Description'}>
            Real-time transactions, data contracts, documents &amp; identities — straight from the chain.
          </Text>
        </div>

        <div className={`HomeHero__Live ${loading ? 'HomeHero__Live--Loading' : ''}`}>
          <Text className={'HomeHero__LiveLabel'}>Live Block Height</Text>
          <div className={'HomeHero__Height'}>
            {typeof heightCount === 'number' ? <BigNumber>{heightCount}</BigNumber> : '—'}
          </div>
          <Text className={'HomeHero__LiveMeta'}>
            {avgBlockTimeSec ? `Avg ~${avgBlockTimeSec}s` : 'Live'}
            {lastBlockTimestamp &&
              <> · last block <TimeDelta endDate={new Date(lastBlockTimestamp)}/></>}
          </Text>
        </div>
      </Box>

      <MetricWave status={status}/>

      <StatusBar
        status={status}
        contested={contested}
        activeContested={activeContested}
        latestContested={latestContested}
        latestVotes={latestVotes}
        validators={validators}
        validatorsActive={validatorsActive}
        epochData={epochData}
        rate={rate}
      />
    </Box>
  )
}
