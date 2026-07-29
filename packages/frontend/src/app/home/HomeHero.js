'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import { TimeDelta, BigNumber } from '../../components/data'
import { useCountUp } from '../../components/home/hooks'
import { HeroNodes } from '../../components/home'
import { isNetworkLive, isApiOperational } from '../../components/home/utils'
import './HomeHero.scss'

export default function HomeHero ({ status, loading, avgBlockTimeSec, epochNumber, epochStartTime, epochEndTime }) {
  const height = status?.api?.block?.height
  const lastBlockTimestamp = status?.api?.block?.timestamp
  const heightCount = useCountUp(typeof height === 'number' ? height : null)
  const epochCount = useCountUp(typeof epochNumber === 'number' ? epochNumber : null)
  // neutral until status arrives, so the badge never flashes red on first paint
  const ready = !loading && status && Object.keys(status).length > 0
  const live = isNetworkLive(status)
  const apiOk = isApiOperational(status)
  const drive = status?.versions?.software?.drive
  const tenderdash = status?.versions?.software?.tenderdash
  const badgeState = !ready ? 'is-loading' : (live ? 'is-live' : 'is-down')
  const dotState = ok => (!ready ? 'is-loading' : (ok ? 'is-ok' : 'is-down'))

  const epochProgress = (() => {
    if (typeof epochStartTime !== 'number' || typeof epochEndTime !== 'number') return null
    const total = epochEndTime - epochStartTime
    if (total <= 0) return null
    return Math.min(1, Math.max(0, (Date.now() - epochStartTime) / total))
  })()

  const blockProgress = (() => {
    if (typeof lastBlockTimestamp !== 'number' || !avgBlockTimeSec) return null
    const expectedMs = avgBlockTimeSec * 1000
    if (expectedMs <= 0) return null
    return Math.min(1, Math.max(0, (Date.now() - lastBlockTimestamp) / expectedMs))
  })()

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
          <div className={'HomeHero__LiveStat'}>
            <Text className={'HomeHero__LiveLabel'}>
              <span role={'status'} className={`HomeHero__LiveBadge ${badgeState}`}>
                {ready && !live ? 'Offline' : 'Live'}
              </span>
              {' '}Block Height
            </Text>
            <div className={'HomeHero__Height'}>
              {typeof heightCount === 'number' ? <BigNumber>{heightCount}</BigNumber> : '—'}
            </div>
            <div
              className={'HomeHero__EpochProgress'}
              style={blockProgress !== null ? { '--epoch-progress': blockProgress } : undefined}
            >
              <span className={'HomeHero__EpochProgressFill'}/>
              <span className={'HomeHero__EpochProgressLabel'}>
                {lastBlockTimestamp
                  ? <>last block <TimeDelta endDate={new Date(lastBlockTimestamp)} format={'compact'}/> ago</>
                  : '—'}
              </span>
            </div>
          </div>

          <div className={'HomeHero__LiveDivider'} aria-hidden={'true'}/>

          <div className={'HomeHero__LiveStat HomeHero__LiveStat--Epoch'}>
            <Text className={'HomeHero__LiveLabel'}>Epoch</Text>
            <div className={'HomeHero__Height'}>
              {typeof epochCount === 'number' ? <BigNumber>{epochCount}</BigNumber> : '—'}
            </div>
            <div
              className={'HomeHero__EpochProgress'}
              style={epochProgress !== null ? { '--epoch-progress': epochProgress } : undefined}
            >
              <span className={'HomeHero__EpochProgressFill'}/>
              <span className={'HomeHero__EpochProgressLabel'}>
                {typeof epochEndTime === 'number'
                  ? <>ends in <TimeDelta endDate={new Date(epochEndTime)} format={'compact'}/></>
                  : '—'}
              </span>
            </div>
          </div>

          <div className={'HomeHero__LiveDivider'} aria-hidden={'true'}/>

          <div className={'HomeHero__LiveStat HomeHero__LiveStat--Compact'}>
            <Text className={'HomeHero__LiveLabel'}>Network</Text>
            <div className={'HomeHero__LiveValue'}>
              <span className={`HomeHero__LiveDot ${dotState(live)}`}/>
              {status?.network || 'n/a'}
            </div>
            <Text className={'HomeHero__LiveSub'}>
              {drive
                ? <a
                    className={'HomeHero__LiveSubLink'}
                    href={'https://github.com/dashpay/platform/releases'}
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                  >
                    Drive v{drive}
                  </a>
                : '—'}
            </Text>
          </div>

          <div className={'HomeHero__LiveDivider'} aria-hidden={'true'}/>

          <div className={'HomeHero__LiveStat HomeHero__LiveStat--Compact'}>
            <Text className={'HomeHero__LiveLabel'}>API</Text>
            <div className={'HomeHero__LiveValue'}>
              <span className={`HomeHero__LiveDot ${dotState(apiOk)}`}/>
              {apiOk ? 'operational' : 'disrupted'}
            </div>
            <Text className={'HomeHero__LiveSub'}>
              {tenderdash
                ? <a
                    className={'HomeHero__LiveSubLink'}
                    href={'https://github.com/dashpay/tenderdash/releases'}
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                  >
                    Tenderdash v{tenderdash}
                  </a>
                : '—'}
            </Text>
          </div>
        </div>
      </Box>
    </Box>
  )
}
