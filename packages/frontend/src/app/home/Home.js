'use client'

import { useState, useEffect, createRef } from 'react'
import * as Api from '../../util/Api'
import { LineChart } from '../../components/charts/index.js'
import { SimpleList, ListLoadingPreview } from '../../components/lists'
import TotalInfo from '../../components/​totalInfo'
import NetworkStatus from '../../components/networkStatus'
import Intro from '../../components/intro/index.js'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import { getTransitionTypeString } from '../../util/index'
import { WarningTwoIcon } from '@chakra-ui/icons'

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

function ErrorMessageBlock () {
  return (
    <Flex
      flexGrow={1}
      w={'100%'}
      justifyContent={'center'}
      alignItems={'center'}
      flexDirection={'column'}
      opacity={0.5}
    >
      <div><WarningTwoIcon color={'#ddd'} mr={2} mt={-1}/>Error loading data</div>
    </Flex>
  )
}

function Home () {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })
  const [dataContracts, setDataContracts] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const [transactions, setTransactions] = useState({ data: {}, props: { printCount: 8 }, loading: true, error: false })
  const [richestIdentities, setRichestIdentities] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const [trendingIdentities, setTrendingIdentities] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const [transactionsHistory, setTransactionsHistory] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const [transactionsTimespan, setTransactionsTimespan] = useState(transactionsChartConfig.timespan.default)
  const richListContainer = createRef()
  const richListRef = createRef()
  const trendingIdentitiesContainer = createRef()
  const trendingIdentitiesList = createRef()
  const transactionsContainer = createRef()
  const transactionsList = createRef()

  function fetchHandlerSuccess (setter, data) {
    setter(state => ({
      ...state,
      data: {
        ...state.data,
        ...data
      },
      loading: false,
      error: false
    }))
  }

  function fetchHandlerError (setter, error) {
    console.error(error)

    setter(state => ({
      ...state,
      data: null,
      loading: false,
      error: true
    }))
  }

  const fetchData = () => {
    Promise.all([
      Api.getStatus()
        .then(res => fetchHandlerSuccess(setStatus, res))
        .catch(err => fetchHandlerError(setStatus, err)),

      Api.getTransactions(1, 10, 'desc')
        .then(paginatedTransactions => fetchHandlerSuccess(setTransactions, paginatedTransactions))
        .catch(err => fetchHandlerError(setTransactions, err)),

      Api.getDataContracts(1, dataContracts.props.printCount, 'desc', 'documents_count')
        .then(paginatedDataContracts => fetchHandlerSuccess(setDataContracts, paginatedDataContracts))
        .catch(err => fetchHandlerError(setDataContracts, err)),

      Api.getIdentities(1, 10, 'desc', 'balance')
        .then(paginatedRichestIdentities => fetchHandlerSuccess(setRichestIdentities, paginatedRichestIdentities))
        .catch(err => fetchHandlerError(setRichestIdentities, err)),

      Api.getIdentities(1, 10, 'desc', 'tx_count')
        .then(paginatedTrendingIdentities => fetchHandlerSuccess(setTrendingIdentities, paginatedTrendingIdentities))
        .catch(err => fetchHandlerError(setTrendingIdentities, err)),

      Api.getBlocks(1, 1, 'desc')
        .then(res => {
          const [latestBlock] = res.resultSet
          fetchHandlerSuccess(setStatus, { latestBlock })
        })
        .catch(err => fetchHandlerError(setStatus, err))
    ])
      .then()
      .catch(console.log)
  }

  useEffect(fetchData, [])

  useEffect(() => {
    Api.getTransactionsHistory(transactionsTimespan)
      .then(res => fetchHandlerSuccess(setTransactionsHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setTransactionsHistory, err))
  }, [transactionsTimespan])

  function adaptList (container, listBlock, data, setDataFunc) {
    if (!container || !listBlock || data?.props.printCount >= data?.data?.resultSet?.length) return

    const childNodes = listBlock.childNodes
    const [listContainer] = Object.entries(childNodes)
      .filter(([i, element]) => element.className.split(' ').includes('SimpleList__List'))
      .map(([i, element]) => element)
    const lastElementHeight = listContainer.childNodes[listContainer.childNodes.length - 1].getBoundingClientRect().height
    const bottomOffset = container.getBoundingClientRect().bottom - listBlock.getBoundingClientRect().bottom
    const extraItems = Math.floor(bottomOffset / lastElementHeight)

    if (extraItems > 0) {
      setDataFunc(state => ({
        ...state,
        props: {
          printCount: state.props.printCount + extraItems
        }
      }))
    }
  }

  useEffect(() => {
    if (!trendingIdentities.loading && !richestIdentities.loading) {
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
    }

    if (!transactions.loading) {
      adaptList(
        transactionsContainer.current,
        transactionsList.current,
        transactions,
        setTransactions
      )
    }
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
              wrap={['wrap', 'wrap', 'nowrap']}
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
        blocks={status.data?.blocksCount}
        transactions={status.data?.txCount}
        dataContracts={status.data?.dataContractsCount}
        documents={status.data?.documentsCount}
        transfers={status.data?.transfersCount}
        loading={status.loading}
      />

      <Container
          maxW={'container.xl'}
          color={'white'}
          padding={3}
          mt={0}
          mb={4}
      >
          <Container p={0} maxW={'container.xl'} mb={[10, 10, 16]}>
              <Flex
                  w={'100%'}
                  justifyContent={'space-between'}
                  wrap={['wrap', 'wrap', 'wrap', 'nowrap']}
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

                      <Flex
                          minH={'220px'}
                          height={['300px', '300px', '300px', 'auto']}
                          maxW={'none'}
                          flexGrow={'1'}
                          mt={2}
                          mb={4}
                          p={0}
                          flexDirection={'column'}
                      >
                        {!transactionsHistory.loading
                          ? (!transactionsHistory.error && transactionsHistory.data?.resultSet?.length)
                              ? <LineChart
                                data={transactionsHistory.data.resultSet.map((item) => ({
                                  x: new Date(item.timestamp),
                                  y: item.data.txs
                                }))}
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
                              : <ErrorMessageBlock/>
                          : <Container
                            w={'100%'}
                            h={'100%'}
                            className={'ChartBlock__Loader'}>
                          </Container>}
                      </Flex>
                  </Flex>

                  <Box flexShrink={'0'} w={10} h={[0, 0, 0, 10]} />

                  <Container mb={5} p={0} maxW={['100%', '100%', '100%', 'calc(50% - 20px)']}>
                      <Flex
                          maxW={'100%'}
                          m={0}
                          h={'100%'}
                          borderWidth={'1px'} borderRadius={'lg'}
                          className={'InfoBlock'}
                          flexDirection={'column'}
                      >
                          <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Trending Data Contracts</Heading>
                          {!dataContracts.loading
                            ? !dataContracts.error
                                ? <SimpleList
                                    items={dataContracts.data.resultSet.map((dataContract, i) => ({
                                      columns: [dataContract.identifier, dataContract.documentsCount],
                                      link: '/dataContract/' + dataContract.identifier
                                    }))}
                                    columns={['Identifier', 'Documents Count']}
                                  />
                                : <ErrorMessageBlock/>
                            : <ListLoadingPreview itemsCount={dataContracts.props.printCount}/>}
                      </Flex>
                  </Container>
              </Flex>

              <Flex
                  w={'100%'}
                  justifyContent={'space-between'}
                  wrap={['wrap', 'wrap', 'nowrap']}
                  mb={[10, 10, 16]}
              >
                  <Flex
                      ref={transactionsContainer}
                      maxW={'100%'}
                      borderWidth={'1px'} borderRadius={'lg'}
                      mb={0}
                      className={'InfoBlock'}
                      flexDirection={'column'}
                      flexGrow={1}
                  >
                      <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Transactions</Heading>
                      {!transactions.loading
                        ? !transactions.error
                            ? <SimpleList
                              ref={transactionsList}
                              items={transactions.data.resultSet
                                .filter((item, i) => i < transactions.props.printCount)
                                .map((transaction, i) => ({
                                  monospaceTitles: [transaction.hash],
                                  columns: [new Date(transaction.timestamp).toLocaleString(), getTransitionTypeString(transaction.type)],
                                  link: '/transaction/' + transaction.hash
                                }))}
                              columns={[]}
                            />
                            : <ErrorMessageBlock/>
                        : <ListLoadingPreview itemsCount={Math.round(transactions.props.printCount * 1.5)}/>}
                  </Flex>

                  <Box flexShrink={'0'} w={10} h={10} />

                  <Flex
                      flexDirection={'column'}
                      p={0}
                      maxW={['100%', '100%', 'calc(50% - 20px)']}
                      width={'100%'}
                  >
                      <Flex
                          ref={trendingIdentitiesContainer}
                          maxW={'100%'}
                          borderWidth={'1px'} borderRadius={'lg'}
                          className={'InfoBlock'}
                          flexGrow={'1'}
                          flexDirection={'column'}
                      >
                          <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Trending Identities</Heading>
                          {!trendingIdentities.loading
                            ? !trendingIdentities.error
                                ? <SimpleList
                                  ref={trendingIdentitiesList}
                                  items={trendingIdentities.data.resultSet
                                    .filter((item, i) => i < trendingIdentities.props.printCount)
                                    .map((identitiy, i) => ({
                                      columns: [identitiy.identifier, identitiy.totalTxs],
                                      link: '/identity/' + identitiy.identifier
                                    }))}
                                  columns={['Identifier', 'Tx Count']}
                                />
                                : <ErrorMessageBlock/>
                            : <ListLoadingPreview itemsCount={trendingIdentities.props.printCount}/>}
                      </Flex>

                      <Box w={10} h={10} />

                      <Flex
                          ref={richListContainer}
                          maxW={'none'}
                          borderWidth={'1px'} borderRadius={'lg'}
                          className={'InfoBlock'}
                          flexGrow={'1'}
                          flexDirection={'column'}
                      >
                          <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Richlist</Heading>
                          {!richestIdentities.loading
                            ? !richestIdentities.error
                                ? <SimpleList
                                  ref={richListRef}
                                  items={richestIdentities.data.resultSet
                                    .filter((item, i) => i < richestIdentities.props.printCount)
                                    .map((identitiy, i) => ({
                                      columns: [identitiy.identifier, identitiy.balance],
                                      link: '/identity/' + identitiy.identifier
                                    }))}
                                  columns={['Identifier', 'Balance']}
                                />
                                : <ErrorMessageBlock/>
                            : <ListLoadingPreview itemsCount={richestIdentities.props.printCount}/>}
                      </Flex>
                  </Flex>
              </Flex>
          </Container>
      </Container>
  </>)
}

export default Home
