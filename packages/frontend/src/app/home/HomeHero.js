'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import { TimeDelta, BigNumber } from '../../components/data'
import { useCountUp } from '../../components/home/hooks'
import { HeroNodes, Skeleton } from '../../components/home'
import { isNetworkLive, isApiOperational } from '../../components/home/utils'
import './HomeHero.scss'

// /status timestamps are ISO strings; epoch start/end are epoch-ms numbers — accept both
function toMs (value) {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const ms = new Date(value).getTime()
  return Number.isFinite(ms) ? ms : null
}

function toNumber (value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value !== '' && Number.isFinite(Number(value))) return Number(value)
  return null
}

export default function HomeHero ({ status, loading, avgBlockTimeSec, epochNumber, epochStartTime, epochEndTime }) {
  const height = toNumber(status?.api?.block?.height)
  const lastBlockMs = toMs(status?.api?.block?.timestamp)
  const epochNum = toNumber(epochNumber)
  const epochStartMs = toMs(epochStartTime)
  const epochEndMs = toMs(epochEndTime)
  const heightReady = height !== null
  const epochReady = epochNum !== null
  const heightCount = useCountUp(heightReady ? height : null)
  const epochCount = useCountUp(epochReady ? epochNum : null)
  // neutral until status arrives, so the badge never flashes red on first paint
  const ready = !loading && status && Object.keys(status).length > 0
  const live = isNetworkLive(status)
  const apiOk = isApiOperational(status)
  const drive = status?.versions?.software?.drive
  const tenderdash = status?.versions?.software?.tenderdash
  const badgeState = !ready ? 'is-loading' : (live ? 'is-live' : 'is-down')
  const dotState = ok => (!ready ? 'is-loading' : (ok ? 'is-ok' : 'is-down'))

  const epochProgress = (() => {
    if (epochStartMs === null || epochEndMs === null) return null
    const total = epochEndMs - epochStartMs
    if (total <= 0) return null
    return Math.min(1, Math.max(0, (Date.now() - epochStartMs) / total))
  })()

  const blockProgress = (() => {
    if (lastBlockMs === null || !avgBlockTimeSec) return null
    const expectedMs = avgBlockTimeSec * 1000
    if (expectedMs <= 0) return null
    return Math.min(1, Math.max(0, (Date.now() - lastBlockMs) / expectedMs))
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

        <div className={'HomeHero__Live'} aria-busy={!ready || !heightReady || !epochReady}>
          <div className={'HomeHero__LiveStat'}>
            <Text className={'HomeHero__LiveLabel'}>
              <span role={'status'} className={`HomeHero__LiveBadge ${badgeState}`}>
                {!ready ? 'Live' : (live ? 'Live' : 'Offline')}
              </span>
              {' '}Block Height
            </Text>
            <div className={'HomeHero__Height'}>
              {heightReady && typeof heightCount === 'number'
                ? <BigNumber>{heightCount}</BigNumber>
                : <Skeleton className={'HomeHero__HeightSkeleton'} w={'9ch'} h={'1em'} radius={6}/>}
            </div>
            <div
              className={'HomeHero__EpochProgress'}
              style={blockProgress !== null ? { '--epoch-progress': blockProgress } : undefined}
            >
              <span className={'HomeHero__EpochProgressFill'}/>
              <span className={'HomeHero__EpochProgressLabel'}>
                {lastBlockMs !== null
                  ? <>last block <TimeDelta endDate={new Date(lastBlockMs)} format={'compact'}/> ago</>
                  : <Skeleton w={'9ch'} h={'0.65em'} radius={4}/>}
              </span>
            </div>
          </div>

          <div className={'HomeHero__LiveDivider'} aria-hidden={'true'}/>

          <div className={'HomeHero__LiveStat HomeHero__LiveStat--Epoch'}>
            <Text className={'HomeHero__LiveLabel'}>Epoch</Text>
            <div className={'HomeHero__Height'}>
              {epochReady && typeof epochCount === 'number'
                ? <BigNumber>{epochCount}</BigNumber>
                : <Skeleton className={'HomeHero__HeightSkeleton'} w={'5ch'} h={'1em'} radius={6}/>}
            </div>
            <div
              className={'HomeHero__EpochProgress'}
              style={epochProgress !== null ? { '--epoch-progress': epochProgress } : undefined}
            >
              <span className={'HomeHero__EpochProgressFill'}/>
              <span className={'HomeHero__EpochProgressLabel'}>
                {epochEndMs !== null
                  ? <>ends in <TimeDelta endDate={new Date(epochEndMs)} format={'compact'}/></>
                  : <Skeleton w={'8ch'} h={'0.65em'} radius={4}/>}
              </span>
            </div>
          </div>

          <div className={'HomeHero__LiveDivider'} aria-hidden={'true'}/>

          <div className={'HomeHero__LiveStat HomeHero__LiveStat--Compact'}>
            <Text className={'HomeHero__LiveLabel'}>Network</Text>
            <div className={'HomeHero__LiveValue'}>
              <span className={`HomeHero__LiveDot ${dotState(live)}`}/>
              {ready
                ? (status?.network || '—')
                : <Skeleton w={'6ch'} h={'0.85em'} radius={4}/>}
            </div>
            <Text className={'HomeHero__LiveSub'}>
              {ready
                ? (drive
                    ? <a
                        className={'HomeHero__LiveSubLink'}
                        href={'https://github.com/dashpay/platform/releases'}
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                      >
                        Drive v{drive}
                      </a>
                    : '—')
                : <Skeleton w={'7ch'} h={'0.7em'} radius={4}/>}
            </Text>
          </div>

          <div className={'HomeHero__LiveDivider'} aria-hidden={'true'}/>

          <div className={'HomeHero__LiveStat HomeHero__LiveStat--Compact'}>
            <Text className={'HomeHero__LiveLabel'}>API</Text>
            <div className={'HomeHero__LiveValue'}>
              <span className={`HomeHero__LiveDot ${dotState(apiOk)}`}/>
              {ready
                ? (apiOk ? 'operational' : 'disrupted')
                : <Skeleton w={'7ch'} h={'0.85em'} radius={4}/>}
            </div>
            <Text className={'HomeHero__LiveSub'}>
              {ready
                ? (tenderdash
                    ? <a
                        className={'HomeHero__LiveSubLink'}
                        href={'https://github.com/dashpay/tenderdash/releases'}
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                      >
                        Tenderdash v{tenderdash}
                      </a>
                    : '—')
                : <Skeleton w={'9ch'} h={'0.7em'} radius={4}/>}
            </Text>
          </div>
        </div>
      </Box>
    </Box>
  )
}
