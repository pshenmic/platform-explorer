'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import HomeHero from './HomeHero.js'
import HomeKpi from './HomeKpi.js'
import EntityTables from './EntityTables.js'
import ContestedResourcesDashboardCards from '../../components/contestedResources/ContestedResourcesDashboardCards'
import IdentitiesGrowthChart from '../../components/charts/IdentitiesGrowthChart'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import theme from '../../styles/theme'
import { Box, Container, Flex, Heading } from '@chakra-ui/react'
import './Home.scss'

function computeAvgBlockTime (blocks) {
  const stamps = (blocks || [])
    .map(b => new Date(b?.header?.timestamp).getTime())
    .filter(t => !Number.isNaN(t))
    .sort((a, b) => b - a)
  if (stamps.length < 2) return null
  let total = 0
  for (let i = 0; i < stamps.length - 1; i++) total += stamps[i] - stamps[i + 1]
  return Math.round(total / (stamps.length - 1) / 1000)
}

function Home () {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })
  const [blocks, setBlocks] = useState({ data: {}, props: { printCount: 10 }, loading: true, error: false })
  const [transactions, setTransactions] = useState({ data: {}, props: { printCount: 10 }, loading: true, error: false })
  const [latestContracts, setLatestContracts] = useState({ data: {}, props: { printCount: 10 }, loading: true, error: false })
  const [latestIdentities, setLatestIdentities] = useState({ data: {}, props: { printCount: 10 }, loading: true, error: false })
  const [validators, setValidators] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })

  const gap = theme.blockOffset

  const fetchData = () => {
    Api.getStatus()
      .then(res => fetchHandlerSuccess(setStatus, res))
      .catch(err => fetchHandlerError(setStatus, err))

    Api.getBlocks(1, blocks.props.printCount, 'desc')
      .then(res => fetchHandlerSuccess(setBlocks, res))
      .catch(err => fetchHandlerError(setBlocks, err))

    Api.getTransactions(1, transactions.props.printCount, 'desc')
      .then(res => fetchHandlerSuccess(setTransactions, res))
      .catch(err => fetchHandlerError(setTransactions, err))

    Api.getDataContracts(1, latestContracts.props.printCount, 'desc', 'block_height')
      .then(res => fetchHandlerSuccess(setLatestContracts, res))
      .catch(err => fetchHandlerError(setLatestContracts, err))

    Api.getIdentities(1, latestIdentities.props.printCount, 'desc', undefined)
      .then(res => fetchHandlerSuccess(setLatestIdentities, res))
      .catch(err => fetchHandlerError(setLatestIdentities, err))

    Api.getValidators(1, 1, 'desc')
      .then(res => fetchHandlerSuccess(setValidators, res))
      .catch(err => fetchHandlerError(setValidators, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }

  useEffect(fetchData, [])

  const avgBlockTimeSec = computeAvgBlockTime(blocks.data?.resultSet)

  return (
    <Container maxW={'container.maxPageW'} color={'white'} px={3} py={0} mt={gap} mb={gap}>
      <Flex direction={'column'} gap={gap}>
        <HomeHero status={status.data} loading={status.loading} avgBlockTimeSec={avgBlockTimeSec}/>

        <HomeKpi status={status} validators={validators}/>

        <EntityTables
          blocks={blocks}
          transactions={transactions}
          dataContracts={latestContracts}
          identities={latestIdentities}
          rate={rate}
        />

        <Box className={'InfoBlock InfoBlock--NoBorder Home__Governance'} w={'100%'}>
          <Heading className={'InfoBlock__Title'} as={'h2'}>Governance</Heading>
          <ContestedResourcesDashboardCards/>
        </Box>

        <Box className={'InfoBlock InfoBlock--NoBorder'} w={'100%'}>
          <Heading className={'InfoBlock__Title'} as={'h2'}>Identities growth</Heading>
          <IdentitiesGrowthChart isActive={true}/>
        </Box>
      </Flex>
    </Container>
  )
}

export default Home
