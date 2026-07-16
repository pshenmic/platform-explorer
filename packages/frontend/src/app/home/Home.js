'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import * as Api from '../../util/Api'
import HomeHero from './HomeHero.js'
import { MetricChart, EpochsOverview, StatusBar, HeroMeta, MasternodesDonut, TxTypesBar, ShieldedPoolCard, CompactTxList, CompactBlocksList } from '../../components/home'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import theme from '../../styles/theme'
import { Box, Container, Flex, Heading, SimpleGrid } from '@chakra-ui/react'
import { ChevronIcon } from '../../components/ui/icons'
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
  const [validators, setValidators] = useState({ data: {}, loading: true, error: false })
  const [validatorsActive, setValidatorsActive] = useState({ data: {}, loading: true, error: false })
  const [validatorsBanned, setValidatorsBanned] = useState({ data: {}, loading: true, error: false })
  const [contested, setContested] = useState({ data: {}, loading: true, error: false })
  const [activeContested, setActiveContested] = useState({ data: {}, loading: true, error: false })
  const [latestContested, setLatestContested] = useState({ data: {}, loading: true, error: false })
  const [latestVotes, setLatestVotes] = useState({ data: {}, loading: true, error: false })
  const [epochData, setEpochData] = useState({ data: {}, loading: true, error: false })
  const [epochs, setEpochs] = useState({ data: { list: [] }, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })

  const gap = theme.blockOffset

  // refetchInterval keeps the hero and both lists live; focus revalidation is the v5 default
  const statusQuery = useQuery({ queryKey: ['home', 'status'], queryFn: Api.getStatus, refetchInterval: 60000 })
  const txQuery = useQuery({ queryKey: ['home', 'transactions'], queryFn: () => Api.getTransactions(1, 10, 'desc'), refetchInterval: 30000 })
  const blocksQuery = useQuery({ queryKey: ['home', 'blocks'], queryFn: () => Api.getBlocks(1, 10, 'desc'), refetchInterval: 30000 })

  // 3 finalized epochs + the in-progress one for the wave; keyed by the epoch number so a rollover refreshes it
  const currentEpochNumber = statusQuery.data?.epoch?.number

  // refresh the in-progress epoch on every status tick and merge it into the wave's last entry
  useEffect(() => {
    if (typeof currentEpochNumber !== 'number') return

    Api.getEpoch(currentEpochNumber)
      .then(ep => {
        fetchHandlerSuccess(setEpochData, ep)
        setEpochs(s => {
          const epochsList = s.data?.list || []
          const last = epochsList[epochsList.length - 1]
          if (last?.epoch?.number !== currentEpochNumber) return s
          // keep protocolVersion/firstBlockHash resolved earlier, refresh the live fields
          return { ...s, data: { list: [...epochsList.slice(0, -1), { ...last, ...ep }] } }
        })
      })
      .catch(err => fetchHandlerError(setEpochData, err))
  }, [currentEpochNumber, statusQuery.dataUpdatedAt])

  useEffect(() => {
    if (typeof currentEpochNumber !== 'number') return

    const numbers = [currentEpochNumber - 3, currentEpochNumber - 2, currentEpochNumber - 1, currentEpochNumber].filter(n => n >= 0)
    Promise.all(numbers.map(n =>
      Api.getEpoch(n)
        .then(ep => {
          const height = ep?.epoch?.firstBlockHeight
          if (height == null) return ep
          // protocol version is not part of /epoch, so read it from the epoch's first block
          return Api.getBlocks(1, 1, 'asc', { height_min: height, height_max: height })
            .then(blocksRes => ({
              ...ep,
              protocolVersion: blocksRes?.resultSet?.[0]?.header?.appVersion ?? null,
              firstBlockHash: blocksRes?.resultSet?.[0]?.header?.hash ?? null
            }))
            .catch(() => ep)
        })
        .catch(() => null)
    ))
      .then(results => fetchHandlerSuccess(setEpochs, { list: results.filter(Boolean) }))
      .catch(err => fetchHandlerError(setEpochs, err))
  }, [currentEpochNumber])

  const fetchData = () => {
    Api.getValidators(1, 100, 'desc')
      .then(res => fetchHandlerSuccess(setValidators, res))
      .catch(err => fetchHandlerError(setValidators, err))

    Api.getValidators(1, 1, 'desc', { isActive: 'true' })
      .then(res => fetchHandlerSuccess(setValidatorsActive, res))
      .catch(err => fetchHandlerError(setValidatorsActive, err))

    Api.getValidators(1, 1, 'desc', { isBanned: 'true' })
      .then(res => fetchHandlerSuccess(setValidatorsBanned, res))
      .catch(err => fetchHandlerError(setValidatorsBanned, err))

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

  const avgBlockTimeSec = computeAvgBlockTime(blocksQuery.data?.resultSet)

  return (
    <Container className={'HomePage'} maxW={'container.maxPageW'} color={'white'} px={3} py={0} mt={gap} mb={gap}>
      <Flex direction={'column'} gap={gap}>
        <HomeHero status={statusQuery.data ?? {}} loading={statusQuery.isLoading} avgBlockTimeSec={avgBlockTimeSec}/>

        <Box className={'InfoBlock InfoBlock--NoBorder HomeOverview'} w={'100%'}>
          <Heading className={'InfoBlock__Title'} as={'h2'}>Network overview</Heading>
          <div className={'HomeOverview__Grid'}>
            <div className={'HomeOverview__Sys'}>
              <HeroMeta status={statusQuery.data ?? {}} loading={statusQuery.isLoading}/>
            </div>
            <div className={'HomeOverview__Tx'}>
              <div className={'HomeOverview__TxHead'}>
                <span className={'HomeOverview__TxTitle'}>Latest Transactions</span>
                <Link href={'/transactions'} className={'HomeOverview__More'}>Show more <ChevronIcon w={'5px'} h={'8px'}/></Link>
              </div>
              <CompactTxList transactions={txQuery.data?.resultSet} limit={7} loading={txQuery.isLoading}/>
            </div>
            <div className={'HomeOverview__Blocks'}>
              <div className={'HomeOverview__TxHead'}>
                <span className={'HomeOverview__TxTitle'}>Latest Blocks</span>
                <Link href={'/blocks'} className={'HomeOverview__More'}>Show more <ChevronIcon w={'5px'} h={'8px'}/></Link>
              </div>
              <CompactBlocksList blocks={blocksQuery.data?.resultSet} limit={7} loading={blocksQuery.isLoading}/>
            </div>
          </div>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={gap} w={'100%'}>
          <MetricChart title={'Transactions history'} type={'bar'} fetcher={Api.getTransactionsHistory} field={'txs'} yAbbr={'txs'}/>
          <MetricChart title={'Identities growth'} type={'line'} fetcher={Api.getIdentitiesHistory} field={'registeredIdentities'} yAbbr={'identities'}/>
          <ShieldedPoolCard rate={rate}/>
        </SimpleGrid>

        <Box className={'InfoBlock InfoBlock--NoBorder HomeEpochs'} w={'100%'}>
          <EpochsOverview
            title={'Epochs'}
            epochs={epochs.data?.list}
            currentEpoch={epochData}
            rate={rate}
            loading={epochs.loading}
          />
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={gap} w={'100%'}>
          <TxTypesBar/>
          <MasternodesDonut validators={validators} validatorsActive={validatorsActive} validatorsBanned={validatorsBanned}/>
          <Box className={'InfoBlock InfoBlock--NoBorder HomeGovCard'} w={'100%'}>
            <Heading className={'InfoBlock__Title'} as={'h2'}>Governance</Heading>
            <StatusBar
              contested={contested}
              activeContested={activeContested}
              latestContested={latestContested}
              latestVotes={latestVotes}
              epochData={epochData}
            />
          </Box>
        </SimpleGrid>
      </Flex>
    </Container>
  )
}

export default Home
