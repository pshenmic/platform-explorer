'use client'

import Link from 'next/link'
import { Box, Button, Flex, Heading, Text, Badge } from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { TimeDelta, BigNumber } from '../../components/data'
import TransactionsHistory from '../../components/charts/TransactionsHistory'
import './HomeHero.scss'

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
      <Flex className={'HomeHero__Inner'}>
        <div className={'HomeHero__Brand'}>
          <Text className={'HomeHero__Welcome'}>Welcome to Dash Platform</Text>
          <Heading as={'h1'} className={'HomeHero__Title'}>Platform Explorer</Heading>
          <Text className={'HomeHero__Description'}>
            Blocks, transactions, data contracts &amp; identities — streamed straight from Dash Platform.
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

          <Flex className={'HomeHero__Cta'}>
            <Button as={Link} href={'/blocks'} className={'HomeHero__Button'} variant={'gray'}>
              Explore Blocks
            </Button>
            <Button as={Link} href={'/transactions'} className={'HomeHero__Button'} variant={'gray'}>
              Transactions
            </Button>
          </Flex>
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
          <TransactionsHistory useInfoBlock={false} heightPx={150}/>
        </div>
      </Flex>
    </Box>
  )
}
