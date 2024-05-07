'use client'

import { useState, useEffect, createRef } from 'react'
import * as Api from '../../util/Api'
import { LineChart } from '../../components/charts/index.js'
import { SimpleList } from '../../components/lists'
import TotalInfo from '../../components/​totalInfo'
import NetworkStatus from '../../components/networkStatus'
import Intro from '../../components/intro/index.js'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import { getTransitionTypeString } from '../../util/index'

import {
  Box,
  Container,
  Heading,
  Flex
} from '@chakra-ui/react'

const transactionsChartConfig = {
  timespan: {
    default: '1w',
    values: ['1h', '24h', '3d', '1w']
  }
}

function Home () {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState({})
  const [dataContracts, setDataContracts] = useState([])
  const [transactions, setTransactions] = useState({ items: [], printCount: 8 })
  const [richestIdentities, setRichestIdentities] = useState({ items: [], printCount: 5 })
  const [trendingIdentities, setTrendingIdentities] = useState({ items: [], printCount: 6 })
  const [transactionsHistory, setTransactionsHistory] = useState([])
  const [transactionsTimespan, setTransactionsTimespan] = useState(transactionsChartConfig.timespan.default)
  const richListContainer = createRef()
  const richListRef = createRef()
  const trendingIdentitiesContainer = createRef()
  const trendingIdentitiesList = createRef()
  const transactionsContainer = createRef()
  const transactionsList = createRef()

  const convertTxsForChart = (transactionsHistory) => transactionsHistory.map((item) => ({
    x: new Date(item.timestamp),
    y: item.data.txs
  }))

  const fetchData = () => {
    setLoading(true)

    Promise.allSettled([
      Api.getStatus(),
      Api.getTransactions(1, 10, 'desc'),
      Api.getDataContracts(1, 5, 'desc', 'documents_count'),
      Api.getIdentities(1, 10, 'desc', 'balance'),
      Api.getIdentities(1, 10, 'desc', 'tx_count'),
      Api.getTransactionsHistory(transactionsChartConfig.timespan.default),
      Api.getBlocks(1, 1, 'desc')
    ])
      .then(([
        status,
        paginatedTransactions,
        paginatedDataContracts,
        paginatedRichestIdentities,
        paginatedTrendingIdentities,
        transactionsHistory,
        latestBlocks
      ]) => {
        const [latestBlock] = latestBlocks.value.resultSet
        setStatus({
          latestBlock,
          ...status.value
        })
        setDataContracts(paginatedDataContracts.value.resultSet)
        setTransactionsHistory(convertTxsForChart(transactionsHistory.value))
        setTransactions(state => ({
          ...state,
          items: paginatedTransactions.value.resultSet
        }))
        setRichestIdentities(state => ({
          ...state,
          items: paginatedRichestIdentities.value.resultSet
        }))
        setTrendingIdentities(state => ({
          ...state,
          items: paginatedTrendingIdentities.value.resultSet
        }))
      })
      .catch(console.log)
      .finally(() => setLoading(false))
  }

  useEffect(fetchData, [])

  useEffect(() => {
    Api.getTransactionsHistory(transactionsTimespan)
      .then(res => setTransactionsHistory(convertTxsForChart(res)))
      .catch(console.log)
      .finally(() => setLoading(false))
  }, [transactionsTimespan])

  function adaptList (container, list, data, setDataFunc) {
    if (container !== null && list !== null && data.printCount < data.items.length) {
      const childNodes = list.childNodes
      const lastElementHeight = childNodes[childNodes.length - 1].getBoundingClientRect().height
      const bottomOffset = container.getBoundingClientRect().bottom - list.getBoundingClientRect().bottom
      const extraItems = Math.floor(bottomOffset / lastElementHeight)

      if (extraItems > 0) {
        setDataFunc({
          ...data,
          printCount: data.printCount + extraItems
        })
      }
    }
  }

  useEffect(() => {
    adaptList(
      trendingIdentitiesContainer.current,
      trendingIdentitiesList.current,
      trendingIdentities,
      setTrendingIdentities
    )

    adaptList(
      richListContainer.current,
      richListRef.current,
      richestIdentities,
      setRichestIdentities
    )

    adaptList(
      transactionsContainer.current,
      transactionsList.current,
      transactions,
      setTransactions
    )
  }, [
    richListContainer,
    trendingIdentitiesContainer,
    transactionsContainer,
    richListRef,
    richestIdentities,
    transactions,
    transactionsList,
    trendingIdentities,
    trendingIdentitiesList
  ])

  if (!loading) {
    return (<>
        <Container
            maxW={'container.xl'}
            color={'white'}
            padding={3}
            mt={8}
            mb={8}
        >
            <Flex
                justifyContent={'space-between'}
                alignItems={'center'}
                wrap={['wrap', , 'nowrap']}
            >
                <Container maxW={'none'} p={0}>
                    <Intro
                        title={'Platform Explorer'}
                        contentSource={<Markdown>{introContent}</Markdown>}
                    />
                </Container>

                <Box flexShrink={'0'} w={10} h={10} />

                <Container maxW={'none'} p={0}>
                    <NetworkStatus status={status}/>
                </Container>
            </Flex>
        </Container>

        <TotalInfo
            blocks={status.blocksCount}
            transactions={status.txCount}
            dataContracts={status.dataContractsCount}
            documents={status.documentsCount}
            transfers={status.transfersCount}
        />

        <Container
            maxW={'container.xl'}
            color={'white'}
            padding={3}
            mt={0}
            mb={4}
        >
            <Container p={0} maxW={'container.xl'} mb={[10, , 16]}>
                <Flex
                    w={'100%'}
                    justifyContent={'space-between'}
                    wrap={['wrap', , , 'nowrap']}
                    mb={5}
                >
                    <Flex
                        className={'ChartBlock'}
                        maxW={'none'}
                        width={'100%'}
                        mb={5}
                        borderWidth={'1px'} borderRadius={'lg'}
                        direction={'column'}
                        p={3}
                        pb={2}
                    >
                        <div className={'ChartBlock__Head'}>
                            <Heading className={'ChartBlock__Title'} as={'h2'} size={'sm'}>Transactions history</Heading>

                            <div className={'ChartBlock__TimeframeContainer'}>
                                <span>Timeframe: </span>
                                <select
                                    className={'ChartBlock__TimeframeSelector'}
                                    onChange={(e) => setTransactionsTimespan(e.target.value)}
                                    defaultValue={transactionsChartConfig.timespan.default}
                                >
                                    {transactionsChartConfig.timespan.values.map(timespan => {
                                      return <option value={timespan} key={'ts' + timespan}>{timespan}</option>
                                    })}
                                </select>
                            </div>
                        </div>

                        <Container
                            minH={'220px'}
                            height={['300px', , , 'auto']}
                            maxW={'none'}
                            flexGrow={'1'}
                            mt={2}
                            mb={4}
                            p={0}
                        >
                            <LineChart
                                data={transactionsHistory}
                                timespan={transactionsTimespan}
                                xAxis={{
                                  type: (() => {
                                    if (transactionsTimespan === '1h') return { axis: 'time' }
                                    if (transactionsTimespan === '24h') return { axis: 'time' }
                                    if (transactionsTimespan === '3d') return { axis: 'date', tooltip: 'datetime' }
                                    if (transactionsTimespan === '1w') return { axis: 'date' }
                                  })(),
                                  abbreviation: '',
                                  title: ''
                                }}
                                yAxis={{
                                  type: 'number',
                                  title: '',
                                  abbreviation: 'txs'
                                }}
                            />
                        </Container>
                    </Flex>

                    <Box flexShrink={'0'} w={10} h={[0, , , 10]} />

                    <Container mb={5} p={0} maxW={['100%', , , 'calc(50% - 20px)']}>
                        <Container
                            maxW={'100%'}
                            m={0}
                            h={'100%'}
                            borderWidth={'1px'} borderRadius={'lg'}
                            className={'InfoBlock'}
                        >
                            <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Trending Data Contracts</Heading>

                            <SimpleList
                                items={dataContracts.map((dataContract, i) => ({
                                  columns: [dataContract.identifier, dataContract.documentsCount],
                                  link: '/dataContract/' + dataContract.identifier
                                }))}
                                columns={['Identifier', 'Documents Count']}
                            />
                        </Container>
                    </Container>
                </Flex>

                <Flex
                    w={'100%'}
                    justifyContent={'space-between'}
                    wrap={['wrap', , 'nowrap']}
                    mb={[10, , 16]}
                >
                    <Container
                        ref={transactionsContainer}
                        maxW={'100%'}
                        borderWidth={'1px'} borderRadius={'lg'}
                        mb={0}
                        className={'InfoBlock'}
                    >
                        <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Transactions</Heading>

                        <SimpleList
                            ref={transactionsList}
                            items={transactions.items
                              .filter((item, i) => i < transactions.printCount)
                              .map((transaction, i) => ({
                                monospaceTitles: [transaction.hash],
                                columns: [new Date(transaction.timestamp).toLocaleString(), getTransitionTypeString(transaction.type)],
                                link: '/transaction/' + transaction.hash
                              }))}
                            columns={[]}
                        />
                    </Container>

                    <Box flexShrink={'0'} w={10} h={10} />

                    <Flex
                        flexDirection={'column'}
                        p={0}
                        maxW={['100%', , 'calc(50% - 20px)']}
                        width={'100%'}
                    >
                        <Container
                            ref={trendingIdentitiesContainer}
                            maxW={'100%'}
                            borderWidth={'1px'} borderRadius={'lg'}
                            className={'InfoBlock'}
                            flexGrow={'1'}
                        >
                            <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Trending Identities</Heading>

                            <SimpleList
                                ref={trendingIdentitiesList}
                                items={trendingIdentities.items
                                  .filter((item, i) => i < trendingIdentities.printCount)
                                  .map((identitiy, i) => ({
                                    columns: [identitiy.identifier, identitiy.totalTxs],
                                    link: '/identity/' + identitiy.identifier
                                  }))}
                                columns={['Identifier', 'Tx Count']}
                            />
                        </Container>

                        <Box w={10} h={10} />

                        <Container
                            ref={richListContainer}
                            maxW={'none'}
                            borderWidth={'1px'} borderRadius={'lg'}
                            className={'InfoBlock'}
                            flexGrow={'1'}
                        >
                            <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Richlist</Heading>

                            <SimpleList
                                ref={richListRef}
                                items={richestIdentities.items
                                  .filter((item, i) => i < richestIdentities.printCount)
                                  .map((identitiy, i) => ({
                                    columns: [identitiy.identifier, identitiy.balance],
                                    link: '/identity/' + identitiy.identifier
                                  }))}
                                columns={['Identifier', 'Balance']}
                            />
                        </Container>
                    </Flex>
                </Flex>
            </Container>
        </Container>
    </>)
  }
}

export default Home
