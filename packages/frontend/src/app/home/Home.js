'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import TransactionsList from '../../components/transactions/TransactionsList'
import { LineGraph } from '../../components/charts/index.js'

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

    const fetchData = () => {
        setLoading(true)

        Promise.all([
            Api.getStatus(), 
            Api.getTransactions(1, 25, 'desc')
        ])
        .then(([status, paginatedTransactions]) => {
            setStatus(status)
            setTransactions(paginatedTransactions.resultSet)
        })
        .catch(console.log)
        .finally(() => setLoading(false))
    }

    useEffect(fetchData, [])
    
    if (!loading) return (
        <Container 
            maxW='container.lg' 
            color= {"white"} 
            padding={3}
            mt={8}
            mb={4}
        >
            <Container 
                width='100%'
                maxW='none'
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


            <Container maxW='container.lg' mb={[10,,16]}>

            <Flex 
                w='100%' 
                justifyContent='space-between'
                wrap={["wrap", , , 'nowrap']}
                mb={5}
            >
                <Container
                    my={5}
                    borderWidth='1px' borderRadius='lg'
                >
                    <Heading as={'h2'} size={'sm'} px={2} mt={0} mb={6} >Average block time</Heading>
                    
                    <Container my={3} p={0}>
                        <LineGraph
                            xLabel={'Block height'}
                            yLabel={'Time, s'}
                            width = {464}
                            height = {180}
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

                <Box flexShrink={'0'} w={10} h={10} />

                <Container
                    my={5}
                    borderWidth='1px' borderRadius='lg'
                >
                    <Heading as={'h2'} size={'sm'} px={2} mt={0} mb={6}>Transaction history</Heading>

                    <Container my={3} p={0}>
                        <LineGraph
                            xLabel={'Block height'}
                            yLabel={'Transactions count'}
                            width = {464}
                            height = {180}
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
                wrap={["wrap", , , 'nowrap']}
                mb={[10,,16]}
            >
                <Container m={0} p={0} >
                    <Container
                        m={0}
                        h={'100%'}
                        borderWidth='1px' borderRadius='lg'
                    >
                        <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Most popular data contracts</Heading>

                        {/* <DataContractsList dataContracts={dataContracts} size='l'/> */}

                    </Container>
                </Container>

                <Box flexShrink={'0'} w={10} h={10} />

                <Container p={0}>

                    <Container
                        borderWidth='1px' borderRadius='lg'
                    >
                        <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Most active Identity</Heading>

                        {/* <IdentitiesList identities={identities}/> */}

                    </Container>

                    <Box w={10} h={10} />


                    <Container
                        borderWidth='1px' borderRadius='lg'
                    >
                        <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Richest Identity</Heading>

                        {/* <IdentitiesList identities={identities}/> */}

                    </Container>
                </Container>
            </Flex>

            </Container>


            <Container
                maxW='container.lg'
                m={0}
                borderWidth='1px' borderRadius='lg'
                className={'InfoBlock'}
            >
                <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Last transaction</Heading>

                <TransactionsList transactions={transactions} />

            </Container>
        </Container>
    );
}

export default Home;
