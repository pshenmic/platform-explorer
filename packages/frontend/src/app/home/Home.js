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

const fetchErrorMessage = 'It looks like there was an error loading data. We\'ll fix it soon.'

function Home () {
  const [status, setStatus] = useState({ data: {}, loaded: false, error: false })
  const [dataContracts, setDataContracts] = useState({ data: { items: [], printCount: 5 }, loaded: false, error: false })
  const [transactions, setTransactions] = useState({ data: { items: [], printCount: 8 }, loaded: false, error: false })
  const [richestIdentities, setRichestIdentities] = useState({ data: { items: [], printCount: 5 }, loaded: false, error: false })
  const [trendingIdentities, setTrendingIdentities] = useState({ data: { items: [], printCount: 5 }, loaded: false, error: false })
  const [transactionsHistory, setTransactionsHistory] = useState({ data: { items: [], printCount: 5 }, loaded: false, error: false })
  const [transactionsTimespan, setTransactionsTimespan] = useState(transactionsChartConfig.timespan.default)
  const richListContainer = createRef()
  const richListRef = createRef()
  const trendingIdentitiesContainer = createRef()
  const trendingIdentitiesList = createRef()
  const transactionsContainer = createRef()
  const transactionsList = createRef()

  const fetchData = () => {
    Promise.all([
      Api.getStatus()
        .then(res => setStatus(state => ({
          ...state,
          data: {
            ...state.data,
            ...res
          },
          loaded: true,
          error: false
        })))
        .catch(res => setStatus(state => ({
          ...state,
          data: {
            ...state.data,
            error: res
          },
          loaded: true,
          error: true
        }))),

      Api.getTransactions(1, 10, 'desc')
        .then(paginatedTransactions => setTransactions(state => ({
          ...state,
          data: {
            ...state.data,
            items: paginatedTransactions?.resultSet
              ? paginatedTransactions.resultSet
              : []
          },
          loaded: true,
          error: false
        }))
        )
        .catch(res => setTransactions(state => ({
          ...state,
          data: {
            ...state.data,
            error: res
          },
          loaded: true,
          error: true
        }))),

      Api.getDataContracts(1, dataContracts.data.printCount, 'desc', 'documents_count')
        .then(paginatedDataContracts => setDataContracts(state => ({
          ...state,
          data: {
            ...state.data,
            items: paginatedDataContracts?.resultSet || []
          },
          loaded: true,
          error: false
        })))
        .catch(res => setDataContracts(state => ({
          ...state,
          data: {
            ...state.data,
            error: res
          },
          loaded: true,
          error: true
        }))),

      Api.getIdentities(1, 10, 'desc', 'balance')
        .then(paginatedRichestIdentities => setRichestIdentities(state => ({
          ...state,
          data: {
            ...state.data,
            items: paginatedRichestIdentities?.resultSet
              ? paginatedRichestIdentities.resultSet
              : []
          },
          loaded: true,
          error: false
        })))
        .catch(res => setRichestIdentities(state => ({
          ...state,
          data: {
            ...state.data,
            error: res
          },
          loaded: true,
          error: true
        }))),

      Api.getIdentities(1, 10, 'desc', 'tx_count')
        .then(paginatedTrendingIdentities => setTrendingIdentities(state => ({
          ...state,
          data: {
            ...state.data,
            items: paginatedTrendingIdentities?.resultSet
              ? paginatedTrendingIdentities.resultSet
              : []
          },
          loaded: true,
          error: false
        })))
        .catch(res => setTrendingIdentities(state => ({
          ...state,
          data: {
            ...state.res,
            error: res
          },
          loaded: true,
          error: true
        }))),

      Api.getTransactionsHistory(transactionsChartConfig.timespan.default)
        .then(transactionsHistory => setTransactionsHistory(state => ({
          ...state,
          data: transactionsHistory,
          loaded: true,
          error: false
        })))
        .catch(res => setTransactionsHistory(state => ({
          ...state,
          data: res,
          loaded: true,
          error: true
        }))),

      Api.getBlocks(1, 1, 'desc')
        .then(latestBlocks => {
          const [latestBlock] = latestBlocks?.resultSet ? latestBlocks.resultSet : {}

          setStatus(state => ({
            ...state,
            data: {
              ...state.data,
              latestBlock
            },
            loaded: true,
            error: false
          }))
        })
        .catch(res => setStatus(state => ({
          ...state,
          data: {
            ...state.data,
            latestBlock: res
          },
          loaded: true,
          error: true
        })))
    ])
      .then()
      .catch(console.log)
  }

  useEffect(fetchData, [])

  useEffect(() => {
    Api.getTransactionsHistory(transactionsTimespan)
      .then(res => {
        setTransactionsHistory(state => ({
          ...state,
          data: res,
          loaded: true
        }))
      })
      .catch(console.log)
  }, [transactionsTimespan])

  function adaptList (container, list, data, setDataFunc) {
    if (container !== null && list !== null && data.printCount < data.items.length) {
      const childNodes = list.childNodes
      const lastElementHeight = childNodes[childNodes.length - 1].getBoundingClientRect().height
      const bottomOffset = container.getBoundingClientRect().bottom - list.getBoundingClientRect().bottom
      const extraItems = Math.floor(bottomOffset / lastElementHeight)

      if (extraItems > 0) {
        setDataFunc(state => ({
          ...state,
          data: {
            ...state.data,
            printCount: data.printCount + extraItems
          }
        }))
      }
    }
  }

  useEffect(() => {
    if (!trendingIdentities.loaded ||
        !richestIdentities.loaded ||
        !transactions.loaded
    ) return

    adaptList(
      trendingIdentitiesContainer.current,
      trendingIdentitiesList.current,
      trendingIdentities.data,
      setTrendingIdentities
    )

    adaptList(
      richListContainer.current,
      richListRef.current,
      richestIdentities.data,
      setRichestIdentities
    )

    adaptList(
      transactionsContainer.current,
      transactionsList.current,
      transactions.data,
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
        loading={!status.loaded}
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

                      <Container
                          minH={'220px'}
                          height={['300px', '300px', '300px', 'auto']}
                          maxW={'none'}
                          flexGrow={'1'}
                          mt={2}
                          mb={4}
                          p={0}
                      >
                        {transactionsHistory.loaded
                          ? transactionsHistory.data?.length &&
                            <LineChart
                              data={transactionsHistory.data.map((item) => ({
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
                          : <Container
                              w={'100%'}
                              h={'100%'}
                              className={'ChartBlock__Loader'}>
                            </Container>}
                      </Container>
                  </Flex>

                  <Box flexShrink={'0'} w={10} h={[0, 0, 0, 10]} />

                  <Container mb={5} p={0} maxW={['100%', '100%', '100%', 'calc(50% - 20px)']}>
                      <Container
                          maxW={'100%'}
                          m={0}
                          h={'100%'}
                          borderWidth={'1px'} borderRadius={'lg'}
                          className={'InfoBlock'}
                      >
                          <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Trending Data Contracts</Heading>
                          {dataContracts.loaded
                            ? !dataContracts.error
                                ? <SimpleList
                                    items={dataContracts.data.items.map((dataContract, i) => ({
                                      columns: [dataContract.identifier, dataContract.documentsCount],
                                      link: '/dataContract/' + dataContract.identifier
                                    }))}
                                    columns={['Identifier', 'Documents Count']}
                                  />
                                : <>{fetchErrorMessage}</>
                            : <ListLoadingPreview itemsCount={dataContracts.data.printCount}/>}
                      </Container>
                  </Container>
              </Flex>

              <Flex
                  w={'100%'}
                  justifyContent={'space-between'}
                  wrap={['wrap', 'wrap', 'nowrap']}
                  mb={[10, 10, 16]}
              >
                  <Container
                      ref={transactionsContainer}
                      maxW={'100%'}
                      borderWidth={'1px'} borderRadius={'lg'}
                      mb={0}
                      className={'InfoBlock'}
                  >
                      <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Transactions</Heading>
                      {transactions.loaded
                        ? !transactions.error
                            ? <SimpleList
                              ref={transactionsList}
                              items={transactions.data.items
                                .filter((item, i) => i < transactions.data.printCount)
                                .map((transaction, i) => ({
                                  monospaceTitles: [transaction.hash],
                                  columns: [new Date(transaction.timestamp).toLocaleString(), getTransitionTypeString(transaction.type)],
                                  link: '/transaction/' + transaction.hash
                                }))}
                              columns={[]}
                            />
                            : <>{fetchErrorMessage}</>
                        : <ListLoadingPreview itemsCount={Math.round(transactions.data.printCount * 1.5)}/>}
                  </Container>

                  <Box flexShrink={'0'} w={10} h={10} />

                  <Flex
                      flexDirection={'column'}
                      p={0}
                      maxW={['100%', '100%', 'calc(50% - 20px)']}
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
                          {trendingIdentities.loaded
                            ? !trendingIdentities.error
                                ? <SimpleList
                                  ref={trendingIdentitiesList}
                                  items={trendingIdentities.data.items
                                    .filter((item, i) => i < trendingIdentities.data.printCount)
                                    .map((identitiy, i) => ({
                                      columns: [identitiy.identifier, identitiy.totalTxs],
                                      link: '/identity/' + identitiy.identifier
                                    }))}
                                  columns={['Identifier', 'Tx Count']}
                                />
                                : <>{fetchErrorMessage}</>
                            : <ListLoadingPreview itemsCount={trendingIdentities.data.printCount}/>}
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
                          {richestIdentities.loaded
                            ? !richestIdentities.error
                                ? <SimpleList
                                  ref={richListRef}
                                  items={richestIdentities.data.items
                                    .filter((item, i) => i < richestIdentities.data.printCount)
                                    .map((identitiy, i) => ({
                                      columns: [identitiy.identifier, identitiy.balance],
                                      link: '/identity/' + identitiy.identifier
                                    }))}
                                  columns={['Identifier', 'Balance']}
                                />
                                : <>{fetchErrorMessage}</>
                            : <ListLoadingPreview itemsCount={richestIdentities.data.printCount}/>}
                      </Container>
                  </Flex>
              </Flex>
          </Container>
      </Container>
  </>)
}

export default Home
