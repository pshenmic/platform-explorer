'use client'

import { useState, useEffect, useRef} from 'react'
import * as Api from '../../util/Api'
import TransactionsList from '../../components/transactions/TransactionsList'
import { LineGraph } from '../../components/charts/index.js'
import {SimpleList} from '../../components/lists'

import { 
    Box, 
    Text, 
    Container,
    Heading, 
    Flex,
    Stack,
    StackDivider
} from '@chakra-ui/react'

function Home() {
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState(true)
    const [transactions, setTransactions] = useState([])
    const [dataContracts, setDataContracts] = useState([])
    const [identities, setIdentities] = useState([])
    const chartContainer = useRef()

    const fetchData = () => {
        setLoading(true)

        Promise.all([
            Api.getStatus(), 
            Api.getTransactions(1, 25, 'desc'),
            Api.getDataContracts(1, 10, 'desc'),
            Api.getIdentities(1, 3, 'desc')
        ])
        .then(([status, paginatedTransactions, paginatedDataContracts, paginatedIdentities]) => {
            setStatus(status)
            setTransactions(paginatedTransactions.resultSet)
            setDataContracts(paginatedDataContracts.resultSet)
            setIdentities(paginatedIdentities.resultSet)
        })
        .catch(console.log)
        .finally(() => setLoading(false))
    }

    useEffect(fetchData, [])
    
    if (!loading) return (<>
        <Container 
            maxW='container.xl' 
            color= {"white"} 
            padding={3}
            mt={8}
            mb={4}
        >
            <Container 
                width='100%'
                maxW='container.lg'
                mt={5}
                mb={[10,,16]}
                borderWidth={['1px' , , '0']} 
                borderRadius='lg'
            >
                <Stack 
                    direction={['column', , 'row']} 
                    spacing='24px'
                    divider={<StackDivider borderColor='gray.700' />}
                >
                    <Box w={['100%', , '33%']}>
                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Network: </Text>
                            <Box>{status.network}</Box>
                        </Flex>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Tenderdash Version:</Text>
                            <Box>{status.tenderdashVersion}</Box>
                        </Flex>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>App Version:</Text>
                            <Box>{status.appVersion}</Box>
                        </Flex>
                    </Box>

                    <Box w={['100%', , '33%']}>
                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Average block time:</Text>
                            <Box>{Math.ceil(status.blockTimeAverage)} sec.</Box>
                        </Flex>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Blocks:</Text>
                            <Box>{status.blocksCount}</Box>
                        </Flex>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Transactions:</Text>
                            <Box>{status.txCount}</Box>
                        </Flex>
                    </Box>

                    <Box w={['100%', , '33%']}>
                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Data contracts:</Text>
                            <Box>{status.dataContractsCount}</Box>
                        </Flex>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Documents:</Text>
                            <Box>{status.documentsCount}</Box>
                        </Flex>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Transfers:</Text>
                            <Box>{status.transfersCount}</Box>
                        </Flex>
                    </Box>
                </Stack>
            </Container>

            <Container p={0} maxW='container.xl' mb={[10,,16]}>
                <Flex 
                    w='100%' 
                    justifyContent='space-between'
                    wrap={["wrap", , , 'nowrap']}
                    mb={5}
                >
                    <Container
                        maxW={'none'}
                        my={5}
                        borderWidth='1px' borderRadius='lg'
                    >
                        <Heading as={'h2'} size={'sm'} px={2} mt={0} mb={6} >Average block time</Heading>
                        
                        <Container my={3} p={0} maxW={'none'}>
                            <LineGraph
                                xLabel={'Block height'}
                                yLabel={'Time, s'}
                                width = {chartContainer.current ? chartContainer.current.offsetWidth : 582}
                                height = {220}
                                data={[
                                    {x: 10, y: 120},
                                    {x: 11, y: 110},
                                    {x: 12, y: 230},
                                    {x: 13, y: 0},
                                    {x: 14, y: 200},
                                    {x: 15, y: 250},
                                    {x: 16, y: 220},
                                    {x: 17, y: 210},
                                    {x: 18, y: 250}
                                ]}
                            />
                        </Container>
                    </Container>

                    <Box flexShrink={'0'} w={10} h={[0,,,10]} />

                    <Container
                        maxW={'none'}
                        my={5}
                        borderWidth='1px' borderRadius='lg'
                    >
                        <Heading as={'h2'} size={'sm'} px={2} mt={0} mb={6}>Transaction history</Heading>

                        <Container ref={chartContainer} my={3} p={0} maxW={'none'}>
                            <LineGraph
                                xLabel={'Block height'}
                                yLabel={'Transactions count'}
                                width = {chartContainer.current ? chartContainer.current.offsetWidth : 582}
                                height = {220}
                                data={[
                                    {x: 10, y: 11111200},
                                    {x: 11, y: 1111500},
                                    {x: 13, y: 11111500},
                                    {x: 16, y: 21111000},
                                    {x: 17, y: 11111200},
                                    {x: 18, y: 11111500}
                                ]}
                            />
                        </Container>
                    </Container>
                </Flex>

                <Flex 
                    w='100%' 
                    justifyContent='space-between'
                    wrap={["wrap", , 'nowrap']}
                    mb={[10,,16]}
                >
                    <Container m={0} p={0} maxW={['100%',,'calc(50% - 20px)']}>
                        <Container
                            maxW={'100%'}
                            m={0}
                            h={'100%'}
                            borderWidth='1px' borderRadius='lg'
                            className={'InfoBlock'}
                        >
                            <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Most popular data contracts</Heading>

                            <SimpleList 
                                items={dataContracts.map((dataContract, i) => ({
                                    monospaceColumns: [dataContract.identifier, 10000 - i * 25],
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
                            borderWidth='1px' borderRadius='lg'
                            className={'InfoBlock'}
                        >
                            <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Most active Identity</Heading>

                            <SimpleList 
                                items={identities.map((identitiy, i) => ({
                                    monospaceTitles:[identitiy.identifier],
                                    columns: ['I-name-' + i, 100 - i * 25],
                                    link: '/identity/' + identitiy.identifier
                                }))}
                                columns={['Identifier', 'Amount of txs']} 
                            />
                        </Container>

                        <Box w={10} h={10} />

                        <Container
                            maxW={'none'}
                            borderWidth='1px' borderRadius='lg'
                            className={'InfoBlock'}
                        >
                            <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Richest Identity</Heading>

                            <SimpleList 
                                items={identities.map((identitiy, i) => ({
                                    monospaceTitles:[identitiy.identifier],
                                    columns: ['I-name-' + i, 20000 - i * 1555],
                                    link: '/identity/' + identitiy.identifier
                                }))}
                                columns={['Identifier', 'Balance']} 
                            />
                        </Container>
                    </Container>
                </Flex>
            </Container>

            <Container
                maxW='container.xl'
                m={0}
                borderWidth='1px' borderRadius='lg'
                className={'InfoBlock'}
            >
                <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Last transaction</Heading>

                <TransactionsList transactions={transactions} />
            </Container>
        </Container>
    </>);
}

export default Home;
