'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import HomeHero from './HomeHero.js'
import EntityTables from './EntityTables.js'
import { MetricChart, MetricWave, StatusBar, HeroMeta, MasternodesDonut } from '../../components/home'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import theme from '../../styles/theme'
import { Box, Container, Flex, Heading, SimpleGrid } from '@chakra-ui/react'
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
  const [validatorsActive, setValidatorsActive] = useState({ data: {}, loading: true, error: false })
  const [contested, setContested] = useState({ data: {}, loading: true, error: false })
  const [activeContested, setActiveContested] = useState({ data: {}, loading: true, error: false })
  const [latestContested, setLatestContested] = useState({ data: {}, loading: true, error: false })
  const [latestVotes, setLatestVotes] = useState({ data: {}, loading: true, error: false })
  const [epochData, setEpochData] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })

  const gap = theme.blockOffset

  const fetchData = () => {
    Api.getStatus()
      .then(res => {
        fetchHandlerSuccess(setStatus, res)
        Api.getEpoch(res?.epoch?.number)
          .then(epochRes => fetchHandlerSuccess(setEpochData, epochRes))
          .catch(err => fetchHandlerError(setEpochData, err))
      })
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

    Api.getValidators(1, 100, 'desc')
      .then(res => fetchHandlerSuccess(setValidators, res))
      .catch(err => fetchHandlerError(setValidators, err))

    Api.getValidators(1, 1, 'desc', { isActive: 'true' })
      .then(res => fetchHandlerSuccess(setValidatorsActive, res))
      .catch(err => fetchHandlerError(setValidatorsActive, err))

    Api.getContestedResourcesStats()
      .then(res => fetchHandlerSuccess(setContested, res))
      .catch(err => fetchHandlerError(setContested, err))

    Api.getContestedResources(1, 10, 'desc', undefined, { voting_finished: false })
      .then(res => fetchHandlerSuccess(setActiveContested, res))
      .catch(err => fetchHandlerError(setActiveContested, err))

    Api.getContestedResources(1, 5, 'desc')
      .then(res => fetchHandlerSuccess(setLatestContested, res))
      .catch(err => fetchHandlerError(setLatestContested, err))

    Api.getMasternodeVotes(1, 10, 'desc')
      .then(res => fetchHandlerSuccess(setLatestVotes, res))
      .catch(err => fetchHandlerError(setLatestVotes, err))

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

        <Box className={'InfoBlock InfoBlock--NoBorder HomeOverview'} w={'100%'}>
          <div className={'HomeOverview__Head'}>
            <Heading className={'InfoBlock__Title HomeOverview__Title'} as={'h2'}>Network overview</Heading>
            <HeroMeta status={status.data}/>
          </div>
          <MetricWave status={status.data}/>
          <StatusBar
            status={status.data}
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

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={gap} w={'100%'}>
          <MetricChart title={'Transactions history'} type={'bar'} fetcher={Api.getTransactionsHistory} field={'txs'} yAbbr={'txs'}/>
          <MetricChart title={'Identities growth'} type={'line'} fetcher={Api.getIdentitiesHistory} field={'registeredIdentities'} yAbbr={'identities'}/>
          <MasternodesDonut validators={validators} validatorsActive={validatorsActive}/>
        </SimpleGrid>

        <EntityTables
          blocks={blocks}
          transactions={transactions}
          dataContracts={latestContracts}
          identities={latestIdentities}
          rate={rate}
        />
      </Flex>
    </Container>
  )
}

export default Home
