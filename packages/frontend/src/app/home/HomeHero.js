'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import { TimeDelta, BigNumber } from '../../components/data'
import { useCountUp } from '../../components/home/hooks'
import { HeroNodes } from '../../components/home'
import { isNetworkLive } from '../../components/home/utils'
import './HomeHero.scss'

export default function HomeHero ({ status, loading, avgBlockTimeSec }) {
  const height = status?.api?.block?.height
  const lastBlockTimestamp = status?.api?.block?.timestamp
  const heightCount = useCountUp(typeof height === 'number' ? height : null)
  // neutral until status arrives, so the badge never flashes red on first paint
  const ready = !loading && status && Object.keys(status).length > 0
  const live = isNetworkLive(status)
  const badgeState = !ready ? 'is-loading' : (live ? 'is-live' : 'is-down')

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder HomeHero'}>
      <div className={'HomeHero__Glow'} aria-hidden={'true'}/>
      <HeroNodes/>

      <Box className={'HomeHero__Inner'}>
        <div className={'HomeHero__Brand'}>
          <Text className={'HomeHero__Welcome'}>Welcome to</Text>
          <Heading as={'h1'} className={'HomeHero__Title'}>Platform Explorer</Heading>
          <Text className={'HomeHero__Tagline'}>The information resource about Dash Platform</Text>
          <Text className={'HomeHero__Description'}>
            Your portal for real-time and historical data across the Dash blockchain &mdash; track and
            verify transactions, identities, contracts and documents with confidence.
          </Text>
        </div>

        <div className={`HomeHero__Live ${loading ? 'HomeHero__Live--Loading' : ''}`}>
          <Text className={'HomeHero__LiveLabel'}>
            <span role={'status'} className={`HomeHero__LiveBadge ${badgeState}`}>
              {ready && !live ? 'Offline' : 'Live'}
            </span>
            {' '}Block Height
          </Text>
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
    </Box>
  )
}
