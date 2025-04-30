'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import TransactionsHistory from '../../components/charts/TransactionsHistory'
import { SimpleList } from '../../components/ui/lists'
import TotalInfo from '../../components/total/TotalInfo'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import TransactionsList from '../../components/transactions/TransactionsList'
import { ErrorMessageBlock } from '../../components/Errors'
import { LoadingList } from '../../components/loading'
import Intro from './HomeIntro.js'
import theme from '../../styles/theme'
import {
  Box,
  Container,
  Heading,
  Flex
} from '@chakra-ui/react'

function Home () {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })
  const [dataContracts, setDataContracts] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const [transactions, setTransactions] = useState({ data: {}, props: { printCount: 15 }, loading: true, error: false })
  const [richestIdentities, setRichestIdentities] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const [trendingIdentities, setTrendingIdentities] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const blockOffset = theme.blockOffset
  const blockMaxWidth = ['100%', '100%', 'calc(50% - 10px)', 'calc(50% - 10px)', 'calc(50% - 20px)']

  const fetchData = () => {
    Promise.all([
      Api.getStatus()
        .then(res => fetchHandlerSuccess(setStatus, res))
        .catch(err => fetchHandlerError(setStatus, err)),

      Api.getTransactions(1, 15, 'desc')
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

      Api.getRate()
        .then(res => fetchHandlerSuccess(setRate, res))
        .catch(err => fetchHandlerError(setRate, err))
    ])
      .catch(console.log)
  }

  useEffect(fetchData, [])

  return (<>
    <Container
      maxW={'container.maxPageW'}
      color={'white'}
      px={3}
      py={0}
      mt={blockOffset}
    >
      <Intro/>
    </Container>

    <Container
      px={3}
      py={0}
      mt={blockOffset}
      maxW={'container.maxPageW'}
    >
      <TotalInfo
        blocks={status?.data?.api?.block?.height}
        transactions={status.data?.transactionsCount}
        dataContracts={status.data?.dataContractsCount}
        documents={status.data?.documentsCount}
        identities={status.data?.identitiesCount}
        loading={status.loading}
      />
    </Container>

    <Container
      maxW={'container.maxPageW'}
      color={'white'}
      padding={3}
      mt={blockOffset}
      py={0}
      mb={0}
    >
      <Container p={0} maxW={'container.maxPageW'} mb={blockOffset}>
        <Flex
          w={'100%'}
          justifyContent={'space-between'}
          wrap={['wrap', 'wrap', 'wrap', 'nowrap']}
          mb={blockOffset}
        >
          <Container mb={0} p={0} maxW={blockMaxWidth}>
            <TransactionsHistory blockBorders={false}/>
          </Container>

          <Box flexShrink={'0'} w={blockOffset} h={blockOffset} />

          <Container m={0} p={0} maxW={blockMaxWidth}>
            <Flex
              maxW={'100%'}
              m={0}
              h={'100%'}
              className={'InfoBlock InfoBlock--NoBorder'}
              flexDirection={'column'}
            >
              <Heading className={'InfoBlock__Title'} as={'h2'}>Trending Data Contracts</Heading>
              {!dataContracts.loading
                ? !dataContracts.error
                    ? <SimpleList
                        items={dataContracts.data.resultSet.map((dataContract) => ({
                          columns: [
                            {
                              value: dataContract.identifier,
                              avatar: true,
                              mono: true,
                              dim: true,
                              ellipsis: true,
                              format: 'identifier'
                            },
                            {
                              value: dataContract.documentsCount,
                              mono: true
                            }
                          ],
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
          wrap={['wrap', 'wrap', 'wrap', 'nowrap']}
          mb={0}
        >
          <Flex
            maxW={blockMaxWidth}
            w={'100%'}
            order={[4, 4, 0]}
            mb={0}
            className={'InfoBlock InfoBlock--NoBorder'}
            flexDirection={'column'}
            flexGrow={1}
          >
            <Heading className={'InfoBlock__Title'} as={'h2'}>Transactions</Heading>
            {!transactions.loading
              ? !transactions.error
                  ? <TransactionsList transactions={transactions.data.resultSet} showMoreLink={'/transactions'} rate={rate.data}/>
                  : <ErrorMessageBlock/>
              : <LoadingList itemsCount={Math.round(transactions.props.printCount * 1.5)}/>}
          </Flex>

          <Box flexShrink={'0'} w={blockOffset} h={blockOffset} order={[3, 3, 0]}/>

          <Flex
            flexDirection={'column'}
            p={0}
            maxW={blockMaxWidth}
            width={'100%'}
            flexShrink={0}
          >
            <Flex
              maxW={'100%'}
              className={'InfoBlock InfoBlock--NoBorder'}
              flexGrow={'1'}
              flexDirection={'column'}
            >
              <Heading className={'InfoBlock__Title'} as={'h2'}>Trending Identities</Heading>
              {!trendingIdentities.loading
                ? !trendingIdentities.error
                    ? <SimpleList
                        items={trendingIdentities.data.resultSet
                          .filter((identity, i) => i < trendingIdentities.props.printCount)
                          .map((identity) => {
                            const activeAlias = identity?.aliases?.find(alias => alias.status === 'ok')
                            const value = activeAlias?.alias || identity.identifier

                            return {
                              columns: [
                                {
                                  value,
                                  avatar: true,
                                  avatarSource: identity.identifier,
                                  mono: true,
                                  dim: !activeAlias,
                                  ellipsis: true,
                                  format: activeAlias ? 'alias' : 'identifier'
                                },
                                {
                                  value: identity.totalTxs,
                                  mono: true
                                }
                              ],
                              link: '/identity/' + identity.identifier
                            }
                          })}
                        columns={['Identifier', 'Tx Count']}
                        showMoreLink={'/identities'}
                      />
                    : <ErrorMessageBlock/>
                : <LoadingList itemsCount={trendingIdentities.props.printCount}/>}
            </Flex>

            <Box w={blockOffset} h={blockOffset}/>

            <Flex
              maxW={'none'}
              className={'InfoBlock InfoBlock--NoBorder'}
              flexGrow={'1'}
              flexDirection={'column'}
            >
              <Heading className={'InfoBlock__Title'} as={'h2'}>Richlist</Heading>
              {!richestIdentities.loading
                ? !richestIdentities.error
                    ? <SimpleList
                        items={richestIdentities.data.resultSet
                          .filter((_, i) => i < richestIdentities.props.printCount)
                          .map((identity) => {
                            const activeAlias = identity?.aliases?.find(alias => alias.status === 'ok')
                            const value = activeAlias?.alias || identity.identifier

                            return {
                              columns: [
                                {
                                  value,
                                  avatar: true,
                                  avatarSource: identity.identifier,
                                  mono: true,
                                  dim: !activeAlias,
                                  ellipsis: true,
                                  format: activeAlias ? 'alias' : 'identifier'
                                },
                                {
                                  value: identity.balance,
                                  mono: true,
                                  format: 'currency',
                                  rate: !rate.loading && !rate.error ? rate.data : null
                                }
                              ],
                              link: '/identity/' + identity.identifier
                            }
                          })}
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
