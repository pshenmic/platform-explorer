'use client'

import { Box, Flex, Heading, Text, Badge } from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { TimeDelta, BigNumber } from '../../components/data'
import HomeHeroSparkline from './HomeHeroSparkline.js'
import './HomeHero.scss'

function ChainPulse () {
  const nodes = [4, 50, 96, 142, 188]
  return (
    <svg className={'HomeHero__Pulse'} viewBox={'0 0 192 24'} aria-hidden={'true'}>
      <line x1={4} y1={12} x2={188} y2={12} className={'HomeHero__PulseLine'}/>
      {nodes.map((cx, i) => (
        <circle key={i} cx={cx} cy={12} r={3} className={'HomeHero__PulseNode'}/>
      ))}
      <circle cx={0} cy={12} r={4} className={'HomeHero__PulseDot'}/>
    </svg>
  )
}

function isNetworkLive (status) {
  const ts = status?.tenderdash?.block?.timestamp || status?.api?.block?.timestamp
  if (!ts) return false
  return (new Date() - new Date(ts)) / 1000 / 60 < 15
}

export default function HomeHero ({ status, loading, avgBlockTimeSec }) {
  const height = status?.api?.block?.height
  const lastBlockTimestamp = status?.api?.block?.timestamp
  const live = isNetworkLive(status)

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder HomeHero'}>
      <div className={'HomeHero__Glow'} aria-hidden={'true'}/>
      <Box className={'HomeHero__Inner'}>
        <div className={'HomeHero__Brand'}>
          <Text className={'HomeHero__Welcome'}>Dash Platform</Text>
          <Heading as={'h1'} className={'HomeHero__Title'}>Platform Explorer</Heading>
          <Text className={'HomeHero__Description'}>
            Real-time blocks, transactions, data contracts &amp; identities — straight from the chain.
          </Text>

          <Flex className={'HomeHero__Status'}>
            <Badge colorScheme={live ? 'green' : 'red'} className={'HomeHero__Badge'}>
              {live ? <CheckCircleIcon mr={1}/> : <WarningIcon mr={1}/>}
              {status?.network || 'network'}
            </Badge>
            {status?.versions?.software?.drive !== undefined &&
              <Badge colorScheme={'gray'} className={'HomeHero__Badge'}>
                Drive v{status.versions.software.drive}
              </Badge>
            }
          </Flex>

          <ChainPulse/>
        </div>

        <div className={`HomeHero__Live ${loading ? 'HomeHero__Live--Loading' : ''}`}>
          <Text className={'HomeHero__LiveLabel'}>Live Block Height</Text>
          <div className={'HomeHero__Height'}>
            {height != null ? <BigNumber>{height}</BigNumber> : '—'}
          </div>
          <Text className={'HomeHero__LiveMeta'}>
            {avgBlockTimeSec ? `Avg ~${avgBlockTimeSec}s` : 'Live'}
            {lastBlockTimestamp &&
              <> · last block <TimeDelta endDate={new Date(lastBlockTimestamp)}/></>}
          </Text>
        </div>

        <div className={'HomeHero__Chart'}>
          <Text className={'HomeHero__LiveLabel'}>Transactions history</Text>
          <HomeHeroSparkline/>
        </div>
      </Box>
    </Box>
  )
}
