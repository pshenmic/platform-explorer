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

const transactionsChartConfig = {
    timespan: {
        default: '1w',
        values: ['1h', '24h', '3d', '1w'],
    }
}

function Home() {
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState(true)
    const [transactions, setTransactions] = useState([])
    const [dataContracts, setDataContracts] = useState([])
    const [richestIdentities, setRichestIdentities] = useState([])
    const [trendingIdentities, setTrendingIdentities] = useState([])
    const [transactionsHistory, setTransactionsHistory] = useState([])
    const [transactionsTimespan, setTransactionsTimespan] = useState(transactionsChartConfig.timespan.default)

    const convertTxsForChart = (transactionsHistory) => transactionsHistory.map((item) => ({
        x: new Date(item.timestamp),
        y: item.data.txs,
        // info: [
        //     {
        //         title: 'Block height',
        //         type: 'blocks',
        //         value: item.data.blockHeight ? item.data.blockHeight : '-' 
        //     },
        // ]
    }))

    const xLabelType = () => {
        if (transactionsTimespan === '1h') return 'time'
        if (transactionsTimespan === '24h') return 'time'
        if (transactionsTimespan === '3d') return 'date'
        if (transactionsTimespan === '1w') return 'date'
    }

    const fetchData = () => {
        setLoading(true)

        Promise.all([
            Api.getStatus(), 
            Api.getTransactions(1, 8, 'desc'),
            Api.getDataContracts(1, 5, 'desc', 'documents_count'),
            Api.getIdentities(1, 5, 'desc', 'balance'),
            Api.getIdentities(1, 5, 'desc', 'tx_count'),
            Api.getTransactionsHistory(transactionsChartConfig.timespan.default),
            Api.getBlocks(1, 1, 'desc')
        ])
        .then(([
            status, 
            paginatedTransactions, 
            paginatedDataContracts, 
            richestIdentities, 
            trendingIdentities, 
            transactionsHistory, 
            latestBlocks
        ]) => {
            const [latestBlock] = latestBlocks.resultSet
            setStatus({
                latestBlock,
                ...status
            })
            setTransactions(paginatedTransactions.resultSet)
            setDataContracts(paginatedDataContracts.resultSet)
            setRichestIdentities(richestIdentities.resultSet)
            setTrendingIdentities(trendingIdentities.resultSet)
            setTransactionsHistory(convertTxsForChart(transactionsHistory))
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
                                    onChange={(e)=> setTransactionsTimespan(e.target.value)} 
                                    defaultValue={transactionsChartConfig.timespan.default}
                                >
                                    {transactionsChartConfig.timespan.values.map(timespan => {
                                        return <option value={timespan} key={'ts' + timespan}>{timespan}</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                        
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
                                    type: xLabelType(),
                                    abbreviation: '',
                                    title: ''
                                }}
                                yLabel={{
                                    type: 'number',
                                    title: '',
                                    abbreviation: 'txs'
                                }}
                            />
                        </Container>
                    </Flex>

                    <Box flexShrink={'0'} w={10} h={[0,,,10]} />

                    <Container mb={5} p={0} maxW={['100%',,,'calc(50% - 20px)']}>
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
                    wrap={["wrap", , 'nowrap']}
                    mb={[10,,16]}
                >
                    <Container
                        maxW={'100%'}
                        borderWidth={'1px'} borderRadius={'lg'}
                        mb={0}
                        className={'InfoBlock'}
                    >
                        <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Transactions</Heading>

                        <SimpleList 
                            items={transactions.map((transaction, i) => ({
                                monospaceTitles:[transaction.hash],
                                columns: [new Date(transaction.timestamp).toLocaleString(), getTransitionTypeString(transaction.type)],
                                link: '/transaction/' + transaction.hash
                            }))}
                            columns={['Identifier']} 
                        />
                    </Container>

                    <Box flexShrink={'0'} w={10} h={10} />

                    <Flex 
                        flexDirection={'column'}
                        p={0} 
                        maxW={['100%',,'calc(50% - 20px)']}
                        width={'100%'}
                    >
                        <Container
                            maxW={'100%'}
                            borderWidth={'1px'} borderRadius={'lg'}
                            className={'InfoBlock'}
                            flexGrow={'1'} 
                        >
                            <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Trending Identities</Heading>

                            <SimpleList 
                                items={trendingIdentities.map((identitiy, i) => ({
                                    columns: [identitiy.identifier, identitiy.totalTxs],
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
                            flexGrow={'1'} 
                        >
                            <Heading className={'InfoBlock__Title'} as={'h2'} size={'sm'}>Richlist</Heading>

                            <SimpleList 
                                items={richestIdentities.map((identitiy, i) => ({
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

export default Home
