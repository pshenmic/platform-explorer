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
    Flex,
} from '@chakra-ui/react'

function Home() {
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState(true)
    const [transactions, setTransactions] = useState([])
    const [dataContracts, setDataContracts] = useState([])
    const [identities, setIdentities] = useState([])
    const [transactionsHistory, settransactionsHistory] = useState([])

    const fetchData = () => {
        setLoading(true)

        Promise.all([
            Api.getStatus(), 
            Api.getTransactions(1, 3, 'desc'),
            Api.getDataContracts(1, 8, 'desc'),
            Api.getIdentities(1, 5, 'desc'),
            Api.getTransactionsHistory('1w'),
            Api.getBlocks(1, 1, 'desc'),
        ])
        .then(([status, paginatedTransactions, paginatedDataContracts, paginatedIdentities, transactionsHistory, latestBlocks]) => {
            const [latestBlock] = latestBlocks.resultSet
            setStatus({
                latestBlock,
                ...status
            })
            setTransactions(paginatedTransactions.resultSet)
            setDataContracts(paginatedDataContracts.resultSet)
            setIdentities(paginatedIdentities.resultSet)
            settransactionsHistory(transactionsHistory.map((item) => ({
                    x: new Date(item.timestamp),
                    y: item.data.txs,
                    info: [
                        {
                            title: 'Block height',
                            type: 'blocks',
                            value: item.data.blockHeight ? item.data.blockHeight : '-' 
                        },
                    ]
                }))
            )
        })
        .catch(console.log)
        .finally(() => setLoading(false))
    }

    useEffect(fetchData, [])

    if (!loading) return (<>
        <Container 
            maxW={'container.xl'} 
            color={"white"} 
            padding={3}
            mt={8}
            mb={8}
        >
            <Flex 
                justifyContent={'space-between'} 
                alignItems={'center'}
                wrap={['wrap',, 'nowrap']}
            >
                <Container maxW={'none'} p={0}>
                    <Intro 
                        title={'Platform Explorer'}
                        contentSource={<Markdown>{introContent}</Markdown>}
                    />
                </Container>
                
                <Box flexShrink={'0'} w={10} h={10} />
                
                <Container maxW={'none'} p={0}>
                    <NetworkStatus network={{
                        name: status.network,
                        latestBlock: status.latestBlock
                    }}/>
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
            color={"white"} 
            padding={3}
            mt={0}
            mb={4}
        >
            <Container p={0} maxW={'container.xl'} mb={[10,,16]}>
                <Flex 
                    w={'100%'} 
                    justifyContent={'space-between'}
                    wrap={["wrap", , , 'nowrap']}
                    mb={5}
                >
                    <Flex
                        maxW={'none'}
                        width={'100%'}
                        mb={5}
                        borderWidth={'1px'} borderRadius={'lg'}
                        direction={'column'}
                        p={3}
                        pb={2}
                    >
                        <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Transactions history</Heading>
                        
                        <Container 
                            minH={'220px'}
                            height={["300px", , ,'auto']}
                            maxW={'none'}
                            flexGrow={'1'} 
                            mt={2}
                            mb={4} 
                            p={0} 
                        >
                            <LineChart
                                data={transactionsHistory}
                                xLabel={{
                                    type: 'date',
                                    abbreviation: 'Date',
                                    title: ''
                                }}
                                yLabel={{
                                    type: 'number',
                                    title: '',
                                    abbreviation: 'Txs'
                                }}
                            />
                        </Container>
                    </Flex>

                    <Box flexShrink={'0'} w={10} h={[0,,,10]} />

                    <Container
                        maxW={'100%'}
                        borderWidth={'1px'} borderRadius={'lg'}
                        mb={5}
                        className={'InfoBlock'}
                    >
                        <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Transactions</Heading>

                        <SimpleList 
                            items={transactions.map((transaction, i) => ({
                                monospaceTitles:[transaction.hash],
                                columns: [new Date(transaction.timestamp).toLocaleString(), getTransitionTypeString(transaction.type)],
                                link: '/transaction/' + transaction.hash
                            }))}
                            columns={['Identifier', 'Amount of txs']} 
                        />
                    </Container>
                </Flex>

                <Flex 
                    w={'100%'} 
                    justifyContent={'space-between'}
                    wrap={["wrap", , 'nowrap']}
                    mb={[10,,16]}
                >
                    <Container m={0} p={0} maxW={['100%',,'calc(50% - 20px)']}>
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
                                    columns: [dataContract.identifier, 10000 - i * 25],
                                    link: '/dataContract/' + dataContract.identifier
                                }))}
                                columns={['Identifier', 'Amount of txs']} 
                            />
                        </Container>
                    </Container>

                    <Box flexShrink={'0'} w={10} h={10} />

                    <Container p={0} maxW={['100%',,'calc(50% - 20px)']}>
                        <Container
                            maxW={'100%'}
                            borderWidth={'1px'} borderRadius={'lg'}
                            className={'InfoBlock'}
                        >
                            <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Trending Identities</Heading>

                            <SimpleList 
                                items={identities.map((identitiy, i) => ({
                                    columns: [identitiy.identifier, 100 - i * 25],
                                    link: '/identity/' + identitiy.identifier
                                }))}
                                columns={['Identifier', 'Amount of txs']} 
                            />
                        </Container>

                        <Box w={10} h={10} />

                        <Container
                            maxW={'none'}
                            borderWidth={'1px'} borderRadius={'lg'}
                            className={'InfoBlock'}
                        >
                            <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Richlist</Heading>

                            <SimpleList 
                                items={identities.map((identitiy, i) => ({
                                    columns: [identitiy.identifier, 20000 - i * 1555],
                                    link: '/identity/' + identitiy.identifier
                                }))}
                                columns={['Identifier', 'Balance']} 
                            />
                        </Container>
                    </Container>
                </Flex>
            </Container>
        </Container>
    </>)
}

export default Home
