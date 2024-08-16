'use client'

import { useState, useEffect, createRef } from 'react'
import * as Api from '../../util/Api'
import TransactionsHistory from '../../components/charts/TransactionsHistory'
import { SimpleList } from '../../components/lists'
import TotalInfo from '../../components/total/TotalInfo'
import { getTransitionTypeString, fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { ErrorMessageBlock } from '../../components/Errors'
import { LoadingList } from '../../components/loading'
import Intro from './HomeIntro.js'
import {
  Box,
  Container,
  Heading,
  Flex
} from '@chakra-ui/react'

function Home () {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })
  const [dataContracts, setDataContracts] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const [transactions, setTransactions] = useState({ data: {}, props: { printCount: 8 }, loading: true, error: false })
  const [richestIdentities, setRichestIdentities] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const [trendingIdentities, setTrendingIdentities] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const richListContainer = createRef()
  const richListRef = createRef()
  const trendingIdentitiesContainer = createRef()
  const trendingIdentitiesList = createRef()
  const transactionsContainer = createRef()
  const transactionsList = createRef()

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
        .catch(err => fetchHandlerError(setTrendingIdentities, err))
    ])
      .catch(console.log)
  }

  useEffect(fetchData, [])

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
    >
      <Intro/>
    </Container>

    <TotalInfo
      blocks={status?.data?.api?.block?.height}
      transactions={status.data?.transactionsCount}
      dataContracts={status.data?.dataContractsCount}
      documents={status.data?.documentsCount}
      identities={status.data?.identitiesCount}
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
          <Container mb={5} p={0} maxW={['100%', '100%', '100%', 'calc(50% - 20px)']}>
            <TransactionsHistory height={'100%'}/>
          </Container>

          <Box flexShrink={'0'} w={10} h={[0, 0, 0, 10]} />

          <Container mb={5} p={0} maxW={['100%', '100%', '100%', 'calc(50% - 20px)']}>
            <Flex
              maxW={'100%'}
              m={0}
              h={'100%'}
              className={'InfoBlock'}
              flexDirection={'column'}
            >
              <Heading className={'InfoBlock__Title'} as={'h2'}>Trending Data Contracts</Heading>
              {!dataContracts.loading
                ? !dataContracts.error
                    ? <SimpleList
                        items={dataContracts.data.resultSet.map((dataContract, i) => ({
                          columns: [dataContract.identifier, dataContract.documentsCount],
                          link: '/dataContract/' + dataContract.identifier
                        }))}
                        columns={['Identifier', 'Documents Count']}
                        showMoreLink={'/dataContracts'}
                      />
                    : <ErrorMessageBlock/>
                : <LoadingList itemsCount={dataContracts.props.printCount}/>}
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
            mb={0}
            className={'InfoBlock'}
            flexDirection={'column'}
            flexGrow={1}
          >
            <Heading className={'InfoBlock__Title'} as={'h2'}>Transactions</Heading>
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
                    showMoreLink={'/transactions'}
                  />
                  : <ErrorMessageBlock/>
              : <LoadingList itemsCount={Math.round(transactions.props.printCount * 1.5)}/>}
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
              className={'InfoBlock'}
              flexGrow={'1'}
              flexDirection={'column'}
            >
              <Heading className={'InfoBlock__Title'} as={'h2'}>Trending Identities</Heading>
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
                      showMoreLink={'/identities'}
                    />
                    : <ErrorMessageBlock/>
                : <LoadingList itemsCount={trendingIdentities.props.printCount}/>}
            </Flex>

            <Box w={10} h={10} />

            <Flex
              ref={richListContainer}
              maxW={'none'}
              className={'InfoBlock'}
              flexGrow={'1'}
              flexDirection={'column'}
            >
              <Heading className={'InfoBlock__Title'} as={'h2'}>Richlist</Heading>
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
                      showMoreLink={'/identities'}
                    />
                    : <ErrorMessageBlock/>
                : <LoadingList itemsCount={richestIdentities.props.printCount}/>}
            </Flex>
          </Flex>
        </Flex>
      </Container>
    </Container>
  </>)
}

export default Home
